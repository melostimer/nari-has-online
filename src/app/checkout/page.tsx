"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatPrice } from "@/lib/utils";
import { MapPin, CreditCard, Banknote, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({ addressText: "", note: "", paymentMethod: "CASH" as "CASH" | "CARD" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-4xl mb-4">&#128722;</p>
          <h2 className="text-xl font-semibold text-gray-700">Sepetiniz bos</h2>
          <Button className="mt-4" onClick={() => router.push("/menu")}>Menuye Don</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.addressText.trim()) { setError("Teslimat adresi zorunludur"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressText: form.addressText,
          note: form.note,
          paymentMethod: form.paymentMethod,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Siparis olusturulamadi"); setLoading(false); return; }
      clearCart();
      router.push(`/orders/${data.id}`);
    } catch { setError("Sunucu hatasi, lutfen tekrar deneyin"); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="section-container max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Siparis Tamamla</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="h-5 w-5 text-brand-500" />
                  <h2 className="font-semibold text-gray-900">Teslimat Adresi</h2>
                </div>
                <div className="space-y-4">
                  <Textarea id="addressText" label="Adres" value={form.addressText} onChange={(e) => setForm({ ...form, addressText: e.target.value })} placeholder="Mahalle, sokak, bina no, daire no..." rows={3} required />
                  <Textarea id="note" label="Siparis Notu (Opsiyonel)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Zil calismiyor, 3. kat sola gel... vs." rows={2} />
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="h-5 w-5 text-brand-500" />
                  <h2 className="font-semibold text-gray-900">Odeme Yontemi</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">Kapida odeme secenekleriniz:</p>
                <div className="grid grid-cols-2 gap-3">
                  {([{ value: "CASH", label: "Kapida Nakit", icon: Banknote }, { value: "CARD", label: "Kapida Kart", icon: CreditCard }] as const).map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setForm({ ...form, paymentMethod: opt.value })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        form.paymentMethod === opt.value ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}>
                      <opt.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
                <h2 className="font-semibold text-gray-900 mb-5">Siparis Ozeti</h2>
                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">&#127997;</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} adet</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ara toplam</span><span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Teslimat</span><span className="text-green-600 font-medium">Ucretsiz</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t">
                    <span>Toplam</span><span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" size="lg" loading={loading}>
                  Siparis Ver
                </Button>
                <p className="text-xs text-center text-gray-400 mt-3">Odeme teslimat sirasinda yapilir</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
