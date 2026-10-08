'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Cookie,
  Search,
  Sparkles,
  ShoppingBag,
  Flame,
  ShieldCheck,
  AlertCircle,
  Clock,
  Heart,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Product, Category, StoreSettings } from '@/types';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { formatRupiah } from '@/lib/format';
import DominoLettering from '@/components/DominoLettering';
import MeshLettering from '@/components/MeshLettering';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { settings } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { items, totalItems, subtotal, setIsCartOpen } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [pRes, cRes] = await Promise.all([
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
        ]);

        if (pRes.success) setProducts(pRes.data);
        if (cRes.success) setCategories(cRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCat =
        selectedCategory === 'all' || item.category_id === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center animate-in fade-in duration-300">
        <div className="relative mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-700 animate-bounce shadow-inner">
            <Cookie className="w-7 h-7" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-amber-400/20 blur-md -z-10 animate-pulse" />
        </div>

        {/* Domino Lettering from React Bits Pro: letters topple like dominoes and rebuild */}
        <DominoLettering
          text={settings?.store_name || 'DAPUR BU NATHA'}
          variant="tile"
          direction="right"
          stagger={0.065}
          cycleDuration={3.2}
          className="mb-4"
        />

        <div className="space-y-1.5 mt-2">
          <p className="text-xs sm:text-sm font-bold text-amber-800 tracking-wide">
            Menyiapkan Menu Kue Kering Spesial...
          </p>
          <p className="text-[11px] sm:text-xs text-stone-400 max-w-sm mx-auto">
            {settings?.store_tagline || 'Fresh from the oven dengan bahan butter pilihan'}
          </p>
        </div>

        {/* Animated Loading Bar */}
        <div className="w-48 h-1.5 bg-amber-100 rounded-full overflow-hidden mt-6 shadow-inner">
          <div className="h-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-full animate-indeterminate" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Closed Notice Banner */}
      {settings && !settings.is_store_open && (
        <div className="bg-rose-500 text-white px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-inner">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            {settings.closed_reason || 'Mohon maaf, pemesanan sedang ditutup sementara.'}
          </span>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-100/20 to-transparent pt-6 pb-10 sm:py-14 border-b border-amber-100/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Fresh from The Oven • 100% Wijsman Butter</span>
              </div>

              <div className="space-y-3">
                <MeshLettering
                  text="Kelezatan Kue Kering Homemade Spesial"
                  colors={['#854d0e', '#fef08a']}
                  sheen={1.4}
                  gloss={0.88}
                  iridescence={0.65}
                  wind={1.15}
                  fontSize={44}
                  fontWeight="900"
                  lineHeight={1.15}
                  textAlign="auto"
                  as="h1"
                  className="max-w-2xl mx-auto lg:mx-0 cursor-pointer active:cursor-grabbing drop-shadow-xs"
                />

                <MeshLettering
                  text={
                    settings?.store_tagline ||
                    'Kue Kering Homemade Fresh from The Oven dengan Butter Pilihan Yang Terbaik'
                  }
                  colors={['#78350f', '#fde68a']}
                  sheen={1.2}
                  gloss={0.78}
                  iridescence={0.5}
                  wind={0.9}
                  fontSize={17}
                  fontWeight="600"
                  lineHeight={1.4}
                  textAlign="auto"
                  as="p"
                  className="max-w-xl mx-auto lg:mx-0 cursor-pointer active:cursor-grabbing"
                />
              </div>

              {/* Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-stone-700">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Dipanggang Sesuai Pesanan</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Higienis & Halal</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Bisa Ambil / Kirim</span>
                </div>
              </div>
            </div>

            {/* Right Col: Visual Card Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 sm:aspect-square group">
                  <img
                    src="https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80"
                    alt="Nastar Wisman Dapur Bu Natha"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                      Best Seller No. 1
                    </span>
                    <h3 className="text-xl font-bold">Nastar Wisman Nanas Asli</h3>
                    <p className="text-xs text-stone-300 mt-1">
                      Selai nanas segar dimasak perlahan hingga legit berpadu kulit lumer wangi butter.
                    </p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-xl border border-amber-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-black text-sm">
                    500g
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-500 font-medium">Ukuran Toples</div>
                    <div className="text-xs font-bold text-stone-900">Segel Kedap Udara</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="max-w-6xl mx-auto px-4 pt-10 sm:pt-14" id="katalog">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Cookie className="w-4 h-4" />
              <span>Daftar Menu Kue Kering</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1">
              Pilih Kue Favorit Anda
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Semua kue dikemas rapi dalam toples premium siap hantaran atau konsumsi pribadi.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nastar, kastengel..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-800'
            }`}
          >
            Semua Varian ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-stone-100 rounded-3xl h-72 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-stone-100 p-8">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Cookie className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-stone-800 text-base">Kue Tidak Ditemukan</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Tidak ada kue yang cocok dengan pencarian &quot;{searchQuery}&quot;. Coba cari dengan kata kunci lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-xl"
            >
              Tampilkan Semua Kue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Bottom Cart Bar (if user added items) */}
      {totalItems > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 z-30 max-w-lg mx-auto animate-in slide-in-from-bottom-5 duration-300">
          <div
            onClick={() => setIsCartOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-3.5 sm:p-4 shadow-2xl flex items-center justify-between border border-stone-700/60 hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-stone-900">
                  {totalItems}
                </span>
              </div>
              <div>
                <div className="text-xs text-stone-300 font-semibold flex items-center gap-1.5">
                  <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {items.length} Macam Kue
                  </span>
                  <span>{totalItems} Toples</span>
                </div>
                <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">
                  {formatRupiah(subtotal)}
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-600/30 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pesanan</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
