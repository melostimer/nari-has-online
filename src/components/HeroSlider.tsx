"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const defaultSlides = [
  "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop", // Burger
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop", // Pizza
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1200&auto=format&fit=crop", // Dessert
  "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200&auto=format&fit=crop", // Coffee
];

export function HeroSlider({ images }: { images?: { imageUrl: string }[] }) {
  const [current, setCurrent] = useState(0);

  const slides = images && images.length > 0 ? images.map(img => img.imageUrl) : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full min-h-[450px] sm:min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      {slides.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark Overlay (always on) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 text-center px-5 flex flex-col items-center w-full max-w-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <Image src="/icon.png" alt="Nar-ı Has" width={80} height={80} className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] brightness-0 invert" />
          <Image src="/logo.png" alt="Nar-ı Has" width={240} height={68} className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] brightness-0 invert -mt-6" />
        </div>

        {/* Slogan */}
        <p className="text-white text-sm md:text-base font-medium mb-8 [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">
          Lezzetli Anlar, Hızlı Teslimat
        </p>

        {/* Primary CTA */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-base px-8 py-4 rounded-2xl shadow-lg transition-all w-full sm:w-auto justify-center"
        >
          Menüyü İncele &amp; Sipariş Ver
          <ArrowRight className="h-5 w-5" />
        </Link>

        {/* Tagline */}
        <p className="text-white/90 text-xs mt-6 mb-6 flex items-center gap-2 flex-wrap justify-center [text-shadow:_0_2px_8px_rgba(0,0,0,0.8)]">
          <span>🚚 Ortalama 45 dk teslimat</span>
          <span>·</span>
          <span>💳 Kapıda nakit veya kart</span>
        </p>

        {/* Badge (Moved to bottom) */}
        <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Sipariş Açık
        </span>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current ? "bg-brand-500 scale-150" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
