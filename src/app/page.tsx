import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Clock, MapPin, Phone, Star, Shield, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Ana Sayfa | Nar-ı Has",
  description: "Nar-ı Has - Geleneksel Anadolu mutfağının en seçkin tatlarını online sipariş edin.",
};

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isAvailable: true },
    include: { category: { select: { name: true, emoji: true } } },
    take: 6,
  });
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  const features = [
    { icon: Truck, title: "Hızlı Teslimat", desc: "Ortalama 45 dakikada kapınızda" },
    { icon: Shield, title: "Güvenli Ödeme", desc: "Kapıda nakit veya kart ile güvenle ödeyin" },
    { icon: Star, title: "Seçkin Lezzetler", desc: "Geleneksel tariflerle hazırlanan özgün tatlar" },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-hero-gradient">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 25px 25px, white 2px, transparent 0)", backgroundSize: "50px 50px" }} />

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pomegranate-600/10 rounded-full blur-3xl" />

        <div className="section-container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-300 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-brand-500/30">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
                Online Sipariş Açık
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Geleneksel
                <span className="block text-gradient">Lezzetler</span>
                Kapınızda
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
                Nar-ı Has'ta yüzlerce yıllık Anadolu mutfağı geleneği, modern bir dokunuşla sofranızda. En taze malzemeler, en özgün tarifler.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-glow hover:shadow-none text-base">
                  Menüyü İncele
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/menu" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base">
                  Hemen Sipariş Ver
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-brand-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center">
                  <div className="mb-4 bg-white/80 p-5 rounded-3xl flex flex-col items-center gap-3">
                    <Image src="/icon.png" alt="Icon" width={64} height={64} className="object-contain" />
                    <Image src="/logo.png" alt="Nar-ı Has" width={160} height={50} className="object-contain" />
                  </div>
                  <p className="text-brand-300 text-sm">Geleneksel Anadolu Mutfağı</p>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">14+</div>
                      <div className="text-xs text-gray-400">Ürün</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">45dk</div>
                      <div className="text-xs text-gray-400">Teslimat</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">5/5</div>
                      <div className="text-xs text-gray-400">Puan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-card">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20">
          <div className="section-container">
            <div className="text-center mb-12">
              <span className="text-brand-500 font-semibold text-sm uppercase tracking-widest">En Popüler</span>
              <h2 className="font-display text-4xl font-bold text-gray-900 mt-2">Öne Çıkan Lezzetler</h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">Müşterilerimizin en çok tercih ettiği özgün tatlarımız</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                Tüm Menüyü Gör
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="py-20 bg-dark-950 text-white">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <Clock className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Çalışma Saatleri</h3>
                <div className="space-y-1 text-gray-400 text-sm">
                  <p>Pazartesi - Cuma: 11:00 - 23:00</p>
                  <p>Cumartesi - Pazar: 10:00 - 24:00</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Adresimiz</h3>
                <p className="text-gray-400 text-sm">Bağcılar Mah. Lezzet Sk. No:12</p>
                <p className="text-gray-400 text-sm">İstanbul, Türkiye</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <Phone className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Bize Ulaşın</h3>
                <a href="tel:+905550000000" className="text-brand-400 hover:text-brand-300 transition-colors">+90 555 000 00 00</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
