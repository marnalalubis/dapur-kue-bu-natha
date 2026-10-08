import { NextRequest, NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat kategori';
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
    const { name, slug } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    const newCategory = await createCategory({ name: name.trim(), slug });
    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menambahkan kategori';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
