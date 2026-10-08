'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  XCircle,
  Phone,
  AlertCircle,
  ArrowLeft,
  Store,
  Truck,
  MessageCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatRupiah, formatTanggal, getStatusInfo, normalizePhoneForWA } from '@/lib/format';
import { useStore } from '@/context/StoreContext';

function StatusPesananContent() {
  const { settings } = useStore();
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderCode, setOrderCode] = useState(initialCode);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchStatus = async (codeToSearch: string, phoneToSearch: string) => {
    if (!codeToSearch.trim()) {
      setErrorMessage('Silakan masukkan kode pesanan Anda.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const url = `/api/orders/${encodeURIComponent(
        codeToSearch.trim()
      )}/status?phone=${encodeURIComponent(phoneToSearch.trim())}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Pesanan tidak ditemukan');
      }

      setOrder(data.data);
    } catch (err: unknown) {
      setOrder(null);
      const msg = err instanceof Error ? err.message : 'Gagal memuat status pesanan';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchStatus(initialCode, initialPhone);
    }
  }, [initialCode, initialPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(orderCode, phone);
  };

  // State timeline calculation
  const getStepStatus = (step: OrderStatus, current: OrderStatus) => {
    if (current === 'Dibatalkan') {
      return step === 'Baru' ? 'completed' : 'cancelled';
    }

    const orderHierarchy: OrderStatus[] = ['Baru', 'Diproses', 'Siap', 'Selesai'];
    const currentIdx = orderHierarchy.indexOf(current);
    const stepIdx = orderHierarchy.indexOf(step);

    if (currentIdx > stepIdx) return 'completed';
    if (currentIdx === stepIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 pb-24">
      {/* Title */}
      <div className="text-center space-y-2 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mb-2 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Lacak Status Pesanan Kue
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Pantau progres pembuatan dan penyiapan toples kue kering pesanan Anda secara real-time.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-md mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Kode Pesanan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
                placeholder="Contoh: KK-20261006-0001"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm font-semibold tracking-wider text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nomor WhatsApp Pemesan
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081298765432"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <span>Memeriksa Status...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Cari Pesanan</span>
              </>
            )}
          </button>
        </form>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 mb-8">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Result Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">KODE:</span>
                <span className="font-mono text-lg font-black text-stone-900">
                  {order.order_code}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Pemesan: <strong>{order.customer_name}</strong> •{' '}
                {formatTanggal(order.created_at)}
              </p>
            </div>

            {/* Status Pill */}
            <div>
              {(() => {
                const info = getStatusInfo(order.status);
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${info.bg} ${info.text} ${info.border}`}
                  >
                    <span>●</span>
                    <span>{info.label}</span>
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Visual Timeline (State Machine) */}
          <div className="px-5 sm:px-8 py-2">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-6 text-center">
              Tahapan Pengerjaan Pesanan
            </h4>

            {order.status === 'Dibatalkan' ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <h5 className="font-bold text-rose-800 text-sm">Pesanan Dibatalkan</h5>
                <p className="text-xs text-rose-600">
                  Pesanan ini telah dibatalkan oleh pihak admin atau atas permintaan pemesan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 relative">
                {/* Steps */}
                {[
                  { key: 'Baru' as OrderStatus, label: 'Diterima', icon: Clock },
                  { key: 'Diproses' as OrderStatus, label: 'Dipanggang', icon: ChefHat },
                  { key: 'Siap' as OrderStatus, label: 'Siap', icon: PackageCheck },
                  { key: 'Selesai' as OrderStatus, label: 'Selesai', icon: CheckCircle2 },
                ].map((step, idx) => {
                  const state = getStepStatus(step.key, order.status);
                  const Icon = step.icon;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all ${
                          state === 'completed'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : state === 'active'
                            ? 'bg-amber-600 text-white ring-4 ring-amber-200 animate-pulse'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-bold mt-2 ${
                          state === 'active'
                            ? 'text-amber-800'
                            : state === 'completed'
                            ? 'text-emerald-800'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-center text-xs text-stone-600">
              {getStatusInfo(order.status).description}
            </div>
          </div>

          {/* Item Details */}
          <div className="p-5 sm:p-6 border-t border-stone-100 space-y-4">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Daftar Kue dalam Pesanan Ini
            </h4>

            <div className="divide-y divide-stone-100">
              {order.items.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-stone-900">{it.product_name}</span>
                    <span className="text-stone-400 text-[11px] ml-2">
                      x {it.quantity} {it.packaging || 'Toples'}
                    </span>
                  </div>
                  <span className="font-extrabold text-stone-900">
                    {formatRupiah(it.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between font-black text-sm sm:text-base text-stone-900">
              <span>Total Tagihan:</span>
              <span className="text-amber-800 text-lg">{formatRupiah(order.grand_total)}</span>
            </div>
          </div>

          {/* Action to Contact Store */}
          <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-stone-500 text-center sm:text-left">
              Ada pertanyaan seputar pesanan Anda?
            </div>
            <a
              href={`https://wa.me/${normalizePhoneForWA(settings.store_phone)}?text=${encodeURIComponent(
                `Halo Admin ${settings.store_name}, saya ingin menanyakan pesanan dengan kode ${order.order_code}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi Admin Toko via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPesananPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Memuat...</div>}>
      <StatusPesananContent />
    </Suspense>
  );
}
