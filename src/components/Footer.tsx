import Link from "next/link";
import Image from "next/image";
import { ChefHat, MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-white/5 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="mb-4 bg-white inline-flex items-center gap-3 p-3.5 rounded-2xl">
              <Image src="/icon.png" alt="Icon" width={32} height={32} className="object-contain" />
              <Image src="/logo.png" alt="Nar-ı Has" width={120} height={32} className="object-contain" />
            </div>
            <p className="text-sm leading-relaxed">Geleneksel Anadolu mutfağının en seçkin tatlarını, modern bir dokunuşla sofranıza getiriyoruz.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Instagram" className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="p-2 rounded-lg hover:bg-white/10 transition-colors"><Facebook className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              {[{href:"/",label:"Ana Sayfa"},{href:"/menu",label:"Menü"},{href:"/auth/login",label:"Giriş Yap"},{href:"/auth/register",label:"Kayıt Ol"}].map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm"><MapPin className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" /><span>Bağcılar Mah. Lezzet Sk. No:12, İstanbul</span></li>
              <li className="flex items-center gap-3 text-sm"><Phone className="h-4 w-4 text-brand-400 flex-shrink-0" /><a href="tel:+905550000000" className="hover:text-white transition-colors">+90 555 000 00 00</a></li>
              <li className="flex items-start gap-3 text-sm"><Clock className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" /><div><div>Hafta İçi: 11:00 - 23:00</div><div>Hafta Sonu: 10:00 - 24:00</div></div></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} Nar-ı Has. Tüm hakları saklıdır.</p>
          <p>Sevgiyle pişirildi</p>
        </div>
      </div>
    </footer>
  );
}
