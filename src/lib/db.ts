import fs from 'fs/promises';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import {
  Category,
  Product,
  Order,
  OrderItem,
  StoreSettings,
  OrderStatus,
  FulfillmentMethod,
  CustomerRecap,
  ProductionQueueItem,
} from '@/types';

interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  admin: {
    username: string;
    passwordHash: string; // For MVP: simple match or sha256
    name: string;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cookie_store.json');
const TMP_DB_FILE = path.join('/tmp', 'cookie_store.json');

// Memory cache to preserve runtime mutations in serverless lambda instances
let inMemoryDb: DatabaseSchema | null = null;

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Kue Klasik Lebaran', slug: 'kue-klasik' },
  { id: 'cat-2', name: 'Aneka Keju Spesial', slug: 'aneka-keju' },
  { id: 'cat-3', name: 'Kreasi Cokelat & Manis', slug: 'cokelat-manis' },
  { id: 'cat-4', name: 'Kue Modern & Renyah', slug: 'kue-modern' },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Nastar Wisman Nanas Asli',
    slug: 'nastar-wisman-nanas-asli',
    description:
      'Nastar lembut lumer di mulut dengan butter Wijsman premium dan selai nanas asli buatan sendiri tanpa pengawet. Manis asamnya pas dan beraroma harum.',
    price: 95000,
    weightGrams: 500,
    packaging: 'Toples 500g',
    category_id: 'cat-1',
    category_name: 'Kue Klasik Lebaran',
    image_url:
      'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date('2026-09-01').toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Kastengel Keju Edam & Kraft',
    slug: 'kastengel-keju-edam-kraft',
    description:
      'Kue keju legendaris dengan paduan keju Edam tua impor yang gurih pekat dan taburan keju cheddar melimpah. Renyah, gurih, dan bikin nagih.',
    price: 105000,
    weightGrams: 500,
    packaging: 'Toples 500g',
    category_id: 'cat-2',
    category_name: 'Aneka Keju Spesial',
    image_url:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    created_at: new Date('2026-09-01').toISOString(),
    updated_at: new Date('2026-09-01').toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Putri Salju Mede Lembut',
    slug: 'putri-salju-mede-lembut',
    description:
      'Sensasi dingin gula donat berpadu dengan adonan kue kaya kacang mede sangrai halus. Lumer seketika saat digigit.',
    price: 90000,
    weightGrams: 500,
    packaging: 'Toples 500g',
    category_id: 'cat-1',
    category_name: 'Kue Klasik Lebaran',
    image_url:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    created_at: new Date('2026-09-02').toISOString(),
    updated_at: new Date('2026-09-02').toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Sagu Keju Lumer Spesial',
    slug: 'sagu-keju-lumer-spesial',
    description:
      'Dibuat dari tepung sagu sangrai daun pandan, santan kental, dan keju melimpah. Tekstur sangat rapuh dan langsung lumer di langit-langit mulut.',
    price: 85000,
    weightGrams: 500,
    packaging: 'Toples 500g',
    category_id: 'cat-2',
    category_name: 'Aneka Keju Spesial',
    image_url:
      'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
    created_at: new Date('2026-09-03').toISOString(),
    updated_at: new Date('2026-09-03').toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Lidah Kucing Renyah Butter',
    slug: 'lidah-kucing-renyah-butter',
    description:
      'Tipis, renyah, dan harum butter harum semerbak. Sangat pas untuk teman minum kopi atau teh sore hari bersama keluarga.',
    price: 80000,
    weightGrams: 400,
    packaging: 'Toples 400g',
    category_id: 'cat-4',
    category_name: 'Kue Modern & Renyah',
    image_url:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
    created_at: new Date('2026-09-04').toISOString(),
    updated_at: new Date('2026-09-04').toISOString(),
  },
  {
    id: 'prod-6',
    name: 'Semprit Dahlia Cokelat Mede',
    slug: 'semprit-dahlia-cokelat-mede',
    description:
      'Bentuk bunga dahlia klasik dengan cokelat bubuk Belanda premium dan choco chips di tengahnya. Rasa cokelatnya pekat dan renyah.',
    price: 75000,
    weightGrams: 450,
    packaging: 'Toples 450g',
    category_id: 'cat-3',
    category_name: 'Kreasi Cokelat & Manis',
    image_url:
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
    created_at: new Date('2026-09-05').toISOString(),
    updated_at: new Date('2026-09-05').toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Palm Cheese Cookies (Gula Palem)',
    slug: 'palm-cheese-cookies-gula-palem',
    description:
      'Paduan unik adonan keju gurih dibalut taburan gula palem organik yang wangi karamel. Sensasi manis gurih yang sangat istimewa.',
    price: 90000,
    weightGrams: 500,
    packaging: 'Toples 500g',
    category_id: 'cat-2',
    category_name: 'Aneka Keju Spesial',
    image_url:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: false,
    created_at: new Date('2026-09-06').toISOString(),
    updated_at: new Date('2026-09-06').toISOString(),
  },
  {
    id: 'prod-8',
    name: 'Almond Crispy Cheese Spesial',
    slug: 'almond-crispy-cheese-spesial',
    description:
      'Kepingan kue tipis super renyah dengan taburan keju kering dan irisan kacang almond panggang renyah. Sangat eksklusif untuk hantaran.',
    price: 85000,
    weightGrams: 350,
    packaging: 'Toples 350g',
    category_id: 'cat-4',
    category_name: 'Kue Modern & Renyah',
    image_url:
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    is_featured: true,
    created_at: new Date('2026-09-07').toISOString(),
    updated_at: new Date('2026-09-07').toISOString(),
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  store_name: 'Dapur Kue Kering Bu Natha',
  store_tagline: 'Kue Kering Homemade Fresh from The Oven dengan Butter Pilihan',
  store_phone: '081396144777',
  store_address:
    'Pardede Onan Kelurahan Pardede Onan Kecmatan Balige Kabupaten Toba Propinsi Sumatera Utara',
  pickup_instructions: 'Pengambilan pesanan tersedia setiap saat',
  delivery_note:
    'Pengiriman manual via kurir lokal atau ekspedisi Paxel. Biaya ongkir dikonfirmasi via WA.',
  payment_info:
    'Pembayaran offline saat ambil di tempat / COD / Transfer BANK SUMUT : 123-456-7890 a/n Lidia Triastuti.',
  is_store_open: true,
  closed_reason: 'Toko sedang dalam masa pemeliharaan oven rutin.',
};

// Seed sample orders to showcase the Baking Queue and Customer Recap immediately
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    order_code: 'KK-20261006-0001',
    customer_name: 'Ibu Ratna Dewi',
    customer_phone: '081298765432',
    customer_address: 'Komp. Bintaro Jaya Sektor 9 Blok H-12, Tangerang Selatan',
    customer_note: 'Tolong jangan terlalu gosong ya kuenya.',
    fulfillment_method: 'delivery',
    subtotal: 285000,
    delivery_fee: 0,
    grand_total: 285000,
    status: 'Baru',
    items: [
      {
        id: 'item-1',
        order_id: 'ord-1',
        product_id: 'prod-1',
        product_name: 'Nastar Wisman Nanas Asli',
        packaging: 'Toples 500g',
        price: 95000,
        quantity: 2,
        subtotal: 190000,
        image_url: INITIAL_PRODUCTS[0].image_url,
      },
      {
        id: 'item-2',
        order_id: 'ord-1',
        product_id: 'prod-3',
        product_name: 'Putri Salju Mede Lembut',
        packaging: 'Toples 500g',
        price: 90000,
        quantity: 1,
        subtotal: 90000,
        image_url: INITIAL_PRODUCTS[2].image_url,
      },
    ],
    created_at: new Date('2026-10-06T14:30:00Z').toISOString(),
    updated_at: new Date('2026-10-06T14:30:00Z').toISOString(),
  },
  {
    id: 'ord-2',
    order_code: 'KK-20261006-0002',
    customer_name: 'Bpk. Hendra Wijaya',
    customer_phone: '081388776655',
    customer_address: '',
    customer_note: 'Ambil sekitar jam 4 sore besok ya bu.',
    fulfillment_method: 'pickup',
    subtotal: 315000,
    delivery_fee: 0,
    grand_total: 315000,
    status: 'Diproses',
    items: [
      {
        id: 'item-3',
        order_id: 'ord-2',
        product_id: 'prod-2',
        product_name: 'Kastengel Keju Edam & Kraft',
        packaging: 'Toples 500g',
        price: 105000,
        quantity: 3,
        subtotal: 315000,
        image_url: INITIAL_PRODUCTS[1].image_url,
      },
    ],
    created_at: new Date('2026-10-06T16:15:00Z').toISOString(),
    updated_at: new Date('2026-10-06T17:00:00Z').toISOString(),
  },
  {
    id: 'ord-3',
    order_code: 'KK-20261005-0003',
    customer_name: 'Ibu Ratna Dewi',
    customer_phone: '081298765432',
    customer_address: 'Komp. Bintaro Jaya Sektor 9 Blok H-12, Tangerang Selatan',
    customer_note: 'Pesanan sebelumnya enak sekali, mau tambah lagi.',
    fulfillment_method: 'delivery',
    subtotal: 190000,
    delivery_fee: 0,
    grand_total: 190000,
    status: 'Selesai',
    items: [
      {
        id: 'item-4',
        order_id: 'ord-3',
        product_id: 'prod-1',
        product_name: 'Nastar Wisman Nanas Asli',
        packaging: 'Toples 500g',
        price: 95000,
        quantity: 2,
        subtotal: 190000,
        image_url: INITIAL_PRODUCTS[0].image_url,
      },
    ],
    created_at: new Date('2026-10-05T09:00:00Z').toISOString(),
    updated_at: new Date('2026-10-05T15:00:00Z').toISOString(),
  },
  {
    id: 'ord-4',
    order_code: 'KK-20261007-0001',
    customer_name: 'Siti Nurhaliza',
    customer_phone: '085712349988',
    customer_address: 'Jl. Gandaria Tengah II No. 8, Jaksel',
    customer_note: 'Bungkus pita untuk hadiah ya.',
    fulfillment_method: 'delivery',
    subtotal: 265000,
    delivery_fee: 0,
    grand_total: 265000,
    status: 'Diproses',
    items: [
      {
        id: 'item-5',
        order_id: 'ord-4',
        product_id: 'prod-1',
        product_name: 'Nastar Wisman Nanas Asli',
        packaging: 'Toples 500g',
        price: 95000,
        quantity: 1,
        subtotal: 95000,
        image_url: INITIAL_PRODUCTS[0].image_url,
      },
      {
        id: 'item-6',
        order_id: 'ord-4',
        product_id: 'prod-4',
        product_name: 'Sagu Keju Lumer Spesial',
        packaging: 'Toples 500g',
        price: 85000,
        quantity: 2,
        subtotal: 170000,
        image_url: INITIAL_PRODUCTS[3].image_url,
      },
    ],
    created_at: new Date('2026-10-07T07:15:00Z').toISOString(),
    updated_at: new Date('2026-10-07T07:45:00Z').toISOString(),
  },
];

function getNeonSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('postgres')) return null;
  return neon(dbUrl);
}

async function ensureDbInitialized(): Promise<DatabaseSchema> {
  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS store_state (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      const rows = (await sql`SELECT data FROM store_state WHERE id = 'main' LIMIT 1;`) as { data: DatabaseSchema }[];
      if (rows && rows.length > 0) {
        const data = rows[0].data;
        for (const p of data.products) {
          if (p.ready_stock === undefined) p.ready_stock = 0;
        }
        inMemoryDb = data;
        return data;
      }

      // Initial seed to Neon from local JSON, /tmp, or defaults
      let initialData: DatabaseSchema;
      try {
        let content = '';
        try {
          content = await fs.readFile(TMP_DB_FILE, 'utf-8');
        } catch {
          content = await fs.readFile(DB_FILE, 'utf-8');
        }
        initialData = JSON.parse(content) as DatabaseSchema;
      } catch {
        initialData = {
          categories: INITIAL_CATEGORIES,
          products: INITIAL_PRODUCTS.map((p) => ({ ...p, ready_stock: p.ready_stock ?? 0 })),
          orders: INITIAL_ORDERS,
          settings: INITIAL_SETTINGS,
          admin: {
            username: 'admin',
            passwordHash: 'admin123',
            name: 'Pemilik Toko (Bu Natha)',
          },
        };
      }

      await sql`
        INSERT INTO store_state (id, data, updated_at)
        VALUES ('main', ${JSON.stringify(initialData)}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP;
      `;
      inMemoryDb = initialData;
      return initialData;
    } catch (err) {
      console.error('Neon DB query error, falling back to local file:', err);
    }
  }

  // Return in-memory database if already loaded/modified
  if (inMemoryDb) {
    return inMemoryDb;
  }

  // Check /tmp first (if previously written during serverless invocation)
  try {
    const tmpContent = await fs.readFile(TMP_DB_FILE, 'utf-8');
    const data = JSON.parse(tmpContent) as DatabaseSchema;
    inMemoryDb = data;
    return data;
  } catch {
    // not in /tmp
  }

  // Fallback to local file
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DB_FILE, 'utf-8');
    const data = JSON.parse(content) as DatabaseSchema;
    let needsSave = false;
    for (const p of data.products) {
      if (p.ready_stock === undefined) {
        p.ready_stock = 0;
        needsSave = true;
      }
    }
    if (needsSave) {
      await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    inMemoryDb = data;
    return data;
  } catch {
    const initialData: DatabaseSchema = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS.map((p) => ({ ...p, ready_stock: p.ready_stock ?? 0 })),
      orders: INITIAL_ORDERS,
      settings: INITIAL_SETTINGS,
      admin: {
        username: 'admin',
        passwordHash: 'admin123', // Default admin login
        name: 'Pemilik Toko (Bu Natha)',
      },
    };
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch {
      // In read-only env, save to /tmp
      try {
        await fs.writeFile(TMP_DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      } catch {
        // memory fallback
      }
    }
    inMemoryDb = initialData;
    return initialData;
  }
}

async function saveDb(data: DatabaseSchema): Promise<void> {
  // Always update memory cache immediately
  inMemoryDb = data;

  const sql = getNeonSql();
  if (sql) {
    try {
      await sql`
        INSERT INTO store_state (id, data, updated_at)
        VALUES ('main', ${JSON.stringify(data)}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = CURRENT_TIMESTAMP;
      `;
      return;
    } catch (err) {
      console.error('Failed to save to Neon DB, falling back to local file:', err);
    }
  }

  // Attempt to write to local data directory
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFile, DB_FILE);
    return;
  } catch (err) {
    // If read-only filesystem (like Vercel serverless lambda), write to /tmp
    try {
      await fs.writeFile(TMP_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return;
    } catch (tmpErr) {
      console.error('Failed to save to local and /tmp file:', err, tmpErr);
    }
  }
}

// =================== PUBLIC METHODS ===================

export async function getCategories(): Promise<Category[]> {
  const db = await ensureDbInitialized();
  return db.categories;
}

export async function getProducts(options?: {
  categoryId?: string;
  isAvailableOnly?: boolean;
}): Promise<Product[]> {
  const db = await ensureDbInitialized();
  let items = db.products;
  if (options?.categoryId && options.categoryId !== 'all') {
    items = items.filter((p) => p.category_id === options.categoryId);
  }
  if (options?.isAvailableOnly) {
    items = items.filter((p) => p.is_available);
  }
  return items;
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = await ensureDbInitialized();
  return db.products.find((p) => p.id === id) || null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = await ensureDbInitialized();
  return db.products.find((p) => p.slug === slug) || null;
}

export async function createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const db = await ensureDbInitialized();
  const newProduct: Product = {
    ...productData,
    ready_stock: productData.ready_stock !== undefined ? Math.max(0, Number(productData.ready_stock)) : 0,
    id: `prod-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.products.push(newProduct);
  await saveDb(db);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const db = await ensureDbInitialized();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  db.products[idx] = {
    ...db.products[idx],
    ...updates,
    ready_stock:
      updates.ready_stock !== undefined
        ? Math.max(0, Number(updates.ready_stock))
        : (db.products[idx].ready_stock ?? 0),
    updated_at: new Date().toISOString(),
  };
  await saveDb(db);
  return db.products[idx];
}

export async function updateProductReadyStock(id: string, readyStock: number): Promise<Product | null> {
  return updateProduct(id, { ready_stock: Math.max(0, readyStock) });
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await ensureDbInitialized();
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLen) {
    await saveDb(db);
    return true;
  }
  return false;
}

export async function getSettings(): Promise<StoreSettings> {
  const db = await ensureDbInitialized();
  return db.settings;
}

export async function updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const db = await ensureDbInitialized();
  db.settings = {
    ...db.settings,
    ...updates,
  };
  await saveDb(db);
  return db.settings;
}

export async function getOrders(options?: {
  status?: OrderStatus;
  search?: string;
}): Promise<Order[]> {
  const db = await ensureDbInitialized();
  let list = [...db.orders];

  if (options?.status) {
    list = list.filter((o) => o.status === options.status);
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
    );
  }

  // Sort newest first
  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const db = await ensureDbInitialized();
  const trimmed = code.trim().toUpperCase();
  return db.orders.find((o) => o.order_code.toUpperCase() === trimmed) || null;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = await ensureDbInitialized();
  return db.orders.find((o) => o.id === id) || null;
}

function generateOrderCode(existingOrdersCount: number): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(existingOrdersCount + 1).padStart(4, '0');
  return `KK-${yyyy}${mm}${dd}-${seq}`;
}

export async function createOrder(input: {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  customer_note?: string;
  fulfillment_method: 'pickup' | 'delivery';
  items: {
    product_id: string;
    quantity: number;
  }[];
}): Promise<Order> {
  const db = await ensureDbInitialized();

  // Validate store open
  if (!db.settings.is_store_open) {
    throw new Error('Maaf, toko sedang tutup sementara.');
  }

  if (!input.items || input.items.length === 0) {
    throw new Error('Keranjang belanja kosong.');
  }

  // Calculate order items based on authoritative server products
  let subtotal = 0;
  const orderId = `ord-${Date.now()}`;
  const orderItems: OrderItem[] = [];

  for (const it of input.items) {
    const product = db.products.find((p) => p.id === it.product_id);
    if (!product) {
      throw new Error(`Produk dengan ID ${it.product_id} tidak ditemukan.`);
    }
    if (!product.is_available) {
      throw new Error(`Kue "${product.name}" saat ini sedang habis.`);
    }
    if (it.quantity <= 0) {
      throw new Error(`Jumlah pemesanan untuk "${product.name}" tidak valid.`);
    }

    const itemSubtotal = product.price * it.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order_id: orderId,
      product_id: product.id,
      product_name: product.name,
      packaging: product.packaging || 'Toples',
      price: product.price,
      quantity: it.quantity,
      subtotal: itemSubtotal,
      image_url: product.image_url,
    });
  }

  const orderCode = generateOrderCode(db.orders.length);
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    order_code: orderCode,
    customer_name: input.customer_name.trim(),
    customer_phone: input.customer_phone.trim(),
    customer_address: input.customer_address?.trim() || '',
    customer_note: input.customer_note?.trim() || '',
    fulfillment_method: input.fulfillment_method,
    subtotal,
    delivery_fee: 0, // Manual / offline delivery fee
    grand_total: subtotal,
    status: 'Baru',
    items: orderItems,
    created_at: now,
    updated_at: now,
  };

  db.orders.unshift(newOrder);
  await saveDb(db);
  return newOrder;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order | null> {
  const db = await ensureDbInitialized();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = newStatus;
  order.updated_at = new Date().toISOString();
  await saveDb(db);
  return order;
}

// =================== SPECIAL FEATURES FROM PRD ===================

/**
 * F-23: Kebutuhan Stok Produksi (Baking Queue Summary)
 * Akumulasi toples/kue yang harus dibuat berdasarkan pesanan aktif ('Baru' & 'Diproses').
 */
export async function getProductionQueue(): Promise<ProductionQueueItem[]> {
  const db = await ensureDbInitialized();
  const activeOrders = db.orders.filter(
    (o) => o.status === 'Baru' || o.status === 'Diproses'
  );

  const productMap: Record<
    string,
    {
      product_id: string;
      product_name: string;
      packaging?: string;
      image_url: string;
      total_quantity_ordered: number;
      ready_stock: number;
      remaining_to_bake: number;
      total_quantity_to_bake: number;
      orders: {
        order_id: string;
        order_code: string;
        customer_name: string;
        quantity: number;
        status: OrderStatus;
        created_at: string;
        fulfillment_method: FulfillmentMethod;
      }[];
    }
  > = {};

  for (const order of activeOrders) {
    for (const item of order.items) {
      if (!productMap[item.product_id]) {
        const prod = db.products.find((p) => p.id === item.product_id);
        const ready = prod?.ready_stock ?? 0;
        productMap[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          packaging: item.packaging || prod?.packaging || 'Toples 500g',
          image_url: prod?.image_url || item.image_url || '',
          total_quantity_ordered: 0,
          ready_stock: ready,
          remaining_to_bake: 0,
          total_quantity_to_bake: 0,
          orders: [],
        };
      }

      productMap[item.product_id].total_quantity_ordered += item.quantity;
      productMap[item.product_id].orders.push({
        order_id: order.id,
        order_code: order.order_code,
        customer_name: order.customer_name,
        quantity: item.quantity,
        status: order.status,
        created_at: order.created_at,
        fulfillment_method: order.fulfillment_method,
      });
    }
  }

  const queueList = Object.values(productMap).map((entry) => {
    const remaining = Math.max(0, entry.total_quantity_ordered - entry.ready_stock);
    return {
      ...entry,
      remaining_to_bake: remaining,
      total_quantity_to_bake: remaining,
      order_count: entry.orders.length,
    };
  });

  // Sort descending: items that still have remaining to bake first, then by total ordered
  return queueList.sort((a, b) => {
    if (b.remaining_to_bake !== a.remaining_to_bake) {
      return b.remaining_to_bake - a.remaining_to_bake;
    }
    return b.total_quantity_ordered - a.total_quantity_ordered;
  });
}

/**
 * F-22: Rekapan Pesanan per Pelanggan (Customer Recap)
 * Riwayat pesanan, frekuensi beli, dan total pengeluaran dikelompokkan per Nomor HP.
 */
export async function getCustomerRecaps(): Promise<CustomerRecap[]> {
  const db = await ensureDbInitialized();
  const phoneMap: Record<string, CustomerRecap> = {};

  for (const order of db.orders) {
    const rawPhone = order.customer_phone.trim();
    if (!rawPhone) continue;

    if (!phoneMap[rawPhone]) {
      phoneMap[rawPhone] = {
        customer_phone: rawPhone,
        customer_name: order.customer_name,
        total_orders: 0,
        total_spent: 0,
        last_order_at: order.created_at,
        orders: [],
      };
    }

    const entry = phoneMap[rawPhone];
    entry.total_orders += 1;
    // Count spent for completed/active orders (omit cancelled)
    if (order.status !== 'Dibatalkan') {
      entry.total_spent += order.grand_total;
    }

    // Keep newest customer name
    if (new Date(order.created_at) > new Date(entry.last_order_at)) {
      entry.customer_name = order.customer_name;
      entry.last_order_at = order.created_at;
    }

    const itemsSummary = order.items
      .map((i) => `${i.product_name} (${i.quantity})`)
      .join(', ');

    entry.orders.push({
      id: order.id,
      order_code: order.order_code,
      created_at: order.created_at,
      grand_total: order.grand_total,
      status: order.status,
      items_summary: itemsSummary,
    });
  }

  const recaps = Object.values(phoneMap);

  // Sort by last order descending
  return recaps.sort(
    (a, b) => new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime()
  );
}

export async function getCustomerRecapByPhone(phone: string): Promise<CustomerRecap | null> {
  const list = await getCustomerRecaps();
  const target = phone.replace(/\D/g, '');
  return (
    list.find(
      (r) => r.customer_phone.replace(/\D/g, '') === target
    ) || null
  );
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  if (envUser && envPass) {
    if (envUser.trim() === username.trim() && envPass.trim() === password.trim()) {
      return true;
    }
  }

  const db = await ensureDbInitialized();
  return (
    db.admin.username === username.trim() &&
    db.admin.passwordHash === password.trim()
  );
}
