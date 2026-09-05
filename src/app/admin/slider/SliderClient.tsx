"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SliderImage = {
  id: string;
  imageUrl: string;
  order: number;
};

export function SliderClient({ initialImages }: { initialImages: SliderImage[] }) {
  const [images, setImages] = useState<SliderImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        const res = await fetch("/api/admin/slider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64data,
            order: images.length,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          window.alert(err.error || "Yükleme başarısız");
          setUploading(false);
          return;
        }

        const newImage = await res.json();
        setImages((prev) => [...prev, newImage]);
        window.alert("Görsel başarıyla eklendi");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      window.alert("Yükleme sırasında hata oluştu");
      setUploading(false);
    } finally {
      // Clear input so same file can be uploaded again if needed
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/slider/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        window.alert("Silinemedi");
        setDeletingId(null);
        return;
      }

      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      window.alert("Silme hatası");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Mevcut Görseller</h2>
        <div>
          <input
            type="file"
            id="slider-upload"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button type="button" disabled={uploading} onClick={() => document.getElementById('slider-upload')?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Yeni Görsel Ekle
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-2">Henüz hiç slider görseli yüklemediniz.</p>
          <p className="text-sm text-gray-400">İlk görselinizi eklemek için yukarıdaki butonu kullanın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, index) => (
            <div key={img.id} className="relative group bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
              <div className="aspect-video relative">
                <Image
                  src={img.imageUrl}
                  alt={`Slider ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(img.id)}
                  disabled={deletingId === img.id}
                  className="p-2 bg-white/90 text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-colors"
                >
                  {deletingId === img.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="p-3 text-xs text-gray-500 font-medium">
                Sıra: {img.order + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
