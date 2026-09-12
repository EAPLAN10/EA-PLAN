# EA PLAN — Supabase Storage setup

## 1. Environment Variables di Vercel
Tambahkan:
- `SUPABASE_URL` = URL project Supabase
- `SUPABASE_ANON_KEY` = Publishable/anon key Supabase

Jangan masukkan `service_role` key ke browser atau repository.

## 2. Jalankan SQL
Buka Supabase → SQL Editor → jalankan seluruh isi:
`supabase/profile-media.sql`

SQL membuat bucket publik `profile-media` dan policy agar pengguna terautentikasi hanya dapat upload/update/delete folder miliknya sendiri.

## 3. Authentication
Versi ini menggunakan Supabase Auth Email/Password. Jadi tombol Buat Akun dan Masuk tidak lagi memakai akun demo localStorage.

Jika Email Confirmation aktif, pengguna harus mengonfirmasi email sebelum sesi login tersedia.

## 4. Media profil
- Foto profil di-upload ke `profile-media/<user-id>/profile.png`.
- Background di-upload ke `profile-media/<user-id>/background.png`.
- Keduanya dikonversi ke PNG di browser sebelum upload.
- URL publik disimpan pada `auth.users.raw_user_meta_data` sebagai `photo_url` dan `background_url`.
- Background diterapkan pada seluruh halaman aplikasi selama URL tersedia.

## Catatan background removal
Konversi JPG/WebP ke PNG **tidak sama dengan menghapus background**. Penghapusan background otomatis membutuhkan engine background-removal khusus. Paket ini belum mengklaim menghapus background foto pengguna secara otomatis.
