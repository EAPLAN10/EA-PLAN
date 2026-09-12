# EA PLAN — Platform Perencanaan + Publikasi Karya

Paket ini mempertahankan arah visual EA PLAN: background `splash.jpg`, card transparan/glass, warna hitam–gold–ivory, dan Welcome tanpa transparansi.

## Struktur

Upload isi folder `EA_PLAN_PLATFORM_FINAL` ke ROOT repository GitHub:

- `index.html`
- `app.js`
- `styles.css`
- `supabase.js`
- `manifest.json`
- `assets/`

**Penting:** folder `assets/` harus berisi aset EA PLAN yang sekarang kamu gunakan:
`logo.png`, `logoea.png`, `splash.jpg`, `icon-192.png`, `icon-512.png`.

## Supabase

1. Buka SQL Editor.
2. Jalankan `EA_PLAN_PUBLIC_LIBRARY.sql`.
3. Jika ingin akun tertentu menjadi pemilik aplikasi, setelah login jalankan:
   `UPDATE public.profiles SET is_owner=true WHERE id='UUID_USER';`
4. Quote Harian hanya bisa diubah akun dengan `is_owner=true`.

## Fitur

- Auth Supabase
- Profil + bio
- Foto profil
- Background profil
- Planning/Goals/Projects/Journal tetap privat per pengguna
- Ideas/Projects/Journal diakses dari Profil
- Statistik dengan grafik dan Progress keseluruhan
- Beranda lama dipertahankan, ditambah Quote Harian dan perpustakaan karya publik
- Karya Publik: buku/tulisan/puisi/komik-galeri
- Draft → edit → tambah bab → publish
- Cover karya
- Tag
- Pencarian karya
- Terbaru / Terpopuler / Menarik
- Pembaca karya + daftar bab
- View counter
- Mobile navigation: Beranda · Karya · Buat · Statistik · Profil

## Vercel

Framework Preset: Other
Root Directory: `./`
Build Command: OFF
Output Directory: OFF
Install Command: OFF

Setelah commit ke GitHub, lakukan Redeploy di Vercel.
