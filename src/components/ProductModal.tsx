'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Check, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/format';
import { useCart } from '@/context/CartContext';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product.is_available) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-stone-600 hover:text-stone-900 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white shadow-sm">
              {product.packaging || 'Toples 500g'}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm text-white ${
                product.is_available ? 'bg-emerald-600/90' : 'bg-rose-600/90'
              }`}
            >
              {product.is_available ? 'Tersedia' : 'Stok Habis'}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs text-amber-700 font-semibold tracking-wide uppercase">
              {product.category_name || 'Kue Kering Pilihan'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5">
              {product.name}
            </h2>
            <div className="mt-2 text-2xl font-black text-amber-800">
              {formatRupiah(product.price)}
              <span className="text-xs text-stone-400 font-normal ml-1">/ toples</span>
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-100/60 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Butter Premium & Harum</span>
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Fresh from The Oven</span>
            </div>
          </div>

          {/* Quantity & CTA */}
          {product.is_available ? (
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-2 border border-stone-200 bg-stone-50 rounded-2xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-stone-800 px-2 min-w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Berhasil Masuk Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>
                      Tambah ({formatRupiah(product.price * quantity)})
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium text-center">
              Maaf, varian kue ini saat ini sedang habis atau dalam proses pemanggangan kembali.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
