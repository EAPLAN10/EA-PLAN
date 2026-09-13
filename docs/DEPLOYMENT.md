# EA PLAN — Production Supabase

## Current release

This package replaces the previous demo/local-browser authentication with real Supabase Auth.

Included:
- EA PLAN mobile-first visual shell
- Splash, Welcome, Register, Login, Forgot Password
- 3-step onboarding
- Real Supabase Email/Password authentication
- Persistent Supabase session
- Password reset flow
- Profile metadata stored in Supabase Auth user metadata
- Core navigation: Planning, Goals, Journal, Ideas, Projects, Journey, Statistik, Profil
- Responsive mobile navigation
- PWA assets
- Vercel `/api/config` endpoint

## Authentication

The frontend does **not** use `localStorage` as an authentication fallback and does not create demo accounts.

Required Vercel Production environment variables:

- `SUPABASE_URL` = bare project URL, for example `https://YOUR_PROJECT_REF.supabase.co`
- `SUPABASE_ANON_KEY` = Supabase Publishable key (`sb_publishable_...`) or legacy anon key

Do not use:
- `https://...supabase.co/rest/v1`
- `https://...supabase.co/auth/v1`
- `sb_secret_...`
- Supabase `service_role` key

## Deployment path

GitHub repository `EA-PLAN` → Vercel → Supabase Auth.

## Do not commit

- `.env`
- Supabase Secret/Service Role keys
- passwords
- private user data

## GitHub note

If GitHub refuses to commit directly to `main`, create a new branch and upload/commit the package there, then merge the pull request into `main`. GitHub documents that protected branches cannot be edited or uploaded to directly.
