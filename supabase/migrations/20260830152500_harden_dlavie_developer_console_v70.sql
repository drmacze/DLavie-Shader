-- Keep developer membership private to authenticated team access and harden trigger search_path.
revoke all on public.dlavie_developers from anon;
grant select, insert, update, delete on public.dlavie_developers to authenticated;

alter function public.dlavie_projects_touch() set search_path = public, pg_temp;
