'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CustomerRecap, OrderStatus } from '@/types';
import {
  formatRupiah,
  formatTanggalSingkat,
  normalizePhoneForWA,
  getStatusInfo,
} from '@/lib/format';

export default function CustomerRecapPage() {
  const [customers, setCustomers] = useState<CustomerRecap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/reports/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers recap', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(q) ||
        c.customer_phone.includes(q)
    );
  }, [customers, searchQuery]);

  const totalOmsetAll = customers.reduce((acc, c) => acc + c.total_spent, 0);

  const toggleExpand = (phone: string) => {
    setExpandedPhone(expandedPhone === phone ? null : phone);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              PRD F-22 • Fitur Utama
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Rekapan Pesanan per Pelanggan</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Agregasi histori belanja pembeli berdasarkan Nomor WhatsApp tanpa mewajibkan registrasi akun.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau No. WhatsApp..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-bold block">Total Pelanggan Terdata</span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">{customers.length} Orang</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-bold block">Total Omset Seluruh Pembeli</span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">{formatRupiah(totalOmsetAll)}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-bold block">Rata-rata Belanja / Orang</span>
            <div className="text-2xl font-black text-stone-900 mt-0.5">
              {formatRupiah(customers.length ? Math.round(totalOmsetAll / customers.length) : 0)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Customers List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500">Menganalisis rekapitulasi data pelanggan...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-2" />
          <h3 className="font-bold text-stone-800 text-base">Tidak Ada Data Pelanggan</h3>
          <p className="text-xs text-stone-500 mt-1">
            Belum ada pelanggan yang cocok dengan kata kunci pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((cust) => {
            const isExpanded = expandedPhone === cust.customer_phone;
            const cleanPhone = normalizePhoneForWA(cust.customer_phone);
            const waGreetUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Halo Ibu/Bpk *${cust.customer_name}*, terima kasih telah menjadi pelanggan setia Dapur Kue Bu Sri! Ada kue yang ingin dipesan lagi? 🙏`
            )}`;

            return (
              <div
                key={cust.customer_phone}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden transition-all"
              >
                {/* Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Customer Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                      {cust.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-stone-900 text-base sm:text-lg">
                        {cust.customer_name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-mono">{cust.customer_phone}</span>
                        <span>•</span>
                        <span>Order Terakhir: {formatTanggalSingkat(cust.last_order_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-start md:self-auto">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">
                        Frekuensi Order
                      </span>
                      <span className="text-sm sm:text-base font-black text-stone-800">
                        {cust.total_orders} Kali
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">
                        Total Belanja
                      </span>
                      <span className="text-sm sm:text-base font-black text-emerald-700">
                        {formatRupiah(cust.total_spent)}
                      </span>
                    </div>

                    {/* WhatsApp Action */}
                    <a
                      href={waGreetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      title="Hubungi via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat WA</span>
                    </a>

                    {/* Expand History Button */}
                    <button
                      onClick={() => toggleExpand(cust.customer_phone)}
                      className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                      title="Lihat Histori Pesanan"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Order History */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-3 animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Riwayat Pesanan Pelanggan Ini ({cust.orders.length} Pesanan)
                    </h4>

                    <div className="space-y-2">
                      {cust.orders.map((ord) => {
                        const st = getStatusInfo(ord.status);
                        return (
                          <div
                            key={ord.id}
                            className="p-3 rounded-2xl bg-white border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-stone-900">
                                  {ord.order_code}
                                </span>
                                <span className="text-stone-400">•</span>
                                <span className="text-stone-500">
                                  {formatTanggalSingkat(ord.created_at)}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}
                                >
                                  {st.label}
                                </span>
                              </div>
                              <div className="text-stone-600 font-medium">
                                {ord.items_summary}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                              <span className="font-black text-stone-900">
                                {formatRupiah(ord.grand_total)}
                              </span>
                              <Link
                                href={`/admin/orders?search=${ord.order_code}`}
                                className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold"
                              >
                                <span>Detail</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
