-- Číslo objednávky (ORD-<timestamp>) k záznamu objednávky, aby ho ukázal /admin/objednavky.
-- Přiděluje ho n8n „Nová objednávka" (node Validate VS) ve stejném PATCHi, který řádek
-- claimne (received -> notified). Starší objednávky ho nemají (null).
-- Záměrně NE unique: kolize v téže milisekundě by shodila claim a objednávka by
-- nedostala e-maily ani fakturu — horší než teoretický duplikát čísla.
alter table public.order_submissions add column if not exists order_number text;

drop index if exists public.order_submissions_order_number_key;
create index if not exists order_submissions_order_number_idx
  on public.order_submissions (order_number);
