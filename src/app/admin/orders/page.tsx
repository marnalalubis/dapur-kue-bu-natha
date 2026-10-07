'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  XCircle,
  Phone,
  MapPin,
  FileText,
  Eye,
  X,
  MessageCircle,
  Truck,
  Store,
  Printer,
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '@/types';
import OrderPrintModal from '@/components/OrderPrintModal';
import {
  formatRupiah,
  formatTanggal,
  formatTanggalSingkat,
  getStatusInfo,
  normalizePhoneForWA,
} from '@/lib/format';

const ALL_STATUSES: OrderStatus[] = ['Baru', 'Diproses', 'Siap', 'Selesai', 'Dibatalkan'];

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const [ordRes, setRes] = await Promise.all([
        fetch('/api/admin/orders').then((r) => r.json()),
        fetch('/api/settings/public').then((r) => r.json()),
      ]);
      if (ordRes.success) setOrders(ordRes.data);
      if (setRes.success) setSettings(setRes.data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.data : o))
        );
        if (activeModalOrder && activeModalOrder.id === orderId) {
          setActiveModalOrder(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus =
        selectedStatus === 'all' || o.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q);
      return matchStatus && matchQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-amber-600" />
            <span>Manajemen Pesanan Kue</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Perbarui alur status pesanan (Baru → Diproses → Siap → Selesai) dan hubungi pembeli.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode, nama, no HP..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
            selectedStatus === 'all'
              ? 'bg-stone-900 text-white shadow-md'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          Semua ({orders.length})
        </button>
        {ALL_STATUSES.map((st) => {
          const count = orders.filter((o) => o.status === st).length;
          const info = getStatusInfo(st);
          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedStatus === st
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <span>{info.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedStatus === st
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500">Memuat daftar pesanan...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <h3 className="font-bold text-stone-800 text-base">Tidak Ada Pesanan</h3>
          <p className="text-xs text-stone-500 mt-1">
            Tidak ditemukan pesanan yang sesuai dengan filter ini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-500 text-[11px] uppercase font-bold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-4">Kode Order & Tanggal</th>
                  <th className="py-3 px-4">Pemesan & Kontak</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Rincian Toples</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status Pesanan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50/60 transition-colors cursor-pointer"
                      onClick={() => setActiveModalOrder(order)}
                    >
                      {/* Code & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-stone-900">
                          {order.order_code}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {formatTanggalSingkat(order.created_at)}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">
                          {order.customer_name}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {order.customer_phone}
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td className="py-3.5 px-4 text-xs">
                        {order.fulfillment_method === 'pickup' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 font-semibold text-[11px]">
                            <Store className="w-3 h-3" />
                            <span>Ambil Sendiri</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-semibold text-[11px]">
                            <Truck className="w-3 h-3" />
                            <span>Kirim Alamat</span>
                          </span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs text-xs">
                        <div className="font-medium text-stone-800 truncate">
                          {order.items
                            .map((i) => `${i.product_name} (${i.quantity})`)
                            .join(', ')}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          Total {order.items.reduce((s, i) => s + i.quantity, 0)} toples
                        </span>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 font-black text-stone-900">
                        {formatRupiah(order.grand_total)}
                      </td>

                      {/* Status Dropdown */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleUpdateStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-hidden ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrintOrder(order);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-100 text-stone-700 transition-colors shadow-2xs"
                            title="Cetak Nota / Label Dus"
                          >
                            <Printer className="w-3.5 h-3.5 text-stone-600" />
                            <span className="hidden sm:inline">Cetak</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveModalOrder(order);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-700" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setActiveModalOrder(null)}
          />

          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase">
                  DETAIL PESANAN
                </span>
                <h3 className="text-xl font-black text-stone-900">
                  {activeModalOrder.order_code}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalOrder(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Status Update Quick Bar */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Ubah Status Pengerjaan:
                  </span>
                  <span className="text-[11px] text-amber-700">
                    Otomatis memperbarui antrean produksi & status pembeli.
                  </span>
                </div>
                <select
                  value={activeModalOrder.status}
                  onChange={(e) =>
                    handleUpdateStatus(
                      activeModalOrder.id,
                      e.target.value as OrderStatus
                    )
                  }
                  className="text-xs font-bold py-2 px-3 rounded-xl border border-amber-300 bg-white text-stone-800"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Info Card */}
              <div className="space-y-2 p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs">
                <div className="font-bold text-stone-900 text-sm">
                  {activeModalOrder.customer_name}
                </div>
                <div className="flex items-center gap-2 text-stone-600 font-mono">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{activeModalOrder.customer_phone}</span>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${normalizePhoneForWA(
                      activeModalOrder.customer_phone
                    )}?text=${encodeURIComponent(
                      `Halo Ibu/Bpk *${activeModalOrder.customer_name}*, konfirmasi dari Dapur Kue Bu Natha terkait pesanan *${activeModalOrder.order_code}* status saat ini: *${activeModalOrder.status}*.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp Pemesan</span>
                  </a>
                </div>

                {activeModalOrder.fulfillment_method === 'delivery' && (
                  <div className="pt-2 text-stone-700">
                    <span className="font-bold block">Alamat Kirim:</span>
                    <span>{activeModalOrder.customer_address}</span>
                  </div>
                )}

                {activeModalOrder.customer_note && (
                  <div className="pt-1 text-stone-600 italic">
                    <span className="font-bold not-italic">Catatan:</span>{' '}
                    {activeModalOrder.customer_note}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Item Kue
                </h4>
                <div className="divide-y divide-stone-100">
                  {activeModalOrder.items.map((it) => (
                    <div
                      key={it.id}
                      className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div>
                        <div className="font-bold text-stone-900">
                          {it.product_name}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {it.quantity} x {formatRupiah(it.price)} (
                          {it.packaging || 'Toples'})
                        </div>
                      </div>
                      <div className="font-black text-stone-900">
                        {formatRupiah(it.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between font-black text-base text-stone-900">
                  <span>Grand Total:</span>
                  <span className="text-amber-800 text-xl">
                    {formatRupiah(activeModalOrder.grand_total)}
                  </span>
                </div>

                {/* Print Quick Action */}
                <div className="pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setPrintOrder(activeModalOrder)}
                    className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Cetak Nota & Label Dus Pengiriman</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Print Modal (Receipt & Shipping Label) */}
      {printOrder && (
        <OrderPrintModal
          order={printOrder}
          settings={settings}
          isOpen={Boolean(printOrder)}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Memuat...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
