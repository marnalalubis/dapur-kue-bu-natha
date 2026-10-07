import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const isAvailableOnly = searchParams.get('available') === 'true';

    const products = await getProducts({ categoryId, isAvailableOnly });
    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat produk';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
