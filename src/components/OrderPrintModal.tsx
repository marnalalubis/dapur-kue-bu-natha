'use client';

import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Package,
  X,
  AlertTriangle,
  Truck,
  Store,
  Phone,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Order, StoreSettings } from '@/types';
import { formatRupiah, formatTanggal, normalizePhoneForWA } from '@/lib/format';

interface OrderPrintModalProps {
  order: Order;
  settings?: StoreSettings | null;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'receipt' | 'label';
}

export default function OrderPrintModal({
  order,
  settings,
  isOpen,
  onClose,
  defaultTab = 'receipt',
}: OrderPrintModalProps) {
  const [activeTab, setActiveTab] = useState<'receipt' | 'label'>(defaultTab);
  const [receiptFormat, setReceiptFormat] = useState<'thermal' | 'standard'>('thermal');

  if (!isOpen) return null;

  const storeName = settings?.store_name || 'Dapur Kue Kering Bu Natha';
  const storeTagline =
    settings?.store_tagline || 'Kue Kering Homemade Fresh from The Oven dengan Butter Pilihan';
  const storePhone = settings?.store_phone || '0812-3456-7890';
  const storeAddress =
    settings?.store_address || 'Jl. Melati Indah No. 42, Kebayoran Baru, Jakarta Selatan';
  const paymentInfo =
    settings?.payment_info || 'COD / Ambil di Tempat / Transfer BCA: 123-456-7890 a/n Bu Natha';

  const totalToples = order.items.reduce((sum, it) => sum + it.quantity, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs print:hidden"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'receipt'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Nota / Struk Kasir</span>
            </button>
            <button
              onClick={() => setActiveTab('label')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'label'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-600" />
              <span>Label Dus Pengiriman</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {activeTab === 'receipt' && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 mr-2 bg-stone-100 px-2 py-1 rounded-xl">
                <span>Layout:</span>
                <button
                  type="button"
                  onClick={() => setReceiptFormat('thermal')}
                  className={`px-2 py-0.5 rounded-lg ${
                    receiptFormat === 'thermal'
                      ? 'bg-white text-stone-900 shadow-2xs font-black'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Thermal (Kasir)
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptFormat('standard')}
                  className={`px-2 py-0.5 rounded-lg ${
                    receiptFormat === 'standard'
                      ? 'bg-white text-stone-900 shadow-2xs font-black'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Standar (A4/A5)
                </button>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Preview Body */}
        <div className="p-4 sm:p-6 bg-stone-100 max-h-[75vh] overflow-y-auto flex justify-center print:bg-white print:p-0 print:max-h-none print:overflow-visible">
          {/* TAB 1: NOTA / STRUK PEMBELIAN */}
          {activeTab === 'receipt' && (
            <div
              id="printable-receipt"
              className={`bg-white shadow-lg print:shadow-none transition-all ${
                receiptFormat === 'thermal'
                  ? 'w-[320px] p-5 font-mono text-stone-900 border border-stone-300 print:border-none print:w-[72mm] print:p-2'
                  : 'w-full max-w-[540px] p-8 text-stone-900 border border-stone-200 rounded-2xl print:border-none print:w-full print:p-4'
              }`}
            >
              {/* THERMAL / KASIR STYLE */}
              {receiptFormat === 'thermal' ? (
                <div className="text-xs space-y-3 leading-relaxed">
                  {/* Header Toko */}
                  <div className="text-center pb-2 border-b border-dashed border-stone-400">
                    <h2 className="font-black text-sm uppercase tracking-tight">{storeName}</h2>
                    <p className="text-[10px] text-stone-600 leading-tight mt-0.5">{storeTagline}</p>
                    <p className="text-[10px] text-stone-600 mt-1">{storeAddress}</p>
                    <p className="text-[10px] font-bold mt-0.5">WA: {storePhone}</p>
                  </div>

                  {/* Metadata Order */}
                  <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-stone-400">
                    <div className="flex justify-between">
                      <span className="text-stone-500">No. Nota:</span>
                      <span className="font-bold">{order.order_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tanggal:</span>
                      <span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Pemesan:</span>
                      <span className="font-bold">{order.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">No. HP:</span>
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Metode:</span>
                      <span className="font-bold uppercase">
                        {order.fulfillment_method === 'pickup' ? 'Ambil di Toko' : 'Kirim Manual'}
                      </span>
                    </div>
                    {order.fulfillment_method === 'delivery' && order.customer_address && (
                      <div className="pt-1 text-[10px] text-stone-700">
                        <span className="font-bold">Alamat:</span> {order.customer_address}
                      </div>
                    )}
                  </div>

                  {/* Daftar Item Pesanan */}
                  <div className="space-y-1.5 pb-2 border-b border-dashed border-stone-400">
                    <div className="font-bold text-[10px] uppercase text-stone-500 flex justify-between">
                      <span>Kue Kering</span>
                      <span>Total</span>
                    </div>
                    {order.items.map((it) => (
                      <div key={it.id} className="text-[11px]">
                        <div className="font-bold">{it.product_name}</div>
                        <div className="flex justify-between text-stone-600 text-[10px]">
                          <span>
                            {it.quantity} x {formatRupiah(it.price)} ({it.packaging || 'Toples'})
                          </span>
                          <span className="font-bold text-stone-900">{formatRupiah(it.subtotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Perhitungan Biaya */}
                  <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-stone-400">
                    <div className="flex justify-between">
                      <span>Total Toples:</span>
                      <span className="font-bold">{totalToples} Toples</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatRupiah(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkir:</span>
                      <span>{order.delivery_fee > 0 ? formatRupiah(order.delivery_fee) : 'Rp 0 (COD)'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black pt-1 border-t border-dotted border-stone-300">
                      <span>TOTAL BAYAR:</span>
                      <span className="text-sm">{formatRupiah(order.grand_total)}</span>
                    </div>
                  </div>

                  {/* Info Pembayaran & Catatan */}
                  <div className="text-[10px] text-stone-600 space-y-1 pb-2 border-b border-dashed border-stone-400">
                    <p className="font-bold text-stone-900">Pembayaran:</p>
                    <p>{paymentInfo}</p>
                    {order.customer_note && (
                      <p className="pt-1 italic">
                        <span className="font-bold not-italic">Catatan:</span> {order.customer_note}
                      </p>
                    )}
                  </div>

                  {/* Footer Ucapan Manis */}
                  <div className="text-center text-[10px] text-stone-600 pt-1 space-y-0.5">
                    <p className="font-bold">Terima Kasih atas Pesanan Anda!</p>
                    <p>Dibuat fresh & higienis dengan butter pilihan.</p>
                    <p className="font-mono text-[9px] text-stone-400 mt-1">*** SIMPAN BUKTI NOTA INI ***</p>
                  </div>
                </div>
              ) : (
                /* STANDARD INVOICE STYLE (A4 / A5) */
                <div className="text-xs space-y-5 leading-relaxed">
                  {/* Kop Surat Toko */}
                  <div className="flex justify-between items-start pb-4 border-b-2 border-stone-900">
                    <div>
                      <h2 className="text-lg font-black tracking-tight uppercase text-stone-950">
                        {storeName}
                      </h2>
                      <p className="text-xs text-stone-600 font-medium">{storeTagline}</p>
                      <p className="text-[11px] text-stone-500 mt-1 max-w-xs">{storeAddress}</p>
                      <p className="text-[11px] font-bold text-amber-800 mt-0.5">WhatsApp: {storePhone}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-lg bg-stone-100 font-mono font-black text-xs uppercase tracking-wider block">
                        NOTA PESANAN
                      </span>
                      <div className="text-sm font-black text-stone-900 mt-2 font-mono">
                        {order.order_code}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </div>
                    </div>
                  </div>

                  {/* Informasi Pemesan */}
                  <div className="grid grid-cols-2 gap-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        DITUJUKAN KEPADA:
                      </span>
                      <p className="font-bold text-stone-900 text-sm mt-0.5">{order.customer_name}</p>
                      <p className="text-stone-600 font-mono">{order.customer_phone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        METODE PENGAMBILAN:
                      </span>
                      <p className="font-bold text-stone-900 capitalize mt-0.5">
                        {order.fulfillment_method === 'pickup' ? '📍 Ambil Sendiri di Toko' : '🚚 Kirim ke Alamat'}
                      </p>
                      {order.fulfillment_method === 'delivery' && (
                        <p className="text-stone-600 text-[11px] mt-0.5">{order.customer_address}</p>
                      )}
                    </div>
                  </div>

                  {/* Tabel Rincian Kue */}
                  <div>
                    <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                      <thead className="bg-stone-100 font-bold text-stone-700 uppercase text-[10px] border-b border-stone-200">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">Varian Kue Kering</th>
                          <th className="py-2.5 px-3">Kemasan</th>
                          <th className="py-2.5 px-3 text-center">Jumlah</th>
                          <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-800">
                        {order.items.map((it, idx) => (
                          <tr key={it.id}>
                            <td className="py-2.5 px-3 font-mono text-stone-500">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-bold">{it.product_name}</td>
                            <td className="py-2.5 px-3 text-stone-600">{it.packaging || 'Toples 500g'}</td>
                            <td className="py-2.5 px-3 text-center font-black">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right">{formatRupiah(it.price)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                              {formatRupiah(it.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Ringkasan & Total */}
                  <div className="flex justify-between items-start pt-2">
                    <div className="max-w-xs text-[11px] text-stone-600 space-y-1">
                      <p className="font-bold text-stone-900">Petunjuk Pembayaran & Pengambilan:</p>
                      <p>{paymentInfo}</p>
                      {order.customer_note && (
                        <p className="pt-1 italic bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900">
                          <strong>Catatan:</strong> {order.customer_note}
                        </p>
                      )}
                    </div>

                    <div className="w-48 space-y-1.5 text-xs text-right">
                      <div className="flex justify-between text-stone-600">
                        <span>Total Toples:</span>
                        <span className="font-bold">{totalToples} Toples</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal:</span>
                        <span>{formatRupiah(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Ongkir:</span>
                        <span>{order.delivery_fee > 0 ? formatRupiah(order.delivery_fee) : 'Rp 0'}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-stone-950 pt-2 border-t-2 border-stone-900">
                        <span>Total Bayar:</span>
                        <span className="text-base text-amber-800">{formatRupiah(order.grand_total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tanda Tangan */}
                  <div className="pt-6 grid grid-cols-2 text-center text-[11px] text-stone-600">
                    <div>
                      <p>Penerima / Pembeli,</p>
                      <div className="h-14" />
                      <p className="font-bold underline">({order.customer_name})</p>
                    </div>
                    <div>
                      <p>Dapur Bu Natha,</p>
                      <div className="h-14" />
                      <p className="font-bold underline">( Bu Natha )</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LABEL PENGIRIMAN DUS (SHIPPING LABEL / PACKING SLIP) */}
          {activeTab === 'label' && (
            <div
              id="printable-label"
              className="w-full max-w-[500px] bg-white p-6 rounded-2xl border-2 border-dashed border-stone-800 shadow-lg text-stone-900 space-y-4 print:shadow-none print:w-full print:p-4 print:border-2 print:border-black"
            >
              {/* Header Pengirim & Fragile Sticker */}
              <div className="flex justify-between items-start pb-3 border-b-2 border-stone-900">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
                    PENGIRIM (FROM):
                  </span>
                  <h3 className="text-sm font-black uppercase text-stone-950">{storeName}</h3>
                  <p className="text-[11px] font-bold text-amber-800">WA: {storePhone}</p>
                  <p className="text-[10px] text-stone-600">{storeAddress}</p>
                </div>
                <div className="text-right">
                  <div className="px-2.5 py-1 rounded-lg bg-stone-950 text-white font-mono font-black text-xs">
                    {order.order_code}
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-1 font-semibold uppercase">
                    {order.fulfillment_method === 'pickup' ? '📍 AMBIL SENDIRI' : '🚚 KURIR PENGIRIMAN'}
                  </span>
                </div>
              </div>

              {/* Penerima / Kepada (Besar, Bold, Jelas untuk Kurir) */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-300 space-y-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 block">
                  KEPADA / PENERIMA (TO):
                </span>
                <div className="text-lg font-black text-stone-950 uppercase tracking-tight">
                  {order.customer_name}
                </div>
                <div className="text-sm font-black font-mono text-stone-900">
                  📱 {order.customer_phone}
                </div>
                <div className="text-xs text-stone-800 leading-snug pt-1">
                  <strong>Alamat:</strong>{' '}
                  {order.customer_address || 'Pengambilan langsung di tempat (Toko Bu Natha)'}
                </div>
                {order.customer_note && (
                  <div className="text-[11px] text-stone-700 pt-1 italic">
                    <strong>Catatan Kurir:</strong> &quot;{order.customer_note}&quot;
                  </div>
                )}
              </div>

              {/* Rincian Isi Paket Kue */}
              <div className="border border-stone-200 rounded-xl p-3 text-xs">
                <div className="flex justify-between font-bold text-[11px] text-stone-500 uppercase pb-1 border-b border-stone-200">
                  <span>Isi Paket Kue Kering:</span>
                  <span className="text-stone-950 font-black">{totalToples} Toples</span>
                </div>
                <ul className="divide-y divide-stone-100 text-[11px] mt-1">
                  {order.items.map((it) => (
                    <li key={it.id} className="py-1 flex justify-between">
                      <span className="font-semibold text-stone-800">
                        {it.quantity}x {it.product_name}
                      </span>
                      <span className="text-stone-500 font-mono">({it.packaging || 'Toples'})</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kotak Status Tagihan / COD */}
              <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-400 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
                    STATUS TAGIHAN:
                  </span>
                  <span className="text-xs font-bold text-amber-800">
                    {order.status === 'Selesai' ? 'LUNAS' : 'BAYAR SAAT TERIMA (COD / CASH)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-500 block">TOTAL TAGIHAN:</span>
                  <span className="text-base font-black text-stone-950">
                    {formatRupiah(order.grand_total)}
                  </span>
                </div>
              </div>

              {/* Stempel Peringatan Fragile (Sangat Penting untuk Kue Kering) */}
              <div className="p-2.5 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xl shrink-0">
                  ⚠️
                </div>
                <div className="text-[10px] sm:text-[11px] leading-tight font-black uppercase">
                  <span>MAKANAN MUDAH HANCUR (FRAGILE)!</span>
                  <span className="block font-normal text-[10px] text-rose-700 mt-0.5 normal-case">
                    Kue kering toples butter renyah. Jangan dibanting, jangan ditindih beban berat, jangan dibalik!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
