"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChefHat, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) { setError("E-posta veya şifre yanlış"); return; }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-4 shadow-glow">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Hoşgeldiniz</h1>
          <p className="text-gray-500 mt-1">Hesabınıza giriş yapın</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input id="email" label="E-posta" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ornek@email.com" required icon={<Mail className="h-4 w-4" />} />
            <div className="relative">
              <Input id="password" label="Şifre" type={showPass ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Şifrenizi girin" required icon={<Lock className="h-4 w-4" />} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>Giriş Yap</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Hesabınız yok mu?{" "}
            <Link href="/auth/register" className="text-brand-600 font-semibold hover:underline">Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
