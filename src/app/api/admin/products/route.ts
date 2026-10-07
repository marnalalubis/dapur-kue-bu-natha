import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const products = await getProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat produk';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, weightGrams, packaging, category_id, image_url, is_available } = body;

    if (!name || !price || !category_id) {
      return NextResponse.json(
        { success: false, error: 'Nama kue, harga, dan kategori wajib diisi.' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct = await createProduct({
      name,
      slug,
      description: description || '',
      price: Number(price),
      weightGrams: weightGrams ? Number(weightGrams) : 500,
      packaging: packaging || 'Toples 500g',
      category_id,
      image_url:
        image_url ||
        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
      is_available: is_available !== undefined ? Boolean(is_available) : true,
      ready_stock: body.ready_stock !== undefined ? Math.max(0, Number(body.ready_stock)) : 0,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menambahkan produk';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
