"use client";

import Image from "next/image";
import { Plus, Check } from "lucide-react";
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

function ProductRow({ product }: { product: Product }) {
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
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="flex items-center gap-3 py-3 px-0">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-orange-50">
            {product.category?.emoji ?? "🍽️"}
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">Tükendi</span>
          </div>
        )}
      </div>

      {/* Name + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{product.name}</p>
          {product.isFeatured && (
            <span className="shrink-0 text-[10px] font-bold bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full leading-none">⭐</span>
          )}
        </div>
        {product.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
        )}
      </div>

      {/* Price + add */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-gray-900">{formatPrice(Number(product.price))}</span>
        <button
          id={`home-add-${product.id}`}
          onClick={handleAdd}
          disabled={!product.isAvailable}
          aria-label={`${product.name} sepete ekle`}
          className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold transition-all active:scale-90 ${
            added
              ? "bg-green-500 text-white"
              : "bg-brand-600 hover:bg-brand-700 text-white"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function HomeProductList({ products }: { products: Product[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 px-4">
      {products.map((product) => (
        <ProductRow key={product.id} product={product} />
      ))}
    </div>
  );
}
