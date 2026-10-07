import { NextResponse } from 'next/server';
import { getProductionQueue } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const queue = await getProductionQueue();
    const totalOrdered = queue.reduce((sum, item) => sum + item.total_quantity_ordered, 0);
    const totalReady = queue.reduce((sum, item) => sum + item.ready_stock, 0);
    const totalRemainingToBake = queue.reduce((sum, item) => sum + item.remaining_to_bake, 0);

    return NextResponse.json({
      success: true,
      data: {
        total_ordered: totalOrdered,
        total_ready_stock: totalReady,
        total_remaining_to_bake: totalRemainingToBake,
        total_toples_to_bake: totalRemainingToBake, // backward compatibility
        total_product_varieties: queue.length,
        items: queue,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat antrean produksi kue';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
