# EA PLAN — Final Implementation

Platform final: perencanaan pribadi + publikasi karya. Desain EA PLAN dipertahankan: background transparan, card premium, nuansa gold/ivory, dan welcome opaque.

## Struktur utama
- Beranda: quote harian + karya Terbaru, Terpopuler, Menarik Dilihat, Komentar Mereka.
- Karya: pencarian, kategori, karya publik, karya saya, draft/publikasi.
- Buat: buku/tulisan, komik/galeri, webtoon, audio, file.
- Statistik: progress keseluruhan + grafik riwayat, target, projects, journal, ringkasan.
- Profil: foto/background, data profil, karya saya, menu Karya Publik, Ide & Catatan, Proyek, Journal, Tentang, Koleksi, Panduan.

## Supabase
1. Pastikan schema dasar EA PLAN sudah ada.
2. Jalankan `EA_PLAN_FINAL_SCHEMA.sql` sekali di Supabase SQL Editor.
3. Jika owner ingin mengubah Quote Hari Ini, isi `app_settings.owner_email` dengan email akun pemilik.
4. Pastikan Data API mengekspos schema `public`.

## Vercel
Framework: Other
Root Directory: ./
Build Command: kosong/default
Output Directory: kosong/default
Install Command: kosong/default
