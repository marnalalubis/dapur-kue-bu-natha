'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah } from '@/lib/format';

export default function CartDrawer() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-stone-900 text-lg">Keranjang Belanja</h2>
              {totalItems > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                  {totalItems} Toples
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-800 text-base">Keranjang Anda Kosong</h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  Yuk pilih kue kering favorit buatan tangan kami untuk menemani hari Anda atau hantaran spesial.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Lihat Katalog Kue
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-2xl border border-stone-100 bg-stone-50/40 hover:bg-stone-50 transition-colors"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-amber-100/50 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-sm truncate">
                          {product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[11px] text-amber-700 bg-amber-50 font-medium px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {product.packaging || 'Toples 500g'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-bold text-stone-900">
                        {formatRupiah(product.price * quantity)}
                      </span>
                      <div className="flex items-center gap-2 border border-stone-200 bg-white rounded-xl px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-900"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-stone-800 min-w-4 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1 text-stone-600 hover:text-stone-900"
                          aria-label="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-100 bg-white space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Total Toples:</span>
                <span className="font-semibold text-stone-800">{totalItems} Toples</span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base font-bold text-stone-900">
                <span>Subtotal:</span>
                <span className="text-amber-700 text-lg">{formatRupiah(subtotal)}</span>
              </div>
              <p className="text-[11px] text-stone-400">
                *Ongkir kirim manual atau ambil sendiri diatur saat checkout.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Kirim Pesanan (Checkout)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={clearCart}
                  className="text-[11px] text-stone-400 hover:text-stone-600 transition-colors py-1 text-center"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
