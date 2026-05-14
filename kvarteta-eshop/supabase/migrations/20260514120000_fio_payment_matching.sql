-- Fio Banka REST API → auto-párování plateb s fakturami
-- Karel Hromada, kvarteta-eshop, n8n cron workflow `fio-payment-matcher`
-- Detail viz docs/n8n-fio-matching.md

-- ============================================================================
-- 1) Invoices: paid_amount + fio_transaction_id
--    (paid_at sloupec už existuje od 20260428000000_invoices.sql)
-- ============================================================================

alter table invoices
  add column if not exists paid_amount numeric(10,2),
  add column if not exists fio_transaction_id text;

-- Partial unique index — idempotence proti dvojímu spárování stejné Fio transakce.
-- WHERE clause umožňuje mít NULL pro nezaplacené faktury (UNIQUE NULL = OK).
create unique index if not exists idx_invoices_fio_transaction_id
  on invoices(fio_transaction_id)
  where fio_transaction_id is not null;

comment on column invoices.paid_amount is
  'Skutečně zaplacená částka z bankovní transakce (Fio column1.value). Může se lišit od total při přeplatku/nedoplatku v rámci tolerance.';

comment on column invoices.fio_transaction_id is
  'Fio API column22.value (ID pohybu, unikátní per účet). UNIQUE — brání dvojímu zpracování stejné transakce při retry/crash.';

-- ============================================================================
-- 2) payment_unmatched — evidence problémových plateb (řeší admin ručně)
-- ============================================================================

create table if not exists payment_unmatched (
  id uuid primary key default gen_random_uuid(),
  fio_transaction_id text unique not null,
  amount numeric(10,2) not null,
  variable_symbol text,
  counter_account text,
  note text,
  transaction_date date not null,
  reason text not null check (reason in (
    'no_invoice_match',      -- VS neexistuje v invoices
    'underpayment',          -- VS sedí, ale částka < total - tolerance
    'overpayment',           -- VS sedí, částka > total + tolerance (faktura byla i tak spárována)
    'duplicate_payment',     -- VS sedí, ale faktura už paid
    'payment_to_cancelled'   -- VS sedí, ale faktura cancelled/refunded
  )),
  matched_invoice_id uuid references invoices(id) on delete set null,
  received_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text,
  resolution_note text
);

comment on table payment_unmatched is
  'Bankovní transakce z Fio API, které nešlo automaticky spárovat s fakturou nebo signalizují anomálii. Admin je řeší ručně v Supabase Studio (fáze 1) nebo přes /admin/payments (fáze 2).';

create index if not exists idx_payment_unmatched_vs on payment_unmatched(variable_symbol);
create index if not exists idx_payment_unmatched_open on payment_unmatched(resolved_at)
  where resolved_at is null;

-- ============================================================================
-- 3) RLS — jen admin čte/řeší; n8n přes service_role bypass
-- ============================================================================

alter table payment_unmatched enable row level security;

create policy "admin reads payment_unmatched" on payment_unmatched
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin updates payment_unmatched" on payment_unmatched
  for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- INSERT a DELETE jen přes service_role (n8n) — bypass RLS automaticky.
