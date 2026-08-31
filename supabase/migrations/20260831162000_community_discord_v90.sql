-- DLavie Community v90: Discord-inspired channels, threads, mentions, read state, typing and presence.

create table if not exists public.dlavie_community_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.dlavie_community_channels add column if not exists category_id uuid references public.dlavie_community_categories(id) on delete set null;
alter table public.dlavie_community_channels add column if not exists channel_type text not null default 'text';
alter table public.dlavie_community_channels add column if not exists topic text not null default '';
alter table public.dlavie_community_channels add column if not exists visibility text not null default 'public';
alter table public.dlavie_community_channels add column if not exists slowmode_seconds integer not null default 0;
alter table public.dlavie_community_channels add column if not exists allow_threads boolean not null default true;
alter table public.dlavie_community_channels add column if not exists required_role_slugs jsonb not null default '[]'::jsonb;
alter table public.dlavie_community_channels add column if not exists icon text not null default 'hash';

alter table public.dlavie_community_messages add column if not exists thread_root_id bigint references public.dlavie_community_messages(id) on delete set null;
alter table public.dlavie_community_members add column if not exists custom_status text not null default '';
alter table public.dlavie_community_members add column if not exists presence_mode text not null default 'online';

create table if not exists public.dlavie_community_read_states (
  member_id uuid not null references public.dlavie_community_members(id) on delete cascade,
  channel_id uuid not null references public.dlavie_community_channels(id) on delete cascade,
  last_message_id bigint,
  last_read_at timestamptz not null default now(),
  notification_level text not null default 'all',
  muted_until timestamptz,
  primary key(member_id, channel_id)
);

create table if not exists public.dlavie_community_typing (
  member_id uuid not null references public.dlavie_community_members(id) on delete cascade,
  channel_id uuid not null references public.dlavie_community_channels(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key(member_id, channel_id)
);

create table if not exists public.dlavie_community_mentions (
  message_id bigint not null references public.dlavie_community_messages(id) on delete cascade,
  mentioned_member_id uuid not null references public.dlavie_community_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  primary key(message_id, mentioned_member_id)
);

create index if not exists dlavie_community_messages_thread_idx on public.dlavie_community_messages(thread_root_id, created_at);
create index if not exists dlavie_community_messages_channel_main_idx on public.dlavie_community_messages(channel_id, id desc) where deleted_at is null and thread_root_id is null;
create index if not exists dlavie_community_read_states_channel_idx on public.dlavie_community_read_states(channel_id, member_id);
create index if not exists dlavie_community_typing_updated_idx on public.dlavie_community_typing(updated_at);
create index if not exists dlavie_community_mentions_member_idx on public.dlavie_community_mentions(mentioned_member_id, read_at, created_at desc);
create index if not exists dlavie_community_channels_category_idx on public.dlavie_community_channels(category_id, sort_order);

insert into public.dlavie_community_categories(slug,name,sort_order) values
 ('community','COMMUNITY',20),('projects','PROJECTS',30)
on conflict(slug) do update set name=excluded.name,sort_order=excluded.sort_order;

update public.dlavie_community_channels c set
  category_id=(select id from public.dlavie_community_categories where slug=case when c.slug='showcase' then 'projects' else 'community' end),
  topic=case c.slug
    when 'global' then 'Obrolan umum untuk seluruh member DLavie.'
    when 'help' then 'Tanya jawab, troubleshooting, dan bantuan komunitas.'
    when 'showcase' then 'Bagikan screenshot, build, texture, addon, dan karya kamu.'
    else coalesce(nullif(c.topic,''),c.description)
  end,
  slowmode_seconds=case c.slug when 'global' then 2 when 'help' then 3 when 'showcase' then 5 else slowmode_seconds end,
  allow_threads=true,
  icon='hash'
where c.slug in ('global','help','showcase');

update public.dlavie_community_channels
set category_id=(select id from public.dlavie_community_categories where slug='community')
where slug='rules' and category_id is null;

update public.dlavie_community_members set presence_mode='online' where presence_mode is null or presence_mode='';

create or replace function public.dlavie_capture_message_mentions()
returns trigger language plpgsql security definer set search_path=public as $$
declare u text;
begin
  delete from public.dlavie_community_mentions where message_id=new.id;
  for u in select distinct lower((regexp_matches(new.body, '@([A-Za-z0-9_]{3,24})', 'g'))[1]) loop
    insert into public.dlavie_community_mentions(message_id, mentioned_member_id)
    select new.id, a.member_id
    from public.dlavie_accounts a
    where lower(a.username)=u and a.member_id is not null and a.member_id<>new.member_id
    on conflict do nothing;
  end loop;
  return new;
end $$;

drop trigger if exists dlavie_message_mentions_trigger on public.dlavie_community_messages;
create trigger dlavie_message_mentions_trigger
after insert or update of body on public.dlavie_community_messages
for each row execute function public.dlavie_capture_message_mentions();

create or replace function public.dlavie_community_message_channel_guard()
returns trigger language plpgsql security definer set search_path=public as $$
declare ch record; mr text; allowed boolean:=false; last_at timestamptz;
begin
  select * into ch from public.dlavie_community_channels where id=new.channel_id;
  if ch.id is null then raise exception 'Channel tidak ditemukan.'; end if;
  select role into mr from public.dlavie_community_members where id=new.member_id;

  if coalesce(ch.is_readonly,false) and coalesce(mr,'member') not in ('owner','admin','moderator','developer') then
    raise exception 'Channel ini read-only.';
  end if;

  if coalesce(ch.visibility,'public')='private' and coalesce(mr,'member') not in ('owner','admin','moderator','developer') then
    if jsonb_array_length(coalesce(ch.required_role_slugs,'[]'::jsonb))=0 then
      allowed:=false;
    else
      select exists(
        select 1 from public.dlavie_community_member_roles x
        join public.dlavie_community_roles r on r.id=x.role_id
        where x.member_id=new.member_id and coalesce(ch.required_role_slugs,'[]'::jsonb) ? r.slug
      ) into allowed;
    end if;
    if not allowed then raise exception 'Channel ini private.'; end if;
  end if;

  if coalesce(ch.slowmode_seconds,0)>0 and coalesce(mr,'member') not in ('owner','admin','moderator','developer') then
    select max(created_at) into last_at
    from public.dlavie_community_messages
    where channel_id=new.channel_id and member_id=new.member_id and deleted_at is null;
    if last_at is not null and last_at > now() - make_interval(secs=>ch.slowmode_seconds) then
      raise exception 'Slowmode aktif. Tunggu % detik sebelum mengirim lagi.', ch.slowmode_seconds;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists dlavie_message_channel_guard on public.dlavie_community_messages;
create trigger dlavie_message_channel_guard
before insert on public.dlavie_community_messages
for each row execute function public.dlavie_community_message_channel_guard();

-- Sensitive per-user / moderation state is only exposed through server-side Edge Functions.
revoke all on table public.dlavie_community_mentions from anon, authenticated;
revoke all on table public.dlavie_community_read_states from anon, authenticated;
revoke all on table public.dlavie_community_typing from anon, authenticated;
revoke all on table public.dlavie_community_admin_audit from anon, authenticated;
revoke all on table public.dlavie_community_blocks from anon, authenticated;
revoke all on table public.dlavie_community_moderation_actions from anon, authenticated;
revoke all on table public.dlavie_community_reports from anon, authenticated;
