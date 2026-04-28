-- Invoice viewing via HMAC-signed permanent link
-- Replaces the fragile "email link → Supabase Storage signed URL" approach.
-- Email recipients click /faktura/<id>?t=<hmac> → frontend calls
-- get_invoice_for_view(id, token) → RPC validates HMAC and returns the row
-- if it matches. Storage HTML stays as legal archive only.

-- pgcrypto provides hmac() (lives in `extensions` schema on Supabase).
create extension if not exists pgcrypto with schema extensions;

-- Locked-down secrets table. Service-role only; even authenticated/anon roles
-- can't see anything thanks to RLS denying everything by default.
create table if not exists app_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_secrets enable row level security;
-- No policies → no select/insert/update/delete for anon/authenticated.
-- Service-role bypasses RLS automatically.

-- Compute deterministic HMAC token for an invoice id.
create or replace function public.invoice_view_token(p_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_secret text;
begin
  select value into v_secret from app_secrets where key = 'invoice_view_secret';
  if v_secret is null or v_secret = '' then
    raise exception 'invoice_view_secret not configured (insert into app_secrets first)';
  end if;
  return encode(extensions.hmac(p_id::text, v_secret, 'sha256'), 'hex');
end;
$$;

comment on function public.invoice_view_token(uuid) is
  'Computes HMAC-SHA256(invoice_id, secret) hex. Service-role only — frontend must NOT call this.';

revoke execute on function public.invoice_view_token(uuid) from public, anon, authenticated;
grant  execute on function public.invoice_view_token(uuid) to service_role;

-- Public RPC: validates HMAC and returns the invoice row (or null).
-- Cached HMAC lookup avoids re-reading secret on each call.
create or replace function public.get_invoice_for_view(p_id uuid, p_token text)
returns invoices
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_inv invoices;
  v_secret text;
  v_expected text;
begin
  if p_id is null or p_token is null then return null; end if;

  select * into v_inv from invoices where id = p_id;
  if not found then return null; end if;

  select value into v_secret from app_secrets where key = 'invoice_view_secret';
  if v_secret is null then return null; end if;

  v_expected := encode(extensions.hmac(p_id::text, v_secret, 'sha256'), 'hex');
  if v_expected = p_token then
    return v_inv;
  end if;
  return null;
end;
$$;

comment on function public.get_invoice_for_view(uuid, text) is
  'Returns the invoice row when HMAC token matches; otherwise null. Anon-callable: token is the only auth.';

grant execute on function public.get_invoice_for_view(uuid, text) to anon, authenticated;
