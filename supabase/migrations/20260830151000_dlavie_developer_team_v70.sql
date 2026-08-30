-- DLavie Developer Console v70: owner-only team management.
drop policy if exists dlavie_developers_owner_insert on public.dlavie_developers;
create policy dlavie_developers_owner_insert on public.dlavie_developers
for insert to authenticated
with check (public.dlavie_developer_role(auth.uid()) = 'owner');

drop policy if exists dlavie_developers_owner_update on public.dlavie_developers;
create policy dlavie_developers_owner_update on public.dlavie_developers
for update to authenticated
using (public.dlavie_developer_role(auth.uid()) = 'owner')
with check (public.dlavie_developer_role(auth.uid()) = 'owner');

drop policy if exists dlavie_developers_owner_delete on public.dlavie_developers;
create policy dlavie_developers_owner_delete on public.dlavie_developers
for delete to authenticated
using (public.dlavie_developer_role(auth.uid()) = 'owner' and user_id <> auth.uid());

grant select, insert, update, delete on public.dlavie_developers to authenticated;

create or replace function public.dlavie_developer_team()
returns table(user_id uuid, role text, username text, display_name text, created_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if public.dlavie_developer_role(auth.uid()) <> 'owner' then
    raise exception 'developer owner required' using errcode='42501';
  end if;
  return query
  select d.user_id,d.role,a.username,a.display_name,d.created_at
  from public.dlavie_developers d
  left join public.dlavie_accounts a on a.user_id=d.user_id
  order by case d.role when 'owner' then 0 when 'developer' then 1 else 2 end,d.created_at;
end;
$$;

create or replace function public.dlavie_add_developer(p_username text, p_role text default 'developer')
returns table(user_id uuid, role text, username text, display_name text)
language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_user uuid;
begin
  if public.dlavie_developer_role(auth.uid()) <> 'owner' then
    raise exception 'developer owner required' using errcode='42501';
  end if;
  if p_role not in ('developer','editor') then raise exception 'invalid role'; end if;
  select a.user_id into v_user from public.dlavie_accounts a where lower(a.username)=lower(trim(p_username)) limit 1;
  if v_user is null then raise exception 'username not found'; end if;
  insert into public.dlavie_developers(user_id,role,created_by)
  values(v_user,p_role,auth.uid())
  on conflict(user_id) do update set role=excluded.role;
  return query select a.user_id,d.role,a.username,a.display_name from public.dlavie_accounts a join public.dlavie_developers d on d.user_id=a.user_id where a.user_id=v_user;
end;
$$;

grant execute on function public.dlavie_developer_team() to authenticated;
grant execute on function public.dlavie_add_developer(text,text) to authenticated;
