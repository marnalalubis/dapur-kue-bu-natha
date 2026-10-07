# 🚀 Panduan Deployment & Go-Live (Online ke Publik)
## Dapur Kue Kering Bu Sri

Dokumen ini memuat panduan lengkap langkah demi langkah untuk meluncurkan aplikasi pemesanan kue kering ke internet agar dapat diakses oleh pelanggan umum melalui browser HP dan komputer.

---

## 📋 Checklist Pra-Peluncuran (Pre-Launch Checklist)

Sebelum membagikan link toko ke pelanggan, pastikan Anda telah melakukan:
1. [ ] **Ganti Kredensial Login Admin**: Ubah username dan password default (`admin` / `admin123`) di environment variables (`ADMIN_USERNAME` dan `ADMIN_PASSWORD`).
2. [ ] **Perbarui Nomor WhatsApp Toko**: Masuk ke menu **Pengaturan Toko** (`/admin/settings`), pastikan nomor WhatsApp yang tercantum adalah nomor aktif yang menerima order.
3. [ ] **Cek Foto & Harga Kue**: Pastikan katalog produk di `/admin/products` sudah memiliki harga dan foto kue yang sesuai.
4. [ ] **Lakukan Uji Coba Order (Test Order)**: Buka katalog dari HP, coba pesan 1 toples kue, kirim pesanan, dan verifikasi bahwa pesanan langsung masuk ke daftar pesanan admin & antrean baking queue.

---

## 🌟 4 Pilihan Metode Deployment

Pilih metode yang paling cocok dengan kebutuhan dan anggaran Anda:

---

### METODE 1: Online 24 Jam via Cloud PaaS (Railway / Render) — *Paling Praktis*

Metode ini sangat disarankan jika Anda ingin website online 24 jam tanpa perlu mengelola server Linux sendiri, dan data pesanan tetap tersimpan aman.

#### Langkah di Railway (railway.app):
1. Buat akun di [Railway](https://railway.app/) (bisa login dengan akun GitHub).
2. Upload kode proyek ini ke repositori GitHub pribadi Anda:
   ```bash
   git init
   git add .
   git commit -m "Siap deploy Dapur Kue Bu Sri"
   git branch -M main
   git remote add origin https://github.com/username-anda/dapur-kue-busri.git
   git push -u origin main
   ```
3. Di Dashboard Railway, klik **New Project** → **Deploy from GitHub repo** → pilih repositori toko kue Anda.
4. Tambahkan **Persistent Volume** di menu *Settings / Volumes*:
   - Mount path: `/app/data` (agar database JSON tidak hilang saat restart).
   - Mount path: `/app/public/uploads` (agar foto kue yang diupload tetap tersimpan).
5. Tambahkan **Variables** di menu *Variables*:
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = `KataSandiRahasiaAnda99!`
   - `NEXT_PUBLIC_BASE_URL` = `https://nama-proyek-anda.up.railway.app`
6. Railway akan otomatis mem-build dan memberikan domain gratis `https://xxx.up.railway.app` yang langsung bisa diakses publik dengan HTTPS. Anda juga bisa menghubungkan domain pribadi (misal: `dapurkuebusri.com`).

---

### METODE 2: Deploy di VPS Sendiri (IDCloudHost / Niagahoster / DigitalOcean) dengan Docker

Metode ini memberikan kontrol 100% dengan performa kencang di server lokal Indonesia dan biaya sangat terjangkau (sekitar Rp 50.000 – Rp 100.000/bulan).

Proyek ini telah dilengkapi dengan file `Dockerfile` dan `docker-compose.yml`.

#### Langkah di Server VPS (Ubuntu/Debian):
1. Install Docker & Docker Compose di VPS:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   ```
2. Salin folder proyek ke VPS:
   ```bash
   git clone https://github.com/username-anda/dapur-kue-busri.git
   cd dapur-kue-busri
   ```
3. Buat file `.env` di VPS:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *(Isi password admin baru dan domain Anda, lalu simpan dengan `Ctrl+O` kemudian `Ctrl+X`)*.
4. Jalankan aplikasi:
   ```bash
   docker compose up -d --build
   ```
5. Aplikasi langsung berjalan di port 3000!
6. Untuk memasang domain dan SSL gratis (Let's Encrypt), gunakan Nginx reverse proxy:
   ```nginx
   server {
       server_name dapurkuebusri.com www.dapurkuebusri.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Lalu pasang SSL:
   ```bash
   sudo certbot --nginx -d dapurkuebusri.com -d www.dapurkuebusri.com
   ```

---

### METODE 3: Online Gratis Tanpa Sewa Server via Cloudflare Tunnel

Jika Anda memiliki laptop/PC di toko yang menyala setiap hari dan **tidak ingin membayar biaya server sama sekali**:
1. Buat akun gratis di [Cloudflare](https://dash.cloudflare.com/).
2. Unduh dan pasang `cloudflared` di komputer Anda:
   ```bash
   # Di PowerShell (Windows):
   winget install Cloudflare.cloudflared
   ```
3. Jalankan aplikasi toko di komputer:
   ```bash
   npm run build
   npm run start
   ```
4. Hubungkan ke Cloudflare Tunnel gratis:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
5. Cloudflare akan memberikan URL publik acak (misal: `https://contoh-kue.trycloudflare.com`) yang langsung bisa dibuka dari HP pembeli di manapun di seluruh dunia dengan sertifikat SSL resmi gratis!

---

### METODE 4: Deploy di Vercel (Serverless)

Aplikasi Next.js ini 100% kompatibel dengan Vercel:
1. Hubungkan repo GitHub ke [Vercel](https://vercel.com/).
2. Tambahkan Environment Variables:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_BASE_URL`
3. Klik **Deploy**.
> **Catatan Serverless Vercel**: Karena serverless Vercel bersifat ephemeral (tidak memiliki harddisk permanen untuk file JSON lokal), untuk penyimpanan jangka panjang di Vercel disarankan menghubungkan database cloud (seperti Supabase PostgreSQL atau Neon Database) atau gunakan Metode 1/2 di atas yang memiliki persistent volume.

---

## 📱 Menghubungkan Domain Sendiri (misal: `dapurkuebusri.com` atau `kuebusri.id`)

1. Beli domain di penyedia domain lokal seperti Niagahoster, DomaiNesia, RumahWeb, atau Cloudflare (harga domain `.my.id` sekitar Rp 12.000/tahun, atau `.com` sekitar Rp 130.000/tahun).
2. Atur DNS Records di panel domain Anda:
   * **Tipe A**: Isi `@` mengarah ke IP Server VPS Anda.
   * **Tipe CNAME**: Isi `www` mengarah ke domain utama.
3. Setelah DNS terhubung (biasanya 5–15 menit), toko online Anda sudah resmi tayang di internet!

---

## 📢 Promosi Link ke Pelanggan

Setelah online, Anda dapat:
* Memasang link di **Bio Instagram & TikTok**: *"Pesan Kue Kering Lebaran: https://dapurkuebusri.com"*
* Membagikan link di **Broadcast / Status WhatsApp**: *"Katalog kue kering Lebaran Dapur Bu Sri sudah buka! Cek menu & pesan langsung di: https://dapurkuebusri.com"*
* Mencetak **QR Code** untuk ditaruh di meja etalase toko.
