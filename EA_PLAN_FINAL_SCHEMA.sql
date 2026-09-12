-- EA PLAN FINAL SCHEMA / MIGRATION
-- Jalankan SEKALI di Supabase SQL Editor setelah schema dasar EA PLAN.
-- Aman diulang karena memakai IF NOT EXISTS / drop-create policy.

alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists background_url text;

create table if not exists public.works (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, author_name text not null default 'Kreator', description text default '', type text not null default 'Tulisan',
 cover_url text, tags text[] default '{}', series text default '', allow_comments boolean not null default true, mature boolean not null default false,
 support_type text not null default 'Gratis', price_points integer not null default 0, status text not null default 'draft', visibility text not null default 'private',
 view_count integer not null default 0, like_count integer not null default 0, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.work_chapters (
 id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
 chapter_number integer not null default 1, title text not null, content text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.app_settings (id integer primary key check(id=1), daily_quote text not null default 'Setiap karya besar berawal dari satu langkah kecil yang terencana.', owner_email text, updated_at timestamptz not null default now());
insert into public.app_settings(id) values(1) on conflict(id) do nothing;

create table if not exists public.work_comments (
 id uuid primary key default gen_random_uuid(), work_id uuid not null references public.works(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(length(trim(body)) between 1 and 2000), created_at timestamptz not null default now()
);
create table if not exists public.work_likes (work_id uuid not null references public.works(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key(work_id,user_id));
create table if not exists public.work_bookmarks (work_id uuid not null references public.works(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key(work_id,user_id));
create table if not exists public.creator_follows (creator_id uuid not null references auth.users(id) on delete cascade, follower_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(), primary key(creator_id,follower_id), check(creator_id<>follower_id));
create table if not exists public.progress_snapshots (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, snapshot_date date not null default current_date, progress integer not null default 0 check(progress between 0 and 100), unique(user_id,snapshot_date));

alter table public.works enable row level security; alter table public.work_chapters enable row level security; alter table public.app_settings enable row level security; alter table public.work_comments enable row level security; alter table public.work_likes enable row level security; alter table public.work_bookmarks enable row level security; alter table public.creator_follows enable row level security; alter table public.progress_snapshots enable row level security;

drop policy if exists works_public_read on public.works; create policy works_public_read on public.works for select to authenticated using((status='published' and visibility='public') or auth.uid()=user_id);
drop policy if exists works_own_insert on public.works; create policy works_own_insert on public.works for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists works_own_update on public.works; create policy works_own_update on public.works for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists works_own_delete on public.works; create policy works_own_delete on public.works for delete to authenticated using(auth.uid()=user_id);

drop policy if exists chapters_public_read on public.work_chapters; create policy chapters_public_read on public.work_chapters for select to authenticated using(exists(select 1 from public.works w where w.id=work_id and ((w.status='published' and w.visibility='public') or w.user_id=auth.uid())));
drop policy if exists chapters_own_insert on public.work_chapters; create policy chapters_own_insert on public.work_chapters for insert to authenticated with check(auth.uid()=user_id and exists(select 1 from public.works w where w.id=work_id and w.user_id=auth.uid()));
drop policy if exists chapters_own_update on public.work_chapters; create policy chapters_own_update on public.work_chapters for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists chapters_own_delete on public.work_chapters; create policy chapters_own_delete on public.work_chapters for delete to authenticated using(auth.uid()=user_id);

drop policy if exists settings_read on public.app_settings; create policy settings_read on public.app_settings for select to authenticated using(true);
drop policy if exists settings_owner_update on public.app_settings; create policy settings_owner_update on public.app_settings for update to authenticated using(owner_email is not null and (auth.jwt()->>'email')=owner_email) with check(owner_email is not null and (auth.jwt()->>'email')=owner_email);

drop policy if exists comments_public_read on public.work_comments; create policy comments_public_read on public.work_comments for select to authenticated using(exists(select 1 from public.works w where w.id=work_id and ((w.status='published' and w.visibility='public') or w.user_id=auth.uid())));
drop policy if exists comments_own_insert on public.work_comments; create policy comments_own_insert on public.work_comments for insert to authenticated with check(auth.uid()=user_id and exists(select 1 from public.works w where w.id=work_id and w.status='published' and w.visibility='public' and w.allow_comments));
drop policy if exists comments_own_delete on public.work_comments; create policy comments_own_delete on public.work_comments for delete to authenticated using(auth.uid()=user_id);

drop policy if exists likes_read on public.work_likes; create policy likes_read on public.work_likes for select to authenticated using(true);
drop policy if exists likes_own on public.work_likes; create policy likes_own on public.work_likes for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists likes_delete on public.work_likes; create policy likes_delete on public.work_likes for delete to authenticated using(auth.uid()=user_id);
drop policy if exists bookmarks_own on public.work_bookmarks; create policy bookmarks_own on public.work_bookmarks for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists follows_read on public.creator_follows; create policy follows_read on public.creator_follows for select to authenticated using(true);
drop policy if exists follows_own on public.creator_follows; create policy follows_own on public.creator_follows for all to authenticated using(auth.uid()=follower_id) with check(auth.uid()=follower_id);
drop policy if exists snapshots_own on public.progress_snapshots; create policy snapshots_own on public.progress_snapshots for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);

create or replace function public.increment_work_view(p_work_id uuid) returns void language sql security definer set search_path=public as $$ update public.works set view_count=view_count+1 where id=p_work_id and status='published' and visibility='public'; $$;
grant execute on function public.increment_work_view(uuid) to authenticated;

insert into storage.buckets(id,name,public) values('profile-media','profile-media',true) on conflict(id) do update set public=true;
insert into storage.buckets(id,name,public) values('work-media','work-media',true) on conflict(id) do update set public=true;
drop policy if exists profile_media_insert on storage.objects; create policy profile_media_insert on storage.objects for insert to authenticated with check(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists profile_media_update on storage.objects; create policy profile_media_update on storage.objects for update to authenticated using(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists profile_media_delete on storage.objects; create policy profile_media_delete on storage.objects for delete to authenticated using(bucket_id='profile-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists work_media_insert on storage.objects; create policy work_media_insert on storage.objects for insert to authenticated with check(bucket_id='work-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists work_media_update on storage.objects; create policy work_media_update on storage.objects for update to authenticated using(bucket_id='work-media' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='work-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists work_media_delete on storage.objects; create policy work_media_delete on storage.objects for delete to authenticated using(bucket_id='work-media' and (storage.foldername(name))[1]=auth.uid()::text);

notify pgrst,'reload schema';
