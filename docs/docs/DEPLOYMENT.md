# EA PLAN — Production v3

## Current milestone

Premium mobile-first web app foundation with:

- cinematic splash using the supplied EA PLAN photography
- separated brand asset
- proper PWA icon assets
- welcome, register, login, forgot-password UI
- onboarding flow
- dashboard shell
- core navigation
- responsive mobile navigation

## Important

Authentication is still demo/local-browser authentication. Do NOT enter sensitive real credentials into the local `index.html` file.

## Next deployment path

GitHub repository EA-PLAN → Vercel → public HTTPS URL → Supabase Authentication + Database → production data security / Row Level Security → PWA installability → custom domain

## Recommended repository

Repository name: `EA-PLAN`  
Branch: `main`

## Do not commit

- `.env`
- API secrets
- service-role keys
- passwords
- private user data
