'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie, MapPin, Phone, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-24 md:pb-12 border-t border-stone-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Dapur Kue Bu Natha</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Kue kering premium buatan rumahan dengan bahan butter berkualitas tinggi.
              Dibuat fresh sesuai pesanan untuk menjaga aroma dan kerenyahan terbaik.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Halal & Tanpa Bahan Pengawet Kimia</span>
            </div>
          </div>

          {/* Operational & Address Col */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Lokasi & Jam Ambil
            </h4>
            <div className="space-y-2.5 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Jl. Melati Indah No. 42, Kebayoran Baru, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Buka Setiap Hari: 09.00 - 18.00 WIB</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: 0812-3456-7890</span>
              </div>
            </div>
          </div>

          {/* Nav & Info Col */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Menu Cepat
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Katalog Kue Kering
                </Link>
              </li>
              <li>
                <Link href="/status-pesanan" className="hover:text-amber-400 transition-colors">
                  Cek Status Pesanan Anda
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-amber-400 transition-colors">
                  Keranjang & Checkout
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Dapur Kue Bu Natha. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk pecinta kue kering Indonesia.
          </p>
        </div>
      </div>
    </footer>
  );
}
