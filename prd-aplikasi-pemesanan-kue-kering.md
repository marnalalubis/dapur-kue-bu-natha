# PRD — Aplikasi Pemesanan Kue Kering

**Versi:** 1.2 | **Status:** Updated (Penambahan Rekap Pelanggan & Menu Kebutuhan Stok Produksi) | **Jenis:** Product Requirement Document

---

## 1. Ringkasan & Tujuan

### 1.1 Latar Belakang
Toko kue kering skala kecil (1 pemilik, puluhan order/bulan) saat ini menerima pesanan secara manual (WhatsApp/chat) tanpa sistem terstruktur. Hal ini menyulitkan pencatatan pesanan, pengelolaan katalog produk, pelacakan status, dan rekapitulasi jumlah kue yang harus diproduksi/dipanggang.

### 1.2 Tujuan Produk
- Menyediakan katalog digital kue kering yang mudah diakses pembeli via browser HP.
- Mengotomatisasi alur pemesanan dari katalog hingga pencatatan pesanan dan konfirmasi WhatsApp.
- Memudahkan admin (pemilik toko) mengelola pesanan, melihat riwayat per pelanggan, dan mengetahui rekapitulasi total kue yang harus dibuat secara otomatis dari pesanan yang masuk.

### 1.3 Sasaran Keberhasilan
Pembeli dapat menyelesaikan pesanan dalam ≤ 5 menit tanpa bantuan admin, dan admin dapat mengelola pesanan serta memantau kebutuhan produksi kue langsung dari dashboard.

---

## 2. Audiens & Peran

| Peran | Deskripsi | Akses |
|---|---|---|
| **Pembeli** | Pelanggan akhir yang memesan kue via HP | Tanpa login (guest checkout) |
| **Admin** | Pemilik toko, mengelola produk, pesanan, dan produksi | Login sederhana (1 akun) |

> Asumsi: hanya ada 1 akun admin. Multi-admin di luar scope MVP.

---

## 3. Scope MVP

### 3.1 In-Scope
- Katalog produk (foto, nama, harga, deskripsi, kategori, status tersedia/habis)
- Keranjang belanja (tersimpan di browser pembeli)
- Checkout dengan form: nama, no. HP, alamat/catatan, metode pengambilan (ambil sendiri / kirim manual)
- Generate kode pesanan unik
- Halaman konfirmasi pesanan: ringkasan pesanan, kode pesanan, rincian biaya yang dibayar saat serah terima/ambil, dan tombol konfirmasi via WhatsApp
- Cek status pesanan oleh pembeli (kode pesanan + no. HP)
- Dashboard admin: daftar pesanan, filter status, pencarian kode/HP
- Kelola produk (CRUD + upload foto)
- Kelola pesanan: konfirmasi pesanan, update status pengerjaan
- **Rekapan pesanan per pelanggan (Customer Order Recap):** Riwayat pesanan, frekuensi beli, total pengeluaran dikelompokkan per nomor HP/nama pembeli
- **Menu kebutuhan stok yang akan dibuat (Production / Baking Queue Summary):** Rekapitulasi total jumlah kue/toples yang harus diproduksi berdasarkan pesanan yang masuk (status Baru & Diproses)
- Pengaturan toko: no. WhatsApp, info toko, alamat penjemputan, info rekening (opsional sebagai info rujukan), mode "tutup sementara"
- Notifikasi order baru ke admin via dashboard + link WA siap kirim ke pembeli

### 3.2 Out-of-Scope (fase ini)
- Sistem/alur transaksi dan pembayaran di dalam web (pembayaran dilakukan secara offline: COD / saat ambil sendiri / transfer mandiri via chat WA)
- Upload dan verifikasi bukti transfer di aplikasi
- Payment gateway (QRIS/e-wallet otomatis)
- Integrasi ongkir/logistik otomatis
- Registrasi akun pembeli
- Aplikasi native (APK/App Store) dan mode offline
- Multi-role (reseller, kurir), multi-admin
- Promo, voucher, poin loyalitas, laporan keuangan lengkap

---

## 4. Workflow & Peran

### 4.1 Alur Pemesanan (Pembeli)
1. Pembeli membuka web app → melihat katalog
2. Memilih produk → tambah ke keranjang → atur jumlah
3. Checkout → mengisi form data diri → memilih metode pengambilan (ambil sendiri / kirim manual)
4. Sistem membuat pesanan dengan **kode unik** (misal: `KK-20250101-0042`) dan mencatatnya ke database
5. Sistem menampilkan halaman konfirmasi pesanan: rincian item, total biaya yang harus dibayar saat ambil/terima, dan instruksi penjemputan/pengantaran
6. Pembeli menekan tombol "Konfirmasi Pesanan via WhatsApp" yang membuka `wa.me` dengan template pesan otomatis berisi kode pesanan dan rincian belanja
7. Pembeli dapat mengecek status kapan pun via kode pesanan + no. HP

### 4.2 Alur Pengelolaan & Produksi (Admin)
1. Admin login → dashboard menampilkan pesanan baru & metrik ringkas
2. Admin membuka detail pesanan → memeriksa rincian pesanan dan kontak pembeli
3. Admin dapat menghubungi pembeli melalui WhatsApp untuk verifikasi/konfirmasi pesanan
4. **Admin membuka Menu Kebutuhan Stok Produksi** → melihat total jumlah toples per varian kue yang harus dipanggang/dibuat dari seluruh pesanan berstatus `Baru` dan `Diproses`
5. **Admin membuka Menu Rekap Pelanggan** → melihat riwayat belanja pelanggan setia atau memeriksa riwayat pemesanan pelanggan tertentu
6. Admin mengubah status bertahap: `Baru → Diproses → Siap → Selesai` (atau `Dibatalkan`)
7. Pembayaran diselesaikan saat pesanan diambil sendiri di toko atau diserahterimakan (COD)

### 4.3 Status Pesanan
| Status | Arti |
|---|---|
| `Baru` | Pesanan dibuat pembeli, menunggu konfirmasi admin |
| `Diproses` | Pesanan dikonfirmasi dan kue sedang disiapkan/diproduksi |
| `Siap` | Kue siap diambil di toko atau siap dikirim |
| `Selesai` | Pesanan telah diterima pembeli dan pembayaran telah lunas (COD/saat serah terima) |
| `Dibatalkan` | Dibatalkan oleh admin atau pembeli |

---

## 5. Kebutuhan Fungsional

### 5.1 Modul Katalog
- **F-01** Sistem menampilkan daftar produk: foto, nama, harga, kategori, status tersedia/habis.
- **F-02** Produk berstatus habis tetap tampil namun tidak bisa ditambahkan ke keranjang.
- **F-03** Pembeli dapat memfilter produk berdasarkan kategori.
- **F-04** Halaman detail produk menampilkan foto, deskripsi, harga, tombol "Tambah ke Keranjang".

### 5.2 Modul Keranjang
- **F-05** Pembeli dapat menambah, mengubah jumlah, dan menghapus item.
- **F-06** Keranjang tersimpan di localStorage browser (tidak hilang saat tutup browser).
- **F-07** Sistem menampilkan subtotal otomatis.

### 5.3 Modul Checkout & Order
- **F-08** Form checkout wajib: nama, no. HP; opsional: alamat, catatan.
- **F-09** Pembeli memilih metode: ambil sendiri / kirim (alamat wajib jika kirim).
- **F-10** Sistem memvalidasi format no. HP Indonesia (awalan 08, 10–13 digit).
- **F-11** Sistem membuat kode pesanan unik dan mencatat pesanan ke database.

### 5.4 Modul Konfirmasi Pesanan (Order Confirmation)
- **F-12** Halaman konfirmasi menampilkan kode pesanan, rincian pesanan, total bayar saat serah terima/ambil, serta instruksi pengambilan/pengiriman.
- **F-13** Pembayaran diselesaikan secara offline (COD / saat ambil sendiri / transfer langsung atas kesepakatan di chat WhatsApp tanpa upload bukti di web).
- **F-14** Tersedia tombol "Konfirmasi Pesanan via WhatsApp" yang membuka `wa.me` dengan template pesan berisi kode pesanan, nama pembeli, rincian belanja, dan total.

### 5.5 Modul Cek Status (Pembeli)
- **F-15** Pembeli memasukkan kode pesanan + no. HP untuk melihat status terkini (`Baru`, `Diproses`, `Siap`, `Selesai`, `Dibatalkan`).

### 5.6 Modul Admin
- **F-16** Admin login dengan email/username + password (password di-hash).
- **F-17** Admin dapat menambah/mengedit/menonaktifkan produk beserta foto.
- **F-18** Admin melihat daftar pesanan dengan filter status dan pencarian kode/no. HP.
- **F-19** Admin dapat mengubah status pesanan sesuai alur 4.3 (`Baru → Diproses → Siap → Selesai / Dibatalkan`).
- **F-20** Admin dapat mengubah pengaturan: no. WA toko, info toko, alamat penjemputan, info rekening (opsional), mode tutup sementara.
- **F-21** Saat mode "tutup sementara" aktif, checkout dinonaktifkan dengan pesan informasi.
- **F-22 [Baru] Rekapan Pesanan per Pelanggan (Customer Recap):**
  - Admin dapat melihat daftar pelanggan teragregasi berdasarkan Nomor HP (dan Nama terakhir).
  - Menampilkan ringkasan: jumlah pesanan (frekuensi order), total nominal belanja yang pernah dilakukan, tanggal order terakhir, dan daftar kode pesanan terkait.
  - Terdapat tombol langsung untuk menghubungi pelanggan via WhatsApp (`wa.me/{nomorHp}`).
- **F-23 [Baru] Menu Kebutuhan Stok yang Akan Dibuat (Production/Baking Queue):**
  - Admin dapat melihat rekapitulasi kuantiti toples/produk kue yang harus diproduksi berdasarkan akumulasi item dari pesanan aktif (filter: status `Baru`, `Diproses`, atau gabungan keduanya).
  - Menampilkan daftar per produk: Nama Kue, Total Jumlah (Qty) yang harus dibuat, serta rincian kode pesanan dan nama pemesan yang memesan kue tersebut.
  - Membantu pemilik toko mengetahui jadwal dan jumlah produksi harian/mingguan tanpa menghitung manual.

---

## 6. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan |
|---|---|
| **Responsif** | Mobile-first, nyaman dipakai di layar 360px ke atas; tetap berfungsi di desktop |
| **Performa** | Halaman katalog termuat ≤ 3 detik pada koneksi 4G *(target, perlu diukur saat testing)* |
| **Kapasitas** | Mendukung ± 100 pesanan/bulan dan ± 50 produk *(target kapasitas, bukan hasil uji)* |
| **Keamanan** | HTTPS wajib; password admin di-hash; halaman admin tidak dapat diakses tanpa login; upload foto produk divalidasi tipe & ukuran |
| **Privasi** | Data pembeli (nama, HP, alamat) hanya untuk keperluan pesanan; tidak dijual/dibagikan |
| **Ketersediaan** | Mengandalkan uptime penyedia hosting (tier gratis ~99% klaim penyedia — perlu verifikasi) |
| **Backup** | Backup database otomatis harian (fitur bawaan Supabase/Neon atau setara) |
| **Bahasa** | Seluruh antarmuka Bahasa Indonesia |

---

## 7. Acceptance Criteria Terukur

| # | Kriteria | Target |
|---|---|---|
| AC-1 | Pembeli menyelesaikan checkout dari katalog | ≤ 5 langkah utama |
| AC-2 | Checkout gagal karena form invalid | Pesan error jelas per field, data tidak hilang |
| AC-3 | Kode pesanan unik | Tidak ada duplikasi dalam database |
| AC-4 | Konfirmasi pesanan & link WhatsApp | Pesanan sukses terbuat di DB, muncul rincian belanja, dan tombol WA membuka pesan terformat dengan kode pesanan |
| AC-5 | Keranjang persisten | Item tetap ada setelah browser ditutup-dibuka |
| AC-6 | Status pesanan | Pembeli melihat status sesuai yang di-set admin, real-time saat refresh |
| AC-7 | Mode tutup sementara | Tombol checkout nonaktif + pesan tampil di katalog |
| AC-8 | Akses admin tanpa login | Diarahkan ke halaman login |
| AC-9 | Rekapan pesanan per pelanggan | Admin dapat melihat riwayat pesanan yang dikelompokkan berdasarkan nomor HP beserta akumulasi total belanjanya |
| AC-10 | Rekap kebutuhan stok yang akan dibuat | Sistem menampilkan total kuantiti kue yang harus dibuat secara tepat berdasarkan pesanan berstatus Baru & Diproses |

---

## 8. Data, Integrasi & Pembayaran

### 8.1 Entitas Data Utama (tingkat konsep)
- **Produk:** nama, deskripsi, harga, kategori, foto, status aktif/habis
- **Pesanan:** kode unik, nama, no. HP, alamat, catatan, metode pengambilan, total, status, waktu dibuat
- **Item Pesanan:** pesanan, produk, jumlah, harga satuan saat transaksi
- **Pelanggan (Virtual Agregasi):** no. HP sebagai identifier unik, nama terakhir, jumlah order, total transaksi, riwayat order
- **Kebutuhan Produksi (Agregasi Stok):** produk, total qty dibutuhkan dari pesanan `Baru` dan `Diproses`
- **Pengaturan:** no. WA, info toko, alamat penjemputan, info rekening (opsional), mode tutup
- **Admin:** username/email, password hash

### 8.2 Integrasi & Pembayaran
- **WhatsApp:** via link `wa.me` + template teks (tanpa API berbayar) untuk konfirmasi pesanan langsung ke nomor pemilik toko dan kontak cepat admin ke pelanggan.
- **Pembayaran:** Manual offline (COD / saat ambil sendiri di toko). Tidak ada alur transaksi pembayaran atau upload bukti transfer di web app.

---

## 9. Dependensi
- Akun hosting (Vercel/Railway atau setara) & database (Supabase/Neon atau setara)
- Domain (opsional tapi direkomendasikan untuk kepercayaan pelanggan)
- Foto produk berkualitas dari pemilik toko
- No. WhatsApp aktif milik toko

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Pesanan fiktif / pembeli no-show saat COD | Kerugian bahan/barang | Admin konfirmasi via WhatsApp sebelum mengubah status ke `Diproses` (sebelum kue mulai dibuat) |
| Salah hitung kebutuhan produksi | Kue kurang/lebih dibuat | Sistem otomatis menghitung total stok kue yang harus dibuat dari pesanan aktif |
| Lonjakan order musiman (Lebaran) | Kewalahan | Mode tutup sementara + status habis per produk |
| Kuota storage habis | Foto produk gagal upload | Foto dikompres otomatis (maks. 2 MB); tidak ada upload file dari pembeli |
| Keranjang hilang | Pembeli frustasi | Simpan di localStorage |
| Pembeli salah input no. HP | Tidak bisa cek status | Validasi format + tampilkan ulang di halaman konfirmasi |
| Lupa password admin | Tidak bisa kelola | Mekanisme reset via email atau reset manual oleh developer |

---

## 11. Metrik Keberhasilan (pasca-rilis)

| Metrik | Target | Cara Ukur |
|---|---|---|
| Pesanan tercatat via aplikasi vs manual | ≥ 70% via aplikasi dalam 2 bulan | Perbandingan jumlah order tercatat |
| Efisiensi waktu produksi | Menghilangkan waktu rekap manual buku pesanan | Pemilik toko langsung memakai menu Kebutuhan Stok Produksi |
| Checkout terbengkalai (keranjang → order) | ≤ 50% abandonment | Tracking sederhana jumlah keranjang vs order |
| Waktu admin memproses pesanan | Lebih cepat dibanding pencatatan chat manual | Feedback pemilik |
| Error/keluhan pembeli per bulan | ≤ 3 keluhan | Catatan pemilik |

---

## 12. Decision Log

| # | Keputusan | Alasan | Status |
|---|---|---|---|
| D-1 | Web App, bukan native | Hemat biaya, tanpa install, update mudah | ✅ Terkonfirmasi |
| D-2 | Guest checkout tanpa akun | Pembeli toko kecil enggan registrasi | ✅ Terkonfirmasi (asumsi) |
| D-3 | Hapus alur pembayaran di web (bayar offline/COD/ambil sendiri) | Menghilangkan friksi upload bukti transfer; volume kecil lebih efektif konfirmasi WA | ✅ Terkonfirmasi |
| D-4 | Notifikasi via link WA, bukan API | Gratis, langsung jalan tanpa biaya API | ✅ Terkonfirmasi |
| D-5 | Rekap pelanggan via no. HP tanpa sistem register | Tetap memberi insight pelanggan setia tanpa memaksa pembeli bikin akun | ✅ Terkonfirmasi |
| D-6 | Menu rekap kebutuhan stok otomatis | Toko kue bekerja dengan sistem batch cooking/baking berdasarkan pesanan masuk | ✅ Terkonfirmasi |
| D-7 | Stack: Next.js/Laravel + Postgres + storage cloud | Teruji dan modular | 🔶 Rekomendasi — dikunci di dokumen Arsitektur |
| D-8 | Satu akun admin | Toko 1 pemilik | 🔶 Asumsi |

---

## 13. Rencana Fase Berikutnya (Out-of-Scope Kandidat)
- Payment gateway (QRIS otomatis)
- Upload bukti transfer jika volume toko berkembang
- PWA (icon di homescreen + push notification)
- Akun pembeli & riwayat login mandiri
- Pengurangan stok bahan baku resep otomatis (BOM - Bill of Materials)
- Voucher/promo

---

*Dokumen ini membedakan: fakta terkonfirmasi (dari discovery), asumsi (ditandai 🔶/catatan), dan rekomendasi. Estimasi bukan komitmen.*
