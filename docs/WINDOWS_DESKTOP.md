# ÖzelHaber Windows Masaüstü ve Ekran Koruyucu Uygulaması

ÖzelHaber’in Windows kabuğu, interaktif haber haritasını modern ve optimize edilmiş bir Electron penceresinde çalıştırır. Haber mozaikleri, ızgara düzeni, tema ve kategori seçenekleri, kaynak kataloğu, özel RSS/Google News kaynakları, arama, TR/EN arayüzü ve pano paylaşımı web çekirdeği ile tam uyumlu olarak sunulur.

---

## ⚡ Masaüstü Özellikleri ve Geliştirmeler

1. **Doğrudan IPC Feed Çekici (Zero-CORS):**
   - Masaüstü ortamında çalışırken web tarayıcılarındaki CORS engellerini aşmak için harici proxy'lere (`allorigins`, `corsproxy` vb.) ihtiyaç duymaz.
   - Electron ana sürecindeki yerel Node/net motoru aracılığıyla Google News ve özel RSS beslemelerini sıfır gecikmeyle ve kesintisiz çeker.

2. **Windows Ekran Koruyucusu (`.scr`) Desteği:**
   - Kurulumla birlikte `ÖzelHaber.scr` otomatik olarak kurulur ve Başlat Menüsüne doğrudan çalıştırma kısayolu eklenir.
   - Windows standart `/s` (çalıştırma), `/c` (yapılandırma) ve `/p` (önizleme) komut satırı parametrelerini eksiksiz destekler.
   - Ekran koruyucu tam ekran modunda açılır, ekranın uyku moduna geçmesini engeller ve klavye tuşuna basıldığında veya fare hareket ettirildiğinde otomatik olarak kapanır.

3. **Gelişmiş Sistem Tepsisi (Tray) Yönetimi:**
   - Arka planda çalışırken sistem tepsisi simgesi üzerinden yönetilir.
   - Menüden tek tıkla **Ekran koruyucuyu başlat** veya **Windows Ekran Koruyucu Ayarlarını Aç** komutları verilebilir.
   - **"Windows ile Birlikte Başlat"** seçeneği ile sistem açılışında arka planda hazır beklemesi sağlanabilir.

4. **Tek Örnek (Single Instance) Güvencesi:**
   - Uygulama tepside veya ekranda açıkken masaüstü simgesine tekrar tıklandığında mükerrer süreç başlatılmaz; mevcut pencere öne getirilir.

5. **Klavye Kısayolları (Power-User Hotkeys):**
   - `Esc`: Açık modalları ve haber özet pencerelerini kapatır.
   - `/`: Doğrudan arama çubuğunu açar.
   - `O`: Seçenekler ve ayarlar penceresini açar.
   - `S`: Kaynak kataloğunu ve özel besleme yöneticisini açar.

6. **Dahili Okuma & Sesli Dinleme (Text-to-Speech):**
   - Haber özet penceresinde Türkçe ve İngilizce haber başlıklarını sesli dinleme (`🔊 Sesli Dinle`) butonu mevcuttur.
   - OPML içe ve dışa aktarma ile RSS beslemeleri diğer okuyuculardan kolayca aktarılabilir.

---

## 🚀 Kurulum ve Paketleme

Geliştirme için Windows ortamında Node.js 20+ ve pnpm gereklidir:

```powershell
# Bağımlılıkları yükleyin
pnpm install

# Masaüstü uygulamasını geliştirme modunda başlatın
pnpm desktop

# Ekran koruyucu modunu test edin
pnpm desktop:screensaver
```

### Windows Kurulum Paketi (.exe) Oluşturma:

```powershell
pnpm package:win
```

Oluşan `release/OzelHaber-Setup-0.2.0.exe` dosyası çalıştırıldığında uygulamayı ve ekran koruyucuyu otomatik olarak kurar.

---

## 🔒 Güvenlik Mimarisi

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` güvenlik standartları korunmuştur.
- Harici haber bağlantıları varsayılan web tarayıcısında açılır; masaüstü kabuğu yalnızca güvenli hedeflere izin verir.
