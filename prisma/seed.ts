/**
 * Prisma Seed Script — Nar-ı Has Restaurant
 * Örnek kategoriler, ürünler ve admin kullanıcısı oluşturur
 * Çalıştırmak için: npm run db:seed
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed verisi yükleniyor...");

  // ─── Admin kullanıcısı ───────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || "admin@narihas.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@narihas123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      phone: "+90 555 000 0000",
    },
  });
  console.log("✅ Admin kullanıcısı oluşturuldu:", adminEmail);

  // ─── Kategoriler ─────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Başlangıçlar" },
      update: {},
      create: { name: "Başlangıçlar", emoji: "🥗", order: 1 },
    }),
    prisma.category.upsert({
      where: { name: "Ana Yemekler" },
      update: {},
      create: { name: "Ana Yemekler", emoji: "🍖", order: 2 },
    }),
    prisma.category.upsert({
      where: { name: "Pideler" },
      update: {},
      create: { name: "Pideler", emoji: "🫓", order: 3 },
    }),
    prisma.category.upsert({
      where: { name: "Tatlılar" },
      update: {},
      create: { name: "Tatlılar", emoji: "🍮", order: 4 },
    }),
    prisma.category.upsert({
      where: { name: "İçecekler" },
      update: {},
      create: { name: "İçecekler", emoji: "🥤", order: 5 },
    }),
  ]);

  const [baslangiclar, anaYemekler, pideler, tatlilar, icecekler] = categories;
  console.log("✅ Kategoriler oluşturuldu");

  // ─── Ürünler ──────────────────────────────────────────────────────────────
  const products = [
    // Başlangıçlar
    {
      categoryId: baslangiclar.id,
      name: "Mercimek Çorbası",
      description: "Geleneksel tarife göre hazırlanan, limon ve kırmızı biberle servis edilen mercimek çorbası",
      price: 95,
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 1,
    },
    {
      categoryId: baslangiclar.id,
      name: "Humus Tabağı",
      description: "Tahinli ev yapımı humus, zeytinyağı ve sumakla tatlandırılmış, pide eşliğinde",
      price: 120,
      imageUrl: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 2,
    },
    {
      categoryId: baslangiclar.id,
      name: "Cacık",
      description: "Sarımsaklı yoğurt, salatalık, nane ve dereotu ile hazırlanan geleneksel cacık",
      price: 85,
      imageUrl: "https://images.unsplash.com/photo-1571167530149-c1105da4b40a?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 3,
    },
    // Ana Yemekler
    {
      categoryId: anaYemekler.id,
      name: "Kuzu İncik",
      description: "Fırında saatlerce pişirilmiş kuzu incik, sebzeli güveç ve pilavla servis edilir",
      price: 420,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76594e1e9e4?w=600",
      isAvailable: true,
      isFeatured: true,
      order: 1,
    },
    {
      categoryId: anaYemekler.id,
      name: "Adana Kebap",
      description: "El yapımı kıyma ile hazırlanan, közde pişmiş Adana kebap, közlenmiş biber ve domates eşliğinde",
      price: 340,
      imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600",
      isAvailable: true,
      isFeatured: true,
      order: 2,
    },
    {
      categoryId: anaYemekler.id,
      name: "Tavuk Şiş",
      description: "Marine edilmiş tavuk göğsü, taze sebzeler ve özel baharatlarla şişte pişirilir",
      price: 280,
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 3,
    },
    {
      categoryId: anaYemekler.id,
      name: "Karnıyarık",
      description: "Kıymalı iç harçla doldurulmuş patlıcan, domates sosu ve pilavla sunulur",
      price: 265,
      imageUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 4,
    },
    // Pideler
    {
      categoryId: pideler.id,
      name: "Kıymalı Pide",
      description: "Ev yapımı hamurdan hazırlanan, özel baharatlı kıyma harçlı geleneksel pide",
      price: 220,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
      isAvailable: true,
      isFeatured: true,
      order: 1,
    },
    {
      categoryId: pideler.id,
      name: "Peynirli Pide",
      description: "Kaşar ve beyaz peynir karışımıyla hazırlanan, fırından çıkmış sıcak pide",
      price: 190,
      imageUrl: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 2,
    },
    // Tatlılar
    {
      categoryId: tatlilar.id,
      name: "Künefe",
      description: "Antep fıstıklı kadayıf ve taze peynirle hazırlanan, gülsuyu şerbetli sıcak künefe",
      price: 165,
      imageUrl: "https://images.unsplash.com/photo-1571167530149-c1105da4b40a?w=600",
      isAvailable: true,
      isFeatured: true,
      order: 1,
    },
    {
      categoryId: tatlilar.id,
      name: "Sütlaç",
      description: "Fırında karamelize edilmiş, nar ekşisi ile tatlandırılmış geleneksel sütlaç",
      price: 110,
      imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 2,
    },
    // İçecekler
    {
      categoryId: icecekler.id,
      name: "Nar Şerbeti",
      description: "Taze sıkılmış nar suyundan yapılan, soğuk servis edilen özel Nar-ı Has şerbeti",
      price: 85,
      imageUrl: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=600",
      isAvailable: true,
      isFeatured: true,
      order: 1,
    },
    {
      categoryId: icecekler.id,
      name: "Türk Çayı",
      description: "Doğu Karadeniz'den gelen özel demlik çayı, çift bardak servis",
      price: 45,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 2,
    },
    {
      categoryId: icecekler.id,
      name: "Ayran",
      description: "Köy yoğurdundan taze yapılan, tuzlu ev ayranı",
      price: 55,
      imageUrl: "https://images.unsplash.com/photo-1571167530149-c1105da4b40a?w=600",
      isAvailable: true,
      isFeatured: false,
      order: 3,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✅ ${products.length} ürün oluşturuldu`);

  console.log("\n🎉 Seed tamamlandı!");
  console.log("─────────────────────────────────────────");
  console.log(`Admin: ${adminEmail}`);
  console.log(`Şifre: ${adminPassword}`);
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
