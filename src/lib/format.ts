import { Order, OrderStatus, StoreSettings } from '@/types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatTanggalSingkat(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function normalizePhoneForWA(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function isValidIndonesianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Matches 08xx or 628xx with length 10 to 14 digits
  if (cleaned.startsWith('08') && cleaned.length >= 10 && cleaned.length <= 13) {
    return true;
  }
  if (cleaned.startsWith('628') && cleaned.length >= 11 && cleaned.length <= 14) {
    return true;
  }
  return false;
}

export function buildWhatsAppOrderMessage(order: Order, storeSettings: StoreSettings): string {
  const itemsText = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. *${it.product_name}* (${it.packaging || 'Toples'}) x ${it.quantity} = ${formatRupiah(
          it.subtotal
        )}`
    )
    .join('\n');

  const methodText =
    order.fulfillment_method === 'pickup'
      ? '📍 *Ambil Sendiri di Toko*'
      : `🚚 *Kirim Manual ke Alamat:*\n_${order.customer_address || '-'}_`;

  const noteText = order.customer_note ? `\n📝 *Catatan:* ${order.customer_note}` : '';

  const message = `Halo *${storeSettings.store_name}*! 👋
Saya ingin konfirmasi pesanan kue kering dengan rincian berikut:

🔖 *KODE PESANAN:* ${order.order_code}
👤 *Nama Pemesan:* ${order.customer_name}
📱 *No. WhatsApp:* ${order.customer_phone}
📦 *Metode Pengambilan:* ${methodText}${noteText}

🧁 *Rincian Pesanan:*
${itemsText}

💰 *TOTAL TAGIHAN:* *${formatRupiah(order.grand_total)}*
_(Pembayaran saat ambil / serah terima / transfer sesuai konfirmasi chat ini)_

Mohon konfirmasi ketersediaan dan perkiraan waktu siapnya ya. Terima kasih! 🙏`;

  return message;
}

export function getStatusInfo(status: OrderStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  description: string;
  iconName: string;
} {
  switch (status) {
    case 'Baru':
      return {
        label: 'Pesanan Baru',
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        description: 'Pesanan telah diterima sistem dan menunggu konfirmasi admin.',
        iconName: 'Clock',
      };
    case 'Diproses':
      return {
        label: 'Sedang Diproses',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        description: 'Kue sedang disiapkan dan dipanggang di dapur.',
        iconName: 'ChefHat',
      };
    case 'Siap':
      return {
        label: 'Siap Diambil / Dikirim',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        description: 'Kue sudah selesai dipanggang dan siap diambil atau dikirim.',
        iconName: 'PackageCheck',
      };
    case 'Selesai':
      return {
        label: 'Selesai',
        bg: 'bg-gray-100 dark:bg-stone-800',
        text: 'text-stone-700 dark:text-stone-300',
        border: 'border-stone-300 dark:border-stone-700',
        description: 'Pesanan telah diterima pembeli dan pembayaran telah tuntas.',
        iconName: 'CheckCircle2',
      };
    case 'Dibatalkan':
      return {
        label: 'Dibatalkan',
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        description: 'Pesanan ini telah dibatalkan.',
        iconName: 'XCircle',
      };
  }
}
