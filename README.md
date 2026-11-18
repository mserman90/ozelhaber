# 🗺️ ÖzelHaber - Yapay Zeka Destekli İnteraktif Haber Haritası

**ÖzelHaber**, efsanevi haber görselleştirme platformu [newsmap.jp](http://newsmap.jp) ve açık kaynaklı NewsMap.JS mirasından esinlenerek geliştirilmiş; **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** ve **Google Gemini AI** ile güçlendirilmiş modern bir haber panosudur.

---

## ✨ Özellikler

### 1. 📊 Dinamik Treemap ve Izgara Görünümü
- Haberlerin önemine, güncelliğine (zaman eskitme renkleri) ve kaynak yoğunluğuna göre dinamik olarak boyutlandırılan mozaik harita.
- Treemap, Birleşik Treemap ve Izgara (Grid) düzen modları.
- Renk paleti seçenekleri ve görsel degrade ayarları.

### 2. 🤖 Yapay Zeka ile Tek Tıkla Haber Özeti (AI Summary)
- Haritadaki herhangi bir habere tıklandığında açılan detay penceresinden **"✨ Yapay Zeka Özeti"** alma imkanı.
- **Google Gemini Flash API** entegrasyonu ile 3-4 maddelik hap çıkarım, haberin duygusu (Pozitif, Dengeli, Kritik, Acil) ve anahtar etiketler.
- API anahtarı girilmediğinde bile çalışan akıllı yerel çıkarım (heuristic context) desteği.
- Kullanıcıların kendi Gemini API anahtarını Ayarlar'dan tanımlayabilmesi.

### 3. 📚 Zengin Hazır Kaynak Kataloğu (Preset Directory)
- Tek tıkla haber haritasına eklenebilen popüler ve güvenilir RSS kaynakları:
  - **Gündem:** Anadolu Ajansı, TRT Haber, BBC Türkçe, Sözcü, NTV, T24.
  - **Teknoloji:** Webrazzi, ShiftDelete.Net, DonanımHaber, Webtekno, TechCrunch, The Verge, Hacker News.
  - **Ekonomi:** Bloomberg HT, Dünya Gazetesi, Investing TR.
  - **Dünya:** BBC News, Reuters, The Guardian, New York Times.
- Kendi özel RSS/Atom beslemelerinizi ekleyebilme.
- Google News Dork arama motoru ile özel anahtar kelime sorguları oluşturma.

### 4. 📱 Mobil ve Dokunmatik Dostu Arayüz
- Mobil ve tablet ekranlar için optimize edilmiş alt çekmece (Bottom Sheet) detay penceresi.
- Ekrandan taşmayan, yatay kaydırılabilir kategori ve filtre araç çubuğu.

### 5. 🎨 Çoklu Görsel Temalar
- **Klasik Koyu (Classic Dark):** Orijinal Newsmap atmosferi.
- **AMOLED Siyah:** Saf siyah (#000) arka plan ile OLED ekranlarda pil tasarrufu ve yüksek kontrast.
- **Modern Açık (Light Mode):** Aydınlık ortamlarda rahat okuma.

### 6. 🔗 Paylaşılabilir Pano Durumları & PWA
- Tek tıkla haritanın aktif filtrelerini ve bölgesini URL olarak panoya kopyalama ("Panoyu Paylaş").
- Web App Manifest (`manifest.json`) ile mobil cihazlarda ana ekrana yüklenebilen PWA desteği.
- Güvenli RSS Proxy (`/api/feed` & `/api/rss`) ile SSRF koruması, boyut sınırlandırması ve timeout yönetimi.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- pnpm (veya npm / yarn)

### Adımlar

1. Depoyu klonlayın ve klasöre girin:
   ```bash
   git clone https://github.com/mserman90/ozelhaber.git
   cd ozelhaber
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   pnpm install
   # veya
   npm install
   ```

3. (İsteğe bağlı) Yapay zeka özetleri için `.env.local` oluşturup Gemini API anahtarınızı tanımlayın:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Not: API anahtarı girmeden de uygulama varsayılan akıllı özetleme moduyla çalışır ya da kullanıcılar arayüzdeki Ayarlar menüsünden kendi anahtarlarını girebilir).*

4. Geliştirme sunucusunu başlatın:
   ```bash
   pnpm dev
   # veya
   npm run dev
   ```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 🛠️ Mimari ve Dizin Yapısı

```
ozelhaber/
├── app/
│   ├── api/
│   │   ├── feed/route.ts        # Güvenli dış RSS proxy (SSRF korumalı)
│   │   ├── rss/[...path]/       # Google News RSS proxy
│   │   └── summary/route.ts     # Gemini AI & akıllı haber özetleme endpoint'i
│   ├── layout.tsx               # Ana layout, PWA manifest, SEO ve metadata
│   ├── page.tsx                 # Kök sayfa
│   └── globals.css              # Global CSS & Tailwind v4
├── components/
│   ├── newsmap-client.tsx       # İstemci taraflı kök sarmalayıcı
│   └── newsmap-root.tsx         # Hata yakalama ve ortam değişkeni bağlayıcısı
├── newsmap/
│   ├── Components/
│   │   ├── App.jsx              # Ana uygulama orkestratörü & UI
│   │   ├── Edition.jsx          # Bölge & kategori harita düzenleyici
│   │   ├── Article.jsx          # Treemap hücre hesaplamaları & render
│   │   ├── SourcesModal.jsx     # Gelişmiş Haber Detay & AI Özet Modalı
│   │   ├── FeedsModal.jsx       # Özel kaynaklar & Hazır Katalog sekmesi
│   │   ├── OptionsModal.jsx     # Ayarlar, temalar & Gemini API anahtarı
│   │   └── TreeMap.jsx          # Squarified treemap algoritması
│   ├── data/
│   │   ├── categories.json      # Varsayılan haber kategorileri
│   │   ├── editions.json        # Google News desteklenen ülkeler/diller
│   │   └── presetFeeds.json     # TR & Global seçkin hazır RSS kataloğu
│   └── i18n.js                  # Çift dil desteği (Türkçe & İngilizce)
├── types/
│   └── newsmap.ts               # TypeScript modelleri ve arayüzler
└── public/
    └── manifest.json            # PWA manifest
```

---

## 📄 Lisans
Bu proje açık kaynak topluluğuna katkı amacıyla geliştirilmiştir. Orijinal treemap konsepti Marcos Weskamp'a aittir.
