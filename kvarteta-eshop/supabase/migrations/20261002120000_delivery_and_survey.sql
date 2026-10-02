-- Doručení objednávky + dotazník spokojenosti.
--
-- Admin v /admin/objednavky označí objednávku jako doručenou (mark_order_delivered).
-- n8n workflow „Hromadovky – Dotazník spokojenosti" denně volá claim_due_survey_emails():
--   * 1. e-mail 2 dny po doručení,
--   * připomínka 7. den po doručení, pokud zákazník neodpověděl ani se neodhlásil.
-- Zákazník odpovídá bez přihlášení přes /dotaznik?o=<id>&t=<hmac> — token je jediná autorizace
-- (stejný princip jako get_invoice_for_view).

alter table public.order_submissions add column if not exists delivered_at timestamptz;

create table if not exists public.order_surveys (
  id uuid primary key default gen_random_uuid(),
  order_submission_id uuid not null unique references public.order_submissions(id) on delete cascade,
  first_sent_at timestamptz,
  reminder_sent_at timestamptz,
  rating smallint check (rating between 1 and 5),
  rated_at timestamptz,
  -- Klíč kanálu ze src/data/survey.ts. Záměrně jen kontrola formátu, ne výčet:
  -- seznam kanálů se mění ve frontendu bez migrace.
  source text check (source ~ '^[a-z0-9_]{1,40}$'),
  source_other text check (char_length(source_other) <= 200),
  comment text check (char_length(comment) <= 2000),
  answered_at timestamptz,
  opted_out_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.order_surveys is
  'Dotazník spokojenosti k objednávce (1:1). Zapisují jen SECURITY DEFINER funkce; čte admin.';

alter table public.order_surveys enable row level security;

-- Supabase dává anon/authenticated na nové tabulky plná práva; RLS zápisy blokuje,
-- ale TRUNCATE pod RLS nespadá — odebrat vše a nechat jen čtení (dál ho omezuje policy).
revoke all on public.order_surveys from anon, authenticated;
grant select on public.order_surveys to authenticated;

drop policy if exists "admin reads order surveys" on public.order_surveys;
create policy "admin reads order surveys" on public.order_surveys
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Secret pro podpis odkazů; hodnota se nikde nevypisuje.
insert into public.app_secrets (key, value)
values ('survey_link_secret', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

-- === Token ===
create or replace function public.survey_token(p_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_secret text;
begin
  select value into v_secret from public.app_secrets where key = 'survey_link_secret';
  if v_secret is null or v_secret = '' then
    raise exception 'survey_link_secret not configured';
  end if;
  return encode(extensions.hmac(p_id::text, v_secret, 'sha256'), 'hex');
end;
$$;

revoke execute on function public.survey_token(uuid) from public, anon, authenticated;
grant  execute on function public.survey_token(uuid) to service_role;

-- Interní kontrola tokenu; volají ji jen funkce níže (běží pod vlastníkem).
create or replace function public.survey_token_valid(p_id uuid, p_token text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_id is null or p_token is null or char_length(p_token) <> 64 then
    return false;
  end if;
  if not exists (select 1 from public.order_submissions where id = p_id) then
    return false;
  end if;
  return public.survey_token(p_id) = p_token;
end;
$$;

revoke execute on function public.survey_token_valid(uuid, text) from public, anon, authenticated;

-- === Admin: označení doručení ===
create or replace function public.mark_order_delivered(p_id uuid, p_delivered_on date default null)
returns public.order_submissions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Europe/Prague')::date;
  v_date date := coalesce(p_delivered_on, v_today);
  v_row public.order_submissions;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Forbidden: admin role required';
  end if;
  if v_date > v_today then
    raise exception 'Datum doručení nesmí být v budoucnu.' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.order_surveys s
    where s.order_submission_id = p_id and s.first_sent_at is not null
  ) then
    raise exception 'Dotazník už byl odeslán, datum doručení nelze měnit.' using errcode = 'P0001';
  end if;

  update public.order_submissions
  set delivered_at = (v_date + time '12:00') at time zone 'Europe/Prague'
  where id = p_id
  returning * into v_row;

  if not found then
    raise exception 'Objednávka nenalezena.' using errcode = 'P0001';
  end if;
  return v_row;
end;
$$;

revoke execute on function public.mark_order_delivered(uuid, date) from public, anon;
grant  execute on function public.mark_order_delivered(uuid, date) to authenticated;

create or replace function public.unmark_order_delivered(p_id uuid)
returns public.order_submissions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.order_submissions;
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Forbidden: admin role required';
  end if;
  if exists (
    select 1 from public.order_surveys s
    where s.order_submission_id = p_id and s.first_sent_at is not null
  ) then
    raise exception 'Dotazník už byl odeslán, doručení nelze zrušit.' using errcode = 'P0001';
  end if;

  update public.order_submissions set delivered_at = null where id = p_id returning * into v_row;
  if not found then
    raise exception 'Objednávka nenalezena.' using errcode = 'P0001';
  end if;
  return v_row;
end;
$$;

revoke execute on function public.unmark_order_delivered(uuid) from public, anon;
grant  execute on function public.unmark_order_delivered(uuid) to authenticated;

-- === n8n: výběr + claim e-mailů k odeslání ===
-- Jeden příkaz = jeden snapshot: objednávka claimnutá jako 'first' nemůže v témže běhu
-- dostat i 'reminder'. Claim PŘED odesláním → opakovaný běh nikdy nepošle e-mail dvakrát
-- (při selhání SMTP e-mail propadne; workflow na to upozorní admina).
create or replace function public.claim_due_survey_emails()
returns table (
  kind text,
  order_submission_id uuid,
  email text,
  first_name text,
  order_number text,
  variable_symbol text,
  item_names jsonb,
  token text
)
language sql
volatile
security definer
set search_path = ''
as $$
  with today as (
    select (now() at time zone 'Europe/Prague')::date as d
  ),
  due_first as (
    select o.id
    from public.order_submissions o
    left join public.order_surveys s on s.order_submission_id = o.id
    cross join today
    where o.delivered_at is not null
      and (o.delivered_at at time zone 'Europe/Prague')::date <= today.d - 2
      -- pojistka: zpětné označení starých objednávek nerozešle dávku
      and o.delivered_at > now() - interval '30 days'
      and s.first_sent_at is null
      and s.rating is null and s.answered_at is null and s.opted_out_at is null
      -- Přísný tvar: adresa jde do SMTP "To" — čárka by přidala dalšího příjemce,
      -- znaky <> by se dostaly do alertu adminovi.
      and coalesce(o.customer ->> 'email', '') ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    order by o.delivered_at
    limit 50
  ),
  claimed_first as (
    insert into public.order_surveys as s (order_submission_id, first_sent_at)
    select id, now() from due_first
    on conflict (order_submission_id) do update set first_sent_at = now()
      where s.first_sent_at is null
    returning s.order_submission_id as id
  ),
  claimed_reminder as (
    update public.order_surveys s
    set reminder_sent_at = now()
    from public.order_submissions o, today
    where o.id = s.order_submission_id
      and o.delivered_at is not null
      and (o.delivered_at at time zone 'Europe/Prague')::date <= today.d - 7
      and s.first_sent_at is not null
      -- když 1. e-mail odešel se zpožděním (výpadek), nepřipomínat hned vzápětí
      and s.first_sent_at <= now() - interval '4 days'
      and s.reminder_sent_at is null
      and s.rating is null and s.answered_at is null and s.opted_out_at is null
    returning s.order_submission_id as id
  ),
  claimed as (
    select 'first'::text as kind, id from claimed_first
    union all
    select 'reminder'::text, id from claimed_reminder
  )
  select
    c.kind,
    o.id,
    o.customer ->> 'email',
    o.customer ->> 'firstName',
    o.order_number,
    o.variable_symbol,
    -- items nejsou pole → prázdný seznam; jsonb_array_elements by jinak shodil CELÝ běh
    -- (a tím každý další, protože by se nic neclaimlo).
    case when jsonb_typeof(o.items) = 'array'
      then (select coalesce(jsonb_agg(it ->> 'name'), '[]'::jsonb) from jsonb_array_elements(o.items) it)
      else '[]'::jsonb
    end,
    public.survey_token(o.id)
  from claimed c
  join public.order_submissions o on o.id = c.id;
$$;

comment on function public.claim_due_survey_emails() is
  'Atomicky vybere a označí dotazníkové e-maily k odeslání (first / reminder). Jen service_role (n8n).';

revoke execute on function public.claim_due_survey_emails() from public, anon, authenticated;
grant  execute on function public.claim_due_survey_emails() to service_role;

-- === Veřejné RPC (autorizace = token) ===
create or replace function public.get_survey_for_view(p_id uuid, p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.survey_token_valid(p_id, p_token) then
    return null;
  end if;
  -- Žádné osobní údaje: odkaz z e-mailu se může přeposlat.
  select jsonb_build_object(
    'order_number', o.order_number,
    'rating', s.rating,
    'answered', s.answered_at is not null,
    'opted_out', s.opted_out_at is not null
  ) into v_result
  from public.order_submissions o
  left join public.order_surveys s on s.order_submission_id = o.id
  where o.id = p_id;
  return v_result;
end;
$$;

grant execute on function public.get_survey_for_view(uuid, text) to anon, authenticated;

create or replace function public.submit_survey_rating(p_id uuid, p_token text, p_rating integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.survey_token_valid(p_id, p_token) then
    return false;
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    return false;
  end if;

  insert into public.order_surveys as s (order_submission_id, rating, rated_at)
  values (p_id, p_rating, now())
  on conflict (order_submission_id) do update
    set rating = excluded.rating, rated_at = excluded.rated_at
    -- odeslaný dotazník už klik na starý odkaz v e-mailu nepřepíše
    where s.answered_at is null;
  return true;
end;
$$;

grant execute on function public.submit_survey_rating(uuid, text, integer) to anon, authenticated;

create or replace function public.submit_survey_answers(
  p_id uuid, p_token text, p_rating integer,
  p_source text, p_source_other text, p_comment text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source text := nullif(btrim(coalesce(p_source, '')), '');
  v_other text := nullif(btrim(coalesce(p_source_other, '')), '');
  v_comment text := nullif(btrim(coalesce(p_comment, '')), '');
begin
  if not public.survey_token_valid(p_id, p_token) then
    return false;
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Vyberte prosím hodnocení 1–5.' using errcode = 'P0001';
  end if;
  if v_source is not null and v_source !~ '^[a-z0-9_]{1,40}$' then
    raise exception 'Neplatná hodnota zdroje.' using errcode = 'P0001';
  end if;
  if char_length(coalesce(v_other, '')) > 200 or char_length(coalesce(v_comment, '')) > 2000 then
    raise exception 'Text je příliš dlouhý.' using errcode = 'P0001';
  end if;

  insert into public.order_surveys as s
    (order_submission_id, rating, rated_at, source, source_other, comment, answered_at)
  values (p_id, p_rating, now(), v_source, v_other, v_comment, now())
  on conflict (order_submission_id) do update
    set rating = excluded.rating,
        rated_at = excluded.rated_at,
        source = excluded.source,
        source_other = excluded.source_other,
        comment = excluded.comment,
        answered_at = excluded.answered_at
    -- odeslaný dotazník je konečný: přeposlaný odkaz ho nesmí přepsat
    where s.answered_at is null;
  return true;
end;
$$;

grant execute on function public.submit_survey_answers(uuid, text, integer, text, text, text)
  to anon, authenticated;

create or replace function public.survey_opt_out(p_id uuid, p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.survey_token_valid(p_id, p_token) then
    return false;
  end if;
  insert into public.order_surveys as s (order_submission_id, opted_out_at)
  values (p_id, now())
  on conflict (order_submission_id) do update
    set opted_out_at = coalesce(s.opted_out_at, excluded.opted_out_at);
  return true;
end;
$$;

grant execute on function public.survey_opt_out(uuid, text) to anon, authenticated;
