# EA PLAN — Final Master UI

## 2026-09-12

This package is the clean master implementation for the EA PLAN experience.

### Visual system
- Premium warm dark brown / ivory / gold visual language.
- Transparent EA PLAN logo treatment in splash, auth, navigation, and onboarding.
- Responsive mobile-first layout for Android screens.
- Consistent typography, spacing, cards, buttons, navigation, profile menu, and modal patterns.
- Splash screen centers logo and tagline vertically and horizontally.

### Core experience
- Welcome / authentication / registration / password recovery.
- 3-step onboarding.
- Beranda with hero, active targets, projects, journal, Menarik Dilihat, and Komentar Mereka.
- Planning, Goals, Journal, Ideas, Projects, Journey.
- Statistik with Progress keseluruhan, Target Aktif, Projects, Journal, Ideas, and Ringkasan.
- Profil with media, editable profile data, public works, ideas, projects, journal, journey, guide, and profile menu.
- Jelajahi, Koleksi, Tentang EA PLAN, and Panduan.
- Local browser persistence for planning content, goals, journal, ideas, and projects so the interface is functional immediately.

### Supabase
- Existing Supabase Auth integration retained.
- Profile metadata: name, username, bio, photo_url, background_url.
- Profile media upload to `profile-media` Storage bucket retained.
- Existing `supabase/profile-media.sql` retained.
- Browser uses the public/publishable Supabase key through `/api/config`.

### Vercel
- `api/config.js` retained.
- `vercel.json` uses the current schema without an obsolete per-function runtime declaration.
- Node.js `24.x` pinned through `package.json` engines.
