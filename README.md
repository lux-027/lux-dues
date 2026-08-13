# LuxDues

Çoklu bina destekli site ve aidat takip yönetim sistemi. Next.js (App Router), TypeScript, Tailwind CSS ve Prisma ile geliştirilmiştir.

## Özellikler

- **Rol tabanlı yetkilendirme**: Ana Yönetici (SUPER_ADMIN), Blok Yöneticisi (BLOCK_ADMIN), Site Sakini (RESIDENT)
- **Çoklu bina/blok yönetimi**: Her bloğa ayrı yönetici atanabilir
- **Aidat takibi**: Aylık aidat tanımlama ve ödeme durumu takibi
- **Ortak masraf bölüşümü**: Garaj kapısı gibi ortak masrafların daire sayısına otomatik bölüştürülmesi
- **Şikayet/istek kutusu**: Sakinlerden gelen taleplerin yönetimi
- **Landing page**: Tanıtım sayfası + modal üzerinden giriş/kayıt akışı

## Kurulum

```bash
npm install
```

`.env.example` dosyasını `.env` olarak kopyalayıp kendi veritabanı bağlantı bilgilerinizi girin:

```bash
cp .env.example .env
```

Veritabanı şemasını uygulayın ve Prisma Client'ı oluşturun:

```bash
npx prisma migrate dev
npx prisma generate
```

(Opsiyonel) Örnek veri ile doldurun:

```bash
npm run seed
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

## Proje Yapısı

- `app/` — Next.js App Router sayfaları ve API route'ları
- `components/` — Yeniden kullanılabilir UI bileşenleri
- `lib/` — Prisma client, auth yardımcıları, seed script
- `prisma/` — Veritabanı şeması ve migration'lar
- `types/` — Paylaşılan TypeScript tipleri
