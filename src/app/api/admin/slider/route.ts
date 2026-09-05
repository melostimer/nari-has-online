import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadSliderImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    const images = await prisma.heroSliderImage.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: "Görseller alınamadı" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { imageBase64, order } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    const imageUrl = await uploadSliderImage(imageBase64);

    const newImage = await prisma.heroSliderImage.create({
      data: {
        imageUrl,
        order: order ?? 0,
      },
    });

    return NextResponse.json(newImage);
  } catch (error) {
    console.error("Slider upload error:", error);
    return NextResponse.json({ error: "Görsel kaydedilemedi" }, { status: 500 });
  }
}
