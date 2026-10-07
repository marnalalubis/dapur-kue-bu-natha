'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Store,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { StoreSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setErrorMessage('');

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      setSettings(data.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500">Memuat pengaturan toko...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-amber-600" />
          <span>Pengaturan Toko & Operasional</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Atur nama toko, kontak WhatsApp tujuan konfirmasi, alamat penjemputan, dan status buka/tutup toko.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan toko berhasil disimpan dan diperbarui!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Mode Buka / Tutup Sementara */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Store className="w-4 h-4 text-amber-600" />
            <span>Status Operasional Toko</span>
          </h2>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
            <div>
              <span className="font-bold text-sm text-stone-900 block">
                {settings.is_store_open ? 'Toko Sedang Buka (Menerima Pesanan)' : 'Toko Ditutup Sementara'}
              </span>
              <p className="text-xs text-stone-500 mt-0.5">
                Jika dinonaktifkan, pembeli tetap bisa melihat katalog namun tombol checkout akan dinonaktifkan.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSettings({ ...settings, is_store_open: !settings.is_store_open })
              }
              className={`w-14 h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                settings.is_store_open ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                  settings.is_store_open ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {!settings.is_store_open && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Pesan Alasan Tutup (Ditampilkan kepada Pembeli)
              </label>
              <input
                type="text"
                value={settings.closed_reason || ''}
                onChange={(e) =>
                  setSettings({ ...settings, closed_reason: e.target.value })
                }
                placeholder="Contoh: Toko sedang dalam masa pemeliharaan oven rutin hingga besok."
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-900"
              />
            </div>
          )}
        </div>

        {/* Informasi Utama */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Phone className="w-4 h-4 text-amber-600" />
            <span>Kontak & Identitas Toko</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nama Toko
              </label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) =>
                  setSettings({ ...settings, store_name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nomor WhatsApp Toko (Tujuan Pesanan Masuk)
              </label>
              <input
                type="text"
                required
                value={settings.store_phone}
                onChange={(e) =>
                  setSettings({ ...settings, store_phone: e.target.value })
                }
                placeholder="081234567890"
                className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={settings.store_tagline}
              onChange={(e) =>
                setSettings({ ...settings, store_tagline: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Alamat Penjemputan Toko (Pickup)
            </label>
            <textarea
              rows={2}
              value={settings.store_address}
              onChange={(e) =>
                setSettings({ ...settings, store_address: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Instruksi Penjemputan (Jam Operasional)
            </label>
            <input
              type="text"
              value={settings.pickup_instructions}
              onChange={(e) =>
                setSettings({ ...settings, pickup_instructions: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Keterangan Pembayaran Offline & Rekening Rujukan
            </label>
            <input
              type="text"
              value={settings.payment_info}
              onChange={(e) =>
                setSettings({ ...settings, payment_info: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 text-sm text-stone-900"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
