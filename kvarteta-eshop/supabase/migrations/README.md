# Supabase migrace

Tato složka obsahuje SQL migrace pro Supabase databázi projektu.

## Aplikace migrace na produkci

Migrace **NENÍ** automaticky aplikována — musí ji spustit Karel manuálně:

### Přes Supabase Studio (jednodušší)
1. Otevřít [Supabase Studio](https://supabase.com/dashboard/project/_/sql).
2. Zvolit projekt hromadovky.cz.
3. SQL Editor → New query → vložit obsah migrace → Run.
4. Ověřit v Table Editor, že tabulky `invoices` a `invoice_counters` existují.

### Přes Supabase CLI (pokročilejší)
```bash
# Předpoklad: Supabase CLI nainstalován + linknutý projekt
supabase db push
```

## Migrace v této složce

- `20260428000000_invoices.sql` — fakturace + dobropisy. Vytvoří tabulky `invoice_counters`, `invoices`, RPC `next_invoice_number(doc_type)`, RLS policies, Storage bucket `invoices` a Storage policies.

## Po aplikaci migrace 20260428000000_invoices.sql

1. **Nastav admin roli pro Karlův účet** v Supabase Studio:
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
   where email = 'karel.hromada30@gmail.com';
   ```
2. **Karel se musí odhlásit a znovu přihlásit**, aby mu Supabase vystavilo nový JWT s `app_metadata.role = 'admin'`.
3. **Test RPC**:
   ```sql
   select next_invoice_number('invoice');     -- vrátí např. '2026-0001'
   select next_invoice_number('credit_note'); -- vrátí např. 'D-2026-0001'
   ```
4. **Smaž testovací řádky** z `invoice_counters` před ostrým provozem (jinak budeš začínat od vyšší sekvence):
   ```sql
   delete from invoice_counters where year = 2026;
   ```

## Konvence

- Časový prefix: `RRRRMMDDHHMMSS`. Migrace v jednom dni → inkrementuj minutu.
- Idempotence: každá migrace musí být bezpečně spustitelná opakovaně (`if not exists`, `on conflict do nothing`).
- Komentáře v plpgsql: piš česky, kód SQL anglicky.
