# EA PLAN

EA PLAN — Your Personalized Planning Journey.

## Production structure
- `index.html` — application entry point
- `src/app.js` — application UI and features
- `src/supabase.js` — Supabase browser client
- `src/styles/app.css` — original EA PLAN visual system
- `public/assets/` — branding and PWA assets
- `EA_PLAN_SUPABASE_SCHEMA.sql` — database/RLS setup

## Deployment
This is a static SPA. In Vercel use Framework Preset `Other`, Root Directory `./`, Build Command empty/default, Output Directory `.`.
