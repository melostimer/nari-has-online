"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { formatPrice, formatDate, shortId } from "@/lib/utils";
import { Phone, MapPin, Package, RefreshCw, Clock, CheckCircle, Truck, ChefHat, XCircle, ArrowLeft, MoreVertical, CreditCard, Banknote, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";

const playAlarmSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
      gainNode.gain.setValueAtTime(0.1, startTime + duration - 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(800, now, 0.15);
    playTone(800, now + 0.3, 0.15);
    playTone(800, now + 0.6, 0.15);
  } catch(e) {}
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PENDING:    { label: "Yeni",           color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-300", icon: Clock },
  PREPARING:  { label: "Hazırlanıyor",   color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-300",  icon: ChefHat },
  ON_THE_WAY: { label: "Yolda",          color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300",icon: Truck },
  DELIVERED:  { label: "Teslim Edildi",  color: "text-green-700",  bg: "bg-green-50",  border: "border-green-300", icon: CheckCircle },
  CANCELLED:  { label: "İptal",          color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300",   icon: XCircle },
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: "PREPARING",
  PREPARING: "ON_THE_WAY",
  ON_THE_WAY: "DELIVERED",
};

const NEXT_LABEL: Record<string, string> = {
  PENDING: "Hazırlamaya Başla",
  PREPARING: "Yola Çıkar",
  ON_THE_WAY: "Teslim Edildi İşaretle",
};

export function SalesScreenClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<string[]>([]);
  const previousOrderIdsRef = useRef<Set<string>>(new Set(initialOrders.map(o => o.id)));

  // Seçili sipariş state'i
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("narihas_sound_enabled");
    if (saved !== null) {
      setSoundEnabled(saved === "true");
    }
  }, []);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem("narihas_sound_enabled", String(newVal));
    if (newVal) {
       playAlarmSound();
    }
  };

  const hasPendingOrder = useMemo(() => orders.some(o => o.status === "PENDING"), [orders]);

  useEffect(() => {
    let intervalId: any;
    if (soundEnabled && hasPendingOrder) {
      // Play once immediately
      playAlarmSound();
      // Then repeat every 5 seconds
      intervalId = setInterval(playAlarmSound, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [soundEnabled, hasPendingOrder]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders?all=true", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        
        const currentIds = new Set(data.map((o: any) => o.id));
        const newIds = data
          .filter((o: any) => !previousOrderIdsRef.current.has(o.id) && o.status === "PENDING")
          .map((o: any) => o.id);
        
        if (newIds.length > 0) {
          setNewOrderIds(prev => [...prev, ...newIds]);
          setTimeout(() => {
            setNewOrderIds(prev => prev.filter(id => !newIds.includes(id)));
          }, 4000);
        }

        previousOrderIdsRef.current = currentIds;
        setOrders(data);
        setLastRefresh(new Date());
      }
    } catch {}
  }, []);

  // 30 saniyede bir otomatik yenileme
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchOrders, soundEnabled]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev: any[]) => prev.map((o) => o.id === id ? { ...o, status } : o));
      }
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  // Sekmelerdeki sayıları hesaplama
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    Object.keys(STATUS_CONFIG).forEach(k => c[k] = 0);
    orders.forEach(o => {
      if (c[o.status] !== undefined) c[o.status]++;
    });
    return c;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders.filter(o => o.status !== "CANCELLED").reduce((sum, o) => sum + Number(o.totalPrice), 0);
  }, [orders]);

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId);
  }, [orders, selectedOrderId]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 -m-8">
      {/* Üst Bilgi Alanı */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold font-display text-gray-900">Satış Ekranı</h1>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(["ALL", "PENDING", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"] as const).map(f => {
              const isActive = filter === f;
              const count = counts[f] || 0;
              const label = f === "ALL" ? "Tümü" : STATUS_CONFIG[f].label;
              return (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setSelectedOrderId(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-white text-brand-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive ? "bg-brand-100 text-brand-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-500">Toplam Ciro</div>
            <div className="text-xl font-bold text-gray-900">{formatPrice(totalRevenue)}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 text-right">
              <div>Son Güncelleme</div>
              <div>{lastRefresh.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
            </div>
            <button 
              onClick={toggleSound} 
              className={`p-2 rounded-xl transition-colors ${soundEnabled ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-400"}`}
              title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)} 
              className={`p-2 rounded-xl transition-colors ${autoRefresh ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-400"}`}
              title="Otomatik Yenileme"
            >
              <RefreshCw className={`h-5 w-5 ${autoRefresh ? "animate-spin-slow" : ""}`} />
            </button>
            <Button onClick={fetchOrders} variant="outline" size="sm" className="hidden sm:flex">
              Yenile
            </Button>
          </div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sol Panel: Sipariş Listesi */}
        <div className={`w-full md:w-[360px] lg:w-[400px] border-r border-gray-200 bg-gray-50 flex flex-col shrink-0 transition-transform ${selectedOrderId ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Bu kategoride sipariş yok</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const conf = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                const Icon = conf.icon;
                const isSelected = selectedOrderId === order.id;
                const totalItems = order.orderItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
                const isNew = newOrderIds.includes(order.id);

                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full text-left bg-white p-4 rounded-2xl border transition-all ${
                      isSelected ? "border-brand-500 shadow-md ring-1 ring-brand-500" : 
                      isNew ? "border-brand-400 shadow-md ring-2 ring-brand-400/50 animate-pulse" :
                      order.status === "PENDING" ? "border-brand-200 shadow-sm hover:border-brand-300" : "border-gray-200 shadow-sm hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-900 truncate pr-2">
                        {order.user?.name || "Bilinmiyor"}
                      </div>
                      <div className="text-sm font-bold text-gray-900 shrink-0">
                        {formatPrice(order.totalPrice)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">#{shortId(order.id)}</span>
                        <span>•</span>
                        <span>{formatDate(order.createdAt).split(' ')[1]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" /> {totalItems} ürün
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${conf.bg} ${conf.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {conf.label}
                      </span>
                      {order.paymentMethod === "CARD" ? (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-medium"><CreditCard className="w-3 h-3"/> Kart</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Banknote className="w-3 h-3"/> Nakit</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Sağ Panel: Sipariş Detayı */}
        <div className={`flex-1 flex flex-col bg-white overflow-hidden ${!selectedOrderId ? "hidden md:flex" : "flex"}`}>
          {selectedOrder ? (
            <div className="flex-1 overflow-y-auto">
              {/* Mobil için geri butonu */}
              <div className="md:hidden p-4 border-b border-gray-100 flex items-center gap-3">
                <button onClick={() => setSelectedOrderId(null)} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100">
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-900">Sipariş Detayı</span>
              </div>

              <div className="p-6 max-w-3xl mx-auto space-y-6">
                {/* Üst Bilgi Kartı */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Sipariş #{shortId(selectedOrder.id)}
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border font-semibold flex items-center gap-2 ${STATUS_CONFIG[selectedOrder.status].bg} ${STATUS_CONFIG[selectedOrder.status].color} ${STATUS_CONFIG[selectedOrder.status].border}`}>
                    {(() => {
                      const Icon = STATUS_CONFIG[selectedOrder.status].icon;
                      return <Icon className="w-5 h-5" />;
                    })()}
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </div>
                </div>

                {/* Müşteri Bilgileri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Müşteri Adı</div>
                    <div className="font-semibold text-gray-900">{selectedOrder.user?.name || "Bilinmiyor"}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-sm text-gray-500 mb-1">Telefon Numarası</div>
                    <a href={`tel:${selectedOrder.user?.phone}`} className="font-semibold text-brand-600 hover:underline flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedOrder.user?.phone || "Belirtilmedi"}
                    </a>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-sm text-gray-500 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Teslimat Adresi
                  </div>
                  <div className="font-medium text-gray-900 whitespace-pre-wrap">
                    {selectedOrder.addressText}
                  </div>
                </div>

                {/* Sipariş Notu */}
                {selectedOrder.note && (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <div className="text-sm text-amber-700 font-semibold mb-1">Sipariş Notu</div>
                    <div className="text-amber-900 font-medium whitespace-pre-wrap">{selectedOrder.note}</div>
                  </div>
                )}

                {/* Ürün Listesi */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-500" />
                    Sipariş İçeriği
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    {selectedOrder.orderItems.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                            {item.quantity}x
                          </div>
                          <div className="font-medium text-gray-900">{item.product.name}</div>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {formatPrice(Number(item.unitPrice) * item.quantity)}
                        </div>
                      </div>
                    ))}
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="font-medium text-gray-500">Ödeme Yöntemi:</div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {selectedOrder.paymentMethod === "CARD" ? <CreditCard className="w-5 h-5 text-blue-600"/> : <Banknote className="w-5 h-5 text-green-600"/>}
                        {selectedOrder.paymentMethod === "CARD" ? "Kredi Kartı" : "Kapıda Nakit"}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-900 text-white flex items-center justify-between rounded-b-2xl">
                      <div className="font-semibold text-lg">Toplam Tutar:</div>
                      <div className="font-bold text-2xl text-brand-400">
                        {formatPrice(selectedOrder.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                  {NEXT_STATUS[selectedOrder.status] && (
                    <Button 
                      onClick={() => updateStatus(selectedOrder.id, NEXT_STATUS[selectedOrder.status])}
                      loading={updating === selectedOrder.id}
                      className="flex-1 py-6 text-lg shadow-lg"
                    >
                      {NEXT_LABEL[selectedOrder.status]}
                    </Button>
                  )}
                  {["PENDING", "PREPARING"].includes(selectedOrder.status) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (confirm("Siparişi iptal etmek istediğinize emin misiniz?")) {
                          updateStatus(selectedOrder.id, "CANCELLED");
                        }
                      }}
                      disabled={updating === selectedOrder.id}
                      className="py-6 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Siparişi İptal Et
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <Package className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Detayları görmek için sol taraftan bir sipariş seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
