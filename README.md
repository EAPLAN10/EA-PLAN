# EA PLAN — Master Final

EA PLAN — Your Personalized Planning Journey.

This package is the clean, ready-to-use baseline for the final mobile-first EA PLAN experience. It includes the complete visual flow, authentication, onboarding, home, planning, goals, journal, ideas, projects, journey, statistics, profile, explore, collection, about, guide, and responsive navigation.

## Final flow
Splash → Welcome → Register/Login → Onboarding 1/3 → 2/3 → 3/3 → Beranda → Planning / Goals / Journal / Ideas / Projects / Journey / Statistik / Profil / Jelajahi / Koleksi / Tentang EA PLAN / Panduan.

## Deployment
1. Replace the contents of the GitHub `main` branch with the contents of this package.
2. Keep the existing Vercel project.
3. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Vercel Production.
4. Run `supabase/profile-media.sql` in Supabase.
5. Push to `main` and wait for Vercel Production to show **Ready**.

See `docs/FINAL_SETUP.md` for the exact setup notes.

## Important
Do not expose Supabase Secret/Service Role keys in frontend code, GitHub, or Vercel client-side configuration.
