-- EA PLAN PUBLIC CREATOR / PLATFORM SCHEMA
-- Aman dijalankan setelah schema dasar EA PLAN. Tidak menghapus data lama.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS background_url TEXT,
  ADD COLUMN IF NOT EXISTS focus TEXT[],
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT DEFAULT '',
  cover_url TEXT,
  work_type TEXT NOT NULL DEFAULT 'book',
  tags TEXT[] NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  comments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  views BIGINT NOT NULL DEFAULT 0,
  likes_count BIGINT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.work_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_no INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(work_id, chapter_no)
);

CREATE INDEX IF NOT EXISTS works_public_idx ON public.works(visibility,status,published_at DESC);
CREATE INDEX IF NOT EXISTS works_user_idx ON public.works(user_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS work_chapters_idx ON public.work_chapters(work_id,chapter_no);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings read all" ON public.app_settings;
CREATE POLICY "settings read all" ON public.app_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "settings owner write" ON public.app_settings;
CREATE POLICY "settings owner write" ON public.app_settings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_owner=true))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_owner=true));

DROP POLICY IF EXISTS "works public read" ON public.works;
CREATE POLICY "works public read" ON public.works FOR SELECT USING ((visibility='public' AND status='published') OR user_id=auth.uid());
DROP POLICY IF EXISTS "works own insert" ON public.works;
CREATE POLICY "works own insert" ON public.works FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS "works own update" ON public.works;
CREATE POLICY "works own update" ON public.works FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS "works own delete" ON public.works;
CREATE POLICY "works own delete" ON public.works FOR DELETE TO authenticated USING (user_id=auth.uid());

DROP POLICY IF EXISTS "chapters public read" ON public.work_chapters;
CREATE POLICY "chapters public read" ON public.work_chapters FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.works w WHERE w.id=work_id AND ((w.visibility='public' AND w.status='published') OR w.user_id=auth.uid()))
);
DROP POLICY IF EXISTS "chapters own insert" ON public.work_chapters;
CREATE POLICY "chapters own insert" ON public.work_chapters FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS "chapters own update" ON public.work_chapters;
CREATE POLICY "chapters own update" ON public.work_chapters FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());
DROP POLICY IF EXISTS "chapters own delete" ON public.work_chapters;
CREATE POLICY "chapters own delete" ON public.work_chapters FOR DELETE TO authenticated USING (user_id=auth.uid());

-- Storage bucket untuk avatar, background, dan cover karya.
INSERT INTO storage.buckets (id,name,public)
VALUES ('profile-media','profile-media',true)
ON CONFLICT (id) DO UPDATE SET public=true;

DROP POLICY IF EXISTS "profile media public read" ON storage.objects;
CREATE POLICY "profile media public read" ON storage.objects FOR SELECT USING (bucket_id='profile-media');

DROP POLICY IF EXISTS "profile media own insert" ON storage.objects;
CREATE POLICY "profile media own insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);

DROP POLICY IF EXISTS "profile media own update" ON storage.objects;
CREATE POLICY "profile media own update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text)
WITH CHECK (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);

DROP POLICY IF EXISTS "profile media own delete" ON storage.objects;
CREATE POLICY "profile media own delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='profile-media' AND (storage.foldername(name))[1]=auth.uid()::text);

-- Quote awal.
INSERT INTO public.app_settings(key,value)
VALUES ('daily_quote','Setiap karya besar berawal dari satu langkah kecil yang terencana.')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst,'reload schema';
