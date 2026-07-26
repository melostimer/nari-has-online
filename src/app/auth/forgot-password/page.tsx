"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "Bir hata oluştu");
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-3">E-posta Gönderildi!</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu ve spam klasörünüzü kontrol edin.
              </p>
              <p className="text-xs text-gray-400">Bağlantı 1 saat geçerlidir.</p>
              <Link href="/auth/login" className="mt-6 inline-flex items-center gap-2 text-sm text-brand-600 hover:underline font-medium">
                <ArrowLeft className="h-4 w-4" /> Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="h-4 w-4" /> Geri
              </Link>
              <div className="mb-6">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-brand-600" />
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
                <p className="text-gray-500 text-sm">
                  Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-posta Adresi</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-70"
                >
                  {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
