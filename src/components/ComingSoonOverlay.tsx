"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export function ComingSoonOverlay() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [tapCount, setTapCount] = useState(0);
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBypassed(localStorage.getItem("narihas-bypass") === "1");
    }
  }, []);

  const handleSecretTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      localStorage.setItem("narihas-bypass", "1");
      setBypassed(true);
    }
  };

  // /admin veya /auth sayfalarında gösterme
  const isBypassed = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  // Giriş yapmış kullanıcılara gösterme
  const isLoggedIn = status === "authenticated" && !!session;

  if (isBypassed || isLoggedIn || bypassed) return null;

  // Oturum yükleniyorsa bekle (flash önleme)
  if (status === "loading") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0f0a06' }}>

      {/* Subtle background radial glow */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(160,90,40,0.12) 0%, transparent 70%),
                          radial-gradient(ellipse 60% 40% at 80% 100%, rgba(120,60,20,0.08) 0%, transparent 60%)`,
      }} />

      {/* Thin horizontal gold lines - top & bottom */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(197,158,103,0.4), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(197,158,103,0.4), transparent)' }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl mx-auto">

        {/* Logo */}
        <div className="mb-12" style={{ animation: 'fadeUp 1s ease both' }}>
          <Image
            src="/logo.png"
            alt="Nar-ı Has"
            width={200}
            height={60}
            className="object-contain"
            style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(0.3)' }}
          />
        </div>

        {/* Gold divider */}
        <div className="flex items-center gap-4 mb-10" style={{ animation: 'fadeUp 1s ease 0.15s both' }}>
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #c59e67)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c59e67' }} />
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #c59e67, transparent)' }} />
        </div>

        {/* Heading */}
        <h1
          className="font-display text-5xl md:text-7xl font-bold mb-6"
          style={{
            color: '#f5ede0',
            letterSpacing: '0.15em',
            animation: 'fadeUp 1s ease 0.25s both',
          }}
        >
          Çok Yakında
        </h1>

        {/* Gold divider */}
        <div className="flex items-center gap-4 mb-10" style={{ animation: 'fadeUp 1s ease 0.35s both' }}>
          <div className="h-px w-24" style={{ background: 'linear-gradient(90deg, transparent, #c59e67)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c59e67' }} />
          <div className="h-px w-24" style={{ background: 'linear-gradient(90deg, #c59e67, transparent)' }} />
        </div>



      </div>

      {/* Gizli bypass butonu — sağ alt köşe, 5 kez tıkla */}
      <button
        onClick={handleSecretTap}
        className="absolute bottom-0 right-0 w-16 h-16 opacity-0 cursor-default"
        aria-hidden="true"
        tabIndex={-1}
      />

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
