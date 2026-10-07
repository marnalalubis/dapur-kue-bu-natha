import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/auth';

export async function GET() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    // Return 200 with authenticated: false so browser console doesn't show red 401 error
    return NextResponse.json(
      { success: true, authenticated: false },
      { status: 200 }
    );
  }
  return NextResponse.json({
    success: true,
    authenticated: true,
    user: { username: 'admin', name: 'Pemilik Toko' },
  });
}
