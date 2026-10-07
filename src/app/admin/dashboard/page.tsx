'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  ChefHat,
  Users,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { formatRupiah, formatTanggalSingkat, getStatusInfo } from '@/lib/format';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [productionStats, setProductionStats] = useState({ total_toples: 0, varieties: 0 });
  const [customerCount, setCustomerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const [ordRes, prodRes, custRes] = await Promise.all([
          fetch('/api/admin/orders').then((r) => r.json()),
          fetch('/api/admin/reports/production').then((r) => r.json()),
          fetch('/api/admin/reports/customers').then((r) => r.json()),
        ]);

        if (ordRes.success) setOrders(ordRes.data);
        if (prodRes.success) {
          setProductionStats({
            total_toples: prodRes.data.total_toples_to_bake,
            varieties: prodRes.data.total_product_varieties,
          });
        }
        if (custRes.success) setCustomerCount(custRes.data.total_customers);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const newOrdersCount = orders.filter((o) => o.status === 'Baru').length;
  const inProgressCount = orders.filter((o) => o.status === 'Diproses').length;
  const readyCount = orders.filter((o) => o.status === 'Siap').length;
  const completedRevenue = orders
    .filter((o) => o.status !== 'Dibatalkan')
    .reduce((sum, o) => sum + o.grand_total, 0);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500">Memuat metrik dashboard toko...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Dashboard Toko Kue Bu Natha
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Pantau pesanan masuk, antrean panggangan toples kue, dan histori pelanggan.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Pesanan Baru */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Pesanan Baru</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {newOrdersCount}
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Menunggu konfirmasi admin
            </span>
          </div>
        </div>

        {/* Antrean Panggang Kue (F-23) */}
        <Link
          href="/admin/production"
          className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-5 rounded-3xl shadow-lg shadow-amber-600/20 space-y-3 hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100">Antrean Panggang (F-23)</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black">
              {productionStats.total_toples}{' '}
              <span className="text-sm font-semibold text-amber-200">Toples</span>
            </div>
            <span className="text-[11px] text-amber-100 font-medium flex items-center gap-1">
              <span>{productionStats.varieties} Varian kue perlu dibuat</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Sedang Diproses */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Sedang Diproses</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {inProgressCount}
            </div>
            <span className="text-[11px] text-blue-600 font-medium">
              Sedang di oven & packing
            </span>
          </div>
        </div>

        {/* Total Omset */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">Total Nilai Order</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 truncate">
              {formatRupiah(completedRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Dari {orders.length} total pesanan
            </span>
          </div>
        </div>
      </div>

      {/* Two Highlighted Feature Banners (F-22 & F-23) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner Baking Queue */}
        <Link
          href="/admin/production"
          className="group p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <ChefHat className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-stone-900 text-base">
                Kebutuhan Stok Produksi (Baking Queue)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                F-23
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Melihat total toples kue yang harus dipanggang hari ini secara otomatis dari seluruh pesanan baru & diproses tanpa hitung manual.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 pt-1 group-hover:underline">
              <span>Buka Jadwal Panggang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Banner Customer Recap */}
        <Link
          href="/admin/customers"
          className="group p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-stone-900 text-base">
                Rekapan Pesanan per Pelanggan
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                F-22
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Riwayat belanja pelanggan loyal teragregasi berdasarkan Nomor WhatsApp. Ketahui frekuensi beli dan hubungi kembali via WA.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 pt-1 group-hover:underline">
              <span>Lihat Rekap ({customerCount} Pelanggan)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Pesanan Masuk Terbaru</h2>
            <p className="text-xs text-stone-500">Daftar transaksi pesanan terkini.</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-500 text-[11px] uppercase font-bold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Kode Order</th>
                <th className="py-3 px-4">Pemesan</th>
                <th className="py-3 px-4">Item Kue</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {orders.slice(0, 5).map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {order.order_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{order.customer_name}</div>
                      <div className="text-[11px] text-stone-400">{order.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {order.items.map((i) => `${i.product_name} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {formatRupiah(order.grand_total)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/orders?search=${order.order_code}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Kelola</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
