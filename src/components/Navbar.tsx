"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Menu, X, ChefHat, LogOut, Package, Instagram } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const { totalItems, toggleCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRole = (session?.user as any)?.role;
  const showAdminLink = userRole === "ADMIN" || userRole === "STAFF";

  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/menu", label: "Menü" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/icon.png" alt="Logo Icon" width={32} height={32} className="object-contain group-hover:scale-105 transition-transform" />
            <Image src="/logo.png" alt="Nar-ı Has" width={120} height={32} className="object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                {link.label}
              </Link>
            ))}
            {showAdminLink && (
              <Link href="/admin" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">Admin Panel</Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href="https://www.instagram.com/cafenarihas/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <button id="cart-toggle-btn" onClick={toggleCart} className="relative p-2.5 rounded-xl text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all" aria-label="Sepeti aç">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-bounce-soft">
                  {totalItems}
                </span>
              )}
            </button>
            {session ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all text-sm">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{session.user?.name}</span>
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" aria-label="Çıkış yap">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Giriş Yap</Link>
                <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold bg-brand-gradient text-white rounded-xl hover:opacity-90 transition-opacity">Kayıt Ol</Link>
              </div>
            )}
            <button className="md:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menü">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all" onClick={() => setMobileOpen(false)}>{link.label}</Link>
            ))}
            {showAdminLink && (
              <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
            )}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {session ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg" onClick={() => setMobileOpen(false)}><User className="h-4 w-4" /> Profilim</Link>
                  <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg" onClick={() => setMobileOpen(false)}><Package className="h-4 w-4" /> Siparişlerim</Link>
                  <button onClick={() => signOut()} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"><LogOut className="h-4 w-4" /> Çıkış Yap</button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Link href="/auth/login" className="block text-center py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl" onClick={() => setMobileOpen(false)}>Giriş Yap</Link>
                  <Link href="/auth/register" className="block text-center py-2.5 text-sm font-semibold bg-brand-gradient text-white rounded-xl" onClick={() => setMobileOpen(false)}>Kayıt Ol</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
