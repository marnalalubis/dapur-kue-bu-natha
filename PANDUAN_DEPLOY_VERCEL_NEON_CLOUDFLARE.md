# 🚀 Panduan Deploy Cepat: GitHub + Neon + Vercel + Cloudflare
## Dapur Kue Kering Bu Sri

Karena Anda sudah memiliki keempat akun (**GitHub**, **Neon.tech**, **Vercel**, dan **Cloudflare**), proses peluncuran toko online ini dapat diselesaikan hanya dalam **4 langkah mudah** (sekitar 5–10 menit)!

Aplikasi sudah kami lengkapi dengan adapter **Neon Serverless PostgreSQL** otomatis (`@neondatabase/serverless`), sehingga saat `DATABASE_URL` dimasukkan, seluruh katalog kue dan riwayat pesanan akan otomatis terhubung ke database cloud Neon!

---

### 📌 LANGKAH 1: Ambil Connection String dari Neon.tech (2 Menit)

1. Buka [console.neon.tech](https://console.neon.tech/) dan login.
2. Klik tombol **"Create Project"** (atau New Project).
   * **Project Name**: `dapur-kue-bu-sri`
   * **Region**: Pilih yang terdekat (misal: `ap-southeast-1` Singapore atau default).
   * Klik **Create Project**.
3. Di halaman Dashboard Neon, pada kotak **Connection Details**, pilih opsi **"Postgres"** atau **".env"**.
4. Salin teks koneksi yang berformat seperti ini:
   ```text
   postgresql://neondb_owner:npg_xxxxxxxx@ep-xxxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
   *(Simpan teks ini di notepad sementara, ini adalah `DATABASE_URL` Anda)*.

---

### 📌 LANGKAH 2: Upload Kode ke GitHub (2 Menit)

1. Buka [github.com](https://github.com/) dan login.
2. Klik tombol **New** (ikon plus di kanan atas) untuk membuat repositori baru:
   * **Repository name**: `dapur-kue-bu-sri`
   * Pilih **Private** (atau Public).
   * Jangan centang "Add a README file" (karena file proyek lokal sudah lengkap).
   * Klik **Create repository**.
3. Buka **PowerShell** atau **Terminal** di laptop Anda, masuk ke folder proyek ini (`c:\Users\User\Downloads\Moblie`), lalu jalankan perintah berikut secara berurutan:
   ```bash
   git init
   git add .
   git commit -m "Siap deploy Dapur Kue Bu Sri ke Vercel dan Neon"
   git branch -M main
   git remote add origin https://github.com/USERNAME_GITHUB_ANDA/dapur-kue-bu-sri.git
   git push -u origin main
   ```
   *(Ganti `USERNAME_GITHUB_ANDA` dengan username GitHub Anda)*.

---

### 📌 LANGKAH 3: Deploy di Vercel (2 Menit)

1. Buka [vercel.com](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Di halaman Dashboard, klik tombol **"Add New..."** → pilih **"Project"**.
3. Pada daftar repositori GitHub yang muncul, cari `dapur-kue-bu-sri`, lalu klik tombol **"Import"**.
4. Buka accordion **"Environment Variables"** dan tambahkan variabel berikut:
   * **Key**: `DATABASE_URL`  
     **Value**: `(Tempelkan Connection String dari Neon di Langkah 1 tadi)`
   * **Key**: `ADMIN_USERNAME`  
     **Value**: `admin` *(atau username pilihan Anda)*
   * **Key**: `ADMIN_PASSWORD`  
     **Value**: `KataSandiRahasiaAnda123!` *(ganti dengan password baru Anda)*
   * **Key**: `ADMIN_SESSION_SECRET`  
     **Value**: `kue-secret-token-aman-2026`
5. Klik tombol **"Deploy"**!
6. Tunggu sekitar 1 menit. Vercel akan otomatis meng-compile aplikasi. Begitu selesai, akan muncul animasi konfeti dan website toko kue Anda sudah **RESMI ONLINE** dengan link gratis ber-HTTPS (misal: `https://dapur-kue-bu-sri.vercel.app`)!

> **Kabar Baik:** Begitu pertama kali dibuka, aplikasi akan secara otomatis menyalin (*auto-seed*) data awal kue kering (Nastar, Kastengel, Putri Salju, dll.) langsung ke database Neon cloud Anda!

---

### 📌 LANGKAH 4: Hubungkan Domain Sendiri di Cloudflare (Opsional)

Jika Anda ingin memakai domain sendiri (misal: `dapurkuebusri.com`):

1. **Di Dashboard Vercel**:
   * Buka project Anda → pilih tab **Settings** → **Domains**.
   * Ketikkan domain Anda (misal `dapurkuebusri.com`) dan klik **Add**.
   * Vercel akan menampilkan DNS target (biasanya CNAME `cname.vercel-dns.com` atau A Record `76.76.21.21`).
2. **Di Dashboard Cloudflare**:
   * Buka [dash.cloudflare.com](https://dash.cloudflare.com/) → pilih domain Anda.
   * Masuk ke menu **DNS** → **Records** → klik **Add record**.
   * Masukkan record yang diminta Vercel:
     * **Type**: `CNAME`
     * **Name**: `@` (atau `www`)
     * **Target**: `cname.vercel-dns.com`
     * **Proxy status**: Disarankan *DNS only* (abu-abu) saat pertama kali verifikasi Vercel.
3. Tunggu beberapa saat, Vercel akan otomatis menerbitkan sertifikat SSL SSL/TLS. Toko kue Anda kini bisa diakses dari seluruh dunia melalui alamat domain Anda sendiri!

---

### 🎉 Selesai! Apa yang Terjadi Sekarang?
* Pelanggan bisa langsung membuka link toko dari HP dan memesan kue.
* Setiap pesanan baru otomatis tersimpan permanen di cloud database **Neon.tech**.
* Pesanan otomatis masuk ke panel admin Anda di `/admin`.
* Anda bisa langsung mencetak nota thermal atau label dus pengiriman kapan pun dari handphone atau laptop Anda!
