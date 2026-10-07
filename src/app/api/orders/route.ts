import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrderByCode } from '@/lib/db';
import { isValidIndonesianPhone } from '@/lib/format';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_address,
      customer_note,
      fulfillment_method,
      items,
    } = body;

    // Validation
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nama pemesan wajib diisi (minimal 2 karakter).' },
        { status: 400 }
      );
    }

    if (!customer_phone || !isValidIndonesianPhone(customer_phone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nomor WhatsApp tidak valid. Gunakan format nomor Indonesia (contoh: 081234567890).',
        },
        { status: 400 }
      );
    }

    if (fulfillment_method !== 'pickup' && fulfillment_method !== 'delivery') {
      return NextResponse.json(
        { success: false, error: 'Pilih metode pengambilan: Ambil Sendiri atau Kirim ke Alamat.' },
        { status: 400 }
      );
    }

    if (fulfillment_method === 'delivery' && (!customer_address || customer_address.trim().length < 5)) {
      return NextResponse.json(
        { success: false, error: 'Alamat pengiriman wajib diisi dengan lengkap jika memilih metode kirim.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keranjang belanja Anda masih kosong.' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customer_name,
      customer_phone,
      customer_address,
      customer_note,
      fulfillment_method,
      items,
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses pesanan.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
