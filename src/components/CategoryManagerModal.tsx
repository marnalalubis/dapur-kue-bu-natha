'use client';

import React, { useState } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
  Loader2,
} from 'lucide-react';
import { Category, Product } from '@/types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: Product[];
  onCategoryChange: (newCategories: Category[], newlyCreatedId?: string) => void;
}

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories,
  products,
  onCategoryChange,
}: CategoryManagerModalProps) {
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Editing state: id of category currently being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Feedback messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const getProductCountForCategory = (catId: string) => {
    return products.filter((p) => p.category_id === catId).length;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setMessage({ type: 'error', text: 'Nama kategori tidak boleh kosong.' });
      return;
    }

    // Check duplicate
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setMessage({ type: 'error', text: 'Kategori dengan nama ini sudah ada.' });
      return;
    }

    try {
      setIsAdding(true);
      setMessage(null);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menambahkan kategori');
      }

      const created: Category = data.data;
      const updatedList = [...categories, created];
      onCategoryChange(updatedList, created.id);
      setNewCatName('');
      setMessage({ type: 'success', text: `Kategori "${created.name}" berhasil ditambahkan!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menambah kategori';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (catId: string) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setMessage({ type: 'error', text: 'Nama kategori tidak boleh kosong.' });
      return;
    }

    // Check duplicate with another category
    if (
      categories.some(
        (c) => c.id !== catId && c.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setMessage({ type: 'error', text: 'Kategori dengan nama ini sudah ada.' });
      return;
    }

    try {
      setIsUpdating(true);
      setMessage(null);
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperbarui kategori');
      }

      const updated: Category = data.data;
      const updatedList = categories.map((c) => (c.id === catId ? updated : c));
      onCategoryChange(updatedList);
      setEditingId(null);
      setEditName('');
      setMessage({ type: 'success', text: `Kategori berhasil diubah menjadi "${updated.name}"!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengedit kategori';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const count = getProductCountForCategory(cat.id);
    if (count > 0) {
      setMessage({
        type: 'error',
        text: `Kategori "${cat.name}" tidak dapat dihapus karena masih digunakan oleh ${count} kue. Ubah kategori kue tersebut terlebih dahulu.`,
      });
      return;
    }

    if (!confirm(`Hapus kategori "${cat.name}"?`)) {
      return;
    }

    try {
      setDeletingId(cat.id);
      setMessage(null);
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus kategori');
      }

      const updatedList = categories.filter((c) => c.id !== cat.id);
      onCategoryChange(updatedList);
      setMessage({ type: 'success', text: `Kategori "${cat.name}" berhasil dihapus.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus kategori';
      setMessage({ type: 'error', text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-700">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Kelola Kategori Kue</h3>
              <p className="text-[11px] text-stone-500">
                Tambah kategori baru atau edit kategori yang sudah ada
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Feedback Banner */}
          {message && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-800 border border-rose-200/60'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          {/* Form Tambah Kategori */}
          <form
            onSubmit={handleAddCategory}
            className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-3"
          >
            <label className="block text-xs font-bold text-amber-900">
              + Tambah Kategori Baru
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Contoh: Kue Tradisional & Basah"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                disabled={isAdding}
              />
              <button
                type="submit"
                disabled={isAdding || !newCatName.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-600/20 transition-all shrink-0"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Daftar Kategori */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold text-stone-700">
                Daftar Kategori ({categories.length})
              </label>
              <span className="text-[11px] text-stone-400">
                Klik ikon pensil untuk mengubah nama
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isEditingThis = editingId === cat.id;
                const count = getProductCountForCategory(cat.id);
                const isDeletingThis = deletingId === cat.id;

                if (isEditingThis) {
                  return (
                    <div
                      key={cat.id}
                      className="p-2.5 rounded-xl border border-amber-400 bg-amber-50/40 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(cat.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-hidden focus:border-amber-500"
                        disabled={isUpdating}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={isUpdating || !editName.trim()}
                        className="p-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                        title="Simpan Perubahan"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isUpdating}
                        className="p-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg transition-colors"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-bold text-xs text-stone-900 truncate">
                        {cat.name}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600 shrink-0"
                        title={`${count} produk menggunakan kategori ini`}
                      >
                        <Package className="w-2.5 h-2.5" />
                        <span>{count} kue</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-100/60 rounded-lg transition-colors"
                        title="Ubah / Edit Nama Kategori"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={isDeletingThis}
                        className={`p-1.5 rounded-lg transition-colors ${
                          count > 0
                            ? 'text-stone-300 hover:text-stone-400 cursor-not-allowed'
                            : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={
                          count > 0
                            ? `Tidak dapat dihapus (${count} kue masih menggunakan kategori ini)`
                            : 'Hapus Kategori'
                        }
                      >
                        {isDeletingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="py-6 text-center text-xs text-stone-400">
                  Belum ada kategori. Silakan tambahkan kategori baru di atas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
