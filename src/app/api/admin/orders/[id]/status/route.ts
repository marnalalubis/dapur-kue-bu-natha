import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';
import { OrderStatus } from '@/types';

const VALID_STATUSES: OrderStatus[] = ['Baru', 'Diproses', 'Siap', 'Selesai', 'Dibatalkan'];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Status "${status}" tidak valid.` },
        { status: 400 }
      );
    }

    const existing = await getOrderById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updated = await updateOrderStatus(id, status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui status pesanan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
