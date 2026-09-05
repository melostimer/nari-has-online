export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Clock, MapPin, Phone, Truck, Shield, Leaf } from "lucide-react";
import { HeroSlider } from "@/components/HeroSlider";

export const metadata: Metadata = {
  title: "Nar-ı Has — Kafe & Restoran",
  description: "Hamburger, pizza, tatlı ve kahve — hızlı teslimat, kapıda ödeme.",
};

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: { select: { name: true, emoji: true } } },
    take: 8,
    orderBy: { order: "asc" },
  });

  const sliderImages = await prisma.heroSliderImage.findMany({
    orderBy: { order: "asc" },
    select: { imageUrl: true },
  });

  return (
    <div className="bg-white min-h-screen">

      {/* ══ HERO ════════════════════════════════════════════ */}
      <HeroSlider images={sliderImages} />

      {/* ══ WHY US ══════════════════════════════════════════ */}
      <section className="bg-gray-50 border-b border-gray-100 px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {[
            { icon: Truck,  text: "Hızlı teslimat" },
            { icon: Leaf,   text: "Taze malzemeler" },
            { icon: Shield, text: "Kapıda güvenli ödeme" },
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
        <section className="max-w-6xl mx-auto px-4 pt-6 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">En Çok Tercih Edilenler</h2>
            <Link href="/menu" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-0.5">
              Tüm menü <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {featured.map((p) => (
              <Link
                key={p.id}
                href="/menu"
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-brand-200 hover:shadow-md active:scale-[0.97] transition-all"
              >
                <div className="relative h-28 bg-gray-50">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 280px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {p.category?.emoji ?? "🍽️"}
                    </div>
                  )}
                </div>
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href="/menu"
          className="flex items-center justify-center gap-2 w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-base rounded-2xl shadow-md transition-all"
        >
          Hemen Sipariş Ver
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/* ══ INFO ════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 text-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <Clock className="text-gray-400 w-5 h-5 flex-shrink-0" />
            <div className="text-gray-600 flex flex-col gap-1">
              <div><strong className="text-gray-800">Haftanın her günü:</strong> 11:00-24:00</div>
              <div className="text-brand-600 font-medium bg-brand-50 inline-block px-2 py-0.5 rounded text-sm w-fit">
                Paket Servis: 11:00-23:30
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <a href="https://maps.google.com/?q=Bağlar+Mahallesi+Atatürk+Bulvarı+No:40+Niksar/Tokat" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">
              Bağlar Mahallesi Atatürk Bulvarı No:40 Niksar/Tokat
            </a>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Phone className="text-brand-500 w-5 h-5 flex-shrink-0" />
            <a href="tel:+905016126060" className="text-brand-600 font-semibold hover:underline">
              +90 501 612 60 60
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
