"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export function StickyCartBar() {
  const { totalItems, totalPrice, openCart } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden">
      <button
        onClick={openCart}
        className="w-full flex items-center justify-between bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white px-5 py-4 rounded-2xl shadow-xl transition-all font-semibold"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 bg-white text-brand-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span>Sepeti Gör</span>
        </div>
        <span className="text-white font-bold">{formatPrice(totalPrice)}</span>
      </button>
    </div>
  );
}
