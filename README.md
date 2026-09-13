# EA PLAN

**Your Personalized Planning Journey**

EA PLAN is a personal planning and creative publishing space for planning, goals, journal, ideas, projects, and reflection.

## Master package

This repository is intentionally kept as a simple static SPA with a small Vercel API endpoint for Supabase configuration.

```text
EA-PLAN/
├── api/config.js
├── public/assets/
├── src/app.js
├── src/supabase.js
├── src/styles/app.css
├── supabase/profile-media.sql
├── docs/
├── index.html
├── manifest.json
├── package.json
└── vercel.json
```

## Vercel

No build step is required. Vercel serves `index.html` and the `/src` assets directly. The project uses Node.js 24.x for the `/api/config.js` function.

Set these Production Environment Variables in Vercel:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` — use the Supabase Publishable key. Never use the Supabase Secret/service-role key in the browser.

## Supabase Storage

Run `supabase/profile-media.sql` in the Supabase SQL editor to create the `profile-media` bucket and its policies.

## Important

The `public/assets/logo.png` file is a transparent-background version of the EA PLAN logo for use over dark and photographic surfaces. The splash image remains a separate photographic background.
