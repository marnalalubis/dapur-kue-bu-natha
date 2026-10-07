export type OrderStatus = 'Baru' | 'Diproses' | 'Siap' | 'Selesai' | 'Dibatalkan';

export type FulfillmentMethod = 'pickup' | 'delivery';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  weightGrams?: number;
  packaging?: string; // e.g. "Toples 500g", "Toples 350g"
  category_id: string;
  category_name?: string;
  image_url: string;
  is_available: boolean;
  is_featured?: boolean;
  ready_stock?: number; // Jumlah toples yang sudah siap/ready di toko
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  packaging?: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_code: string; // e.g. KK-20261007-0001
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  customer_note?: string;
  fulfillment_method: FulfillmentMethod;
  subtotal: number;
  delivery_fee: number;
  grand_total: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface StoreSettings {
  store_name: string;
  store_tagline: string;
  store_phone: string; // WhatsApp format, e.g. "081234567890" or "6281234567890"
  store_address: string;
  pickup_instructions: string;
  delivery_note: string;
  payment_info: string;
  is_store_open: boolean;
  closed_reason?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  created_at: string;
}

// Rekapan Pelanggan (F-22)
export interface CustomerRecap {
  customer_phone: string;
  customer_name: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
  orders: {
    id: string;
    order_code: string;
    created_at: string;
    grand_total: number;
    status: OrderStatus;
    items_summary: string;
  }[];
}

// Rekapan Kebutuhan Stok Produksi / Baking Queue (F-23)
export interface ProductionQueueItem {
  product_id: string;
  product_name: string;
  packaging?: string;
  image_url: string;
  total_quantity_ordered: number; // total toples dipesan
  ready_stock: number; // toples yang sudah ready
  remaining_to_bake: number; // sisa kekurangan yang harus dibuat lagi
  total_quantity_to_bake: number; // alias kompatibilitas
  order_count: number;
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

export interface CartItem {
  product: Product;
  quantity: number;
}
