"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";

export function DashboardChart({ data }: { data: { date: string; orders: number; revenue: number }[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-semibold text-gray-900 mb-6">Son 7 Gun - Siparis ve Ciro</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}` } />
            <Tooltip formatter={(value, name) => name === "revenue" ? [formatPrice(Number(value)), "Ciro"] : [value, "Siparis"]} />
            <Bar yAxisId="left" dataKey="orders" fill="#ff5722" radius={[4, 4, 0, 0]} name="Siparisler" />
            <Bar yAxisId="right" dataKey="revenue" fill="#b21111" radius={[4, 4, 0, 0]} name="Ciro" opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
