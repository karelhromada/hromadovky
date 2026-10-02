-- Notifikace adminům o odpovědi z dotazníku spokojenosti.
--
-- Trigger na order_surveys pošle webhook do n8n („Hromadovky – Dotazník: notifikace odpovědi").
-- Webhook je veřejný, proto mu n8n nevěří: podle id zavolá claim_survey_notifications(),
-- která odpověď atomicky vyzvedne a označí jako oznámenou (žádné duplicity, žádný spam).
--   * odeslaný formulář → notifikace hned,
--   * jen klik na hvězdičku v e-mailu → n8n počká 10 minut (zákazník možná formulář dokončí),
--   * formulář odeslaný AŽ PO oznámení hvězdičky → druhá notifikace s plnou odpovědí,
--   * p_id = null → denní zametání odpovědí, jejichž webhook nedorazil (výpadek n8n).

alter table public.order_surveys add column if not exists notified_at timestamptz;

create or replace function public.claim_survey_notifications(p_id uuid default null)
returns table (
  order_submission_id uuid,
  order_number text,
  variable_symbol text,
  customer_name text,
  rating smallint,
  source text,
  source_other text,
  comment text,
  answered boolean,
  item_names jsonb
)
language sql
volatile
security definer
set search_path = ''
as $$
  with claimed as (
    update public.order_surveys s
    set notified_at = now()
    where (s.rating is not null or s.answered_at is not null)
      and (s.notified_at is null or s.answered_at > s.notified_at)
      and (
        s.order_submission_id = p_id
        -- zametání: jen odpovědi, které už měly dost času přijít webhookem
        or (p_id is null and coalesce(s.answered_at, s.rated_at) < now() - interval '30 minutes')
      )
    returning s.*
  )
  select
    o.id,
    o.order_number,
    o.variable_symbol,
    nullif(btrim(coalesce(o.customer ->> 'firstName', '') || ' ' || coalesce(o.customer ->> 'lastName', '')), ''),
    c.rating,
    c.source,
    c.source_other,
    c.comment,
    c.answered_at is not null,
    case when jsonb_typeof(o.items) = 'array'
      then (select coalesce(jsonb_agg(it ->> 'name'), '[]'::jsonb) from jsonb_array_elements(o.items) it)
      else '[]'::jsonb
    end
  from claimed c
  join public.order_submissions o on o.id = c.order_submission_id;
$$;

comment on function public.claim_survey_notifications(uuid) is
  'Atomicky vyzvedne odpovědi z dotazníku k oznámení adminům. Jen service_role (n8n).';

revoke execute on function public.claim_survey_notifications(uuid) from public, anon, authenticated;
grant  execute on function public.claim_survey_notifications(uuid) to service_role;

-- Stejný mechanismus jako "new-user-webhook" na auth.users (pg_net, asynchronně —
-- nedostupné n8n neshodí zápis odpovědi). notified_at v seznamu sloupců záměrně není:
-- claim tak sám sebe znovu nespouští.
drop trigger if exists "survey-answered-webhook" on public.order_surveys;
create trigger "survey-answered-webhook"
  after insert or update of rating, answered_at on public.order_surveys
  for each row
  when (new.rating is not null or new.answered_at is not null)
  execute function supabase_functions.http_request(
    'https://n8n.hromadovky.cz/webhook/survey-answered',
    'POST',
    '{"Content-type":"application/json"}',
    '{}',
    '5000'
  );
