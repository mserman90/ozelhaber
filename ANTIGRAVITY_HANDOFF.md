# Google Antigravity için proje aktarım notu

Bu arşiv, `mserman90/ozelhaber` deposunun Windows masaüstü uygulaması ve ekran koruyucu kabuğuyla genişletilmiş çalışma kopyasıdır. Depodaki haber haritasının mevcut web özellikleri korunur; Electron masaüstü kabuğu canlı web uygulamasını açar.

## Proje durumu

- Electron ana süreç dosyası: `electron/main.cjs`
- Electron alt paket tanımı: `electron/package.json`
- Windows NSIS installer ayarları: ana `package.json`
- Installer sırasında `.scr` kopyalama: `build/installer.nsh`
- Windows Actions build: `.github/workflows/windows-desktop.yml`
- Kullanım ve teknik sınırlamalar: `docs/WINDOWS_DESKTOP.md`
- Ana README’de Windows geliştirme/paketleme komutları yer alır.

Masaüstü uygulaması `https://mserman90.github.io/ozelhaber/` adresini yükler. Bu yaklaşım uygulamanın mevcut treemap/ızgara görünümleri, temalar, haber kaynak kataloğu, özel RSS/Google News kaynakları, arama, dil ve pano paylaşımı özelliklerini aynı web uygulaması üzerinden korur. İnternet bağlantısı gerekir; çevrimdışı çalışma bu sürümde kapsam dışıdır.

## Önceki doğrulama

- `pnpm build` başarılı.
- `pnpm exec tsc --noEmit` başarılı.
- `node --check electron/main.cjs` başarılı.
- Electron Builder ile Windows `win-unpacked` uygulama klasörü üretildi; Windows PE yürütülebilir dosyası ve küçük `app.asar` doğrulandı.
- Bu geliştirme ortamında Wine bulunmadığından NSIS kurulum `.exe` dosyasının oluşturulması tamamlanamadı. Gerçek kurulum dosyasını Windows’ta veya GitHub Actions `Windows Desktop Build` iş akışında üretip test edin.
- Kaynak arşivine `node_modules`, `.next`, `release` ve Git geçmişi dahil edilmemiştir.

## Devam edecek asistana talimat

1. Önce `README.md`, `docs/WINDOWS_DESKTOP.md`, `electron/main.cjs`, `package.json`, `build/installer.nsh` ve Windows Actions dosyasını okuyun.
2. Windows üzerinde `pnpm install` ve `pnpm package:win` ile gerçek kurucuyu üretip doğrulayın. Ayrıca `.scr` dosyasının Windows Ekran Koruyucusu ayarlarında seçilebildiğini ve `/s`, `/c`, `/p` çağrılarının beklendiği şekilde çalıştığını test edin.
3. Uygulama çevrimiçi web sürümünü açtığı için çevrimdışı destek veya yerel veri saklama eklemeden önce mimariyi ve API/feeds kısıtlarını analiz edin; mevcut çalışma biçimini sessizce değiştirmeyin.
4. Mevcut masaüstü kabuğunun güvenlik ayarlarını (sandbox, context isolation, Node entegrasyonu kapalı, harici bağlantıların varsayılan tarayıcıda açılması) koruyun.
5. Kaynak değişikliklerini test edin ve Windows kurulumu/ekran koruyucu entegrasyonu için gerçek Windows testi sonuçlarını raporlayın. Kullanıcı açıkça istemedikçe GitHub deposuna push yapmayın.
