'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie, ShoppingBag, Search, MessageSquare } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { normalizePhoneForWA } from '@/lib/format';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { settings } = useStore();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const cleanPhone = normalizePhoneForWA(settings.store_phone);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-100 px-3 py-2 shadow-lg shadow-stone-900/10">
      <div className="grid grid-cols-4 gap-1">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            pathname === '/' ? 'text-amber-700 font-bold' : 'text-stone-500'
          }`}
        >
          <Cookie className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Katalog</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 rounded-xl text-stone-500 transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">Keranjang</span>
        </button>

        <Link
          href="/status-pesanan"
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
            pathname === '/status-pesanan' ? 'text-amber-700 font-bold' : 'text-stone-500'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lacak</span>
        </Link>

        <a
          href={`https://wa.me/${cleanPhone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 rounded-xl text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Bantuan WA</span>
        </a>
      </div>
    </div>
  );
}
