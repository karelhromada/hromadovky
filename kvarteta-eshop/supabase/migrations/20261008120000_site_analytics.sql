-- Vlastní anonymní analytika návštěvnosti pro /admin/analytika (bez cookies, bez osobních údajů).
--
-- Prohlížeč volá RPC track_event (src/lib/siteAnalytics.ts). Návštěvník = hash(denní sůl + IP +
-- user-agent); sůl vzniká náhodně každý den a předchozí se maže → hash nejde zpětně spojit
-- s člověkem ani mezi dny. IP ani user-agent se NEUKLÁDAJÍ. Nic se neukládá do prohlížeče,
-- proto měření nevyžaduje souhlas s cookies a započítá všechny návštěvy.
--
-- Tržby se berou z order_submissions (serverová pravda), události „purchase" je jen párují
-- s návštěvou (a tím se zdrojem) přes UUID objednávky — zná ho jen prohlížeč kupujícího
-- (VS je sekvenční a šel by uhodnout → podvržená atribuce).
--
-- Ochrana veřejného RPC: strop na návštěvníka (index), globální strop přes hodinové počítadlo
-- (bez count(*)), nákup je ze stropu vyjmutý; cesty/zdroje jen z povolených vzorů (žádná PII).
-- Pozn.: Supabase zálohy drží smazané soli po dobu své retence.

-- === Tabulky ===
create table if not exists public.analytics_salts (
  day date primary key,
  salt text not null
);
alter table public.analytics_salts enable row level security;
comment on table public.analytics_salts is
  'Denní sůl pro anonymní hash návštěvníka. Drží se jen dnešní; čte jen track_event.';

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  day date not null default (now() at time zone 'Europe/Prague')::date,
  event text not null check (event in
    ('pageview', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'configurator_start')),
  visitor text not null check (visitor ~ '^[0-9a-f]{16}$'),
  path text check (char_length(path) <= 300),
  source text check (char_length(source) <= 60),
  medium text check (char_length(medium) <= 30),
  campaign text check (char_length(campaign) <= 100),
  referrer_host text check (char_length(referrer_host) <= 120),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  product_id text check (char_length(product_id) <= 80),
  order_vs text check (char_length(order_vs) <= 20)
);
alter table public.analytics_events enable row level security;
comment on table public.analytics_events is
  'Anonymní události návštěvnosti (bez IP/UA/cookies). Zapisuje jen track_event; čte admin přes admin_analytics_report.';

create index if not exists analytics_events_day_idx on public.analytics_events (day);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at);
create index if not exists analytics_events_visitor_idx on public.analytics_events (visitor, created_at);
-- Jedna konverze na objednávku (opakované odeslání ze stejné pokladny se tiše zahodí).
create unique index if not exists analytics_events_purchase_vs_uidx
  on public.analytics_events (order_vs) where event = 'purchase';

create table if not exists public.analytics_rate (
  bucket timestamptz primary key,
  n integer not null
);
alter table public.analytics_rate enable row level security;
comment on table public.analytics_rate is 'Hodinové počítadlo událostí pro globální strop track_event.';

-- Žádné policies: anon/authenticated tabulky přímo nečtou ani nezapisují.
revoke all on public.analytics_events, public.analytics_salts, public.analytics_rate from anon, authenticated;

-- === Zápis události z webu ===
create or replace function public.track_event(
  p_event text,
  p_path text default null,
  p_source text default null,
  p_medium text default null,
  p_campaign text default null,
  p_referrer_host text default null,
  p_device text default null,
  p_product_id text default null,
  p_order_id uuid default null
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_headers json;
  v_ip text;
  v_ua text;
  v_day date := (now() at time zone 'Europe/Prague')::date;
  v_salt text;
  v_visitor text;
  v_recent integer;
  v_order_vs text;
  v_source text;
  v_medium text;
begin
  -- Neznámá událost: tiše zahodit (žádná chyba = žádné vyzvídání názvů).
  if p_event is null or p_event not in
     ('pageview', 'view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'configurator_start') then
    return;
  end if;

  begin
    v_headers := current_setting('request.headers', true)::json;
  exception when others then
    v_headers := null;
  end;
  -- Jen cf-connecting-ip (přepisuje Cloudflare); x-forwarded-for si klient podvrhne → nepoužívat.
  -- Bez něj se návštěvník pozná jen podle user-agentu (méně přesné, ale nejde obejít limit).
  v_ip := coalesce(v_headers ->> 'cf-connecting-ip', '');
  v_ua := coalesce(v_headers ->> 'user-agent', '');

  -- Roboti a nástroje do statistik nepatří.
  if v_ua = '' or v_ua ~* '(bot\M|crawl|spider|slurp|headless|lighthouse|pagespeed|facebookexternalhit|curl|wget|python|axios|node-fetch|go-http)' then
    return;
  end if;

  select s.salt into v_salt from public.analytics_salts s where s.day = v_day;
  if v_salt is null then
    -- První událost dne: nová sůl; staré soli, počítadla a události nad retenci pryč.
    insert into public.analytics_salts (day, salt)
    values (v_day, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
    on conflict (day) do nothing;
    select s.salt into v_salt from public.analytics_salts s where s.day = v_day;
    delete from public.analytics_salts s where s.day < v_day;
    delete from public.analytics_rate r where r.bucket < now() - interval '1 day';
    delete from public.analytics_events e where e.created_at < now() - interval '400 days';
  end if;

  v_visitor := left(encode(sha256(convert_to(v_salt || '|' || v_ip || '|' || v_ua, 'UTF8')), 'hex'), 16);

  -- Strop na návštěvníka (index visitor, created_at).
  select count(*) into v_recent
  from public.analytics_events e
  where e.visitor = v_visitor and e.created_at > now() - interval '10 minutes';
  if v_recent >= 120 then
    return;
  end if;

  -- Globální strop: levné hodinové počítadlo. Nákup ze stropu vyjmutý (zaplavení ho neumlčí).
  insert into public.analytics_rate as r (bucket, n)
  values (date_trunc('hour', now()), 1)
  on conflict (bucket) do update set n = r.n + 1
  returning r.n into v_recent;
  if v_recent > 3000 and p_event <> 'purchase' then
    return;
  end if;

  if p_event = 'purchase' then
    -- Jen skutečná a čerstvá objednávka podle UUID; VS se dohledá ze serveru.
    select o.variable_symbol into v_order_vs
    from public.order_submissions o
    where o.id = p_order_id and o.created_at > now() - interval '1 hour';
    if v_order_vs is null then
      return;
    end if;
  end if;

  -- Zdroj/typ jen z bezpečné abecedy (žádné e-maily ani jiná PII z utm parametrů).
  v_source := lower(trim(p_source));
  v_source := case when v_source ~ '^[a-z0-9._-]{1,40}$' then v_source when v_source is null or v_source = '' then null else 'jine' end;
  v_medium := lower(trim(p_medium));
  v_medium := case when v_medium ~ '^[a-z0-9._-]{1,30}$' then v_medium when v_medium is null or v_medium = '' then null else 'jine' end;

  insert into public.analytics_events
    (event, visitor, path, source, medium, campaign, referrer_host, device, product_id, order_vs)
  values (
    p_event,
    v_visitor,
    -- Jen tvar skutečných rout (/, /kvarteta, /kvarteta/<slug>); 404 s nesmysly → jedna položka.
    case
      when p_path is null then null
      when p_path ~ '^/([a-z0-9-]{1,60}(/[a-z0-9-]{1,80})?)?$' then p_path
      else '/jina-stranka'
    end,
    v_source,
    v_medium,
    case when p_campaign ~ '^[^@<>/\\]{1,100}$' then trim(p_campaign) end,
    case when lower(p_referrer_host) ~ '^[a-z0-9.-]{1,120}$' then lower(p_referrer_host) end,
    case when p_device in ('mobile', 'tablet', 'desktop') then p_device end,
    case when p_product_id ~ '^[a-z0-9-]{1,80}$' then p_product_id end,
    v_order_vs
  )
  on conflict (order_vs) where event = 'purchase' do nothing;
end;
$function$;

revoke all on function public.track_event(text, text, text, text, text, text, text, text, uuid) from public;
grant execute on function public.track_event(text, text, text, text, text, text, text, text, uuid) to anon, authenticated;

-- === Report pro admin ===
-- Návštěva = návštěvník v daném dni (hash se denně mění, delší okno nejde spojit).
-- Zdroj návštěvy = zdroj její první události. Objednávka bez spárované události = „neznámý".
create or replace function public.admin_analytics_report(p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path to ''
as $function$
declare
  v_result jsonb;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Forbidden: admin role required';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 120 then
    raise exception 'Neplatné období' using errcode = '22023';
  end if;

  with ev as (
    select * from public.analytics_events e where e.day between p_from and p_to
  ),
  visits as (
    select distinct on (ev.visitor, ev.day)
      ev.visitor, ev.day,
      coalesce(ev.source, 'direct') as source,
      coalesce(ev.medium, 'none') as medium,
      coalesce(ev.device, 'desktop') as device
    from ev
    order by ev.visitor, ev.day, ev.created_at, ev.id  -- id rozhodne shodu času (stejná transakce)
  ),
  orders as (
    select o.variable_symbol as vs, o.subtotal,
           (o.created_at at time zone 'Europe/Prague')::date as day
    from public.order_submissions o
    where o.created_at >= (p_from::timestamp at time zone 'Europe/Prague')
      and o.created_at < ((p_to + 1)::timestamp at time zone 'Europe/Prague')
  ),
  attributed as (
    select o.vs, o.subtotal,
           coalesce(v.source, 'neznámý') as source,
           coalesce(v.medium, 'none') as medium
    from orders o
    left join ev p on p.event = 'purchase' and p.order_vs = o.vs
    left join visits v on v.visitor = p.visitor and v.day = p.day
  ),
  step as (  -- návštěvy, které daný krok trychtýře udělaly
    select ev.event, count(distinct ev.visitor || ev.day::text) as visits
    from ev
    group by ev.event
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'visits', (select count(*) from visits),
      'pageviews', (select count(*) from ev where ev.event = 'pageview'),
      'orders', (select count(*) from orders),
      'revenue', (select coalesce(sum(orders.subtotal), 0) from orders)
    ),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'day', g.day::date,
               'visits', coalesce(vd.visits, 0),
               'pageviews', coalesce(pd.pageviews, 0),
               'orders', coalesce(od.orders, 0),
               'revenue', coalesce(od.revenue, 0)
             ) order by g.day), '[]'::jsonb)
      from generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') as g(day)
      left join (select v.day, count(*) as visits from visits v group by v.day) vd on vd.day = g.day::date
      left join (select ev.day, count(*) as pageviews from ev where ev.event = 'pageview' group by ev.day) pd
        on pd.day = g.day::date
      left join (select o.day, count(*) as orders, sum(o.subtotal) as revenue from orders o group by o.day) od
        on od.day = g.day::date
    ),
    'sources', (
      select coalesce(jsonb_agg(s order by s.visits desc, s.revenue desc), '[]'::jsonb)
      from (
        select x.source, x.medium,
               sum(x.visits)::int as visits, sum(x.orders)::int as orders, sum(x.revenue)::int as revenue
        from (
          select v.source, v.medium, count(*) as visits, 0 as orders, 0 as revenue
          from visits v group by v.source, v.medium
          union all
          select a.source, a.medium, 0, count(*), sum(a.subtotal)
          from attributed a group by a.source, a.medium
        ) x
        group by x.source, x.medium
      ) s
    ),
    'pages', (
      select coalesce(jsonb_agg(p order by p.pageviews desc), '[]'::jsonb)
      from (
        select ev.path, count(*) as pageviews, count(distinct ev.visitor || ev.day::text) as visits
        from ev
        where ev.event = 'pageview' and ev.path is not null
        group by ev.path
        order by count(*) desc
        limit 20
      ) p
    ),
    'devices', (
      select coalesce(jsonb_agg(dv order by dv.visits desc), '[]'::jsonb)
      from (select v.device, count(*) as visits from visits v group by v.device) dv
    ),
    'funnel', jsonb_build_object(
      'visits', (select count(*) from visits),
      'view_item', coalesce((select step.visits from step where step.event = 'view_item'), 0),
      'add_to_cart', coalesce((select step.visits from step where step.event = 'add_to_cart'), 0),
      'begin_checkout', coalesce((select step.visits from step where step.event = 'begin_checkout'), 0),
      'purchase', coalesce((select step.visits from step where step.event = 'purchase'), 0)
    ),
    'products', (
      select coalesce(jsonb_agg(pr order by pr.views desc, pr.added desc), '[]'::jsonb)
      from (
        select ev.product_id,
               count(*) filter (where ev.event = 'view_item') as views,
               count(*) filter (where ev.event = 'add_to_cart') as added
        from ev
        where ev.product_id is not null and ev.product_id not like 'custom-%'
        group by ev.product_id
        order by count(*) filter (where ev.event = 'view_item') desc
        limit 30
      ) pr
    ),
    'configurators', (
      select jsonb_agg(c)
      from (
        select k.kind,
               (select count(distinct ev.visitor || ev.day::text) from ev
                 where ev.event = 'configurator_start' and ev.product_id = k.kind) as starts,
               (select count(*) from ev
                 where ev.event = 'add_to_cart' and ev.product_id = k.kind) as added
        from (values ('custom-kvarteto'), ('custom-pexeso'), ('custom-karty')) as k(kind)
      ) c
    )
  ) into v_result;

  return v_result;
end;
$function$;

revoke all on function public.admin_analytics_report(date, date) from public, anon;
grant execute on function public.admin_analytics_report(date, date) to authenticated;
