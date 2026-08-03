-- Retence osiřelých fotek + doladění rate limitu.
--
-- STAV: aplikováno na produkci 2026-08-03 (MCP apply_migration:
--       list_deletable_order_uploads + rate_limit_trust_cloudflare_only).

-- === 1) Retence osiřelých fotek v bucketu order-uploads ===
--
-- Bucket nikdy nic nemazal a rostl donekonečna (k 2026-08-03: 25 objektů, 13 MB,
-- z toho 12 MB starších 30 dnů a NIC z toho navázané na objednávku).
-- Mazat lze jen přes Storage API — přímý DELETE blokuje trigger storage.protect_delete
-- a stejně by zanechal osiřelé soubory v S3. Tahle funkce jen VYBERE, co se smí smazat;
-- samotné mazání dělá n8n workflow "Hromadovky – Úklid osiřelých fotek" (REgPCdhst99BjZZM,
-- neděle 3:40, Code node s $env.SUPABASE_SERVICE_KEY).
create or replace function public.list_deletable_order_uploads(p_days integer default 30)
returns table (name text, size_bytes bigint, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  with referenced as (
    -- Cesty se ukládají na DVOU místech (CheckoutPage posílá obojí) — skenovat obě,
    -- jinak by budoucí nekonzistence smazala fotky navázané na objednávku.
    select jsonb_array_elements_text(photo_paths) as path from public.order_submissions
    union select jsonb_array_elements_text(rendered_paths) from public.order_submissions
    union select jsonb_array_elements_text(coalesce(it->'photoPaths', '[]'::jsonb))
          from public.order_submissions os, jsonb_array_elements(os.items) it
    union select jsonb_array_elements_text(coalesce(it->'renderedCardPaths', '[]'::jsonb))
          from public.order_submissions os, jsonb_array_elements(os.items) it
  ),
  referenced_prefixes as (
    select distinct split_part(path, '/', 1) as prefix from referenced where path is not null
  )
  select o.name, (o.metadata->>'size')::bigint, o.created_at
  from storage.objects o
  where o.bucket_id = 'order-uploads'
    -- drží se CELÝ draft, ne jednotlivé soubory
    and split_part(o.name, '/', 1) not in (select prefix from referenced_prefixes)
    -- greatest(p_days, 14): pojistka proti překlepu v n8n, aby nešlo smazat živé košíky
    and o.created_at < now() - make_interval(days => greatest(p_days, 14))
    -- celý draft musí být za retencí — rozdělaný košík se nikdy nesmaže po částech
    and not exists (
      select 1 from storage.objects o2
      where o2.bucket_id = 'order-uploads'
        and split_part(o2.name, '/', 1) = split_part(o.name, '/', 1)
        and o2.created_at >= now() - make_interval(days => greatest(p_days, 14))
    )
  order by o.created_at
  limit 500;
$$;

comment on function public.list_deletable_order_uploads(integer) is
  'Objekty v order-uploads, které lze bezpečně smazat: nepatří k žádné objednávce a celý jejich draft je starší retence (min. 14 dní). Volá jen service_role z úklidového n8n workflow.';

revoke execute on function public.list_deletable_order_uploads(integer) from public, anon, authenticated;

-- === 2) Rate limit: přestat důvěřovat x-forwarded-for ===
-- XFF si klient může poslat sám, takže per-IP strop šel obejít náhodnou hodnotou.
-- cf-connecting-ip nastavuje Cloudflare před Supabase a klientskou hodnotu přepisuje.
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
  if p_idempotency_key is not null then
    select * into v_row from public.order_submissions o where o.idempotency_key = p_idempotency_key;
    if found then
      id := v_row.id; variable_symbol := v_row.variable_symbol; return next; return;
    end if;
  end if;

  begin
    v_ip := current_setting('request.headers', true)::json ->> 'cf-connecting-ip';
  exception when others then
    v_ip := null;
  end;

  if v_ip is not null then
    select count(*) into v_recent_ip
    from public.order_submissions
    where created_at > now() - interval '1 hour'
      and customer ->> '_ip' = v_ip;
    if v_recent_ip >= 15 then
      raise exception 'Objednávku se teď nepodařilo přijmout, zkuste to prosím za chvíli.'
        using errcode = 'P0001';
    end if;
  end if;

  select count(*) into v_recent_total
  from public.order_submissions
  where created_at > now() - interval '1 hour';
  if v_recent_total >= 300 then
    raise exception 'Objednávku se teď nepodařilo přijmout, zkuste to prosím za chvíli.'
      using errcode = 'P0001';
  end if;

  insert into public.order_submissions(
    user_id, idempotency_key, customer, items, photo_paths, rendered_paths,
    subtotal, delivery_cost, payment_cost, total_to_pay,
    delivery_method, payment_method, pickup_point, note
  ) values (
    auth.uid(), p_idempotency_key,
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
