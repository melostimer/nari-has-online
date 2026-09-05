import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Ayarlar - Admin Panel",
};

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8 font-display">Sistem Ayarları</h1>
      <SettingsClient />
    </div>
  );
}
