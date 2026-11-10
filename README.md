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

Edit `src/data/shop.ts` untuk alamat, tautan Google Maps, koordinat toko yang diverifikasi, layanan/harga, produk retail/harga/stok, dan metode pembayaran. Katalog produk mencerminkan daftar pada sistem produk retail Bone Barber Shop; stok adalah catatan pada data katalog, bukan informasi real-time, dan dapat berubah mengikuti penjualan. Jam operasional, nomor admin WhatsApp, layanan untuk reservasi, dan daftar barber dikonfigurasi di `src/data/businessConfig.ts`. Harga serta durasi layanan saat ini disalin dari data bawaan SQL sistem operasional dan ditandai perlu dikonfirmasi admin. Jangan memasukkan koordinat perkiraan. Edit `src/data/faq.ts` untuk menambahkan FAQ dan kata kunci.

Alamat rumah berupa teks tidak otomatis diubah menjadi koordinat. Form manual menerima latitude dan longitude, tanpa layanan geocoding. Dari lokasi pelanggan, halaman Lokasi menyediakan tautan rute Google Maps untuk kendaraan bermotor, jalan kaki, dan sepeda; Google Maps menghitung jarak jalan serta estimasi waktu berdasarkan rute dan kondisi terkini. Jarak garis lurus tetap memerlukan koordinat toko terverifikasi. Koordinat pengguna hanya berada di memori halaman; Local Storage dipakai hanya untuk preferensi tema.

## Pilihan chatbot dan reservasi melalui WhatsApp

Chatbot menyediakan pilihan interaktif untuk layanan dan produk. Permintaan “cara reservasi” menampilkan tautan formulir yang meminta nama, nomor WhatsApp, layanan, tanggal, dan jam. Setelah formulir valid, WhatsApp terbuka dengan draf pesan dan chatbot mengonfirmasi bahwa draf telah disiapkan. Pelanggan tetap perlu menekan Kirim di WhatsApp; konfirmasi chatbot bukan konfirmasi ketersediaan jadwal dari admin. Pilihan produk menampilkan harga jual serta stok yang tercatat dan dapat ditanyakan lebih lanjut kepada admin melalui WhatsApp.

Halaman `/reservasi` memvalidasi nama, nomor pelanggan (opsional), layanan, tanggal, jam operasional, serta durasi layanan. Tanggal dan jam mengikuti zona waktu `Asia/Jakarta`. Saat data valid dikirim, situs membuka WhatsApp melalui tautan HTTPS dengan pesan reservasi yang sudah diisi. Pelanggan tetap perlu memeriksa pesan dan menekan **Kirim** di WhatsApp; situs tidak dapat mengirim pesan atau memastikan reservasi diterima atas nama pelanggan. Jadwal hanya divalidasi terhadap jam operasional, bukan ketersediaan barber atau slot, sehingga admin tetap harus mengonfirmasi permintaan.

Konfigurasi lokal ada di `src/data/businessConfig.ts`. Nomor WhatsApp admin Bone Barber Shop disimpan dalam format internasional dengan kode negara, tanpa tanda `+` atau spasi. `barbers` kosong sampai ada daftar barber terverifikasi. Layanan dan jam usaha diambil dari data toko lokal; verifikasi perubahan jadwal sebelum mengubah konfigurasi. Formulir tidak menyimpan data reservasi di browser atau mengirimkannya ke backend. Deploy Vercel tetap menggunakan HTTPS; HTTPS mengenkripsi koneksi situs, tetapi bukan pengganti konfirmasi pelanggan melalui WhatsApp.

## Struktur

```text
src/
  components/   Navbar, footer, chatbot, kalkulator jarak, kartu layanan, form/ringkasan reservasi
  data/          Data toko, konfigurasi usaha, dan FAQ lokal
  hooks/         Preferensi tema
  pages/         Beranda, chatbot, layanan, reservasi, lokasi, tentang
  styles/        Tema dan gaya responsif
  types/         Tipe data reservasi
  utils/         Pencocokan FAQ, Haversine, validasi reservasi, dan URL WhatsApp
integration/php/ Integrasi PHP operasional yang terpisah dari alur reservasi WhatsApp situs ini
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
