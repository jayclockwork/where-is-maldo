-- Journey Mapping Website (v1) — Supabase schema
-- Notes:
-- - This schema uses TEXT ids to match the app’s current id generation (sess_..., p_..., etc.).
-- - Enable Realtime on tables `sessions`, `participants`, `mappings` if you want cross-instance live updates.

create table if not exists public.sessions (
  id text primary key,
  join_code text not null unique,
  title text,
  status text not null default 'open' check (status in ('open','closed')),
  admin_token text not null,
  created_at timestamptz not null default now(),
  results_cleared_at timestamptz
);

create index if not exists sessions_join_code_idx on public.sessions (join_code);

create table if not exists public.participants (
  id text primary key,
  session_id text not null references public.sessions (id) on delete cascade,
  display_name text not null,
  avatar_color text,
  secret text not null,
  joined_at timestamptz not null default now()
);

create index if not exists participants_session_idx on public.participants (session_id);

-- Enforce unique avatar color per session (nullable; unique only when non-null)
create unique index if not exists participants_session_avatar_color_uniq
  on public.participants (session_id, avatar_color)
  where avatar_color is not null;

create table if not exists public.mappings (
  session_id text not null references public.sessions (id) on delete cascade,
  participant_id text not null references public.participants (id) on delete cascade,
  item_id text not null,
  is_doing boolean not null,
  updated_at timestamptz not null default now(),
  primary key (session_id, participant_id, item_id)
);

create index if not exists mappings_session_idx on public.mappings (session_id);

-- RLS is enabled to prevent public exposure. Add policies before exposing via anon/auth.
alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.mappings enable row level security;

