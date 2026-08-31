create table if not exists public.dlavie_community_saved_messages (
  member_id uuid not null references public.dlavie_community_members(id) on delete cascade,
  message_id bigint not null references public.dlavie_community_messages(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now(),
  primary key(member_id,message_id)
);

create table if not exists public.dlavie_community_dm_threads (
  id uuid primary key default gen_random_uuid(),
  pair_key text not null unique,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.dlavie_community_dm_participants (
  thread_id uuid not null references public.dlavie_community_dm_threads(id) on delete cascade,
  member_id uuid not null references public.dlavie_community_members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  muted_until timestamptz,
  primary key(thread_id,member_id)
);

create table if not exists public.dlavie_community_dm_messages (
  id bigserial primary key,
  thread_id uuid not null references public.dlavie_community_dm_threads(id) on delete cascade,
  member_id uuid not null references public.dlavie_community_members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.dlavie_community_dm_read_states (
  member_id uuid not null references public.dlavie_community_members(id) on delete cascade,
  thread_id uuid not null references public.dlavie_community_dm_threads(id) on delete cascade,
  last_message_id bigint not null default 0,
  last_read_at timestamptz not null default now(),
  primary key(member_id,thread_id)
);

create index if not exists dlavie_saved_messages_member_created_idx on public.dlavie_community_saved_messages(member_id,created_at desc);
create index if not exists dlavie_saved_messages_message_idx on public.dlavie_community_saved_messages(message_id);
create index if not exists dlavie_dm_participants_member_idx on public.dlavie_community_dm_participants(member_id,thread_id);
create index if not exists dlavie_dm_messages_thread_created_idx on public.dlavie_community_dm_messages(thread_id,created_at desc) where deleted_at is null;
create index if not exists dlavie_dm_messages_member_idx on public.dlavie_community_dm_messages(member_id,created_at desc);
create index if not exists dlavie_dm_read_states_thread_idx on public.dlavie_community_dm_read_states(thread_id,member_id);
create index if not exists dlavie_community_mentions_member_read_idx on public.dlavie_community_mentions(mentioned_member_id,read_at,message_id);
create index if not exists dlavie_community_blocks_blocked_member_idx on public.dlavie_community_blocks(blocked_member_id,blocker_member_id);
create index if not exists dlavie_community_admin_audit_actor_idx on public.dlavie_community_admin_audit(actor_member_id,created_at desc);

alter table public.dlavie_community_saved_messages enable row level security;
alter table public.dlavie_community_dm_threads enable row level security;
alter table public.dlavie_community_dm_participants enable row level security;
alter table public.dlavie_community_dm_messages enable row level security;
alter table public.dlavie_community_dm_read_states enable row level security;

revoke all on table public.dlavie_community_saved_messages from anon, authenticated;
revoke all on table public.dlavie_community_dm_threads from anon, authenticated;
revoke all on table public.dlavie_community_dm_participants from anon, authenticated;
revoke all on table public.dlavie_community_dm_messages from anon, authenticated;
revoke all on table public.dlavie_community_dm_read_states from anon, authenticated;
revoke all on sequence public.dlavie_community_dm_messages_id_seq from anon, authenticated;
