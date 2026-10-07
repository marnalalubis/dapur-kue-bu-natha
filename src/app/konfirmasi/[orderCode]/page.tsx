'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Search,
  ArrowRight,
  Store,
  Truck,
  ShieldAlert,
  Cookie,
  Printer,
} from 'lucide-react';
import { Order, StoreSettings } from '@/types';
import OrderPrintModal from '@/components/OrderPrintModal';
import {
  formatRupiah,
  formatTanggal,
  buildWhatsAppOrderMessage,
  normalizePhoneForWA,
} from '@/lib/format';

function OrderConfirmationContent() {
  const params = useParams();
  const orderCode = params?.orderCode as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    async function fetchOrderData() {
      if (!orderCode) return;
      try {
        setIsLoading(true);
        const [ordRes, setRes] = await Promise.all([
          fetch(`/api/orders/${orderCode}/status`).then((r) => r.json()),
          fetch('/api/settings/public').then((r) => r.json()),
        ]);

        if (ordRes.success) {
          setOrder(ordRes.data);
          // Trigger confetti animation for delightful experience
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#D97706', '#F59E0B', '#10B981', '#FBBF24'],
            });
          } catch {
            // ignore confetti error
          }
        }
        if (setRes.success) setSettings(setRes.data);
      } catch (err) {
        console.error('Failed to load order confirmation', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrderData();
  }, [orderCode]);

  const handleCopyCode = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-500">Memuat rincian konfirmasi pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900">Pesanan Tidak Ditemukan</h2>
        <p className="text-xs text-stone-500 mt-2">
          Kode pesanan {orderCode} tidak terdaftar di sistem kami.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const storePhone = settings?.store_phone || '081234567890';
  const cleanStorePhone = normalizePhoneForWA(storePhone);
  const waText = settings
    ? buildWhatsAppOrderMessage(order, settings)
    : `Halo, saya ingin konfirmasi pesanan ${order.order_code}`;
  const waLink = `https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 pb-28">
      {/* Success Badge */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mt-2">
          Pesanan Berhasil Dicatat!
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
          Terima Kasih, {order.customer_name}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Pesanan kue kering Anda telah tersimpan dengan aman di antrean dapur kami.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-xl overflow-hidden mb-6">
        {/* Code Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-amber-100/60 border-b border-amber-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              KODE PESANAN UNIK ANDA:
            </span>
            <div className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              {order.order_code}
            </div>
            <span className="text-[11px] text-stone-500">
              Dibuat pada: {formatTanggal(order.created_at)}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-50 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-700" />
                <span>Salin Kode</span>
              </>
            )}
          </button>
        </div>

        {/* Status Terhubung ke Database Admin Dapur */}
        <div className="p-5 sm:p-6 bg-emerald-50/80 border-b border-emerald-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold uppercase tracking-wide">
                <span>●</span>
                <span>Terhubung ke Rekap Pesanan Admin</span>
              </div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base mt-1">
                Pesanan Resmi Masuk ke Antrean Dapur Toko
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                Pesanan Anda telah langsung tersimpan ke sistem database dapur Bu Sri dan sudah masuk ke <strong>Rekap Pesanan</strong> serta <strong>Jadwal Pemanggangan Kue</strong> di dashboard admin.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim Salinan ke WhatsApp Toko (Opsional)</span>
            </a>

            <Link
              href={`/status-pesanan?code=${order.order_code}&phone=${order.customer_phone}`}
              className="py-3 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors text-center"
            >
              <Search className="w-4 h-4 text-amber-600" />
              <span>Pantau Status Kue</span>
            </Link>
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Item Kue Dipesan ({order.items.length} Macam)
            </h4>
            <div className="divide-y divide-stone-100">
              {order.items.map((it) => (
                <div key={it.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900">{it.product_name}</div>
                    <div className="text-[11px] text-stone-500">
                      {it.quantity} x {formatRupiah(it.price)} ({it.packaging || 'Toples'})
                    </div>
                  </div>
                  <div className="font-extrabold text-stone-900">
                    {formatRupiah(it.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-base font-black text-stone-900">
            <span>Total Tagihan:</span>
            <span className="text-amber-800 text-xl">{formatRupiah(order.grand_total)}</span>
          </div>

          {/* Fulfillment Info */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs space-y-2 text-stone-700">
            <div className="font-bold text-stone-900 flex items-center gap-2">
              {order.fulfillment_method === 'pickup' ? (
                <>
                  <Store className="w-4 h-4 text-amber-600" />
                  <span>Metode: Ambil Sendiri di Toko</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Metode: Kirim Manual ke Alamat</span>
                </>
              )}
            </div>
            {order.fulfillment_method === 'delivery' && (
              <p className="text-stone-600">
                Alamat: <span className="font-medium">{order.customer_address}</span>
              </p>
            )}
            {order.customer_note && (
              <p className="text-stone-600">
                Catatan: <span className="italic">{order.customer_note}</span>
              </p>
            )}
          </div>

          {/* Payment Offline Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/50 text-[11px] text-stone-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Pembayaran dilakukan secara offline</strong> (COD / saat ambil di toko / transfer bank langsung sesuai instruksi chat WhatsApp tanpa upload bukti di web).
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Cetak / Simpan Nota</span>
          </button>

          <Link
            href={`/status-pesanan?code=${order.order_code}&phone=${order.customer_phone}`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <Search className="w-4 h-4 text-amber-600" />
            <span>Lacak Status</span>
          </Link>
        </div>

        <Link
          href="/"
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-amber-800 hover:text-amber-900 font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          <span>Pesan Kue Lainnya</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Order Print Modal */}
      {order && (
        <OrderPrintModal
          order={order}
          settings={settings}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          defaultTab="receipt"
        />
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <React.Suspense fallback={<div className="p-16 text-center text-sm text-stone-500">Memuat rincian pesanan...</div>}>
      <OrderConfirmationContent />
    </React.Suspense>
  );
}
