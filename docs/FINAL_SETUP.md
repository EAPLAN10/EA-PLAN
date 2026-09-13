# EA PLAN — Final Setup

## 1. GitHub
Upload the **contents** of this ZIP to the root of the `main` branch. Do not upload the ZIP as a nested file.

## 2. Vercel
Keep the existing Vercel project connected to GitHub. Push to `main` and wait for Production to become **Ready**.

Required Environment Variables in Production:
- `SUPABASE_URL` = EA PLAN Supabase project URL
- `SUPABASE_ANON_KEY` = Supabase Publishable key (`sb_publishable_...`) or legacy anon key

Never put a Supabase Secret/Service Role key in the browser or in GitHub.

## 3. Supabase
Run `supabase/profile-media.sql` in the Supabase SQL editor to create the `profile-media` storage bucket and policies.

## 4. First-run flow
Splash → Welcome → Buat Akun → Onboarding 1/3 → Onboarding 2/3 → Onboarding 3/3 → Beranda.

If Supabase email confirmation is enabled, EA PLAN does not trap the user on the registration screen. The UI continues through onboarding locally; after email confirmation the user can log in and the real Supabase session becomes active.

## 5. Asset paths
The final package keeps the visual assets in both `/assets/` and `/public/assets/` so the static deployment cannot lose the logo or splash because of an incorrect asset path. The application references `/assets/...`.
