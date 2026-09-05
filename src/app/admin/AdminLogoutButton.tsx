"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminLogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all text-sm font-medium"
    >
      <LogOut className="h-4 w-4" /> Çıkış Yap
    </button>
  );
}
