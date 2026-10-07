# 04_ARCHITECTURE_TECHSTACK_COOKIE_ORDER_v1.0

> Status: Updated (v1.2 — Penambahan Rekap Pelanggan & Menu Kebutuhan Stok Produksi)  
> Produk: Aplikasi Pemesanan Kue Kering  
> Domain: Online bakery / single-store e-commerce  
> Platform: Responsive Web, mobile-first  
> Basis: PRD Aplikasi Pemesanan Kue Kering v1.2

## ToC

1. Ringkasan Arsitektur
2. Keputusan Arsitektur Utama
3. Target Architecture
4. Technology Stack
5. Struktur Modul Aplikasi
6. Arsitektur Frontend
7. Arsitektur Backend
8. Arsitektur Database
9. Object Storage & File Upload
10. Authentication & Authorization
11. Order & Fulfillment Architecture
12. Order State Machine
13. API Architecture
14. Data Flow Utama
15. Deployment Architecture
16. Security Architecture
17. Backup & Disaster Recovery
18. Observability & Operations
19. Performance & Scaling
20. Repository & Struktur Folder
21. Traceability
22. ADR
23. Larangan Arsitektur
24. Checklist Implementasi
25. Assumptions & Open Decisions

---

## 1. Ringkasan Arsitektur

### 1.1 Rekomendasi Utama

Gunakan **modular monolith** dengan satu aplikasi web, satu backend/API, satu database PostgreSQL, dan object storage untuk foto produk.

```text
                    INTERNET
                       │
                       ▼
                ┌───────────────┐
                │   CDN / TLS   │
                └───────┬───────┘
                        │
                        ▼
              ┌───────────────────┐
              │   WEB APPLICATION  │
              │ Customer + Admin   │
              └─────────┬─────────┘
                        │ HTTPS
                        ▼
              ┌───────────────────┐
              │  APPLICATION/API  │
              │  Modular Monolith │
              └──────┬─────┬──────┘
                     │     │
             ┌───────┘     └────────┐
             ▼                      ▼
      ┌──────────────┐       ┌───────────────┐
      │ PostgreSQL   │       │ Object Storage│
      │ Transaction  │       │ Foto Produk   │
      └──────────────┘       └───────────────┘
                     │
                     ▼
              ┌──────────────┐
              │ WhatsApp Link│
              │ wa.me        │
              └──────────────┘
```

Penyederhanaan & Penambahan Utama pada v1.2:
- **Tanpa alur transaksi & verifikasi pembayaran di web:** Pembayaran dilakukan manual saat serah terima/COD/ambil sendiri.
- **Menu Rekap Pesanan per Pelanggan:** Agregasi riwayat pemesanan berbasis nomor HP pelanggan untuk melihat pelanggan setia dan histori belanja tanpa mewajibkan registrasi akun.
- **Menu Kebutuhan Stok Produksi (Baking Queue):** Sistem otomatis menghitung total toples/jumlah kue yang perlu dibuat dari seluruh pesanan berstatus `Baru` dan `Diproses`.
- Sesuai dengan skala PRD: sekitar 100 order/bulan dan sekitar 50 produk, dengan satu akun admin.

### 1.2 Prinsip

- Simple first.
- Server menjadi sumber kebenaran untuk harga, validasi ketersediaan, kalkulasi rekap produksi, dan pembuatan order.
- Database transaction untuk operasi pembuatan pesanan.
- Relational query efisien untuk laporan rekapitulasi pelanggan dan produksi.
- Tidak ada file blob di database.
- Admin terlindungi authentication.
- Status order menggunakan state transition yang terkontrol.
- PII dibatasi sesuai kebutuhan operasional.
- Tidak menggunakan microservices pada MVP.

---

## 2. Keputusan Arsitektur Utama

| ID | Keputusan | Rekomendasi | Alasan |
|---|---|---|---|
| ADR-001 | Architecture style | Modular monolith | Skala kecil, satu owner, operasi sederhana |
| ADR-002 | Frontend | Next.js/React | Responsive web dan struktur frontend yang baik |
| ADR-003 | Backend | Laravel API | CRUD, auth, validation, ORM, storage integration matang |
| ADR-004 | Database | PostgreSQL | Relational aggregation & transaction konsisten |
| ADR-005 | File storage | Object storage cloud | Khusus foto produk, tidak membebani database |
| ADR-006 | Customer auth | Guest checkout | Sesuai PRD, tanpa login pembeli |
| ADR-007 | Admin auth | Email/username + password | Sesuai PRD (1 akun admin) |
| ADR-008 | Payment | Offline / COD / Ambil Sendiri | Tanpa alur pembayaran di web; memangkas friksi dan biaya |
| ADR-009 | WhatsApp | wa.me link | Konfirmasi pesanan & komunikasi pelanggan tanpa API berbayar |
| ADR-010 | Rekap Pelanggan | Agregasi berbasis `customer_phone` | Insight pelanggan tanpa mewajibkan pendaftaran akun |
| ADR-011 | Kebutuhan Stok | Dynamic query sum `order_items` pesanan aktif | Menghilangkan buku rekap manual bagi pemilik toko |
| ADR-012 | Cart | localStorage | Sesuai PRD dan cukup untuk guest checkout |

---

## 3. Target Architecture

### 3.1 Logical Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       PRESENTATION                          │
│                                                             │
│ Customer Web                 Admin Web                      │
│ - Katalog & Detail Produk    - Dashboard                    │
│ - Keranjang Belanja          - Daftar Pesanan               │
│ - Checkout Form              - Rekap per Pelanggan          │
│ - Konfirmasi Pesanan         - Kebutuhan Stok Produksi      │
│ - Cek Status Pesanan         - Kelola Produk                │
│                              - Pengaturan Toko              │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / JSON API
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│                                                             │
│ Auth │ Catalog │ Cart/Checkout │ Order │ OrderStatus        │
│ CustomerRecap │ ProductionPlanning │ ProductImage │ Audit   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       DOMAIN / DATA                         │
│                                                             │
│ Product │ Category │ Order │ OrderItem                      │
│ AdminUser │ Setting │ OrderStatusHistory │ AuditLog         │
└───────────────┬──────────────────────────────┬──────────────┘
                │                              │
                ▼                              ▼
        ┌───────────────┐              ┌────────────────┐
        │ PostgreSQL    │              │ Object Storage │
        │               │              │ (Foto Produk)  │
        └───────────────┘              └────────────────┘
```

---

## 4. Technology Stack

| Layer | Teknologi | Peran |
|---|---|---|
| Frontend | Next.js + React + TypeScript | Customer Storefront & Admin Dashboard |
| Styling | Tailwind CSS | UI responsif mobile-first |
| Backend | Laravel + PHP | REST API, Business Logic & Report Agregation |
| ORM | Eloquent | Data access & relationship queries |
| Database | PostgreSQL | Data transaksi, katalog & laporan |
| Storage | S3-compatible object storage | Foto produk katalog (public-read) |
| Auth | Laravel session / Sanctum token | Autentikasi Admin |
| Validation | Laravel Form Request | Validasi input data |
| HTTP | REST/JSON | Komunikasi API |
| WhatsApp | wa.me deep link | Integrasi link chat WhatsApp |
| Deployment | Vercel (Frontend) + Railway/VPS (Backend) | Hosting |

---

## 5. Struktur Modul Aplikasi

```text
APP
├── Auth
│   ├── Admin Login
│   └── Session Management
│
├── Catalog
│   ├── Product Listing & Filter
│   ├── Product Detail
│   └── Availability Status
│
├── Cart
│   └── Browser localStorage
│
├── Checkout & Order
│   ├── Customer Data Form
│   ├── Fulfillment Method (Ambil / Kirim)
│   ├── Order Creation Transaction
│   └── Unique Order Code Generation
│
├── Order Management
│   ├── Order List & Filter
│   ├── Order Detail & Item Snapshot
│   ├── Status State Machine (Baru -> Diproses -> Siap -> Selesai / Batal)
│   └── Status History
│
├── Reports & Analytics (Admin)
│   ├── Customer Recap (Agregasi pesanan per No. HP pembeli)
│   └── Production Stock Queue (Total toples yang harus dibuat dari order aktif)
│
├── Customer Tracking
│   └── Order Code + Phone Number Verification
│
├── Admin Catalog Management
│   ├── Product CRUD
│   └── Product Photo Upload
│
├── Store Settings
│   └── Info Toko, Alamat Ambil, No WA, Mode Tutup Sementara
│
└── Notification
    └── WhatsApp Link Generation
```

---

## 6. Arsitektur Frontend

### 6.1 Area Customer

```text
/
├── katalog
├── produk/[slug]
├── keranjang
├── checkout
├── konfirmasi/[orderCode]
├── status-pesanan
└── pesanan/[orderCode]
```

### 6.2 Area Admin

```text
/admin
├── login
├── dashboard
├── orders
│   ├── list
│   └── [orderId]
├── customers
│   ├── list                # Rekapan per pelanggan (No. HP, Total Belanja, Frekuensi)
│   └── [phone]             # Histori detail pesanan pelanggan tersebut
├── production              # Rekap kebutuhan stok kue yang harus dibuat (baking queue)
├── products
│   ├── list
│   ├── create
│   └── [productId]
└── settings
```

---

## 7. Arsitektur Backend

### 7.1 Service Utama

```text
CatalogService
OrderService
CustomerReportService      # Mengelompokkan riwayat belanja per customer_phone
ProductionPlanningService  # Menghitung total qty item pesanan aktif (Baru & Diproses)
ProductService
SettingsService
FileUploadService (Foto Produk)
OrderStatusService
AuditLogService
```

### 7.2 Logika Kebutuhan Stok Produksi (Production Planning)

Query agregasi untuk menu Kebutuhan Stok:
```sql
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    SUM(oi.quantity) AS total_quantity_to_bake,
    COUNT(DISTINCT o.id) AS total_orders_count
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('Baru', 'Diproses')
GROUP BY p.id, p.name
ORDER BY total_quantity_to_bake DESC;
```
Menghasilkan daftar kue siap produksi secara real-time dari pesanan yang sedang aktif.

### 7.3 Logika Rekapan Pelanggan (Customer Recap)

Query agregasi untuk riwayat pelanggan:
```sql
SELECT 
    o.customer_phone,
    MAX(o.customer_name) AS latest_customer_name,
    COUNT(o.id) AS total_orders,
    SUM(o.grand_total) AS total_spent,
    MAX(o.created_at) AS last_order_at
FROM orders o
GROUP BY o.customer_phone
ORDER BY last_order_at DESC;
```

---

## 8. Arsitektur Database

### 8.1 Entitas MVP

```text
admin_users
categories
products
orders
order_items
settings
order_status_histories
audit_logs
```

### 8.2 Relasi

```text
Category
   │ 1
   │
   └──────< Product

Order
   │ 1
   ├──────< OrderItem
   │
   └──────< OrderStatusHistory

AdminUser
   │
   ├──────< OrderStatusHistory
   └──────< AuditLog
```

### 8.3 Order Table

```text
id
order_code UNIQUE
customer_name
customer_phone
customer_address NULL
customer_note NULL
fulfillment_method (pickup / delivery)
subtotal
grand_total
status (Baru, Diproses, Siap, Selesai, Dibatalkan)
created_at
updated_at
```

### 8.4 Indexing & Optimasi Database

Wajib memiliki index pada:
- `orders.order_code` (UNIQUE).
- `orders.customer_phone` (untuk pencarian cepat & query rekapan pelanggan).
- `orders.status` (untuk query cepat filter status dan agregasi stok produksi).
- `orders.created_at` (untuk urutan histori).
- `order_items.order_id` & `order_items.product_id` (foreign key indexing).

---

## 9. Object Storage & File Upload

- Hanya digunakan untuk foto produk katalog oleh admin.
- Tersimpan di direktori `/products/{product-id}/...`.
- Format gambar dikonversi ke WebP, maksimal ukuran 2 MB.
- Bersifat public-read via CDN/storage endpoint.

---

## 10. Authentication & Authorization

- **Customer:** Guest checkout (tanpa akun). Pelacakan status menggunakan kombinasi `order_code` + `customer_phone`.
- **Admin:** Email/username + hashed password. Diproteksi middleware pada rute admin dan rate limiting.

---

## 11. Order State Machine

```text
                 ┌──────────────┐
                 │     BARU     │
                 └──────┬───────┘
                        │ admin konfirmasi pesanan via WA
                        ▼
                 ┌──────────────┐
                 │   DIPROSES   │
                 └──────┬───────┘
                        │ kue selesai dibuat / siap ambil
                        ▼
                 ┌──────────────┐
                 │     SIAP     │
                 └──────┬───────┘
                        │ pesanan diserahkan & dibayar (COD/ambil)
                        ▼
                 ┌──────────────┐
                 │   SELESAI    │
                 └──────────────┘

BARU ────────────────► DIBATALKAN
DIPROSES ────────────► DIBATALKAN (jika ada pembatalan)
```

*Catatan:* Pada status `Baru` dan `Diproses`, item kue otomatis terhitung dalam **Menu Kebutuhan Stok Produksi**. Ketika status berubah ke `Siap` atau `Selesai`, item tersebut keluar dari antrean produksi karena sudah rampung dibuat.

---

## 12. API Architecture

### 12.1 Public API

```text
GET    /api/products
GET    /api/products/{slug}
GET    /api/categories
GET    /api/settings/public

POST   /api/orders
GET    /api/orders/{orderCode}/status
```

### 12.2 Admin API

```text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me

# Orders
GET    /api/admin/orders
GET    /api/admin/orders/{id}
PATCH  /api/admin/orders/{id}/status

# Reports (Baru)
GET    /api/admin/reports/customers                 # Daftar rekap pelanggan
GET    /api/admin/reports/customers/{phone}          # Detail riwayat order pelanggan
GET    /api/admin/reports/production                # Rekap total kue yang harus dibuat

# Products
GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/{id}
PATCH  /api/admin/products/{id}
POST   /api/admin/products/{id}/image

# Settings
GET    /api/admin/settings
PATCH  /api/admin/settings

# Audit
GET    /api/admin/audit-logs
```

---

## 13. Data Flow: Kebutuhan Stok & Rekap Pelanggan

```text
[Pesanan Baru Masuk]
        │
        ▼
   DB: orders (status: 'Baru')
   DB: order_items
        │
        ├────────────────────────────────────────────────┐
        ▼                                                ▼
[Menu Kebutuhan Stok Produksi]                   [Menu Rekap Pelanggan]
  - Query SUM(qty) status Baru/Diproses             - Grouping by customer_phone
  - Admin melihat: Nastar: 20 toples                - Menampilkan total order si Budi
    Kastengel: 15 toples                            - Riwayat belanja & chat WA
  - Siap dipanggang sesuai antrean
```

---

## 14. Checklist Implementasi

- [ ] Setup Modular Monolith (Next.js + Laravel + PostgreSQL)
- [ ] Database migration & seeder (products, categories, orders, order_items, settings, audit_logs)
- [ ] Indexing pada `customer_phone`, `status`, dan foreign keys
- [ ] Customer Catalog, Cart, & Checkout Form
- [ ] Order Creation API (Transaction & server-side price calculation)
- [ ] Halaman Konfirmasi Order & Link WhatsApp
- [ ] Public Order Status Tracking (Order Code + Phone)
- [ ] Admin Auth & Order Management
- [ ] **Admin: Menu Rekapan Pesanan per Pelanggan**
- [ ] **Admin: Menu Kebutuhan Stok Produksi (Baking Queue)**
- [ ] Admin Catalog Management (CRUD + Image upload)
- [ ] Pengaturan Toko & Mode Tutup Sementara
