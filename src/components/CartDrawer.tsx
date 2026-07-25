"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const { data: session } = useSession();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={closeCart} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between p-5 border-b bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Sepetim</h2>
            {totalItems > 0 && <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">{totalItems} urun</span>}
          </div>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Sepeti kapat"><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 bg-brand-50 rounded-2xl flex items-center justify-center mb-4"><ShoppingBag className="h-10 w-10 text-brand-300" /></div>
              <p className="font-semibold text-gray-700 mb-1">Sepetiniz bos</p>
              <p className="text-sm text-gray-400 mb-6">Menuден lezzetli urunler ekleyin</p>
              <Button onClick={closeCart} variant="outline" size="sm">Menuye Git</Button>
            </div>
          ) : (
            <div className="px-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-50 flex items-center justify-center text-2xl">&#127997;</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-brand-600 font-semibold">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Azalt"><Minus className="h-3 w-3" /></button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Artir"><Plus className="h-3 w-3" /></button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" aria-label="Kaldir"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="p-5 border-t bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Toplam</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
            {session ? (
              <Link href="/checkout" onClick={closeCart}><Button className="w-full" size="lg">Siparisi Tamamla <ArrowRight className="h-4 w-4" /></Button></Link>
            ) : (
              <Link href="/auth/login" onClick={closeCart}><Button className="w-full" size="lg">Giris Yap ve Siparis Ver <ArrowRight className="h-4 w-4" /></Button></Link>
            )}
            <p className="text-xs text-center text-gray-400">Teslimat ucreti siparis tamamlanirken hesaplanir</p>
          </div>
        )}
      </div>
    </>
  );
}
