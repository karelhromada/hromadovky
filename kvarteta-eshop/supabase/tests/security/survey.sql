-- Bezpečnostní a logické testy dotazníku spokojenosti (migrace 20261002120000).
--
-- Spuštění: celý soubor najednou v Supabase SQL editoru (role postgres).
-- Vše běží v jedné transakci zakončené ROLLBACK — v databázi nic nezůstane.
-- Selhání = výjimka „TEST FAILED: …"; úspěch = poslední řádek „VŠECHNY TESTY PROŠLY".

begin;

create temp table t_ids (label text primary key, id uuid not null) on commit drop;
grant select on t_ids to anon, authenticated;

-- Fixture: 6 objednávek v různém stavu sekvence.
with src(label, days_ago, email) as (
  values
    ('due_first', 3, 'test-a@example.com'),
    ('due_reminder', 8, 'test-b@example.com'),
    ('rated', 8, 'test-c@example.com'),
    ('too_fresh', 1, 'test-d@example.com'),
    ('too_old', 40, 'test-e@example.com'),
    ('no_email', 3, ''),
    ('opted_out', 8, 'test-f@example.com')
),
ins as (
  insert into public.order_submissions
    (customer, items, delivered_at, note, subtotal, delivery_cost, payment_cost, total_to_pay)
  select jsonb_build_object('firstName', 'Test', 'email', email),
         '[{"name":"Testovací kvarteto"}]'::jsonb,
         now() - make_interval(days => days_ago),
         'survey-test:' || label,
         0, 0, 0, 0
  from src
  returning id, note
)
insert into t_ids select replace(note, 'survey-test:', ''), id from ins;

insert into public.order_surveys (order_submission_id, first_sent_at, rating, rated_at, opted_out_at)
select id, now() - interval '5 days',
       case when label = 'rated' then 4 end,
       case when label = 'rated' then now() end,
       case when label = 'opted_out' then now() end
from t_ids where label in ('due_reminder', 'rated', 'opted_out');

-- 1) claim vrátí přesně: due_first → first, due_reminder → reminder
do $$
declare
  v_got text;
begin
  select string_agg(t.label || ':' || c.kind, ',' order by t.label) into v_got
  from public.claim_due_survey_emails() c
  join t_ids t on t.id = c.order_submission_id;
  if v_got is distinct from 'due_first:first,due_reminder:reminder' then
    raise exception 'TEST FAILED: claim vrátil "%"', v_got;
  end if;
end $$;

-- 2) druhý claim už testovací objednávky nevrátí (žádné duplicitní e-maily)
do $$
begin
  if exists (
    select 1 from public.claim_due_survey_emails() c join t_ids t on t.id = c.order_submission_id
  ) then
    raise exception 'TEST FAILED: druhý claim vrátil už odeslané e-maily';
  end if;
end $$;

-- 3) špatný token nic nezapíše; správný ano
do $$
declare
  v_id uuid := (select id from t_ids where label = 'too_fresh');
begin
  if public.submit_survey_rating(v_id, repeat('0', 64), 5) then
    raise exception 'TEST FAILED: rating prošel se špatným tokenem';
  end if;
  if public.submit_survey_answers(v_id, repeat('0', 64), 5, 'google', null, 'x') then
    raise exception 'TEST FAILED: answers prošly se špatným tokenem';
  end if;
  if public.survey_opt_out(v_id, 'kratky') then
    raise exception 'TEST FAILED: opt-out prošel se špatným tokenem';
  end if;
  if public.get_survey_for_view(v_id, repeat('0', 64)) is not null then
    raise exception 'TEST FAILED: view vrátil data se špatným tokenem';
  end if;
  if exists (select 1 from public.order_surveys where order_submission_id = v_id) then
    raise exception 'TEST FAILED: špatný token vytvořil řádek';
  end if;
  -- token jedné objednávky nesmí fungovat pro jinou (IDOR)
  if public.submit_survey_rating(v_id, public.survey_token((select id from t_ids where label = 'too_old')), 5) then
    raise exception 'TEST FAILED: token cizí objednávky byl přijat';
  end if;

  if not public.submit_survey_rating(v_id, public.survey_token(v_id), 5) then
    raise exception 'TEST FAILED: platný token odmítnut';
  end if;
  if (select rating from public.order_surveys where order_submission_id = v_id) is distinct from 5 then
    raise exception 'TEST FAILED: hodnocení se neuložilo';
  end if;
end $$;

-- 4) validace vstupů + klik z e-mailu nepřepíše odeslaný dotazník
do $$
declare
  v_id uuid := (select id from t_ids where label = 'too_fresh');
  v_token text := public.survey_token(v_id);
  v_raised boolean;
begin
  v_raised := false;
  begin
    perform public.submit_survey_answers(v_id, v_token, 5, 'x''; drop table invoices; --', null, null);
  exception when others then v_raised := true;
  end;
  if not v_raised then raise exception 'TEST FAILED: neplatný klíč zdroje prošel'; end if;

  v_raised := false;
  begin
    perform public.submit_survey_answers(v_id, v_token, 5, 'google', null, repeat('a', 2001));
  exception when others then v_raised := true;
  end;
  if not v_raised then raise exception 'TEST FAILED: příliš dlouhý komentář prošel'; end if;

  v_raised := false;
  begin
    perform public.submit_survey_answers(v_id, v_token, 9, 'google', null, null);
  exception when others then v_raised := true;
  end;
  if not v_raised then raise exception 'TEST FAILED: hodnocení 9 prošlo'; end if;

  if not public.submit_survey_answers(v_id, v_token, 2, 'google', null, '<script>alert(1)</script>') then
    raise exception 'TEST FAILED: platné odpovědi odmítnuty';
  end if;
  perform public.submit_survey_rating(v_id, v_token, 5);
  if (select rating from public.order_surveys where order_submission_id = v_id) is distinct from 2 then
    raise exception 'TEST FAILED: klik z e-mailu přepsal odeslaný dotazník';
  end if;
  -- přeposlaný odkaz nesmí přepsat už odeslané odpovědi
  perform public.submit_survey_answers(v_id, v_token, 5, 'facebook', null, 'přepsáno');
  if (select rating::text || ':' || source from public.order_surveys where order_submission_id = v_id)
     is distinct from '2:google' then
    raise exception 'TEST FAILED: odeslaný dotazník šel přepsat';
  end if;
  if public.get_survey_for_view(v_id, v_token) ?| array['email', 'customer', 'comment'] then
    raise exception 'TEST FAILED: view vrací osobní údaje';
  end if;
end $$;

-- 5) anon: nečte tabulku, nevolá interní ani admin funkce
set local role anon;
do $$
declare
  v_id uuid := (select id from t_ids where label = 'due_first');
  v_raised boolean;
begin
  v_raised := false;
  begin perform 1 from public.order_surveys; exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon čte order_surveys'; end if;

  v_raised := false;
  begin
    insert into public.order_surveys (order_submission_id, rating) values (v_id, 1);
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'TEST FAILED: anon zapisuje přímo do order_surveys'; end if;

  v_raised := false;
  begin perform public.claim_due_survey_emails(); exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon smí volat claim_due_survey_emails'; end if;

  v_raised := false;
  begin perform public.survey_token(v_id); exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon smí volat survey_token'; end if;

  v_raised := false;
  begin perform public.survey_token_valid(v_id, 'x'); exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon smí volat survey_token_valid'; end if;

  v_raised := false;
  begin perform public.mark_order_delivered(v_id, null); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: anon smí označit doručení'; end if;
end $$;
reset role;

-- 6) přihlášený ne-admin: nesmí označit ani zrušit doručení, nečte cizí dotazníky
set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001","app_metadata":{}}';
do $$
declare
  v_id uuid := (select id from t_ids where label = 'too_fresh');
  v_raised boolean;
begin
  v_raised := false;
  begin perform public.mark_order_delivered(v_id, null); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: ne-admin označil doručení'; end if;

  v_raised := false;
  begin perform public.unmark_order_delivered(v_id); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: ne-admin zrušil doručení'; end if;

  if (select count(*) from public.order_surveys) <> 0 then
    raise exception 'TEST FAILED: ne-admin čte order_surveys';
  end if;

  v_raised := false;
  begin
    update public.order_surveys set rating = 1;
  exception when insufficient_privilege then v_raised := true;
  end;
  if not v_raised then raise exception 'TEST FAILED: ne-admin smí UPDATE order_surveys'; end if;

  v_raised := false;
  begin perform public.claim_due_survey_emails(); exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: ne-admin smí volat claim_due_survey_emails'; end if;

  v_raised := false;
  begin perform public.survey_token(v_id); exception when insufficient_privilege then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: ne-admin smí volat survey_token'; end if;
end $$;

-- 7) admin: smí označit; ne budoucí datum; ne po odeslání dotazníku
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000002","app_metadata":{"role":"admin"}}';
do $$
declare
  v_fresh uuid := (select id from t_ids where label = 'no_email');
  v_sent uuid := (select id from t_ids where label = 'due_first');
  v_raised boolean;
begin
  if (public.mark_order_delivered(v_fresh, current_date - 1)).delivered_at is null then
    raise exception 'TEST FAILED: admin neoznačil doručení';
  end if;

  v_raised := false;
  begin perform public.mark_order_delivered(v_fresh, current_date + 2); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: prošlo budoucí datum doručení'; end if;

  v_raised := false;
  begin perform public.unmark_order_delivered(v_sent); exception when others then v_raised := true; end;
  if not v_raised then raise exception 'TEST FAILED: doručení šlo zrušit po odeslání dotazníku'; end if;

  if (select count(*) from public.order_surveys) = 0 then
    raise exception 'TEST FAILED: admin nevidí order_surveys';
  end if;
end $$;
reset role;

select 'VŠECHNY TESTY PROŠLY' as vysledek;

rollback;
