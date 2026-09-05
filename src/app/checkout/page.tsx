"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import {
  MapPin, CreditCard, Banknote, CheckCircle, Plus, Trash2,
  Navigation, Loader2, Home, Briefcase, X
} from "lucide-react";
import Image from "next/image";

type SavedAddress = {
  id: string;
  title: string;
  addressText: string;
  district?: string | null;
  note?: string | null;
};

// Yapısal adres alanları → tek bir adres metni oluşturur
type AddressFields = {
  title: string;
  mahalle: string;   // Mahalle / Sokak
  binaNo: string;    // Bina No (zorunlu)
  kat: string;       // Kat (zorunlu)
  daireNo: string;   // Daire No (zorunlu)
  note: string;      // Ek not
};

const EMPTY_FIELDS: AddressFields = {
  title: "", mahalle: "", binaNo: "", kat: "", daireNo: "", note: ""
};

const TITLE_ICONS: Record<string, any> = {
  "Evim": Home,
  "İş Yerim": Briefcase,
};

function buildAddressText(f: AddressFields): string {
  const parts = [
    f.mahalle,
    f.binaNo ? `No: ${f.binaNo}` : "",
    f.kat ? `Kat: ${f.kat}` : "",
    f.daireNo ? `Daire: ${f.daireNo}` : "",
    "Niksar",
  ].filter(Boolean);
  return parts.join(", ");
}

function validateFields(f: AddressFields): string | null {
  if (!f.title.trim()) return "Adres başlığı zorunludur (örn: Evim)";
  if (!f.mahalle.trim()) return "Mahalle / sokak bilgisi zorunludur";
  if (!f.binaNo.trim()) return "Bina numarası zorunludur";
  if (!f.kat.trim()) return "Kat bilgisi zorunludur";
  if (!f.daireNo.trim()) return "Daire numarası zorunludur";
  return null;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [fields, setFields] = useState<AddressFields>(EMPTY_FIELDS);
  const [formError, setFormError] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [orderNote, setOrderNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const upd = (key: keyof AddressFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(p => ({ ...p, [key]: e.target.value }));

  const fetchAddresses = useCallback(async () => {
    if (!session?.user) return;
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data);
        if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        } else {
          setShowNewAddressForm(true);
        }
      }
    } finally {
      setLoadingAddresses(false);
    }
  }, [session]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const detectLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=tr`,
            { headers: { "User-Agent": "NariHasApp/1.0" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const road = addr.road || addr.pedestrian || "";
          const neighbourhood = addr.neighbourhood || addr.quarter || addr.suburb || "";
          setFields(prev => ({
            ...prev,
            mahalle: [neighbourhood, road].filter(Boolean).join(", "),
          }));
          setShowNewAddressForm(true);
          setSelectedAddressId(null);
        } catch {
          setLocationError("Adres bilgisi alınamadı, lütfen manuel girin.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setLocationError("Konum iznini tarayıcı ayarlarından açın.");
        else setLocationError("Konumunuz alınamadı, lütfen manuel girin.");
      },
      { timeout: 10000 }
    );
  };

  const saveNewAddress = async () => {
    setFormError("");
    const err = validateFields(fields);
    if (err) { setFormError(err); return; }

    setSavingAddress(true);
    try {
      const addressText = buildAddressText(fields);
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fields.title,
          addressText,
          district: "Niksar",
          note: fields.note,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setSavedAddresses(prev => [...prev, saved]);
        setSelectedAddressId(saved.id);
        setShowNewAddressForm(false);
        setFields(EMPTY_FIELDS);
        setFormError("");
      }
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      const remaining = savedAddresses.filter(a => a.id !== id);
      setSavedAddresses(remaining);
      if (selectedAddressId === id) {
        setSelectedAddressId(remaining[0]?.id || null);
        if (remaining.length === 0) setShowNewAddressForm(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    // Kayıtlı adres seçilmediyse formu doğrula
    if (!selectedAddressId) {
      const err = validateFields(fields);
      if (err) { setSubmitError(err); return; }
    }

    setLoading(true);
    try {
      const payload: any = {
        paymentMethod,
        note: orderNote,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
      };
      if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.addressText = buildAddressText(fields);
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error || "Sipariş oluşturulamadı"); setLoading(false); return; }
      clearCart();
      router.push(`/orders/${data.id}`);
    } catch { setSubmitError("Sunucu hatası, lütfen tekrar deneyin"); setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-4xl mb-4">🛒</p>
          <h2 className="text-xl font-semibold text-gray-700">Sepetiniz boş</h2>
          <Button className="mt-4" onClick={() => router.push("/menu")}>Menüye Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">Sipariş Tamamla</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sol Kolon */}
          <div className="lg:col-span-3 space-y-5">

            {/* Teslimat Adresi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <h2 className="font-semibold text-gray-900 text-lg">Teslimat Adresi</h2>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(!showNewAddressForm);
                      if (!showNewAddressForm) setSelectedAddressId(null);
                      else setSelectedAddressId(savedAddresses[0]?.id || null);
                      setFormError("");
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    {showNewAddressForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showNewAddressForm ? "İptal" : "Yeni Adres"}
                  </button>
                )}
              </div>

              {/* Kayıtlı Adresler */}
              {!showNewAddressForm && (
                loadingAddresses ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Adresler yükleniyor...
                  </div>
                ) : savedAddresses.length > 0 ? (
                  <div className="space-y-3">
                    {savedAddresses.map(addr => {
                      const isSelected = selectedAddressId === addr.id;
                      const Icon = TITLE_ICONS[addr.title] || MapPin;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-brand-500 bg-brand-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-brand-500" : "bg-gray-100"}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-gray-900">{addr.title}</span>
                              {isSelected && (
                                <span className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                                  <CheckCircle className="w-3.5 h-3.5" /> Seçildi
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{addr.addressText}</p>
                            {addr.district && <p className="text-xs text-gray-400 mt-0.5">{addr.district}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={(ev) => { ev.stopPropagation(); deleteAddress(addr.id); }}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Henüz kayıtlı adresiniz yok</p>
                  </div>
                )
              )}

              {/* Yeni Adres Formu */}
              {showNewAddressForm && (
                <div className="space-y-4">
                  {/* Konum Bul Butonu */}
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locating}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border-2 border-dashed border-brand-300 text-brand-600 font-semibold hover:bg-brand-50 transition-colors disabled:opacity-60 disabled:cursor-wait"
                  >
                    {locating
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Konum alınıyor...</>
                      : <><Navigation className="w-5 h-5" /> 📍 Konumumu Otomatik Bul</>
                    }
                  </button>
                  {locationError && <p className="text-sm text-red-500">{locationError}</p>}

                  {/* Başlık */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Evim, İş Yerim..." value={fields.title} onChange={upd("title")}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>

                  {/* Mahalle / Sokak */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mahalle / Cadde / Sokak <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="Atatürk Mah., Cumhuriyet Cad." value={fields.mahalle} onChange={upd("mahalle")}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>

                  {/* Bina No, Kat, Daire No */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bina No <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="12A" value={fields.binaNo} onChange={upd("binaNo")}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-center font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kat <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="3" value={fields.kat} onChange={upd("kat")}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-center font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daire No <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="7" value={fields.daireNo} onChange={upd("daireNo")}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-center font-medium" />
                    </div>
                  </div>

                  {/* Ek Not */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ek Not (Kapı kodu, yön vs.)</label>
                    <input type="text" placeholder="Kapı kodu: 1234, sol taraf..." value={fields.note} onChange={upd("note")}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                      <span className="mt-0.5">⚠️</span> {formError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={saveNewAddress}
                    disabled={savingAddress}
                    className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Adresi Kaydet ve Seç
                  </button>
                  {savedAddresses.length === 0 && (
                    <p className="text-xs text-gray-400 text-center">Kaydetmeden de sipariş verebilirsiniz — zorunlu alanlar doldurulmuş olmalı (<span className="text-red-400">*</span>)</p>
                  )}
                </div>
              )}
            </div>

            {/* Sipariş Notu */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Sipariş Notu <span className="text-gray-400 font-normal text-sm">(Opsiyonel)</span></h2>
              <textarea
                rows={2}
                placeholder="Zil çalışmıyor, 3. kat sola gel... vs."
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Ödeme Yöntemi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-500" /> Ödeme Yöntemi
              </h2>
              <p className="text-sm text-gray-400 mb-4">Kapıda ödeme seçenekleri:</p>
              <div className="grid grid-cols-2 gap-3">
                {(["CASH", "CARD"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center justify-center gap-3 py-4 px-5 rounded-xl border-2 font-semibold transition-all ${
                      paymentMethod === method
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {method === "CASH" ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    {method === "CASH" ? "Kapıda Nakit" : "Kapıda Kart"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Sipariş Özeti */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-5">Sipariş Özeti</h2>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} adet</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ara toplam</span>
                  <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Teslimat</span>
                  <span className="text-green-600 font-medium">Ücretsiz</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-100">
                  <span>Toplam</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-4 text-base font-bold shadow-lg"
                loading={loading}
              >
                Sipariş Ver
              </Button>
              <p className="text-xs text-gray-400 text-center mt-3">Ödeme teslimat sırasında yapılır</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
