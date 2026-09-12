# EA PLAN — Vercel Runtime Fix

This package fixes the Vercel deployment error:

`Function Runtimes must have a valid version`

## What changed
- Removed the custom function runtime declaration from `vercel.json`.
- Added `package.json` with Node.js `24.x` in `engines`.
- Kept `api/config.js` as a normal Vercel Node.js Function.

## Deployment
1. Upload/push this package to the EA PLAN repository.
2. Keep the existing Vercel environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Deploy the new commit.
