-- Faktury a dobropisy pro hromadovky.cz
-- Karel Hromada, OSVČ, IČO 76137767, neplátce DPH dle §6 ZDPH
-- Formát čísla: faktura RRRR-NNNN, dobropis D-RRRR-NNNN, reset každý rok

-- ============================================================================
-- 1) Counter table + atomická RPC pro generování čísel
-- ============================================================================

create table if not exists invoice_counters (
  type text not null check (type in ('invoice', 'credit_note')),
  year int not null,
  last_seq int not null default 0,
  primary key (type, year)
);

comment on table invoice_counters is
  'Per-year sequential counters for invoice/credit_note numbering. Atomically incremented via next_invoice_number().';

create or replace function next_invoice_number(doc_type text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  y int := extract(year from current_date);
  s int;
  prefix text;
begin
  if doc_type not in ('invoice', 'credit_note') then
    raise exception 'invalid doc_type: %', doc_type;
  end if;

  insert into invoice_counters (type, year, last_seq)
    values (doc_type, y, 1)
  on conflict (type, year) do update
    set last_seq = invoice_counters.last_seq + 1
  returning last_seq into s;

  prefix := case when doc_type = 'credit_note' then 'D-' else '' end;
  return prefix || y::text || '-' || lpad(s::text, 4, '0');
end;
$$;

comment on function next_invoice_number(text) is
  'Atomically returns the next invoice/credit_note number for the current year. Use SECURITY DEFINER so n8n service role can call without direct counter access.';

-- ============================================================================
-- 2) Invoices table (jednotná pro fakturu i dobropis)
-- ============================================================================

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  type text not null check (type in ('invoice', 'credit_note')),
  original_invoice_id uuid references invoices(id) on delete restrict,
  order_id uuid references orders(id) on delete set null,
  variable_symbol text not null,
  issued_at date not null default current_date,
  taxable_supply_at date not null default current_date,
  due_at date not null,
  customer jsonb not null,        -- { firstName, lastName, email, phone, street, city, zip, companyName?, ico?, dic? }
  items jsonb not null,           -- snapshot položek z košíku (u dobropisu jen vrácené)
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) not null default 0,
  cod_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,   -- pro credit_note ZÁPORNÁ hodnota
  payment_method text not null,   -- 'transfer' | 'cod'
  status text not null default 'unpaid'
    check (status in ('unpaid', 'paid', 'cancelled', 'refunded')),
  paid_at timestamptz,
  cancelled_at timestamptz,
  credit_reason text,             -- jen pro credit_note
  pdf_path text,                  -- cesta v Supabase Storage bucketu 'invoices'
  pdf_generated_at timestamptz,
  created_at timestamptz not null default now(),

  -- credit_note MUSÍ mít original_invoice_id, invoice NESMÍ
  constraint credit_note_has_original
    check (
      (type = 'credit_note' and original_invoice_id is not null)
      or (type = 'invoice' and original_invoice_id is null)
    ),
  -- credit_note má credit_reason, invoice ne
  constraint credit_note_has_reason
    check (
      (type = 'credit_note' and credit_reason is not null)
      or (type = 'invoice' and credit_reason is null)
    )
);

comment on table invoices is
  'Faktury i dobropisy v jedné tabulce. type=invoice nebo credit_note. Pro neplátce DPH dle §11 zák. 563/1991 Sb.';

create index if not exists idx_invoices_variable_symbol on invoices(variable_symbol);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_type_status on invoices(type, status);
create index if not exists idx_invoices_original on invoices(original_invoice_id);
create index if not exists idx_invoices_customer_email on invoices((customer ->> 'email'));
create index if not exists idx_invoices_issued_at on invoices(issued_at desc);

-- ============================================================================
-- 3) Row-Level Security
-- ============================================================================

alter table invoices enable row level security;
alter table invoice_counters enable row level security;

-- Counter table: jen service_role smí (n8n volá RPC která má security definer)
create policy "counters service only" on invoice_counters
  for all
  using (false)
  with check (false);

-- Invoices: zákazník vidí své doklady podle emailu v JWT
create policy "users read own invoices" on invoices
  for select
  using (
    auth.role() = 'authenticated'
    and auth.jwt() ->> 'email' = (customer ->> 'email')
  );

-- Invoices: admin vidí vše
create policy "admin reads all invoices" on invoices
  for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Invoices: jen admin smí měnit status
create policy "admin updates invoices" on invoices
  for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- INSERT a DELETE jen přes service_role (n8n) — žádná policy potřeba,
-- service_role bypass-uje RLS automaticky.

-- ============================================================================
-- 4) Storage bucket pro PDF
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- Storage RLS: zákazník stahuje jen své PDF
create policy "users download own invoice pdfs"
  on storage.objects
  for select
  using (
    bucket_id = 'invoices'
    and auth.role() = 'authenticated'
    and exists (
      select 1 from invoices i
      where i.pdf_path = storage.objects.name
        and (i.customer ->> 'email') = (auth.jwt() ->> 'email')
    )
  );

create policy "admin downloads all invoice pdfs"
  on storage.objects
  for select
  using (
    bucket_id = 'invoices'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- INSERT do bucketu jen přes service_role (n8n).
