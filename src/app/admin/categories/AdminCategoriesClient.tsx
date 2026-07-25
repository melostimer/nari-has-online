"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Pencil, Trash2, ListOrdered } from "lucide-react";

interface Category { id: string; name: string; emoji: string; order: number; _count?: { products: number } }
const emptyForm = { name: "", emoji: "", order: 0 };

export function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [modal, setModal] = useState<{ open: boolean; editing?: Category }>({ open: false });
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => { setForm({ ...emptyForm, order: categories.length + 1 }); setError(""); setModal({ open: true }); };
  const openEdit = (c: Category) => { setForm({ name: c.name, emoji: c.emoji, order: c.order }); setError(""); setModal({ open: true, editing: c }); };
  const closeModal = () => { setModal({ open: false }); setForm({ ...emptyForm }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.emoji) { setError("Isim ve emoji zorunludur"); return; }
    setLoading(true); setError("");
    
    const body = { ...form, order: Number(form.order) };
    const url = modal.editing ? `/api/admin/categories/${modal.editing.id}` : "/api/admin/categories";
    const method = modal.editing ? "PATCH" : "POST";
    
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Hata oluştu"); setLoading(false); return; }
    
    if (modal.editing) {
      setCategories(categories.map((c) => c.id === data.id ? { ...data, _count: c._count } : c).sort((a, b) => a.order - b.order));
    } else {
      setCategories([...categories, { ...data, _count: { products: 0 } }].sort((a, b) => a.order - b.order));
    }
    setLoading(false); closeModal();
  };

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) { alert("Bu kategoriye ait ürünler var. Silmeden önce ürünleri başka kategoriye taşıyın veya silin."); return; }
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Kategoriler</h1>
        <Button onClick={openAdd} size="md"><Plus className="h-4 w-4" /> Kategori Ekle</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Sıra</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Kategori Adı</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Ürün Sayısı</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="py-4 px-6"><div className="flex items-center gap-2 text-sm text-gray-500"><ListOrdered className="h-4 w-4" />{cat.order}</div></td>
                <td className="py-4 px-6"><div className="flex items-center gap-3"><span className="text-2xl">{cat.emoji}</span><span className="font-medium text-gray-900">{cat.name}</span></div></td>
                <td className="py-4 px-6"><span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">{cat._count?.products ?? 0} Ürün</span></td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(cat.id, cat._count?.products ?? 0)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.editing ? "Kategoriyi Düzenle" : "Yeni Kategori"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}
          <div className="flex gap-4">
            <div className="w-24">
              <Input id="emoji" label="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} required placeholder="🍕" />
            </div>
            <div className="flex-1">
              <Input id="name" label="Kategori Adı" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Örn: Pideler" />
            </div>
          </div>
          <Input id="order" label="Sıralama (Küçük olan önce çıkar)" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">Vazgeç</Button>
            <Button type="submit" className="flex-1" loading={loading}>{modal.editing ? "Güncelle" : "Ekle"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
