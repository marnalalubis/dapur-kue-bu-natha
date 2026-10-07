import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { checkIsAdmin } from '@/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file gambar yang diunggah.' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Harap unggah file JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 5 MB.' },
        { status: 400 }
      );
    }

    // Ensure upload dir exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Determine extension
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    else if (file.type === 'image/gif') ext = 'gif';

    const fileName = `kue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try writing to local public uploads first
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(filePath, buffer);
      const publicUrl = `/uploads/products/${fileName}`;
      return NextResponse.json({ success: true, url: publicUrl });
    } catch {
      // Serverless (Vercel) read-only fallback: convert to WebP/Image Data URI
      const base64 = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ success: true, url: dataUri });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengunggah foto produk';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
