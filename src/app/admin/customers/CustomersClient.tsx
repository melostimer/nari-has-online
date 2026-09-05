"use client";

import { useState } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Users, Mail, Phone, Shield, ShieldOff, Search } from "lucide-react";

export function CustomersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "CUSTOMER" | "STAFF">("ALL");

  const updateRole = async (id: string, newRole: string) => {
    if (!confirm(`Bu kullanıcının rolünü ${newRole} yapmak istediğinizden emin misiniz?`)) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => u.id === id ? { ...u, role: newRole } : u));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search);
    const matchesFilter = filter === "ALL" || u.role === filter;
    return matchesSearch && matchesFilter;
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const customerCount = users.filter((u) => u.role === "CUSTOMER").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-gray-900">Kullanıcılar</h1>
          <span className="bg-brand-100 text-brand-700 font-semibold text-sm px-3 py-1 rounded-full">
            {users.length} toplam
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> {users.filter(u => u.role === "ADMIN").length} Admin
          </span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {users.filter(u => u.role === "STAFF").length} Personel
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {users.filter(u => u.role === "CUSTOMER").length} Müşteri
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="İsim, e-posta veya telefon ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ADMIN", "STAFF", "CUSTOMER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "ALL" ? "Tümü" : f === "ADMIN" ? "Adminler" : f === "STAFF" ? "Personel" : "Müşteriler"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kullanıcı</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">İletişim</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sipariş</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Harcama</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kayıt</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const totalSpent = u.orders.reduce((sum: number, o: any) => sum + Number(o.totalPrice), 0);
                const isAdmin = u.role === "ADMIN";
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isAdmin ? "bg-purple-600" : "bg-brand-gradient"
                        }`}>
                          <span className="text-white font-bold text-sm">{u.name[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />{u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />{u.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                        u.role === "STAFF" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {u.role === "ADMIN" ? "Admin" : u.role === "STAFF" ? "Personel" : "Müşteri"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">{u._count.orders}</span>
                      <span className="text-gray-400 text-sm ml-1">sipariş</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-brand-600">{formatPrice(totalSpent)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">{formatDate(u.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                      >
                        <option value="CUSTOMER">Müşteri</option>
                        <option value="STAFF">Personel</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Kullanıcı bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
