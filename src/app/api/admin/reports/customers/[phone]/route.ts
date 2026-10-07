import { NextRequest, NextResponse } from 'next/server';
import { getCustomerRecapByPhone } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ phone: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await context.params;
    const recap = await getCustomerRecapByPhone(phone);

    if (!recap) {
      return NextResponse.json(
        { success: false, error: 'Data pelanggan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: recap });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat detail pelanggan';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
