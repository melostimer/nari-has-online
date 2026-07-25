# Nar-ı Has — Online Restoran Sipariş Sistemi

> Geleneksel Anadolu mutfağının en seçkin tatlarını online sipariş edin.

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend + Backend | Next.js 14 (App Router) |
| Veritabanı | PostgreSQL via **Neon** |
| ORM | Prisma |
| Kimlik Doğrulama | NextAuth.js (JWT) |
| Görseller | Cloudinary |
| Stil | Tailwind CSS |
| Deploy | Vercel |

---

## 📋 Gereksinimler

- Node.js 18.x veya üzeri
- npm 9.x veya üzeri
- [Neon](https://neon.tech) hesabı (ücretsiz)
- [Cloudinary](https://cloudinary.com) hesabı (ücretsiz)
- [Vercel](https://vercel.com) hesabı (ücretsiz)

---

## ⚙️ Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını kopyalayın:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını açın ve şu değerleri doldurun:

#### 🐘 Neon (Veritabanı)
1. [neon.tech](https://neon.tech) adresine gidin
2. Ücretsiz hesap açın
3. Yeni bir proje oluşturun: **"narihas"**
4. Dashboard'da **Connection String**'i kopyalayın
5. `.env.local` dosyasında `DATABASE_URL` değerine yapıştırın

#### 🔐 NextAuth Secret
Güvenli bir secret üretin:
```bash
# Windows PowerShell:
[System.Web.Security.Membership]::GeneratePassword(32, 8)

# veya herhangi bir random string kullanın (en az 32 karakter)
```
`NEXTAUTH_SECRET` değerine yapıştırın.

#### 🖼️ Cloudinary (Görseller)
1. [cloudinary.com](https://cloudinary.com) adresine gidin
2. Ücretsiz hesap açın
3. Dashboard'dan **Cloud Name**, **API Key**, **API Secret** değerlerini alın
4. `.env.local` dosyasında ilgili alanlara girin

### 3. Veritabanı Şemasını Oluşturun

```bash
# Prisma client oluştur
npm run db:generate

# Şemayı Neon veritabanına uygula
npm run db:push
```

### 4. Örnek Verileri Yükleyin

```bash
npm run db:seed
```

Bu komut şunları oluşturur:
- ✅ Admin kullanıcısı (`admin@narihas.com` / `Admin@narihas123!`)
- ✅ 5 kategori (Başlangıçlar, Ana Yemekler, Pideler, Tatlılar, İçecekler)
- ✅ 14 örnek ürün

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda açın: **http://localhost:3000**

---

## 🚀 Vercel'e Deploy

### 1. GitHub Reposu Oluşturun
```bash
git init
git add .
git commit -m "Initial commit: Nar-i Has restaurant app"
```
GitHub'da yeni repo oluşturun ve push edin.

### 2. Vercel'e Bağlayın
1. [vercel.com](https://vercel.com) → **New Project**
2. GitHub reponuzu seçin
3. **Environment Variables** sekmesine gidin
4. `.env.local` dosyasındaki TÜM değişkenleri Vercel'e ekleyin:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → Vercel URL'iniz (örn: `https://narihas.vercel.app`)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. **Deploy** butonuna tıklayın

### 3. Hostinger Domain Bağlama
1. Vercel Dashboard → Projeniz → **Settings → Domains**
2. Domain adınızı ekleyin (örn: `narihas.com`)
3. Vercel size iki DNS kaydı verir:
   - `A Record: 76.76.21.21`
   - `CNAME Record: cname.vercel-dns.com`
4. Hostinger Panel → Domains → DNS Zone Editor
5. Bu iki kaydı ekleyin
6. 5-30 dakika bekleyin, site canlıya geçer!

---

## 👤 Admin Paneli

Admin paneline erişim: `/admin`

Varsayılan giriş bilgileri:
- **E-posta:** `admin@narihas.com`
- **Şifre:** `Admin@narihas123!`

> ⚠️ Canlıya geçmeden önce şifreyi değiştirin!

Admin panelinde yapabilecekleriniz:
- 📊 Dashboard — Günlük/haftalık sipariş ve ciro istatistikleri
- 📦 Ürün Yönetimi — Ürün ekle, düzenle, sil, stok durumu güncelle
- 🛒 Sipariş Yönetimi — Siparişleri listele, durumlarını güncelle
- 👥 Müşteri Listesi — Kayıtlı müşterileri ve sipariş geçmişlerini gör

---

## 📁 Proje Yapısı

```
src/
├── app/
│   ├── page.tsx              # Ana sayfa
│   ├── menu/                 # Menü sayfası
│   ├── checkout/             # Sipariş tamamlama
│   ├── orders/[id]/          # Sipariş takibi
│   ├── profile/              # Kullanıcı profili
│   ├── auth/                 # Giriş/Kayıt
│   ├── admin/                # Admin paneli
│   └── api/                  # API rotaları
├── components/               # Yeniden kullanılabilir bileşenler
├── context/                  # React Context (Sepet)
├── lib/                      # Yardımcı kütüphaneler
├── providers/                # Provider bileşenleri
└── types/                    # TypeScript tip tanımları
prisma/
├── schema.prisma             # Veritabanı şeması
└── seed.ts                   # Örnek veri
```

---

## 🔧 Kullanışlı Komutlar

```bash
npm run dev         # Geliştirme sunucusu
npm run build       # Production build
npm run start       # Production sunucusu
npm run db:generate # Prisma client oluştur
npm run db:push     # Şemayı veritabanına uygula
npm run db:seed     # Örnek veriyi yükle
npm run db:studio   # Prisma Studio (veritabanı arayüzü)
npm run lint        # ESLint kontrolü
```

---

## 🛒 Kullanıcı Akışı

```
Ana Sayfa → Menü → Sepete Ekle → Giriş Yap → Checkout → Sipariş Takibi
```

1. **Menüye Göz At** — Kategoriye göre filtrele, ara
2. **Sepete Ekle** — Ürünleri sepete ekle, miktarı ayarla
3. **Kayıt Ol / Giriş Yap** — Sipariş için hesap gerekli
4. **Checkout** — Teslimat adresi gir, ödeme yöntemini seç
5. **Sipariş Takibi** — Anlık durum güncelleme sayfası
6. **Profil** — Sipariş geçmişi

---

## 📞 Destek

Sorunlarınız için lütfen iletişime geçin.

---

*Nar-ı Has — Sevgiyle pişirildi 🍽️*
