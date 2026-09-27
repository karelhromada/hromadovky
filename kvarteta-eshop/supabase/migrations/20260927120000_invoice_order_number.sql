-- Číslo objednávky (ORD-<timestamp>) generované n8n workflow „Nová objednávka".
-- Dřív žilo jen v e-mailu a Google Sheetu; ukládáme ho k faktuře, aby bylo vidět v adminu.
alter table public.invoices add column if not exists order_number text;

create index if not exists invoices_order_number_idx on public.invoices (order_number);

-- Dobropis dědí číslo objednávky z původní faktury (dobropisový workflow ho neposílá).
create or replace function public.invoices_inherit_order_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.order_number is null and new.original_invoice_id is not null then
    select order_number into new.order_number
    from public.invoices
    where id = new.original_invoice_id;
  end if;
  return new;
end;
$$;

drop trigger if exists invoices_inherit_order_number on public.invoices;
create trigger invoices_inherit_order_number
  before insert on public.invoices
  for each row execute function public.invoices_inherit_order_number();
