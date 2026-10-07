'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  Printer,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Flame,
  Minus,
  Plus,
  Check,
  Loader2,
  Boxes,
  X,
  Package,
} from 'lucide-react';
import { ProductionQueueItem, Product, OrderStatus } from '@/types';
import { formatTanggalSingkat, getStatusInfo } from '@/lib/format';

export default function ProductionPlanningPage() {
  const [queue, setQueue] = useState<ProductionQueueItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Baru' | 'Diproses'>('all');

  // Stock updating states
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);
  const [justSavedProductId, setJustSavedProductId] = useState<string | null>(null);

  // All products stock management modal
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const fetchProductionQueue = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/reports/production');
      const data = await res.json();
      if (data.success) {
        setQueue(data.data.items);
      }
    } catch (err) {
      console.error('Failed to load production queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to load products list', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProductionQueue();
  }, []);

  const openStockModal = () => {
    setIsStockModalOpen(true);
    fetchAllProducts();
  };

  // Immediate optimistic update for ready stock
  const handleUpdateStock = async (productId: string, newStock: number) => {
    const sanitizedStock = Math.max(0, Math.floor(newStock));

    // Update queue state optimistically
    setQueue((prevQueue) =>
      prevQueue.map((item) => {
        if (item.product_id !== productId) return item;
        const remaining = Math.max(0, item.total_quantity_ordered - sanitizedStock);
        return {
          ...item,
          ready_stock: sanitizedStock,
          remaining_to_bake: remaining,
          total_quantity_to_bake: remaining,
        };
      })
    );

    // Also update allProducts if loaded
    setAllProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ready_stock: sanitizedStock } : p))
    );

    setUpdatingProductId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ready_stock: sanitizedStock }),
      });
      const data = await res.json();
      if (data.success) {
        setJustSavedProductId(productId);
        setTimeout(() => {
          setJustSavedProductId((curr) => (curr === productId ? null : curr));
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to update ready stock', err);
      // Re-fetch to roll back in case of error
      fetchProductionQueue();
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Filter items based on chosen status
  const filteredQueue = useMemo(() => {
    return queue
      .map((item) => {
        let matchedOrders = item.orders;
        if (statusFilter !== 'all') {
          matchedOrders = item.orders.filter((o) => o.status === statusFilter);
        }
        const totalOrdered = matchedOrders.reduce((sum, o) => sum + o.quantity, 0);
        const remaining = Math.max(0, totalOrdered - (item.ready_stock || 0));
        return {
          ...item,
          total_quantity_ordered: totalOrdered,
          remaining_to_bake: remaining,
          total_quantity_to_bake: remaining,
          order_count: matchedOrders.length,
          orders: matchedOrders,
        };
      })
      .filter((item) => item.total_quantity_ordered > 0);
  }, [queue, statusFilter]);

  // Aggregate totals
  const totalOrderedSemua = filteredQueue.reduce(
    (sum, it) => sum + it.total_quantity_ordered,
    0
  );
  const totalReadySemua = filteredQueue.reduce(
    (sum, it) => sum + (it.ready_stock || 0),
    0
  );
  const totalRemainingSemua = filteredQueue.reduce(
    (sum, it) => sum + it.remaining_to_bake,
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
              PRD F-23 • Fitur Utama
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1 flex items-center gap-2.5">
            <ChefHat className="w-7 h-7 text-amber-600" />
            <span>Kebutuhan Stok Produksi (Baking Queue)</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Akumulasi toples kue dari pesanan aktif vs stok yang sudah ready untuk menentukan jumlah yang harus dipanggang lagi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openStockModal}
            className="px-3.5 py-2.5 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            title="Kelola semua stok kue ready di dapur"
          >
            <Boxes className="w-4 h-4 text-amber-700" />
            <span>Kelola Semua Stok Ready</span>
          </button>
          <button
            onClick={fetchProductionQueue}
            className="p-2.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors shadow-xs"
            title="Refresh Antrean"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar Produksi</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Header (Only visible on paper print) */}
      <div className="hidden print:block border-b-2 border-stone-900 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-stone-950">
              Dapur Kue Kering Bu Sri
            </h1>
            <p className="text-xs text-stone-700 font-semibold">
              Lembar Rencana Produksi & Antrean Oven (Baking Work Order)
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-stone-900">
              Dicetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </p>
            <p className="text-stone-600 font-mono">
              Waktu: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </p>
          </div>
        </div>
        <div className="mt-3 p-2 bg-stone-100 rounded-lg text-xs grid grid-cols-3 text-center font-bold">
          <div>Total Dipesan: {totalOrderedSemua} Toples</div>
          <div>Stok Ready: {totalReadySemua} Toples</div>
          <div className="text-stone-950 underline">
            TARGET HARUS DIPANGGANG: {totalRemainingSemua} TOPLES
          </div>
        </div>
      </div>

      {/* Summary KPI Banner (3 Cards Dashboard) */}
      <div className="rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white shadow-xl shadow-amber-600/20 p-5 sm:p-6 print:hidden">
        {/* Top bar inside banner: Title & Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-amber-500/40">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
              Ringkasan Antrean Baking Hari Ini
            </span>
            <h2 className="text-lg sm:text-xl font-black mt-0.5">
              Kalkulasi Kebutuhan Produksi Otomatis
            </h2>
            <p className="text-xs text-amber-100/90 mt-0.5">
              Stok ready langsung memotong jumlah toples yang harus dipanggang lagi di oven.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              Semua (Baru + Diproses)
            </button>
            <button
              onClick={() => setStatusFilter('Baru')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'Baru'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              Hanya Baru
            </button>
            <button
              onClick={() => setStatusFilter('Diproses')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'Diproses'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-100 hover:text-white'
              }`}
            >
              Hanya Diproses
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5">
          {/* 1. Total Dipesan */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                1. Total Dipesan
              </span>
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black tracking-tight">
                {totalOrderedSemua}{' '}
                <span className="text-base font-bold text-amber-200">Toples</span>
              </div>
              <p className="text-[11px] text-amber-100/80 mt-1">
                Dari {filteredQueue.length} varian kue yang dipesan
              </p>
            </div>
          </div>

          {/* 2. Total Stok Ready */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                2. Stok Ready (Sudah Ada)
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black tracking-tight text-white">
                {totalReadySemua}{' '}
                <span className="text-base font-bold text-emerald-200">Toples</span>
              </div>
              <p className="text-[11px] text-amber-100/80 mt-1">
                Sudah matang & siap dikemas di dapur
              </p>
            </div>
          </div>

          {/* 3. Sisa yang Harus Dibuat Lagi */}
          <div className="bg-stone-950/40 backdrop-blur-xs rounded-2xl p-4 border-2 border-amber-300/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>3. Harus Dibuat Lagi</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                Target Oven
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-2">
                <span>{totalRemainingSemua}</span>
                <span className="text-base font-bold text-amber-300">Toples</span>
              </div>
              <p className="text-[11px] text-amber-200/90 font-medium mt-1">
                {totalRemainingSemua === 0
                  ? '🎉 Stok ready mencukupi semua pesanan!'
                  : 'Kekurangan yang wajib dipanggang hari ini'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Queue Cards */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500">Mengkalkulasi antrean produksi kue...</p>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-stone-900 text-lg">Semua Kue Sudah Siap!</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
            Saat ini tidak ada pesanan aktif berstatus &quot;Baru&quot; atau &quot;Diproses&quot; yang perlu dipanggang.
            Dapur siap menerima pesanan berikutnya.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredQueue.map((item, idx) => {
            const isDeficit = item.remaining_to_bake > 0;
            const surplus = Math.max(0, item.ready_stock - item.total_quantity_ordered);
            const isUpdating = updatingProductId === item.product_id;
            const justSaved = justSavedProductId === item.product_id;

            return (
              <div
                key={item.product_id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden transition-all hover:border-amber-200"
              >
                {/* Card Header (Product & Stock Controls) */}
                <div className="p-4 sm:p-5 bg-stone-50/70 border-b border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Product Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-sm shrink-0 shadow-xs">
                      #{idx + 1}
                    </div>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-12 h-12 rounded-2xl object-cover border border-stone-200 bg-white shrink-0 print:hidden"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                    )}
                    <div>
                      <h3 className="font-black text-stone-900 text-base sm:text-lg">
                        {item.product_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-500 font-semibold">
                          Kemasan: {item.packaging || 'Toples 500g'}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs bg-stone-200/70 text-stone-700 font-bold px-2 py-0.5 rounded-lg">
                          {item.order_count} Pemesan
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center & Right: Ready Stock Input & Calculation Badges */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-200">
                    {/* Entry Stok Ready (Sudah Ada) */}
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2 sm:px-3 flex items-center gap-2.5 print:hidden">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                          Stok Ready (Sudah Ada)
                        </span>
                        <span className="text-[10px] text-amber-700 font-medium">
                          Di rak / siap kemas
                        </span>
                      </div>

                      {/* Stepper Input */}
                      <div className="flex items-center gap-1.5 ml-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStock(item.product_id, Math.max(0, item.ready_stock - 1))
                          }
                          disabled={item.ready_stock <= 0 || isUpdating}
                          className="w-7 h-7 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 disabled:opacity-30 text-amber-950 font-black flex items-center justify-center transition-all shadow-2xs"
                          title="Kurangi stok ready 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={item.ready_stock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleUpdateStock(item.product_id, isNaN(val) ? 0 : val);
                          }}
                          className="w-12 h-7 text-center font-black text-xs sm:text-sm bg-white border border-amber-300 rounded-xl text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />

                        <button
                          type="button"
                          onClick={() => handleUpdateStock(item.product_id, item.ready_stock + 1)}
                          disabled={isUpdating}
                          className="w-7 h-7 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-black flex items-center justify-center transition-all shadow-2xs"
                          title="Tambah stok ready 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Saving feedback */}
                      {isUpdating && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700 ml-0.5" />
                      )}
                      {justSaved && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 animate-in fade-in">
                          <Check className="w-3 h-3" />
                          <span>Tersimpan</span>
                        </span>
                      )}
                    </div>

                    {/* Metric 1: Total Dipesan */}
                    <div className="text-right px-2">
                      <span className="text-[10px] text-stone-400 font-medium block">
                        Total Dipesan:
                      </span>
                      <span className="text-base sm:text-lg font-black text-stone-800">
                        {item.total_quantity_ordered} Toples
                      </span>
                    </div>

                    {/* Metric 2: Sisa yang Harus Dibuat Lagi (Badge Utama) */}
                    <div className="text-right">
                      {isDeficit ? (
                        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-3 py-1.5 flex flex-col items-end">
                          <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1 uppercase tracking-wider">
                            <Flame className="w-3 h-3 text-rose-500" />
                            <span>Harus Dibuat Lagi:</span>
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-rose-700">
                            {item.remaining_to_bake} Toples
                          </span>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-1.5 flex flex-col items-end">
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Stok Cukup!</span>
                          </span>
                          <span className="text-xs font-black text-emerald-800">
                            {surplus > 0 ? `+${surplus} Toples Lebih` : '0 Toples (Pas)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Print View Specific Row */}
                <div className="hidden print:block px-5 py-2 bg-stone-100 border-b border-stone-300 text-xs font-bold">
                  <div className="grid grid-cols-4 text-center">
                    <div>Total Dipesan: {item.total_quantity_ordered} Toples</div>
                    <div>Stok Ready: {item.ready_stock} Toples</div>
                    <div className="text-stone-900 font-black">
                      Target Panggang: {item.remaining_to_bake} Toples
                    </div>
                    <div>[ &nbsp; ] Selesai Panggang</div>
                  </div>
                </div>

                {/* Orders Breakdown Table */}
                <div className="p-4 sm:p-5 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[11px] font-bold text-stone-400 uppercase border-b border-stone-100 pb-2">
                      <tr>
                        <th className="py-2 px-3">Kode Pesanan</th>
                        <th className="py-2 px-3">Nama Pemesan</th>
                        <th className="py-2 px-3">Jumlah (Toples)</th>
                        <th className="py-2 px-3">Pengambilan</th>
                        <th className="py-2 px-3">Status Saat Ini</th>
                        <th className="py-2 px-3 text-right print:hidden">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {item.orders.map((o) => {
                        const st = getStatusInfo(o.status);
                        return (
                          <tr key={o.order_code} className="hover:bg-stone-50/50">
                            <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                              {o.order_code}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">{o.customer_name}</td>
                            <td className="py-2.5 px-3 font-black text-amber-800">
                              {o.quantity} Toples
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="capitalize">
                                {o.fulfillment_method === 'pickup'
                                  ? '📍 Ambil di Toko'
                                  : '🚚 Kirim ke Alamat'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}
                              >
                                {st.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right print:hidden">
                              <Link
                                href={`/admin/orders?search=${o.order_code}`}
                                className="text-amber-700 hover:text-amber-800 font-bold inline-flex items-center gap-1"
                              >
                                <span>Buka Order</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Kelola Semua Stok Ready Kue (Seluruh Menu) */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsStockModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Kelola Stok Ready Seluruh Kue
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Perbarui jumlah toples yang sudah matang dan siap di rak dapur saat ini.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {isLoadingProducts ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Memuat data produk...</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {allProducts.map((p) => {
                    const isUpdating = updatingProductId === p.id;
                    const justSaved = justSavedProductId === p.id;
                    const queueItem = queue.find((q) => q.product_id === p.id);
                    const orderedCount = queueItem ? queueItem.total_quantity_ordered : 0;
                    const stock = p.ready_stock || 0;
                    const needed = Math.max(0, orderedCount - stock);

                    return (
                      <div
                        key={p.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 px-2 rounded-2xl transition-colors"
                      >
                        {/* Product Info */}
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                          <div>
                            <div className="font-bold text-stone-900 text-xs sm:text-sm">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-stone-400 flex items-center gap-2">
                              <span>{p.packaging || 'Toples 500g'}</span>
                              <span>•</span>
                              <span className="text-amber-800 font-semibold">
                                Dipesan aktif: {orderedCount} toples
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stock Controls */}
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          {/* Deficit/Surplus pill */}
                          {orderedCount > 0 && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                needed > 0
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {needed > 0 ? `Kurang ${needed}` : 'Cukup'}
                            </span>
                          )}

                          {/* Stepper */}
                          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(p.id, Math.max(0, stock - 1))}
                              disabled={stock <= 0 || isUpdating}
                              className="w-7 h-7 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 disabled:opacity-30 text-stone-700 font-bold flex items-center justify-center transition-all"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={stock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                handleUpdateStock(p.id, isNaN(val) ? 0 : val);
                              }}
                              className="w-12 h-7 text-center font-black text-xs bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-hidden"
                            />

                            <button
                              type="button"
                              onClick={() => handleUpdateStock(p.id, stock + 1)}
                              disabled={isUpdating}
                              className="w-7 h-7 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold flex items-center justify-center transition-all"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-semibold text-stone-500">Toples</span>

                          {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />}
                          {justSaved && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Perubahan stok ready langsung tersimpan otomatis.</span>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
