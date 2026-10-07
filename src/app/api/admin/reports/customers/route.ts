import { NextRequest, NextResponse } from 'next/server';
import { getCustomerRecaps } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim();

    let recaps = await getCustomerRecaps();

    if (search) {
      recaps = recaps.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(search) ||
          r.customer_phone.includes(search)
      );
    }

    const totalCustomers = recaps.length;
    const totalRevenue = recaps.reduce((acc, c) => acc + c.total_spent, 0);

    return NextResponse.json({
      success: true,
      data: {
        total_customers: totalCustomers,
        total_revenue: totalRevenue,
        customers: recaps,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat rekapan pelanggan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
