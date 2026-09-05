import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const image = await prisma.heroSliderImage.findUnique({
      where: { id: params.id },
    });

    if (!image) {
      return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
    }

    // Cloudinary'den sil
    if (image.imageUrl) {
      try {
        await deleteImage(image.imageUrl);
      } catch (err) {
        console.error("Cloudinary silme hatası:", err);
      }
    }

    await prisma.heroSliderImage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Slider delete error:", error);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}
