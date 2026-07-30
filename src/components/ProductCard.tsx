"use client";

import Image from "next/image";
import { Plus, Check, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: any;
  imageUrl?: string | null;
  isAvailable: boolean;
  isFeatured?: boolean;
  category?: { name: string; emoji: string };
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!product.isAvailable) return;
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.imageUrl ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-row sm:flex-col active:scale-[0.98] transition-transform">
      
      {/* Image — left on mobile, top on sm+ */}
      <div className="relative w-28 sm:w-full h-auto sm:h-44 flex-shrink-0 bg-gray-100">
        <div className="relative w-28 h-28 sm:w-full sm:h-44">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-50 to-red-50">
              {product.category?.emoji ?? "🍽️"}
            </div>
          )}
        </div>
        {product.isFeatured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-current" /> Öne Çıkan
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Tükendi</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-between p-3 sm:p-4 sm:flex-col sm:items-stretch gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-1 sm:line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 sm:line-clamp-2 leading-relaxed hidden sm:block">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end sm:flex-row sm:items-center sm:justify-between sm:mt-3 sm:pt-3 sm:border-t sm:border-gray-50 gap-2 shrink-0">
          <span className="text-base font-bold text-gray-900 whitespace-nowrap">
            {formatPrice(Number(product.price))}
          </span>
          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAdd}
            disabled={!product.isAvailable}
            aria-label={`${product.name} sepete ekle`}
            className={`flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] px-3 sm:px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              added
                ? "bg-green-500 text-white scale-95"
                : "bg-brand-600 hover:bg-brand-700 active:scale-95 text-white"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? (
              <Check className="h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ekle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
