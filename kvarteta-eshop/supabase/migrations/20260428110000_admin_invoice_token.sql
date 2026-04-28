-- Wrapper RPC so admins can compute view token for any invoice.
-- Frontend admin UI calls this to construct the /api/faktura/<id>?t=<token> URL.

create or replace function public.get_admin_invoice_token(p_id uuid)
returns text
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Forbidden: admin role required';
  end if;
  return public.invoice_view_token(p_id);
end;
$$;

revoke execute on function public.get_admin_invoice_token(uuid) from public, anon;
grant  execute on function public.get_admin_invoice_token(uuid) to authenticated;
