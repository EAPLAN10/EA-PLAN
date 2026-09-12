# EA PLAN — paket revisi terbaru

Paket ini berisi build statis yang siap dimasukkan ke GitHub dan dideploy ke Vercel.

## Perubahan utama
- Logo EA PLAN `public/assets/logo.png` sudah dibuat **PNG transparan**: latar hitam pada file logo tidak ikut tampil.
- Splash/welcome menempatkan logo + tagline di tengah vertikal dan horizontal.
- Teks `EA PLAN` duplikat di bawah logo pada splash dihapus.
- Profil pengguna dapat menyimpan nama, username, bio, foto profil, dan background secara lokal untuk build demo.
- Foto profil yang tersimpan dipakai kembali pada avatar/header dan halaman profil.
- Beranda tidak lagi menampilkan Progress, Target Aktif, Projects, Journal, dan Langkah Hari Ini; area tersebut dipusatkan untuk statistik.
- Bagian kedua `Menarik Dilihat` menjadi `Komentar Mereka`.

> Catatan: penyimpanan media pada build ini menggunakan localStorage/Data URL. Untuk production multi-device, hubungkan ke Supabase Storage + database sesuai migration/backend yang digunakan.

## Deploy
1. Upload isi folder ini ke repository GitHub.
2. Import repository tersebut ke Vercel.
3. Jika memakai Supabase, isi environment variable di Vercel sesuai project Supabase Anda.
