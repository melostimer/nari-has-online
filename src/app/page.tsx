export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Clock, MapPin, Phone, Truck, Shield, Star } from "lucide-react";
import { HomeProductList } from "@/components/HomeProductList";
import { StickyCartBar } from "@/components/StickyCartBar";

export const metadata: Metadata = {
  title: "Ana Sayfa | Nar-ı Has",
  description: "Nar-ı Has - Geleneksel Anadolu mutfağının en seçkin tatlarını online sipariş edin.",
};

export default async function HomePage() {
  const [featured, categories, allProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isAvailable: true },
      include: { category: { select: { name: true, emoji: true } } },
      take: 8,
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.findMany({
      where: { isAvailable: true },
      include: { category: { select: { id: true, name: true, emoji: true } } },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    }),
  ]);

  return (
    <div className="bg-gray-50 min-h-screen pb-28 md:pb-0">

      {/* ── Compact Hero ─────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 px-4 py-5">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Image src="/icon.png" alt="Nar-ı Has" width={44} height={44} className="object-contain" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Nar-ı Has</h1>
              <p className="text-xs text-gray-500">Geleneksel Anadolu Mutfağı • Online Sipariş</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs shrink-0">
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              Sipariş Açık
            </span>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Menüye Git <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Slim Features Strip ───────────────────────── */}
      <section className="bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 flex-wrap text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-brand-500" />Ortalama 45 dk teslimat</span>
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-brand-500" />Kapıda ödeme</span>
          <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-brand-500" />Taze & özgün tarifler</span>
        </div>
      </section>

      {/* ── Featured Products List ────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 mt-5">
        {featured.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">⭐ Öne Çıkanlar</h2>
              <Link href="/menu" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-0.5">
                Tümü <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <HomeProductList products={featured} />
          </section>
        )}

        {/* ── All Products by Category ───────────────── */}
        {categories.map((cat) => {
          const catProducts = allProducts.filter((p) => (p.category as any).id === cat.id && !featured.find(f => f.id === p.id));
          if (catProducts.length === 0) return null;
          return (
            <section key={cat.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{cat.emoji}</span>
                <h2 className="text-base font-bold text-gray-900">{cat.name}</h2>
                <span className="text-xs text-gray-400">{catProducts.length} ürün</span>
              </div>
              <HomeProductList products={catProducts} />
            </section>
          );
        })}
      </div>

      {/* ── Info Strip ───────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 mt-2 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <Clock className="h-4 w-4 text-gray-400 shrink-0" />
            <div>
              <span className="text-gray-900 font-medium">Pzt–Cum:</span>
              <span className="text-gray-500 ml-1">11:00–23:00</span>
              <span className="mx-2 text-gray-300">·</span>
              <span className="text-gray-900 font-medium">Cts–Paz:</span>
              <span className="text-gray-500 ml-1">10:00–24:00</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-600">Bağcılar Mah. Lezzet Sk. No:12, İstanbul</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <a href="tel:+905550000000" className="text-brand-600 font-medium hover:underline">+90 555 000 00 00</a>
          </div>
        </div>
      </section>

      <StickyCartBar />
    </div>
  );
}
