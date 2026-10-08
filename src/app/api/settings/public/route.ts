import { NextRequest, NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Accessing req.url ensures dynamic evaluation
    const _ = req.nextUrl;
    const settings = await getSettings();
    return NextResponse.json(
      { success: true, data: settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat pengaturan toko';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
