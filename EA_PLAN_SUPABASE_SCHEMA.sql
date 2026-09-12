-- EA PLAN production schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text unique,
  email text,
  bio text,
  focus text[] default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active','completed','archived')),
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null,
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  body text not null,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active','completed','archived')),
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.journal_entries enable row level security;
alter table public.ideas enable row level security;
alter table public.projects enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid()=id);
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (auth.uid()=id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);

-- Generic owner policies
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['goals','tasks','journal_entries','ideas','projects'] LOOP
    EXECUTE format('drop policy if exists %I_select_own on public.%I', t, t);
    EXECUTE format('create policy %I_select_own on public.%I for select to authenticated using (auth.uid()=user_id)', t, t);
    EXECUTE format('drop policy if exists %I_insert_own on public.%I', t, t);
    EXECUTE format('create policy %I_insert_own on public.%I for insert to authenticated with check (auth.uid()=user_id)', t, t);
    EXECUTE format('drop policy if exists %I_update_own on public.%I', t, t);
    EXECUTE format('create policy %I_update_own on public.%I for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id)', t, t);
    EXECUTE format('drop policy if exists %I_delete_own on public.%I', t, t);
    EXECUTE format('create policy %I_delete_own on public.%I for delete to authenticated using (auth.uid()=user_id)', t, t);
  END LOOP;
END $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id,name,username,email)
  values(
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'username',
    new.email
  )
  on conflict (id) do update set email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();


-- PROFILE MEDIA (foto profil + background)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS background_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-media', 'profile-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "profile media upload own folder" ON storage.objects;
CREATE POLICY "profile media upload own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "profile media update own folder" ON storage.objects;
CREATE POLICY "profile media update own folder"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "profile media delete own folder" ON storage.objects;
CREATE POLICY "profile media delete own folder"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-media' AND (storage.foldername(name))[1] = auth.uid()::text);

NOTIFY pgrst, 'reload schema';
