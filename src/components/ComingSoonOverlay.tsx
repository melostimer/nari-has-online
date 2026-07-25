"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function ComingSoonOverlay() {
  const pathname = usePathname();
  
  // Eğer kullanıcı /admin veya /auth (giriş) sayfalarındaysa bu ekranı GÖSTERME
  const isBypassed = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');
  
  if (isBypassed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-brand-300/40 rounded-full mix-blend-multiply blur-[100px] animate-blob" />
        <div className="absolute top-0 -right-10 w-[500px] h-[500px] bg-brand-200/50 rounded-full mix-blend-multiply blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-pomegranate-300/40 rounded-full mix-blend-multiply blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 25px 25px, black 2px, transparent 0)", backgroundSize: "50px 50px" }} />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center p-8">
        <div className="mb-10 flex flex-col items-center gap-5 bg-white/70 backdrop-blur-xl px-12 py-10 rounded-[3rem] border border-white shadow-card animate-float">
          <Image src="/icon.png" alt="Icon" width={100} height={100} className="object-contain animate-spin-slow" />
          <Image src="/logo.png" alt="Nar-ı Has" width={240} height={70} className="object-contain" />
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight drop-shadow-sm animate-slide-up" style={{ animationFillMode: 'both' }}>
          Çok Yakında...
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          Geleneksel Anadolu mutfağının en seçkin tatlarını modern bir dokunuşla sizlerle buluşturmak için heyecanla hazırlanıyoruz. Bizi takipte kalın!
        </p>
        <div className="mt-12 flex gap-4 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <div className="w-3 h-3 rounded-full bg-brand-600 animate-ping" />
          <div className="w-3 h-3 rounded-full bg-brand-600 animate-ping" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 rounded-full bg-brand-600 animate-ping" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
