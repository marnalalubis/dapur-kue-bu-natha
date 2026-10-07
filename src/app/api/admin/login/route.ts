import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/db';
import { setAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const isValid = await verifyAdmin(username, password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password admin salah.' },
        { status: 401 }
      );
    }

    await setAdminSession();
    return NextResponse.json({ success: true, message: 'Login admin berhasil' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat login.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
