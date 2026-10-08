import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory, getCategoryById } from '@/lib/db';
import { checkIsAdmin } from '@/lib/auth';

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
    const existing = await getCategoryById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, slug } = body;

    if (name !== undefined && (!name || typeof name !== 'string' || !name.trim())) {
      return NextResponse.json(
        { success: false, error: 'Nama kategori tidak boleh kosong' },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, { name, slug });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui kategori';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const result = await deleteCategory(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal menghapus kategori' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghapus kategori';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
