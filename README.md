# Vila Permai

Halaman web statis untuk melihat pilihan vila, memperkirakan biaya menginap, dan mencatat pesanan secara lokal. Dibuat dengan HTML, CSS, dan JavaScript murni tanpa framework, pustaka tambahan, server aplikasi, atau basis data.

## Menjalankan

Tidak perlu memasang dependensi. Buka `index.html` langsung di peramban, atau jalankan melalui XAMPP:

1. Pastikan folder proyek berada di `htdocs`.
2. Nyalakan Apache dari XAMPP.
3. Buka `http://localhost/Teknologi%20web/` di peramban. Sesuaikan nama URL jika folder proyek berbeda.

## Berkas proyek

- `index.html` — struktur halaman dan formulir pemesanan.
- `style.css` — tampilan responsif bertema desa Konoha.
- `script.js` — data vila, pencarian, validasi, perkiraan biaya, dan penyimpanan pesanan.

## Perkiraan biaya

Total dihitung dengan rumus **harga vila per malam × jumlah malam**. Check-out harus setelah check-in. Tidak ada biaya tambahan per tamu; jumlah tamu harus sesuai kapasitas vila.

## Data dan batasan

- Data tiga vila dan status ketersediaannya ditentukan di array `dataVila` dalam `script.js`.
- Nama tamu terakhir dan daftar pesanan disimpan di `localStorage` peramban. Data hanya tersedia pada peramban dan perangkat yang sama.
- Aplikasi ini tidak mengirimkan pesanan kepada pemilik dan tidak memeriksa ketersediaan secara langsung. Hubungi pemilik untuk konfirmasi.
- Nomor kontak yang ditampilkan dapat diperbarui pada bagian kontak di `index.html`.
