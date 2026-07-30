-- Rate limit na zakládání objednávek + vazba faktur na uživatele.
--
-- STAV: aplikováno na produkci 2026-07-30 (MCP apply_migration:
--       order_submission_rate_limit + invoices_user_id_rls).
--
-- Proč:
--  1) create_order_submission je SECURITY DEFINER spustitelná anonem bez jakéhokoli
--     stropu — smyčka {RPC → webhook} vyrobí neomezeně faktur s nepřerušitelnou
--     účetní číselnou řadou (§35 ZoÚ) a rozešle stejný počet e-mailů.
--  2) Policy "users read own invoices" porovnávala e-mail z JWT s customer->>'email'.
--     Registrace se stejným e-mailem = přístup k cizím fakturám (adresa, telefon, IČO).

-- === 1) Rate limit ===
-- Limity jsou řádově nad reálným provozem, takže legitimního zákazníka netrefí.
create or replace function public.create_order_submission(
  p_idempotency_key text, p_customer jsonb, p_items jsonb, p_photo_paths jsonb,
  p_rendered_paths jsonb, p_subtotal integer, p_delivery_cost integer,
  p_payment_cost integer, p_total_to_pay integer, p_delivery_method text,
  p_payment_method text, p_pickup_point text, p_note text)
returns table(id uuid, variable_symbol text)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_row public.order_submissions;
  v_recent_total integer;
  v_recent_ip integer;
  v_ip text;
begin
  -- Idempotence: opakované odeslání téže objednávky vrací původní řádek (limit se neuplatní).
  if p_idempotency_key is not null then
    select * into v_row from public.order_submissions o where o.idempotency_key = p_idempotency_key;
    if found then
      id := v_row.id; variable_symbol := v_row.variable_symbol; return next; return;
    end if;
  end if;

  select count(*) into v_recent_total
  from public.order_submissions
  where created_at > now() - interval '1 hour';
  if v_recent_total >= 30 then
    raise exception 'Objednávku se teď nepodařilo přijmout, zkuste to prosím za chvíli.'
      using errcode = 'P0001';
  end if;

  -- Per-IP strop (jen když PostgREST hlavičky předá; přes přímé SQL je NULL a přeskočí se).
  begin
    v_ip := coalesce(
      current_setting('request.headers', true)::json ->> 'cf-connecting-ip',
      current_setting('request.headers', true)::json ->> 'x-forwarded-for'
    );
  exception when others then
    v_ip := null;
  end;
  if v_ip is not null then
    select count(*) into v_recent_ip
    from public.order_submissions
    where created_at > now() - interval '1 hour'
      and customer ->> '_ip' = v_ip;
    if v_recent_ip >= 10 then
      raise exception 'Objednávku se teď nepodařilo přijmout, zkuste to prosím za chvíli.'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.order_submissions(
    user_id, idempotency_key, customer, items, photo_paths, rendered_paths,
    subtotal, delivery_cost, payment_cost, total_to_pay,
    delivery_method, payment_method, pickup_point, note
  ) values (
    auth.uid(), p_idempotency_key,
    -- IP se ukládá do customer._ip jen pro potřeby rate limitu (klient ji neposílá)
    coalesce(p_customer, '{}'::jsonb) || case when v_ip is null then '{}'::jsonb
                                              else jsonb_build_object('_ip', v_ip) end,
    coalesce(p_items, '[]'::jsonb),
    coalesce(p_photo_paths, '[]'::jsonb), coalesce(p_rendered_paths, '[]'::jsonb),
    coalesce(p_subtotal, 0), coalesce(p_delivery_cost, 0), coalesce(p_payment_cost, 0), coalesce(p_total_to_pay, 0),
    p_delivery_method, p_payment_method, p_pickup_point, p_note
  )
  returning * into v_row;

  id := v_row.id; variable_symbol := v_row.variable_symbol; return next;
end;
$function$;

create index if not exists idx_order_submissions_created_at
  on public.order_submissions (created_at desc);

-- === 2) Faktury vázat na user_id, ne na řetězec e-mailu ===
alter table public.invoices add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_invoices_user_id on public.invoices (user_id);

-- Backfill z objednávek podle variabilního symbolu (order_submissions.user_id je z auth.uid()).
update public.invoices i
set user_id = o.user_id
from public.order_submissions o
where i.user_id is null
  and o.user_id is not null
  and o.variable_symbol = i.variable_symbol;

drop policy if exists "users read own invoices" on public.invoices;
create policy "users read own invoices"
on public.invoices
for select
to authenticated
using (
  -- primárně vlastnictví přes user_id
  (select auth.uid()) = user_id
  -- fallback pro objednávky bez účtu (host), kde user_id nikdy nevznikne
  or (user_id is null and (auth.jwt() ->> 'email') = (customer ->> 'email'))
);
