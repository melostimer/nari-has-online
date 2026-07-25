"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { Search } from "lucide-react";

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
      result = result.filter((p) => p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q)));
    }
    return result;
  }, [products, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark-950 text-white py-12">
        <div className="section-container text-center flex flex-col items-center">
          <div className="mb-4 bg-white p-4 rounded-3xl inline-flex flex-col items-center gap-2 shadow-lg">
            <Image src="/icon.png" alt="Icon" width={48} height={48} className="object-contain" />
            <Image src="/logo.png" alt="Nar-ı Has" width={140} height={40} className="object-contain" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">Menümüzü Keşfedin</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Geleneksel tariflerle hazırlanan, taze malzemelerle sunulan lezzetlerimiz</p>
        </div>
      </div>

      <div className="section-container py-8">
        {/* Search */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Yemek ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 shadow-card"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              selectedCategory === null ? "bg-brand-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Tümü
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                selectedCategory === cat.id ? "bg-brand-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span>{cat.emoji}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">&#129325;</p>
            <p className="font-semibold text-gray-700">Ürün bulunamadı</p>
            <p className="text-gray-400 text-sm mt-1">Farklı bir arama deneyin</p>
          </div>
        ) : (
          <div>
            {(selectedCategory ? categories.filter(c => c.id === selectedCategory) : categories).map((cat) => {
              const catProducts = filtered.filter((p) => p.categoryId === cat.id);
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id} className="mb-12">
                  <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>{cat.emoji}</span> {cat.name}
                    <span className="text-sm font-normal text-gray-400 ml-2">({catProducts.length} ürün)</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
    </div>
  );
}
