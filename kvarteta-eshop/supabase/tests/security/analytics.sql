-- Bezpečnostní a logické testy vlastní analytiky (migrace 20261008120000).
--
-- Spuštění: celý soubor najednou v Supabase SQL editoru (role postgres).
-- Vše běží v jedné transakci zakončené ROLLBACK — v databázi nic nezůstane.
-- Selhání = výjimka „TEST FAILED: …"; úspěch = poslední řádek „VŠECHNY TESTY PROŠLY".

begin;

create temp table t_order (id uuid, vs text) on commit drop;
grant select on t_order to anon, authenticated;

-- Čistý stav uvnitř transakce (ROLLBACK vše vrátí).
delete from public.analytics_events;
delete from public.analytics_salts;
delete from public.analytics_rate;

select set_config('request.headers', '{"user-agent":"Mozilla/5.0 (TestBrowser)","cf-connecting-ip":"203.0.113.7"}', true);

-- === Zápis, normalizace a anonymizace ===
do $$
declare
  v_row public.analytics_events;
  v_count integer;
begin
  perform public.track_event('hack', '/');
  if exists (select 1 from public.analytics_events) then
    raise exception 'TEST FAILED: neplatná událost se uložila';
  end if;

  perform public.track_event('pageview', '/kvarteta', '  Google ', 'Organic', 'podzim', 'www.google.cz', 'mobile');
  select * into v_row from public.analytics_events;
  if v_row.visitor !~ '^[0-9a-f]{16}$' then raise exception 'TEST FAILED: visitor není 16 hex znaků'; end if;
  if v_row.source <> 'google' or v_row.medium <> 'organic' then
    raise exception 'TEST FAILED: zdroj se nenormalizoval (%/%)', v_row.source, v_row.medium;
  end if;
  if row_to_json(v_row)::text like '%203.0.113.7%' or row_to_json(v_row)::text ilike '%TestBrowser%' then
    raise exception 'TEST FAILED: událost obsahuje IP nebo user-agent';
  end if;

  perform public.track_event('pageview', '/pexeso');
  if (select count(distinct visitor) from public.analytics_events) <> 1 then
    raise exception 'TEST FAILED: stejný návštěvník dostal jiný hash';
  end if;
  perform set_config('request.headers', '{"user-agent":"Mozilla/5.0 (TestBrowser)","cf-connecting-ip":"198.51.100.9"}', true);
  perform public.track_event('pageview', '/karty');
  if (select count(distinct visitor) from public.analytics_events) <> 2 then
    raise exception 'TEST FAILED: jiná IP dala stejný hash';
  end if;

  -- Nebezpečné / osobní hodnoty se neuloží v původní podobě.
  perform public.track_event('view_item', '/jan.novak@example.com', 'jan@example.com', 'x y', 'pro <b>jana</b>',
                             'evil host/<x>', 'fridge', 'X<script>');
  select * into v_row from public.analytics_events where event = 'view_item';
  if v_row.path <> '/jina-stranka' then raise exception 'TEST FAILED: cesta s e-mailem prošla (%)', v_row.path; end if;
  if v_row.source <> 'jine' or v_row.medium <> 'jine' then raise exception 'TEST FAILED: zdroj s e-mailem prošel'; end if;
  if v_row.campaign is not null or v_row.referrer_host is not null or v_row.device is not null or v_row.product_id is not null then
    raise exception 'TEST FAILED: neplatné hodnoty se uložily';
  end if;
  if row_to_json(v_row)::text like '%example.com%' then raise exception 'TEST FAILED: e-mail v datech'; end if;

  -- Roboti a požadavky bez user-agentu se nepočítají.
  select count(*) into v_count from public.analytics_events;
  perform set_config('request.headers', '{"user-agent":"Mozilla/5.0 (compatible; Googlebot/2.1)","cf-connecting-ip":"66.249.66.1"}', true);
  perform public.track_event('pageview', '/');
  perform set_config('request.headers', '{"cf-connecting-ip":"203.0.113.8"}', true);
  perform public.track_event('pageview', '/');
  if (select count(*) from public.analytics_events) <> v_count then
    raise exception 'TEST FAILED: bot nebo požadavek bez UA se započítal';
  end if;
end $$;

-- === Podvržené x-forwarded-for nevyrobí nové návštěvníky ===
do $$
begin
  perform set_config('request.headers', '{"user-agent":"Mozilla/5.0 (Spoof)","x-forwarded-for":"10.0.0.1"}', true);
  perform public.track_event('pageview', '/spoof');
  perform set_config('request.headers', '{"user-agent":"Mozilla/5.0 (Spoof)","x-forwarded-for":"10.0.0.2"}', true);
  perform public.track_event('pageview', '/spoof');
  if (select count(distinct visitor) from public.analytics_events where path = '/spoof') <> 1 then
    raise exception 'TEST FAILED: x-forwarded-for obchází identitu návštěvníka';
  end if;
end $$;

-- === Denní sůl: včerejší se smaže ===
do $$
begin
  delete from public.analytics_salts;
  insert into public.analytics_salts (day, salt) values ((now() at time zone 'Europe/Prague')::date - 1, 'vcerejsi');
  perform set_config('request.headers', '{"user-agent":"Mozilla/5.0 (TestBrowser)","cf-connecting-ip":"203.0.113.7"}', true);
  perform public.track_event('pageview', '/');
  if exists (select 1 from public.analytics_salts where salt = 'vcerejsi') then
    raise exception 'TEST FAILED: včerejší sůl zůstala (hash by šel spojit mezi dny)';
  end if;
  if (select count(*) from public.analytics_salts) <> 1 then
    raise exception 'TEST FAILED: čekána právě jedna (dnešní) sůl';
  end if;
end $$;

-- === Strop na návštěvníka ===
do $$
begin
  perform set_config('request.headers', '{"user-agent":"Mozilla/5.0 (Flood)","cf-connecting-ip":"192.0.2.50"}', true);
  for i in 1..130 loop
    perform public.track_event('pageview', '/flood');
  end loop;
  if (select count(*) from public.analytics_events where path = '/flood') > 120 then
    raise exception 'TEST FAILED: rate limit na návštěvníka nefunguje';
  end if;
end $$;

-- === Nákup: jen skutečná objednávka podle UUID, jednou; globální strop ho neumlčí ===
with ins as (
  insert into public.order_submissions (customer, items, note, subtotal, delivery_cost, payment_cost, total_to_pay)
  values ('{"firstName":"Test"}'::jsonb, '[{"name":"Testovací kvarteto"}]'::jsonb, 'analytics-test', 698, 79, 0, 777)
  returning id, variable_symbol
)
insert into t_order select id, variable_symbol from ins;

do $$
declare
  v_id uuid := (select id from t_order);
begin
  perform set_config('request.headers', '{"user-agent":"Mozilla/5.0 (Buyer)","cf-connecting-ip":"203.0.113.20"}', true);
  perform public.track_event('pageview', '/kvarteta', 'google', 'cpc', 'vanoce');
  perform public.track_event('purchase', '/checkout', null, null, null, null, null, null, gen_random_uuid());
  if exists (select 1 from public.analytics_events where event = 'purchase') then
    raise exception 'TEST FAILED: nákup s neexistující objednávkou se zapsal';
  end if;

  -- Globální strop vyčerpaný: běžné události se zahodí, nákup projde.
  update public.analytics_rate set n = 3000 where bucket = date_trunc('hour', now());
  perform public.track_event('pageview', '/po-stropu');
  if exists (select 1 from public.analytics_events where path = '/po-stropu') then
    raise exception 'TEST FAILED: globální strop nefunguje';
  end if;
  perform public.track_event('purchase', '/checkout', null, null, null, null, null, null, v_id);
  perform public.track_event('purchase', '/checkout', null, null, null, null, null, null, v_id);
  if (select count(*) from public.analytics_events where event = 'purchase') <> 1 then
    raise exception 'TEST FAILED: nákup se nezapsal právě jednou (i přes strop)';
  end if;
  if (select order_vs from public.analytics_events where event = 'purchase') <> (select vs from t_order) then
    raise exception 'TEST FAILED: nákup nemá VS dohledaný ze serveru';
  end if;
  update public.analytics_rate set n = 0;
end $$;

-- === Anon ===
set local role anon;
do $$
declare
  v_raised boolean;
begin
  v_raised := false;
  begin perform 1 from public.analytics_events limit 1;
  exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon čte analytics_events'; end if;

  v_raised := false;
  begin insert into public.analytics_events (event, visitor) values ('pageview', '0123456789abcdef');
  exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon zapisuje přímo do analytics_events'; end if;

  v_raised := false;
  begin perform 1 from public.analytics_salts limit 1;
  exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon čte denní sůl'; end if;

  v_raised := false;
  begin update public.analytics_rate set n = 0;
  exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon mění počítadlo'; end if;

  v_raised := false;
  begin perform public.admin_analytics_report(current_date - 7, current_date);
  exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon smí volat admin_analytics_report'; end if;

  perform public.track_event('pageview', '/anon-ok');
end $$;
reset role;

-- === Přihlášený ne-admin ===
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001","app_metadata":{}}';
do $$
declare
  v_raised boolean := false;
begin
  begin perform public.admin_analytics_report(current_date - 7, current_date);
  exception when others then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: ne-admin čte report'; end if;
end $$;

-- === Admin ===
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000002","app_metadata":{"role":"admin"}}';
do $$
declare
  v_report jsonb;
  v_raised boolean;
  v_cpc jsonb;
  v_today jsonb;
begin
  v_report := public.admin_analytics_report(current_date - 7, current_date);
  if (v_report #>> '{totals,visits}')::int < 4 then
    raise exception 'TEST FAILED: report nevidí návštěvy (%)', v_report -> 'totals';
  end if;
  if (v_report #>> '{totals,orders}')::int < 1 or (v_report #>> '{totals,revenue}')::int < 698 then
    raise exception 'TEST FAILED: report nevidí objednávku (%)', v_report -> 'totals';
  end if;
  select s into v_cpc from jsonb_array_elements(v_report -> 'sources') s
  where s ->> 'source' = 'google' and s ->> 'medium' = 'cpc';
  if v_cpc is null or (v_cpc ->> 'orders')::int <> 1 or (v_cpc ->> 'revenue')::int <> 698 then
    raise exception 'TEST FAILED: tržba se nepřiřadila ke zdroji google/cpc (%)', v_report -> 'sources';
  end if;
  if (v_report #>> '{funnel,purchase}')::int <> 1 then
    raise exception 'TEST FAILED: trychtýř nevidí nákup (%)', v_report -> 'funnel';
  end if;
  if jsonb_array_length(v_report -> 'daily') <> 8 then
    raise exception 'TEST FAILED: denní řada nemá 8 dní';
  end if;
  select d into v_today from jsonb_array_elements(v_report -> 'daily') d
  where d ->> 'day' = ((now() at time zone 'Europe/Prague')::date)::text;
  if (v_today ->> 'visits')::int < 4 or (v_today ->> 'orders')::int < 1 then
    raise exception 'TEST FAILED: dnešní den v řadě nesedí (%)', v_today;
  end if;

  v_raised := false;
  begin perform public.admin_analytics_report(current_date, current_date - 1);
  exception when sqlstate '22023' then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: prošlo obrácené období'; end if;

  v_raised := false;
  begin perform public.admin_analytics_report(current_date - 365, current_date);
  exception when sqlstate '22023' then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: prošlo období delší než 120 dní'; end if;
end $$;
reset role;

select 'VŠECHNY TESTY PROŠLY' as result;

rollback;
