import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';
import { OrderStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') as OrderStatus | null;
    const searchParam = searchParams.get('search') || undefined;

    const orders = await getOrders({
      status: statusParam && statusParam !== ('all' as any) ? statusParam : undefined,
      search: searchParam,
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat daftar pesanan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
