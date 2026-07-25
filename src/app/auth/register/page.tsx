export const dynamic = 'force-dynamic';
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ChefHat, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Sifreler eslesmiyor"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Kayit basarisiz"); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/");
    } catch { setError("Sunucu hatasi"); setLoading(false); }
  };

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-glow">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Hesap Olustur</h1>
          <p className="text-gray-500 mt-1">Hizli ve kolay siparis icin kayit olun</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8">
          {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Ad Soyad" value={form.name} onChange={update("name")} placeholder="Adinizi girin" required icon={<User className="h-4 w-4" />} />
            <Input id="email" label="E-posta" type="email" value={form.email} onChange={update("email")} placeholder="ornek@email.com" required icon={<Mail className="h-4 w-4" />} />
            <Input id="phone" label="Telefon" type="tel" value={form.phone} onChange={update("phone")} placeholder="0555 000 00 00" required icon={<Phone className="h-4 w-4" />} />
            <div className="relative">
              <Input id="password" label="Sifre" type={showPass ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="En az 8 karakter" required icon={<Lock className="h-4 w-4" />} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-gray-400">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <Input id="confirm" label="Sifre Tekrar" type="password" value={form.confirm} onChange={update("confirm")} placeholder="Sifrenizi tekrar girin" required icon={<Lock className="h-4 w-4" />} />
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>Kayit Ol</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">Hesabiniz var mi? <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">Giris Yap</Link></p>
        </div>
      </div>
    </div>
  );
}
