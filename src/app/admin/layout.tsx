import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChefHat, LayoutDashboard, Package, ShoppingBag, Users, LogOut, ListOrdered, Monitor, Image as ImageIcon, Settings } from "lucide-react";
import { AdminLogoutButton } from "./AdminLogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["ADMIN", "STAFF"].includes(userRole)) {
    redirect("/auth/login");
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/satis", label: "Satış Ekranı", icon: Monitor },
    { href: "/admin/orders", label: "Siparişler", icon: ShoppingBag },
    { href: "/admin/categories", label: "Kategoriler", icon: ListOrdered },
    { href: "/admin/products", label: "Ürünler", icon: Package },
    { href: "/admin/customers", label: "Müşteriler", icon: Users },
    { href: "/admin/slider", label: "Slider Görselleri", icon: ImageIcon },
    { href: "/admin/settings", label: "Ayarlar", icon: Settings },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (userRole === "STAFF") {
      return item.href === "/admin/satis";
    }
    return true; // ADMIN sees everything
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
        <div className="p-6 border-b border-gray-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/icon.png" alt="Icon" width={28} height={28} className="object-contain" />
            <Image src="/logo.png" alt="Nar-ı Has" width={110} height={30} className="object-contain" />
          </div>
          <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Admin Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all text-sm font-medium group">
              <item.icon className="h-5 w-5 group-hover:text-brand-500 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          {userRole === "STAFF" ? (
            <AdminLogoutButton />
          ) : (
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all text-sm font-medium">
              <LogOut className="h-4 w-4" /> Siteye Dön
            </Link>
          )}
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}
