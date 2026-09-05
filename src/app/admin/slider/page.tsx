import { prisma } from "@/lib/prisma";
import { SliderClient } from "./SliderClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slider Yönetimi | Admin",
};

// Next.js'in sayfayı build sırasında statik olarak oluşturmasını engelle
export const dynamic = "force-dynamic";

export default async function AdminSliderPage() {
  const images = await prisma.heroSliderImage.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Slider Yönetimi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ana sayfada dönen (hero) fotoğrafları buradan ekleyip çıkarabilirsiniz. Tavsiye edilen boyut: 1920x1080 (Yatay).
        </p>
      </div>

      <SliderClient initialImages={images} />
    </div>
  );
}
