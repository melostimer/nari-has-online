"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsClient() {
  const [settings, setSettings] = useState({
    orderStartTime: "11:00",
    orderEndTime: "23:30",
    isOrderingEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings({
            orderStartTime: data.orderStartTime || "11:00",
            orderEndTime: data.orderEndTime || "23:30",
            isOrderingEnabled: data.isOrderingEnabled ?? true,
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Ayarlar başarıyla kaydedildi.");
      } else {
        setMessage("Kaydetme başarısız.");
      }
    } catch {
      setMessage("Sunucu hatası.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
      <h2 className="text-xl font-bold mb-6">Sipariş Ayarları</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-brand-50 text-brand-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sipariş Başlangıç Saati</label>
            <input 
              type="time" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
              value={settings.orderStartTime} 
              onChange={(e) => setSettings({ ...settings, orderStartTime: e.target.value })} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sipariş Bitiş Saati</label>
            <input 
              type="time" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" 
              value={settings.orderEndTime} 
              onChange={(e) => setSettings({ ...settings, orderEndTime: e.target.value })} 
              required 
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50">
          <input 
            type="checkbox" 
            id="isOrderingEnabled"
            className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
            checked={settings.isOrderingEnabled}
            onChange={(e) => setSettings({ ...settings, isOrderingEnabled: e.target.checked })}
          />
          <div>
            <label htmlFor="isOrderingEnabled" className="font-medium text-gray-900 cursor-pointer">Sipariş Alımını Aç</label>
            <p className="text-xs text-gray-500">Kaldırırsanız sipariş alımı saatlerden bağımsız olarak tamamen durdurulur.</p>
          </div>
        </div>

        <Button type="submit" loading={saving} className="w-full">Ayarları Kaydet</Button>
      </form>
    </div>
  );
}
