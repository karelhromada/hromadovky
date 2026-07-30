-- Zpřísnění anonymního uploadu do bucketu order-uploads + oprava upsert bugu renderů.
--
-- STAV: aplikováno na produkci 2026-07-30 (MCP apply_migration:
--       harden_order_uploads_policies + order_uploads_daily_cap).
--       Tento soubor je kanonický zápis pro audit a obnovu — je idempotentní,
--       takže se dá bezpečně spustit znovu.
--
-- Proč:
--  1) Původní policy "anonymní upload 17rzor7_0" dovolovala komukoli (i nepřihlášenému)
--     nahrát neomezené množství 20MB souborů na libovolnou cestu v bucketu.
--  2) Rendery karet se nahrávají s upsert:true. Storage upsert = INSERT ON CONFLICT
--     DO UPDATE, což vyžaduje UPDATE i SELECT permission — ty chyběly, takže druhé
--     "Přidat do košíku" ve stejné session vždy selhalo.

-- 1) Počet objektů v draftu. SECURITY DEFINER je nutný: anon nemá SELECT na
--    storage.objects, takže subquery přímo v policy by pod RLS volajícího vrátila 0
--    a limit by nefungoval.
create or replace function public.count_order_upload_objects(p_draft text)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  -- Přijímá výhradně tvar draft-<uuid>; cokoli jiného vrátí "nekonečno", aby policy selhala.
  -- Regex zároveň garantuje, že p_draft neobsahuje LIKE wildcardy (% _).
  if p_draft !~ '^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return 2147483647;
  end if;
  select count(*) into v_count
  from storage.objects
  where bucket_id = 'order-uploads'
    and name like p_draft || '/%';
  return v_count;
end;
$$;

comment on function public.count_order_upload_objects(text) is
  'Počet objektů pod prefixem draft-<uuid>/ v bucketu order-uploads. Pro RLS cap na anonymní upload.';

revoke execute on function public.count_order_upload_objects(text) from public, anon, authenticated;
grant execute on function public.count_order_upload_objects(text) to anon, authenticated;

-- 2) Existence objektu — úniková klauzule pro re-upsert renderu na plném draftu.
--    PG vyhodnocuje INSERT WITH CHECK i na konfliktní cestě upsertu, takže bez ní
--    by draft na capu zablokoval i legitimní opakované "Přidat do košíku".
create or replace function public.order_upload_exists(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from storage.objects
    where bucket_id = 'order-uploads' and name = p_name
  );
$$;

comment on function public.order_upload_exists(text) is
  'Existuje objekt daného jména v order-uploads? Jen pro RLS — re-upsert existujícího objektu bucket nezvětšuje.';

revoke execute on function public.order_upload_exists(text) from public, anon, authenticated;
grant execute on function public.order_upload_exists(text) to anon, authenticated;

-- 3) Globální denní pojistka — per-draft cap sám o sobě nezastaví rotaci draftů
--    (útočník generuje nová UUID zdarma).
create or replace function public.count_recent_order_uploads()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from storage.objects
  where bucket_id = 'order-uploads'
    and created_at > now() - interval '1 day';
$$;

comment on function public.count_recent_order_uploads() is
  'Počet objektů nahraných do order-uploads za posledních 24 h. Pro RLS denní cap.';

revoke execute on function public.count_recent_order_uploads() from public, anon, authenticated;
grant execute on function public.count_recent_order_uploads() to anon, authenticated;

-- 4) INSERT: tvar cesty + cap 300 souborů na draft (legit maximum ~264) + 3000/den.
drop policy if exists "order-uploads: anon insert (tvar cesty + cap)" on storage.objects;
create policy "order-uploads: anon insert (tvar cesty + cap)"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'order-uploads'
  and name ~ '^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/(renders/)?[^/]+$'
  and (
    ( public.count_order_upload_objects(split_part(name, '/', 1)) < 300
      and public.count_recent_order_uploads() < 3000 )
    or public.order_upload_exists(name)
  )
);

-- 5) UPDATE + SELECT jen na renders/ — nutné pro upsert renderů; originály fotek
--    zůstávají pro anon nepřepsatelné i nečitelné.
drop policy if exists "order-uploads: anon upsert renders (update)" on storage.objects;
create policy "order-uploads: anon upsert renders (update)"
on storage.objects
for update
to anon, authenticated
using (
  bucket_id = 'order-uploads'
  and name ~ '^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/renders/[^/]+$'
)
with check (
  bucket_id = 'order-uploads'
  and name ~ '^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/renders/[^/]+$'
);

drop policy if exists "order-uploads: anon select renders (pro upsert)" on storage.objects;
create policy "order-uploads: anon select renders (pro upsert)"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'order-uploads'
  and name ~ '^draft-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/renders/[^/]+$'
);

-- 6) Až po vytvoření náhrad odstranit původní bezlimitní policy.
drop policy if exists "anonymní upload 17rzor7_0" on storage.objects;
