# 🗺️ ÖzelHaber - İnteraktif Haber Haritası

[![Deploy to GitHub Pages](https://github.com/mserman90/ozelhaber/actions/workflows/deploy.yml/badge.svg)](https://github.com/mserman90/ozelhaber/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)

**ÖzelHaber**, efsanevi haber görselleştirme platformu [newsmap.jp](http://newsmap.jp) ve açık kaynaklı NewsMap.JS mirasından esinlenerek geliştirilmiş; **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** ile güçlendirilmiş modern, hızlı ve duyarlı bir haber panosudur.

🌐 **Canlı Uygulama:** [https://mserman90.github.io/ozelhaber/](https://mserman90.github.io/ozelhaber/)  
📄 **Akademik Teknik Makale (Whitepaper):** [docs/ACADEMIC_WHITEPAPER.md](docs/ACADEMIC_WHITEPAPER.md)  
📖 **Kapsamlı Kullanım Kılavuzu:** [docs/USER_MANUAL.md](docs/USER_MANUAL.md)  

---

## ✨ Öne Çıkan Özellikler

### 1. 📊 Squarified Treemap ve Izgara Görünümü
- Haberlerin önemine (sıralama / kaynak adedi) ve güncelliğine (zamansal renk eskitmesi) göre dinamik olarak ölçeklenen mozaik harita.
- Treemap, Birleşik Treemap ve Izgara (Grid) düzen modları.
- WCAG 2.1 bağıl parlaklık standardına göre otomatik kontrastlı tipografi.

### 2. ⚡ Doğrudan ve Hızlı Haber Erişimi
- Herhangi bir haber kutucuğuna tıklandığında doğrudan orijinal kaynağa anında yönlendirme.
- Birden fazla kaynağa sahip haberlerde dileyen kullanıcılar için çoklu kaynak inceleme desteği.
- Sıfır gecikme, sıfır harici API bağımlılığı ve tamamen güvenli istemci tarafı deneyim.

### 3. 📚 Popüler Kaynaklar & Özel RSS / Google Dork Desteği
- Popüler haber kaynakları dizininden tek tıkla kaynak ekleme (Türkiye, Dünya, Teknoloji, Ekonomi).
- Dilediğiniz özel RSS/Atom adresini ekleme ve gelişmiş Google News Dork sorguları oluşturma imkanı.

### 4. 🎨 3 Farklı Görsel Tema
- **Klasik Koyu (Classic Dark):** Orijinal Newsmap atmosferi.
- **AMOLED Siyah (Pure Black):** `#000000` saf siyah zemin ile OLED ekranlarda yüksek kontrast ve pil tasarrufu.
- **Modern Açık Mod (Light Mode):** Aydınlık ortamlarda rahat okuma.

### 5. 📱 Mobil ve Dokunmatik Dostu Arayüz
- Mobil ekranlar için alttan açılan modern **Bottom Sheet** haber çekmecesi.
- Yatay kaydırılabilir, taşmayan kompakt araç çubuğu.

### 6. 🔗 Paylaşılabilir Pano Durumları & PWA
- Üst bardaki **"🔗 Panoyu Paylaş"** butonu ile aktif bölge, kategori ve filtre ayarlarını içeren URL tek tıkla kopyalanabilir.
- Web App Manifest (`manifest.json`) ile mobil cihazlarda ana ekrana yüklenebilen Progressive Web App (PWA) desteği.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18+)
- pnpm (veya npm)

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

3. Geliştirme sunucusunu başlatın:
   ```bash
   pnpm dev
   # veya
   npm run dev
   ```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın. Yapay zeka ve hazır kaynaklar hiçbir ek yapılandırma gerektirmeden çalışacaktır.

---

## 🌐 GitHub Pages Dağıtımı

Proje, GitHub Actions (`.github/workflows/deploy.yml`) ile `main` dalına yapılan her push işleminde otomatik olarak derlenir ve statik GitHub Pages üzerinde canlıya alınır:

1. GitHub deponuzun **Settings > Pages** sekmesine gidin.
2. **Build and deployment > Source** seçeneğini **GitHub Actions** olarak ayarlayın.
3. Canlı adres: **`https://mserman90.github.io/ozelhaber/`**

---

## 🛠️ Mimari ve Dizin Yapısı

```
ozelhaber/
├── .github/workflows/
│   └── deploy.yml               # Otomatik GitHub Pages CI/CD iş akışı
├── docs/
│   ├── ACADEMIC_WHITEPAPER.md   # Akademik teknik makale ve formülasyonlar
│   └── USER_MANUAL.md           # Kapsamlı kullanıcı kılavuzu ve ipuçları
├── app/
│   ├── api/
│   │   ├── feed/route.ts        # Güvenli dış RSS proxy (SSRF korumalı)
│   │   ├── rss/[...path]/       # Google News RSS proxy
│   │   └── summary/route.ts     # Sıfır-anahtarlı AI özetleme endpoint'i
│   ├── layout.tsx               # Ana layout, PWA manifest, SEO ve metadata
│   └── globals.css              # Global stiller
├── lib/
│   ├── free-ai.ts               # Ücretsiz & sıfır-anahtarlı açık LLM/NLP motoru
│   └── safe-fetch.ts            # SSRF ve boyut korumalı güvenli ağ katmanı
├── newsmap/
│   ├── Components/
│   │   ├── App.jsx              # Ana uygulama orkestratörü & tema yönetimi
│   │   ├── Edition.jsx          # Bölge & kategori harita düzenleyici
│   │   ├── Article.jsx          # Squarified treemap hücre hesaplamaları
│   │   ├── SourcesModal.jsx     # Gelişmiş Haber Detay & AI Özet Modalı
│   │   ├── FeedsModal.jsx       # Özel kaynaklar & Hazır Katalog sekmesi
│   │   ├── OptionsModal.jsx     # Ayarlar & temalar
│   │   └── TreeMap.jsx          # Squarified treemap algoritması
│   ├── data/
│   │   ├── categories.json      # Varsayılan haber kategorileri
│   │   ├── editions.json        # Google News desteklenen ülkeler/diller
│   │   └── presetFeeds.json     # TR & Global seçkin hazır RSS kataloğu
│   └── i18n.js                  # Çift dil desteği (Türkçe & İngilizce)
└── public/
    └── manifest.json            # PWA manifest
```

---

## 📄 Lisans
Bu proje açık kaynak topluluğuna katkı amacıyla geliştirilmiştir. Orijinal treemap konsepti Marcos Weskamp'a aittir.
