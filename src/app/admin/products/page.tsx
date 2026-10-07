'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
  Camera,
  Loader2,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { formatRupiah } from '@/lib/format';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formPackaging, setFormPackaging] = useState('Toples 500g');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formReadyStock, setFormReadyStock] = useState('0');
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file terlalu besar. Maksimal 5 MB.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengunggah foto.');
      }

      setFormImageUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah foto';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);

      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || 'cat-1');
    setFormPrice('');
    setFormPackaging('Toples 500g');
    setFormDescription('');
    setFormImageUrl('');
    setFormIsAvailable(true);
    setFormReadyStock('0');
    setImageInputMode('upload');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategoryId(p.category_id);
    setFormPrice(p.price.toString());
    setFormPackaging(p.packaging || 'Toples 500g');
    setFormDescription(p.description);
    setFormImageUrl(p.image_url);
    setFormIsAvailable(p.is_available);
    setFormReadyStock((p.ready_stock ?? 0).toString());
    setImageInputMode('upload');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleQuickUpdateStock = async (p: Product, newStock: number) => {
    const safeVal = Math.max(0, newStock);
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, ready_stock: safeVal } : item))
    );
    setUpdatingStockId(p.id);
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ready_stock: safeVal }),
      });
    } catch (err) {
      console.error('Failed to quick update stock', err);
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleToggleAvailability = async (p: Product) => {
    try {
      const nextAvailable = !p.is_available;
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: nextAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? data.data : item))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        name: formName,
        category_id: formCategoryId,
        price: Number(formPrice),
        packaging: formPackaging,
        description: formDescription,
        image_url: formImageUrl,
        is_available: formIsAvailable,
        ready_stock: Math.max(0, parseInt(formReadyStock, 10) || 0),
      };

      if (editingProduct) {
        // Edit existing
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error);

        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? data.data : item))
        );
      } else {
        // Create new
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error);

        setProducts((prev) => [...prev, data.data]);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan produk';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus produk "${name}" dari katalog?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-amber-600" />
            <span>Katalog Kue Kering</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Kelola daftar menu kue, harga per toples, dan switch ketersediaan stok.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kue Baru</span>
        </button>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500">Memuat katalog produk...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50 text-stone-500 text-[11px] uppercase font-bold border-b border-stone-100">
                <tr>
                  <th className="py-3 px-4">Foto & Nama Kue</th>
                  <th className="py-3 px-4">Kemasan</th>
                  <th className="py-3 px-4">Harga / Toples</th>
                  <th className="py-3 px-4">Stok Ready</th>
                  <th className="py-3 px-4">Status Ketersediaan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=150&q=80';
                        }}
                      />
                      <div>
                        <div className="font-bold text-stone-900">{p.name}</div>
                        <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                          {p.description}
                        </div>
                      </div>
                    </td>

                    {/* Packaging */}
                    <td className="py-3.5 px-4 font-semibold text-stone-600">
                      {p.packaging || 'Toples 500g'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-black text-stone-900">
                      {formatRupiah(p.price)}
                    </td>

                    {/* Ready Stock Stepper */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-stone-50 px-2 py-1 rounded-xl border border-stone-200">
                        <button
                          type="button"
                          onClick={() => handleQuickUpdateStock(p, Math.max(0, (p.ready_stock || 0) - 1))}
                          disabled={(p.ready_stock || 0) <= 0 || updatingStockId === p.id}
                          className="w-6 h-6 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 disabled:opacity-30 text-stone-700 font-bold flex items-center justify-center text-xs shadow-2xs"
                          title="Kurangi stok"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-xs text-stone-900">
                          {p.ready_stock || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickUpdateStock(p, (p.ready_stock || 0) + 1)}
                          disabled={updatingStockId === p.id}
                          className="w-6 h-6 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold flex items-center justify-center text-xs shadow-2xs"
                          title="Tambah stok"
                        >
                          +
                        </button>
                        <span className="text-[10px] font-semibold text-stone-400">Toples</span>
                      </div>
                    </td>

                    {/* Availability Switch */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleAvailability(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          p.is_available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                        title="Klik untuk mengubah ketersediaan"
                      >
                        <span className={`w-2 h-2 rounded-full ${p.is_available ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{p.is_available ? 'Tersedia' : 'Habis'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Edit Kue"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-xl border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900">
                {editingProduct ? 'Edit Kue Kering' : 'Tambah Kue Kering Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="m-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Kue <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Nastar Wisman Keju"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Harga Satuan (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="95000"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ukuran Kemasan
                  </label>
                  <input
                    type="text"
                    value={formPackaging}
                    onChange={(e) => setFormPackaging(e.target.value)}
                    placeholder="Toples 500g"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Stok Ready (Toples)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formReadyStock}
                    onChange={(e) => setFormReadyStock(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Status Awal
                  </label>
                  <select
                    value={formIsAvailable ? 'true' : 'false'}
                    onChange={(e) => setFormIsAvailable(e.target.value === 'true')}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                  >
                    <option value="true">Tersedia (Bisa dipesan)</option>
                    <option value="false">Habis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Deskripsi Kue
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Kelezatan butter, rasa, dan tekstur..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                />
              </div>

              {/* Foto Kue Section - Mode Upload File Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">
                    Foto Kue Kering
                  </label>
                  <button
                    type="button"
                    onClick={() => setImageInputMode(imageInputMode === 'upload' ? 'url' : 'upload')}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
                  >
                    {imageInputMode === 'upload' ? 'Gunakan tautan URL' : 'Upload file gambar'}
                  </button>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                    />

                    {formImageUrl ? (
                      <div className="relative rounded-2xl border border-stone-200 overflow-hidden bg-stone-50 p-3 flex items-center gap-3">
                        <img
                          src={formImageUrl}
                          alt="Preview Kue"
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-white shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-stone-800 block truncate">
                            Foto Berhasil Dipilih
                          </span>
                          <span className="text-[11px] text-stone-400 block truncate font-mono">
                            {formImageUrl}
                          </span>
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors"
                            >
                              Ganti Foto
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormImageUrl('')}
                              className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                          isUploading
                            ? 'border-amber-400 bg-amber-50/50'
                            : 'border-stone-200 hover:border-amber-500 hover:bg-amber-50/30'
                        }`}
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                            <span className="text-xs font-bold text-amber-800">
                              Mengunggah foto kue...
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-1.5">
                            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-stone-800">
                              Klik untuk Unggah Foto dari Komputer / HP
                            </span>
                            <span className="text-[11px] text-stone-400">
                              Format: JPG, PNG, atau WebP (Maksimal 5 MB)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
