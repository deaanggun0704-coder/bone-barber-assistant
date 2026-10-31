# Bone Barber Assistant

Chatbot informasi Bone Barber Shop yang dibuat dengan React, Vite, TypeScript, Tailwind CSS, dan Lucide. FAQ berjalan secara lokal tanpa database atau layanan AI.

> Informasi yang belum diberikan ditandai **Perlu diisi admin**. Koordinat toko sengaja belum diatur; kalkulasi jarak baru aktif setelah admin mengisi koordinat yang terverifikasi.

## Menjalankan lokal

Prasyarat: Node.js 22.12 atau lebih baru dan npm.

```bash
npm install
npm run dev
```

Jalankan pemeriksaan:

```bash
npm test
npm run build
npm run preview
```

## Mengisi data usaha

Edit `src/data/shop.ts` untuk alamat, tautan Google Maps, koordinat toko yang diverifikasi, layanan/harga, jam operasional, telepon, WhatsApp, kategori retail, dan metode pembayaran. Jam operasional yang tercatat: Senin–Sabtu 09.00–20.00; Minggu 10.00–20.00. Harga serta durasi layanan saat ini disalin dari data bawaan SQL sistem operasional dan ditandai perlu dikonfirmasi admin; verifikasi sebelum menganggapnya sebagai harga berlaku. Kategori retail bukan jaminan stok tersedia; nama/merek, harga jual, dan stok harus dilengkapi admin. Jangan memasukkan koordinat perkiraan. Edit `src/data/faq.ts` untuk menambahkan FAQ dan kata kunci.

Alamat rumah berupa teks tidak otomatis diubah menjadi koordinat. Form manual menerima latitude dan longitude, tanpa layanan geocoding. Koordinat pengguna hanya berada di memori halaman; Local Storage dipakai hanya untuk preferensi tema.

## Reservasi online

Form reservasi ada di `/reservasi`. Form meminta nama, nomor WhatsApp/HP, layanan aktif, tanggal (hari ini, besok, atau tanggal pilihan), jam, dan persetujuan pemrosesan data. Sumber endpoint PHP adalah `integration/php/public-booking.php`; tempatkan salinannya sebagai `api/public-booking.php` pada root situs PHP operasional (folder `api` sudah disiapkan untuk pengujian lokal). Endpoint mengambil daftar layanan aktif langsung dari database operasional, membuat/mencari data pelanggan berdasarkan nomor HP, lalu menambahkan booking dengan status `menunggu` dan barber belum ditentukan. Admin/kasir harus memeriksa jadwal dan mengonfirmasi; ketersediaan slot tidak dikunci otomatis.

Endpoint PHP memerlukan PHP 8.1+ dengan PDO MySQL dan memakai database yang sudah dikonfigurasi untuk situs operasional. Untuk tes lokal, nyalakan Apache/MySQL XAMPP, akses endpoint lewat `http://localhost/webbarbershop/api/public-booking.php`, dan jalankan Vite pada `http://localhost:5173`. Endpoint hanya mengizinkan origin Vercel production dan Vite localhost secara default; atur `BOOKING_ALLOWED_ORIGINS` pada server PHP jika domain berubah. Endpoint menerapkan validasi server, honeypot, rate limit 5 pengiriman per 10 menit per alamat IP, aturan jam operasional, dan batas akhir layanan.

**Integrasi publik belum aktif sampai situs PHP/MySQL admin di-host dengan HTTPS.** `localhost` hanya dapat diakses dari komputer yang sama. Setelah endpoint memperoleh URL publik HTTPS, atur `VITE_BOOKING_API_URL` pada Environment Variables Vercel ke URL endpoint penuh (misalnya `https://domain-admin.example/api/public-booking.php`), lalu redeploy. Jangan mengisi URL localhost di Vercel dan jangan menaruh secret di variabel `VITE_*`. Tanpa konfigurasi API, formulir menampilkan bahwa pengiriman online belum tersedia dan tidak berpura-pura menyimpan reservasi.

## Struktur

```text
src/
  components/   Navbar, footer, chatbot, kalkulator jarak, kartu layanan
  data/          Data toko dan FAQ lokal
  hooks/         Preferensi tema
  pages/         Beranda, chatbot, layanan, reservasi, lokasi, tentang
  styles/        Tema dan gaya responsif
  utils/         Pencocokan FAQ dan Haversine
integration/php/ Endpoint reservasi publik untuk ditempatkan pada hosting admin PHP
```

## Deploy ke GitHub dan Vercel

1. Buat repository baru di GitHub, lalu dari folder proyek jalankan:

   ```bash
   git init
   git add .
   git commit -m "Initial Bone Barber Assistant"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
   git push -u origin main
   ```
2. Di Vercel, pilih **Add New → Project**, impor repository GitHub. Framework terdeteksi sebagai Vite.
3. Build command `npm run build`, output directory `dist`, kemudian klik **Deploy**.
4. Vercel menampilkan URL production setelah deployment berhasil. Buka URL dan pastikan HTTPS aktif; aplikasi belum online sampai URL berhasil dibuka.
5. Uji navigasi, FAQ, tema, reservasi, dan layout di desktop dan smartphone. Browser memerlukan HTTPS atau localhost untuk Geolocation API.

`vercel.json` mengatur security headers serta fallback SPA. HTTPS mengenkripsi komunikasi saat transit, tetapi bukan berarti semua data otomatis terenkripsi di semua tempat. Versi ini tidak mengirim chat maupun koordinat ke server.

## Keamanan

- Jangan menaruh token/secret di repository atau variabel frontend `VITE_*`.
- API eksternal yang membutuhkan secret harus dipanggil melalui backend/serverless function.
- Input chat dibatasi 500 karakter dan ditampilkan sebagai teks biasa.
- Tidak ada riwayat percakapan atau lokasi yang disimpan.
