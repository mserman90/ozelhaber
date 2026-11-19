# ÖzelHaber Windows masaüstü uygulaması

ÖzelHaber’in Windows kabuğu, mevcut haber haritasını Electron penceresinde çalıştırır. Haber mozaikleri/ızgara düzeni, tema ve kategori seçenekleri, kaynak kataloğu, özel RSS/Google News kaynakları, arama, TR/EN arayüzü ve pano paylaşımı web sürümünün kendisi tarafından sağlanır; masaüstü kabuğu bunları yeniden uygulamaz veya değiştirmez.

## Bağlantı ve veri

Uygulama mevcut canlı adresi (`https://mserman90.github.io/ozelhaber/`) yükler. Dolayısıyla güncel haberler ve web tarafındaki özellikler için internet erişimi gereklidir; şu an uygulama çevrimdışı haber okuyucu değildir. Web uygulamasında yayınlanan yeni özellikler, masaüstü uygulamasını güncellemeden erişilebilir. Bağlantı kurulamazsa uygulama yeniden deneme seçeneği gösterir.

## Kurulum ve geliştirme

Geliştirme için Windows üzerinde Node.js 20+ ve pnpm gerekir:

```powershell
pnpm install
pnpm desktop
```

Windows NSIS kurulum dosyası:

```powershell
pnpm package:win
```

Oluşan `release/OzelHaber-Setup-0.2.0.exe` dosyasını çalıştırın. Uygulama kaynak kodundan Windows dışında geliştirme yapmak mümkündür; Windows kurulum paketi oluşturmak için Windows ortamı veya depodaki Windows GitHub Actions iş akışı kullanılmalıdır.

## Ekran koruyucu

Kurulum, `ÖzelHaber.exe` yanına Windows ekran koruyucusu biçimindeki `ÖzelHaber.scr` dosyasını ekler. Windows’un ekran koruyucu ayarlarında bu `.scr` dosyasını seçip bekleme süresini ve devamında oturum açma tercihini belirleyin. Ekran koruyucu tam ekran haber haritası gösterir, görüntü uykusunu engeller ve fare/klavye girdisinde çıkar. Sistem tepsisindeki menüden **Ekran koruyucuyu başlat** seçeneğiyle de denenebilir.

Windows ekran koruyucu protokolünün `/s`, `/c` ve `/p` çağrıları ele alınır. `/p` Windows ayarlarına gömülü yerel HWND önizlemesi değildir; ayrı, küçük bir önizleme penceresi açar. `/c` ekran koruyucu kurulumunu nasıl seçeceğini anlatan iletişim kutusudur.

## Gizlilik ve güvenlik

Web içeriği sandbox, context isolation ve Node entegrasyonu kapalı şekilde çalışır. Harici haber bağlantıları sistemin varsayılan tarayıcısında açılır; masaüstü uygulaması yalnızca ÖzelHaber web adresindeki sayfalar arasında gezinmeye izin verir. Masaüstü kabuğuna haber içeriği veya hesap bilgisi kaydetme özelliği eklenmemiştir.
