-- Admin smí číst obsah bucketu order-uploads (galerie objednávek v /admin/objednavky).
--
-- STAV: aplikováno na produkci 2026-07-30 (MCP apply_migration: admin_reads_order_uploads).
--       Tento soubor je kanonický zápis pro audit a obnovu.
--
-- Bez této policy nemá klient na order-uploads žádné SELECT právo, takže nejde
-- vytvořit signed URL ani soubor stáhnout — obrázky objednávek byly dostupné jen
-- přes 14denní odkazy, které rozesílá n8n přes service key.
-- Mechanismus je shodný s existující policy "admin downloads all invoice pdfs".

drop policy if exists "admin reads all order uploads" on storage.objects;
create policy "admin reads all order uploads"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'order-uploads'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
