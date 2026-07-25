"use client";

import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
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
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: Number(product.price), imageUrl: product.imageUrl ?? undefined });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-brand-50 to-orange-50">
            {product.category?.emoji ?? "&#127997;"}
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-brand-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <Star className="h-3 w-3 fill-current" /> One Cikan
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl">Tukendi</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        {product.category && <span className="text-xs font-medium text-brand-500 mb-1">{product.category.emoji} {product.category.name}</span>}
        <h3 className="font-semibold text-gray-900 text-base mb-1 leading-tight">{product.name}</h3>
        {product.description && <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2 flex-1">{product.description}</p>}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <span className="text-lg font-bold text-gray-900">{formatPrice(Number(product.price))}</span>
          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAdd}
            disabled={!product.isAvailable}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${added ? "bg-green-500 text-white scale-95" : "bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-glow"} disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={`${product.name} sepete ekle`}
          >
            <ShoppingCart className="h-4 w-4" />
            {added ? "Eklendi!" : "Sepete Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
