'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Store,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  FileText,
  ShieldCheck,
  Plus,
  Minus,
  Trash2,
  Send,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatRupiah, isValidIndonesianPhone } from '@/lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Keranjang belanja Anda kosong.');
      return;
    }

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }

    if (!isValidIndonesianPhone(customerPhone)) {
      setErrorMessage(
        'Format nomor WhatsApp tidak valid. Masukkan nomor HP aktif (contoh: 081234567890).'
      );
      return;
    }

    if (fulfillmentMethod === 'delivery' && (!customerAddress.trim() || customerAddress.trim().length < 5)) {
      setErrorMessage('Silakan isi alamat pengiriman lengkap untuk metode kirim.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          customer_note: customerNote,
          fulfillment_method: fulfillmentMethod,
          items: items.map((it) => ({
            product_id: it.product.id,
            quantity: it.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      // Order created successfully
      const order = data.data;
      clearCart();
      router.push(`/konfirmasi/${order.order_code}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Keranjang Belanja Kosong</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-sm mx-auto">
          Anda belum memilih kue kering untuk dipesan. Silakan pilih dari katalog terlebih dahulu.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Kue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 pb-24">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
          Penyelesaian Pesanan (Checkout)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Pesanan dibuat tanpa registrasi akun (Guest Checkout).
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Fields Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Data Diri Pemesan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <User className="w-4 h-4 text-amber-600" />
              <span>Data Kontak Pemesan</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nama Lengkap Pemesan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Ibu Ratna Dewi"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081298765432"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <span className="text-[11px] text-stone-400 mt-1 block">
                Digunakan untuk konfirmasi pesanan dan pengecekan status pesanan Anda.
              </span>
            </div>
          </div>

          {/* Metode Pengambilan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Metode Pengambilan Pesanan</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pickup Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  checked={fulfillmentMethod === 'pickup'}
                  onChange={() => setFulfillmentMethod('pickup')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Ambil Sendiri</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Ambil langsung di toko kami (Gratis).
                  </p>
                </div>
              </label>

              {/* Delivery Option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value="delivery"
                  checked={fulfillmentMethod === 'delivery'}
                  onChange={() => setFulfillmentMethod('delivery')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Kirim ke Alamat</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Via kurir instan / ekspedisi Paxel.
                  </p>
                </div>
              </label>
            </div>

            {/* Address Input if Delivery */}
            {fulfillmentMethod === 'delivery' ? (
              <div className="pt-2 space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  Alamat Pengiriman Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota, dan patokan..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <span className="text-[11px] text-amber-700 block">
                  *Ongkos kirim disepakati dan diinformasikan langsung oleh admin via chat WhatsApp.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-bold text-stone-800">Alamat Penjemputan Toko:</div>
                <p>Jl. Melati Indah No. 42, Kebayoran Baru, Jakarta Selatan (Buka 09.00 - 18.00 WIB)</p>
              </div>
            )}

            {/* Catatan Tambahan */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>Catatan Pesanan (Opsional)</span>
              </label>
              <input
                type="text"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Contoh: Mohon sertakan kartu ucapan Idul Fitri / jangan dibanting."
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  Ringkasan Pesanan ({items.length} Macam Kue)
                </h2>
                <span className="text-[11px] text-stone-400">
                  Total {totalItems} Toples Terpilih
                </span>
              </div>
              <Link
                href="/#katalog"
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kue Lain</span>
              </Link>
            </div>

            {/* Item list with multi-item quantity controls */}
            <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1 space-y-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="space-y-0.5 pr-2 min-w-0">
                    <div className="font-bold text-stone-800 truncate">{product.name}</div>
                    <div className="text-[11px] text-stone-400">
                      {formatRupiah(product.price)} / toples
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Stepper */}
                    <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200"
                        title="Kurangi"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black px-1.5 min-w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700"
                        title="Tambah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-extrabold text-stone-900 min-w-16 text-right">
                      {formatRupiah(product.price * quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Subtotal ({items.length} macam, {totalItems} toples)</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Ongkos Kirim</span>
                <span>{fulfillmentMethod === 'pickup' ? 'Gratis (Ambil Sendiri)' : 'Konfirmasi via WA'}</span>
              </div>
              <div className="flex items-center justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-100">
                <span>Total Tagihan</span>
                <span className="text-amber-800 text-lg">{formatRupiah(subtotal)}</span>
              </div>
            </div>

            {/* Direct Connect to Admin Notice */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Langsung Terhubung ke Rekap Pesanan Dapur</span>
              </div>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                Menekan tombol di bawah langsung mencatat seluruh jenis kue pesanan Anda ke database toko & antrean panggangan admin.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span>Mencatat Pesanan ke Rekap Dapur...</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Pesanan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
