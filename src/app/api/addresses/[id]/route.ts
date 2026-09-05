export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Adres sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapınız" }, { status: 401 });
  const userId = (session.user as any).id;

  // Güvenlik: sadece kendi adresini silebilir
  const address = await prisma.address.findFirst({
    where: { id: params.id, userId },
  });

  if (!address) {
    return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
