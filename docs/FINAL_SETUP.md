# EA PLAN — Final Production Setup

## 1. GitHub

Upload the **contents** of this ZIP to the root of the EA PLAN repository. Do not upload the ZIP as a nested file.

If `main` refuses direct commits, create a new branch from `main`, upload the files there, then create/merge a pull request. GitHub protected branches cannot be edited directly.

## 2. Vercel

Keep the existing Vercel project connected to GitHub.

Required Production Environment Variables:

- `SUPABASE_URL` = `https://YOUR_PROJECT_REF.supabase.co`
- `SUPABASE_ANON_KEY` = Supabase Publishable key beginning with `sb_publishable_...` (legacy anon key is also supported)

Both values must belong to the same Supabase project.

Never put a Supabase Secret or Service Role key in browser code, GitHub, or client-side Vercel configuration.

After the GitHub commit is merged/deployed, open a new Vercel deployment and wait until Production is **Ready**.

## 3. Supabase

Run `supabase/profile-media.sql` in the Supabase SQL editor if you want the profile-media storage bucket/policies used by the broader package.

Authentication → Providers → Email should have **Allow new users to sign up** enabled.

If **Confirm email** is enabled, a newly registered user must confirm their email before signing in.

## 4. First-run flow

Splash → Welcome → Buat Akun → Onboarding 1/3 → 2/3 → 3/3 → Beranda.

If email confirmation is enabled, registration displays a confirmation message and the user can return to Login after confirming the email.

If email confirmation is disabled, Supabase returns a session immediately and the user continues directly to onboarding.

## 5. Asset paths

The package keeps assets in both `/assets/` and `/public/assets/` for deployment compatibility. The production `app.js` references `/public/assets/`.

## 6. Cache busting

The HTML references versioned script URLs so the browser requests the production JavaScript after deployment.
