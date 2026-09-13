# EA PLAN — Final Production Supabase Release

Release: 2026.09.13-production

## Main change

`src/app.js` has been replaced with the production Supabase version.

## Authentication behavior

- No demo/localStorage authentication
- Supabase Email/Password sign-up
- Supabase Email/Password login
- Persistent Supabase session
- Forgot-password email flow
- Supabase user metadata for onboarding fields
- Clear messages for common Supabase errors
- Validates the Vercel `/api/config` response
- Validates that `SUPABASE_URL` is the bare project URL

## Deployment

After replacing the repository contents, make sure Vercel Production has:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Use the Publishable key (`sb_publishable_...`) or legacy anon key. Never use a Secret/Service Role key in the frontend.
