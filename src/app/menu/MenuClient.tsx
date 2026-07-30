"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { StickyCartBar } from "@/components/StickyCartBar";

interface Category { id: string; name: string; emoji: string; }
interface Product {
  id: string; name: string; description?: string | null;
  price: any; imageUrl?: string | null; isAvailable: boolean;
  isFeatured?: boolean; categoryId: string;
  category: { id: string; name: string; emoji: string };
}

export function MenuClient({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCategory) result = result.filter((p) => p.categoryId === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [products, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 md:pb-8">

      {/* Compact top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-0">

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Yemek ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-all"
            />
          </div>

          {/* Category pills — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === null
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tümü
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product list */}
      <div className="max-w-5xl mx-auto px-4 pt-5">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🤔</p>
            <p className="font-semibold text-gray-700">Ürün bulunamadı</p>
            <p className="text-gray-400 text-sm mt-1">Farklı bir arama deneyin</p>
          </div>
        ) : (
          <div className="space-y-8">
            {(selectedCategory
              ? categories.filter((c) => c.id === selectedCategory)
              : categories
            ).map((cat) => {
              const catProducts = filtered.filter((p) => p.categoryId === cat.id);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{cat.emoji}</span>
                    <h2 className="text-lg font-bold text-gray-900">{cat.name}</h2>
                    <span className="text-xs text-gray-400 font-medium">{catProducts.length} ürün</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {catProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky bottom cart bar */}
      <StickyCartBar />
    </div>
  );
}
