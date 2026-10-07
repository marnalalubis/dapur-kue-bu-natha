'use client';

import React, { useState } from 'react';
import { Plus, Minus, Check, Eye } from 'lucide-react';
import { Product } from '@/types';
import { formatRupiah } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import ProductModal from './ProductModal';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cartItem = items.find((it) => it.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddFirst = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.is_available) return;
    addToCart(product, 1);
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col cursor-pointer"
      >
        {/* Photo Container */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-amber-900 shadow-xs">
              {product.packaging || 'Toples 500g'}
            </span>
            {product.is_featured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                Favorit
              </span>
            )}
          </div>

          {/* Availability Badge */}
          <div className="absolute top-3 right-3">
            {product.is_available ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs">
                Tersedia
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/90 text-white shadow-xs backdrop-blur-xs">
                Habis
              </span>
            )}
          </div>

          {/* Quick Preview Icon on Hover */}
          <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-3 py-1.5 bg-white/95 rounded-full text-xs font-semibold text-stone-800 shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              Lihat Detail
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-amber-700 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-stone-400 font-medium block">Harga / Toples</span>
              <span className="font-extrabold text-stone-900 text-sm sm:text-base text-amber-900">
                {formatRupiah(product.price)}
              </span>
            </div>

            {/* Multi-item Quantity Controls */}
            {product.is_available ? (
              quantityInCart > 0 ? (
                <div
                  className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-2xl p-1 shadow-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                    className="w-7 h-7 rounded-xl bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 shadow-2xs transition-colors"
                    title="Kurangi toples"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-black text-amber-900 px-1 min-w-5 text-center">
                    {quantityInCart}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                    className="w-7 h-7 rounded-xl bg-amber-600 hover:bg-amber-700 flex items-center justify-center text-white shadow-2xs transition-colors"
                    title="Tambah toples"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddFirst}
                  className="p-2.5 sm:px-3 sm:py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 active:scale-95 transition-all"
                  title="Tambah ke Pesanan"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pesan</span>
                </button>
              )
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-stone-100 text-stone-400">
                Habis
              </span>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal product={product} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
