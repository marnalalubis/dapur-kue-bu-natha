import { NextRequest, NextResponse } from 'next/server';
import { getOrderByCode } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderCode: string }> }
) {
  try {
    const { orderCode } = await context.params;
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: 'Kode pesanan wajib disertakan.' },
        { status: 400 }
      );
    }

    const order = await getOrderByCode(orderCode);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan dengan kode tersebut tidak ditemukan.' },
        { status: 404 }
      );
    }

    // If phone query is provided, verify matching phone digits
    if (phone) {
      const cleanInput = phone.replace(/\D/g, '');
      const cleanSaved = order.customer_phone.replace(/\D/g, '');
      if (cleanInput && !cleanSaved.endsWith(cleanInput.slice(-8))) {
        return NextResponse.json(
          {
            success: false,
            error: 'Nomor WhatsApp tidak cocok dengan data pemesan untuk kode ini.',
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat status pesanan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
