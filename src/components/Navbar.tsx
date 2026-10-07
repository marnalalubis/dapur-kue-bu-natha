'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cookie, ShoppingBag, Search, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  // If in admin area, hide customer navbar
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-amber-100/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Cookie className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
              Dapur Kue Bu Natha
            </span>
            <span className="text-[11px] sm:text-xs text-amber-700/80 font-medium -mt-0.5">
              Kue Kering Homemade & Butter
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <Link
            href="/"
            className={`hover:text-amber-700 transition-colors ${
              pathname === '/' ? 'text-amber-700 font-semibold' : ''
            }`}
          >
            Katalog Kue
          </Link>
          <Link
            href="/status-pesanan"
            className={`hover:text-amber-700 transition-colors flex items-center gap-1.5 ${
              pathname === '/status-pesanan' ? 'text-amber-700 font-semibold' : ''
            }`}
          >
            <Search className="w-4 h-4" />
            Lacak Pesanan
          </Link>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-700 transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp Toko
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-medium shadow-md shadow-amber-500/20 transition-all"
            aria-label="Buka Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-semibold">Keranjang</span>
            {totalItems > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-amber-700 bg-white rounded-full shadow-sm min-w-5">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
