export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  try {
    const body = await req.json();
    let { imageBase64, ...data } = body;

    if (imageBase64) {
      const existing = await prisma.product.findUnique({ where: { id: params.id } });
      if (existing?.imageUrl?.includes("cloudinary")) {
        await deleteImage(existing.imageUrl).catch(() => {});
      }
      data.imageUrl = await uploadImage(imageBase64);
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Güncelleme hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }
  try {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (product?.imageUrl?.includes("cloudinary")) {
      await deleteImage(product.imageUrl).catch(() => {});
    }
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Silme hatası" }, { status: 500 });
  }
}
