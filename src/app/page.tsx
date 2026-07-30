export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Clock, MapPin, Phone, Truck, Shield, Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "Nar-ı Has — Geleneksel Anadolu Mutfağı",
  description: "Geleneksel Anadolu lezzetleri kapınızda. Ortalama 45 dk teslimat, kapıda ödeme.",
};

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: { select: { name: true, emoji: true } } },
    take: 4,
    orderBy: { order: "asc" },
  });

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1a0500 0%, #7c1a0a 45%, #c2410c 100%)",
          minHeight: "clamp(300px, 55vh, 480px)",
        }}
      >
        {/* Subtle texture dots */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* Warm glow */}
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #fb923c, transparent)" }} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 py-14 h-full"
          style={{ minHeight: "clamp(300px, 55vh, 480px)" }}>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-orange-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Sipariş Açık
          </span>

          {/* Logo + name */}
          <div className="flex items-center gap-3 mb-3">
            <Image src="/icon.png" alt="Nar-ı Has" width={48} height={48} className="object-contain drop-shadow-lg" />
            <Image src="/logo.png" alt="Nar-ı Has" width={150} height={42} className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }} />
          </div>

          <p className="text-orange-200 text-sm font-medium mb-8 tracking-wide">
            Geleneksel Anadolu Mutfağı
          </p>

          {/* Primary CTA */}
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Menüyü İncele &amp; Sipariş Ver
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Tagline */}
          <p className="text-white/50 text-xs mt-5 flex items-center gap-2 flex-wrap justify-center">
            <span>🚚 Ortalama 45 dk teslimat</span>
            <span className="opacity-40">·</span>
            <span>💳 Kapıda nakit veya kart</span>
            <span className="opacity-40">·</span>
            <span>📍 İstanbul geneli</span>
          </p>
        </div>
      </section>

      {/* ══ WHY US — 3 items ════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {[
            { icon: Truck,  text: "Hızlı teslimat" },
            { icon: Leaf,   text: "Taze malzemeler" },
            { icon: Shield, text: "Güvenli kapıda ödeme" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-brand-600" />
              </div>
              <span className="font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURED TEASERS ════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="max-w-xl mx-auto px-4 pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">En Çok Tercih Edilenler</h2>
            <Link href="/menu" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-0.5">
              Tüm menü <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <Link
                key={p.id}
                href="/menu"
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand-200 hover:shadow-md active:scale-[0.97] transition-all"
              >
                {/* Image */}
                <div className="relative h-28 bg-orange-50">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 280px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {p.category?.emoji ?? "🍽️"}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{p.name}</p>
                  <p className="text-sm font-bold text-brand-600 mt-0.5">{formatPrice(Number(p.price))}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══ SECOND CTA ══════════════════════════════════════ */}
      <div className="max-w-xl mx-auto px-4 py-6">
        <Link
          href="/menu"
          className="flex items-center justify-center gap-2 w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-md transition-all"
        >
          Hemen Sipariş Ver
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* ══ INFO ════════════════════════════════════════════ */}
      <section className="max-w-xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 text-sm">
          <div className="flex items-center gap-3 px-4 py-3 text-gray-600">
            <Clock className="h-4 w-4 text-gray-400 shrink-0" />
            <span><strong className="text-gray-800">Pzt–Cum:</strong> 11:00–23:00 &nbsp;·&nbsp; <strong className="text-gray-800">Cts–Paz:</strong> 10:00–24:00</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <span>Bağcılar Mah. Lezzet Sk. No:12, İstanbul</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <a href="tel:+905550000000" className="text-brand-600 font-semibold hover:underline">+90 555 000 00 00</a>
          </div>
        </div>
      </section>

    </div>
  );
}
