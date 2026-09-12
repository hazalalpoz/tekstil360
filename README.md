# Tekstil360

Atölye ve firmayı tek çatı altında buluşturan sipariş / üretim takip platformu.

## Özellikler

- **Kurumsal başvuru** — Giriş ekranında evrak yükleme ve yasal onaylar; admin onayı sonrası firma girişi
- **Atölye kaydı** — E-posta ile kayıt; zorunlu işçi / makine sayısı, opsiyonel makine modelleri
- **İş talebi** — 9 kategori, adet, temin süresi, model fotoğrafı
- **Teklif & onay** — Atölyeler teklif verir; firma onaylayınca **canlı sohbet** açılır
- **Üretim aşamaları** — Sipariş alındı → dikime hazırlanıyor → üretim sürecinde → teslime hazır
- **Değerlendirme** — Teslim sonrası karşılıklı 5 yıldız; [herkese açık yorumlar](/yorumlar)

## Kurulum

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

**Admin (test):** `admin@tekstil360.local` / `admin123` — kurumsal başvuruları onaylar.

## Akış

1. Firma **Kurumsal Başvuru** ile kayıt olur → admin onaylar → **Giriş Yap**
2. Firma **Yeni iş talebi** oluşturur
3. Atölye **Açık işler**den teklif gönderir
4. Firma teklifi **onaylar** → sohbet başlar
5. Atölye üretim aşamalarını günceller
6. Firma **teslim aldım** der → iki taraf birbirini puanlar
