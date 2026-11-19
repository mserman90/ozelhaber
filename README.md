# 🗺️ ÖzelHaber - İnteraktif Haber Haritası

[![Deploy to GitHub Pages](https://github.com/mserman90/ozelhaber/actions/workflows/deploy.yml/badge.svg)](https://github.com/mserman90/ozelhaber/actions/workflows/deploy.yml)
[![Windows Desktop Build](https://github.com/mserman90/ozelhaber/actions/workflows/windows-desktop.yml/badge.svg)](https://github.com/mserman90/ozelhaber/actions/workflows/windows-desktop.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Electron 45](https://img.shields.io/badge/Electron-45.3-47848f)](https://www.electronjs.org/)

**ÖzelHaber**, efsanevi haber görselleştirme platformu [newsmap.jp](http://newsmap.jp) ve açık kaynaklı NewsMap.JS mirasından esinlenerek geliştirilmiş; **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4** ve **Electron** ile güçlendirilmiş modern, hızlı ve duyarlı bir haber panosu ve Windows masaüstü uygulamasıdır.

🌐 **Canlı Web Uygulaması:** [https://mserman90.github.io/ozelhaber/](https://mserman90.github.io/ozelhaber/)  
💾 **Windows Masaüstü Kurulumu (.exe):** [Releases](https://github.com/mserman90/ozelhaber/releases)  
📄 **Akademik Teknik Makale (Whitepaper):** [docs/ACADEMIC_WHITEPAPER.md](docs/ACADEMIC_WHITEPAPER.md)  
📖 **Kapsamlı Kullanım Kılavuzu:** [docs/USER_MANUAL.md](docs/USER_MANUAL.md)  
🪟 **Windows Masaüstü ve Ekran Koruyucu Dokümantasyonu:** [docs/WINDOWS_DESKTOP.md](docs/WINDOWS_DESKTOP.md)  

---

## ✨ Öne Çıkan Özellikler

### 1. 📊 Squarified Treemap ve Izgara Görünümü
- Haberlerin önemine (sıralama / kaynak adedi) ve güncelliğine (zamansal renk eskitmesi) göre dinamik olarak ölçeklenen mozaik harita.
- Treemap, Birleşik Treemap ve Izgara (Grid) düzen modları.
- WCAG 2.1 bağıl parlaklık standardına göre otomatik kontrastlı tipografi.

### 2. ⚡ Doğrudan ve Hızlı Haber Erişimi & Sesli Okuma
- Herhangi bir haber kutucuğuna tıklandığında doğrudan orijinal kaynağa anında yönlendirme.
- **🔊 Sesli Dinleme (Text-to-Speech):** Web Speech API ile haber başlık ve özetlerini Türkçe/İngilizce sesli dinleme.
- Çoklu kaynak inceleme ve bağlantı kopyalama desteği.

### 3. 📚 Zengin Hazır Kaynak Kataloğu & OPML Desteği
- Tek tıkla haritaya eklenebilen seçkin kaynaklar (Gündem, Teknoloji, Ekonomi, Dünya).
- Dilediğiniz özel RSS/Atom adresini ekleme ve gelişmiş Google News Dork sorguları oluşturma imkanı.
- **📥/📤 OPML Desteği:** Feedly, Inoreader gibi okuyuculardan kaynak listelerini tek tıkla içe/dışa aktarma.

### 4. 🪟 Windows Masaüstü ve Ekran Koruyucu Entegrasyonu
- **Tek Tıkla Kurulum:** NSIS tabanlı `OzelHaber-Setup.exe` ile masaüstü panosu ve `ÖzelHaber.scr` ekran koruyucusu otomatik kurulur.
- **Zero-CORS Yerel Motor:** Masaüstünde Electron ana süreci (`fetch-feed` IPC) üzerinden Google News ve özel RSS kaynakları harici web proxy gecikmesi olmaksızın anında çekilir.
- **Akıllı Ekran Koruyucu:** Tam ekran modunda çalışır, ekran uykusunu engeller; fare hareketi veya klavye tuşunda kapanır.
- **Sistem Tepsisi & Otomatik Başlatma:** Kapatıldığında tepsiye küçülür, Windows açılışında otomatik başlama desteği sunar.

### 5. 🎨 Görsel Temalar & Mobil Uyum
- Klasik Koyu, AMOLED Saf Siyah ve Modern Açık temalar.
- Mobil cihazlar için akıcı alt çekmece (Bottom Sheet) ve PWA (Progressive Web App) desteği.

---

## 🚀 Kurulum ve Çalıştırma

### Web Geliştirme

```bash
git clone https://github.com/mserman90/ozelhaber.git
cd ozelhaber
pnpm install
pnpm dev
```

### Windows Masaüstü ve Paketleme

```powershell
# Geliştirme modunda masaüstü panosunu açın
pnpm desktop

# Ekran koruyucu modunu test edin
pnpm desktop:screensaver

# Windows NSIS kurulum paketini (.exe) derleyin
pnpm package:win
```

Derlenen kurulum dosyası `release/OzelHaber-Setup-0.2.1.exe` dizininde üretilir.

---

## 🛠️ Mimari ve Dizin Yapısı

```
ozelhaber/
├── .github/workflows/
│   ├── deploy.yml               # GitHub Pages otomatik dağıtım iş akışı
│   └── windows-desktop.yml      # Windows masaüstü kurulum paketi & GitHub Release iş akışı
├── build/
│   └── installer.nsh            # Windows NSIS kurulum/ekran koruyucu kayıt betiği
├── docs/
│   ├── ACADEMIC_WHITEPAPER.md   # Akademik teknik makale ve formülasyonlar
│   ├── USER_MANUAL.md           # Kapsamlı kullanıcı kılavuzu
│   └── WINDOWS_DESKTOP.md       # Windows masaüstü & ekran koruyucu dokümantasyonu
├── electron/
│   ├── main.cjs                 # Electron ana süreç, IPC feed motoru, tepsi & ekran koruyucu
│   ├── preload.cjs              # Güvenli köprü, fare algılama & contextBridge
│   ├── package.json             # Masaüstü kabuk bağımlılıkları
│   └── assets/                  # Uygulama ikonları (.ico, .png)
├── app/
│   ├── api/                     # Güvenli feed ve RSS vekil uç noktaları
│   ├── layout.tsx               # Ana layout, SEO, PWA manifest
│   └── globals.css              # Global Tailwind stilleri
├── newsmap/
│   ├── Components/              # App, Article, Edition, FeedsModal, OptionsModal vb.
│   ├── sources/                 # Google News ve RSS entegrasyonu (Zero-CORS IPC destekli)
│   ├── data/                    # Kategoriler, bölgeler ve hazır kaynaklar
│   └── i18n.js                  # Çift dil motoru (Türkçe & İngilizce)
└── public/                      # Statik varlıklar ve PWA manifest
```

---

## 📄 Lisans
Bu proje [MIT](LICENSE) lisansı altında yayınlanmıştır.
