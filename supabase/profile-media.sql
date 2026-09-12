-- EA PLAN: profile media storage
-- Run this once in Supabase SQL Editor.

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update set public = true;

-- Authenticated users can upload only into their own <user-id>/ folder.
create policy "EA PLAN profile media insert own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "EA PLAN profile media update own folder"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "EA PLAN profile media delete own folder"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Public read is intentional so avatars/backgrounds can be displayed on the public app.
create policy "EA PLAN profile media public read"
on storage.objects for select to public
using (bucket_id = 'profile-media');
