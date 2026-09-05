"use client";

import { useState, useRef } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Star } from "lucide-react";
import Image from "next/image";

interface Category { id: string; name: string; emoji: string; }
interface Product {
  id: string; name: string; description?: string | null;
  price: any; imageUrl?: string | null; isAvailable: boolean;
  isFeatured: boolean; categoryId: string; category: Category; order: number;
}

const emptyForm = {
  categoryId: "", name: "", description: "", price: "",
  imageBase64: "", imageUrl: "", isAvailable: true, isFeatured: false, order: 0,
};

export function AdminProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [modal, setModal] = useState<{ open: boolean; editing?: Product }>({ open: false });
  const [form, setForm] = useState({ ...emptyForm });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const openAdd = () => {
    setForm({ ...emptyForm, categoryId: selectedCategory ?? "" });
    setPreview("");
    setError("");
    setModal({ open: true });
  };

  const openEdit = (p: Product) => {
    setForm({
      categoryId: p.categoryId, name: p.name,
      description: p.description ?? "", price: String(Number(p.price)),
      imageBase64: "", imageUrl: p.imageUrl ?? "",
      isAvailable: p.isAvailable, isFeatured: p.isFeatured, order: p.order,
    });
    setPreview(p.imageUrl ?? "");
    setError("");
    setModal({ open: true, editing: p });
  };

  const closeModal = () => {
    setModal({ open: false });
    setForm({ ...emptyForm });
    setPreview("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setPreview(base64);
      setForm((f) => ({ ...f, imageBase64: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId || !form.name || !form.price) {
      setError("Kategori, isim ve fiyat zorunludur");
      return;
    }
    setLoading(true);
    setError("");
    const body = { ...form, price: parseFloat(form.price) };
    const url = modal.editing ? `/api/admin/products/${modal.editing.id}` : "/api/admin/products";
    const method = modal.editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Hata oluştu");
      setLoading(false);
      return;
    }
    if (modal.editing) {
      setProducts(products.map((p) => p.id === data.id ? data : p));
    } else {
      setProducts([...products, data]);
    }
    setLoading(false);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Silme başarısız: ${data?.error || res.statusText}`);
      }
    } catch (err) {
      alert("Bağlantı hatası: Sayfa yenilenip tekrar denensin.");
      console.error("Delete error:", err);
    }
  };


  const toggleAvailable = async (p: Product) => {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !p.isAvailable }),
    });
    if (res.ok) {
      setProducts(products.map((pr) => pr.id === p.id ? { ...pr, isAvailable: !p.isAvailable } : pr));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
        <Button onClick={openAdd} size="md">
          <Plus className="h-4 w-4" /> Ürün Ekle
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selectedCategory === null
              ? "bg-brand-600 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Tümü
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              selectedCategory === cat.id
                ? "bg-brand-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            <span>{cat.emoji}</span> {cat.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ürün</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fiyat</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Durum</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            {product.category.emoji}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          {product.name}
                          {product.isFeatured && <Star className="h-3.5 w-3.5 text-brand-500 fill-current" />}
                        </p>
                        {product.description && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">{product.category.emoji} {product.category.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">{formatPrice(Number(product.price))}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleAvailable(product)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        product.isAvailable
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {product.isAvailable
                        ? <><Eye className="h-3 w-3" /> Aktif</>
                        : <><EyeOff className="h-3 w-3" /> Tükendi</>}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                        aria-label="Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        aria-label="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>Henüz ürün eklenmemiş</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Modal isOpen={modal.open} onClose={closeModal} title={modal.editing ? "Ürünü Düzenle" : "Yeni Ürün Ekle"} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Kategori seçin</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          <Input
            id="prod-name"
            label="Ürün Adı"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Örnek: Adana Kebap"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Ürün açıklaması..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
            />
          </div>

          <Input
            id="prod-price"
            label="Fiyat (TL)"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            placeholder="0.00"
          />

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ürün Fotoğrafı</label>
            <div className="flex gap-3 items-start">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-all"
              >
                <Upload className="h-4 w-4" /> Fotoğraf Seç
              </button>
              {preview && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                  <Image src={preview} alt="Önizleme" width={64} height={64} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {!form.imageBase64 && form.imageUrl && (
              <p className="text-xs text-gray-400 mt-1">Mevcut fotoğraf korunacak</p>
            )}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600"
              />
              <span className="text-sm text-gray-700">Stokta var</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-brand-600"
              />
              <span className="text-sm text-gray-700">Öne çıkan</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Vazgeç</Button>
            <Button type="submit" className="flex-1" loading={loading}>
              {modal.editing ? "Güncelle" : "Ekle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
