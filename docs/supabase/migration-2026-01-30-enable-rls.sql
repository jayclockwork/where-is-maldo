-- Enable RLS on public tables exposed by PostgREST
alter table public.sessions enable row level security;
alter table public.participants enable row level security;
alter table public.mappings enable row level security;
