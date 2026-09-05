import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="mb-3 inline-flex items-center gap-3">
              <Image src="/icon.png" alt="Icon" width={32} height={32} className="object-contain" />
              <Image src="/logo.png" alt="Nar-ı Has" width={110} height={30} className="object-contain" />
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Hamburger, pizza, tatlı ve kahve — hızlı teslimat, kapıda ödeme.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://www.instagram.com/cafenarihas/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Ana Sayfa" },
                { href: "/menu", label: "Menü" },
                { href: "/auth/login", label: "Giriş Yap" },
                { href: "/auth/register", label: "Kayıt Ol" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-brand-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" />
                <a href="https://maps.google.com/?q=Bağlar+Mahallesi+Atatürk+Bulvarı+No:40+Niksar/Tokat" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors">
                  Bağlar Mahallesi Atatürk Bulvarı No:40 Niksar/Tokat
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <a href="tel:+905016126060" className="hover:text-brand-600 transition-colors">+90 501 612 60 60</a>
              </li>
              <li className="flex gap-3">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <div>Haftanın her günü: 11:00 - 24:00</div>
                  <div className="text-brand-600 font-medium bg-brand-50 inline-block px-2 py-0.5 rounded text-sm w-fit">
                    Paket Servis: 11:00 - 23:30
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Nar-ı Has. Tüm hakları saklıdır.</p>
          <p>Sevgiyle hazırlandı ☕</p>
        </div>
      </div>
    </footer>
  );
}
