"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Şifreler eşleşmiyor"); return; }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        setError(data.error || "Bir hata oluştu");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 font-medium mb-4">Geçersiz bağlantı.</p>
        <Link href="/auth/forgot-password" className="text-brand-600 hover:underline text-sm">
          Yeni sıfırlama bağlantısı iste
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Şifre Güncellendi!</h2>
      <p className="text-gray-500 text-sm">Yeni şifrenizle giriş yapabilirsiniz. Giriş sayfasına yönlendiriliyorsunuz...</p>
    </div>
  ) : (
    <>
      <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Geri
      </Link>
      <div className="mb-6">
        <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-brand-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Yeni Şifre Belirle</h1>
        <p className="text-gray-500 text-sm">Güçlü bir şifre oluşturun.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Yeni Şifre</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition pr-12"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Şifre Tekrar</label>
          <input
            type={showPass ? "text" : "password"}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Şifreyi tekrar girin"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-70"
        >
          {loading ? "Kaydediliyor..." : "Şifremi Güncelle"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card p-8">
          <Suspense fallback={<div className="text-center text-gray-400 py-8">Yükleniyor...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
