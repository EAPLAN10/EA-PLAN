# Changelog — Revisi Final

1. Logo profil/splash transparan (tidak lagi membawa kotak/background hitam dari aset logo).
2. Splash: logo dan tagline center vertical + horizontal.
3. Beranda: kartu Progress/Target/Projects/Journal/Langkah Hari Ini dikeluarkan dari Home.
4. Home: `Menarik Dilihat` diganti `Komentar Mereka`.
5. Avatar header mendukung foto profil pengguna.
6. Halaman Profil ditambahkan untuk edit data dan media.

## Supabase Storage integration
- Added Supabase JS client bootstrap and Vercel `/api/config` runtime config.
- Replaced demo email/password flow with Supabase Auth email/password.
- Added `profile-media` Storage bucket SQL and RLS policies.
- Profile photo/background upload now goes to Supabase Storage and profile metadata is stored in Supabase Auth user metadata.
- Profile/background media is reused across application pages.
- Profile images are converted to PNG before upload; automatic background removal is intentionally not claimed without a dedicated removal service.

## Vercel runtime fix — September 2026
- Removed the per-function `runtime` declaration that caused Vercel build error: "Function Runtimes must have a valid version".
- Added `package.json` with Node.js `24.x` engine, which is supported by Vercel and is the current default for new projects.
- Kept `/api/config.js` as a standard Vercel Node.js Function; Vercel detects the function automatically without a custom runtime entry.
