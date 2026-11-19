# 📖 ÖzelHaber - Kapsamlı Kullanım Kılavuzu

**ÖzelHaber**, binlerce haber başlığı arasında kaybolmadan, gündemi en önemli maddeleri ve gerçek zamanlı görsel boyutlarıyla takip etmenizi sağlayan yeni nesil bir haber haritası ve Windows masaüstü panosudur.

Bu kılavuzda uygulamanın web ve Windows masaüstü sürümlerindeki tüm özelliklerini, kısayollarını ve püf noktalarını bulabilirsiniz.

---

## 📌 İçindekiler
1. [Hızlı Başlangıç ve Temel Arayüz](#1-hızlı-başlangıç-ve-temel-arayüz)
2. [Haberleri Okuma, Kaynaklar ve Sesli Dinleme](#2-haberleri-okuma-kaynaklar-ve-sesli-dinleme)
3. [📚 Hazır Kaynak Kataloğu ve Popüler Beslemeler](#3-hazır-kaynak-kataloğu-ve-popüler-beslemeler)
4. [🔍 Kendi RSS veya Google Dork Aramanızı Ekleyin](#4-kendi-rss-veya-google-dork-aramanızı-ekleyin)
5. [📥/📤 OPML ile RSS İçe ve Dışa Aktarma](#5-opml-ile-rss-içe-ve-dışa-aktarma)
6. [🎨 Görsel Temalar ve Kişiselleştirme](#6-görsel-temalar-ve-kişiselleştirme)
7. [🔗 Panoyu Paylaşma (Stateful URLs)](#7-panoyu-paylaşma-stateful-urls)
8. [🪟 Windows Masaüstü Uygulaması ve Ekran Koruyucu](#8-windows-masaüstü-uygulaması-ve-ekran-koruyucu)
9. [📱 Mobil Kullanım ve PWA Olarak Yükleme](#9-mobil-kullanım-ve-pwa-olarak-yükleme)
10. [⌨️ Klavye Kısayolları ve İpuçları](#10-klavye-kısayolları-ve-ipuçları)

---

## 1. Hızlı Başlangıç ve Temel Arayüz

ÖzelHaber ekranı açıldığında iki ana bölgeden oluşur:

1. **Haber Mozaiği (Treemap Haritası):**
   - Ekranda gördüğünüz kutucukların büyüklüğü, haberin önemini, kaynak çeşitliliğini veya güncelliğini temsil eder.
   - **Kutu ne kadar büyükse, o haber gündemde o kadar geniş yer bulmuştur.**
   - Kutunun rengi haberin kategorisini (Dünya, Ülke, Teknoloji, İş Dünyası vb.) belirtir.
   - **Parlak renkler:** Son dakikalarda girilen yeni haberler.
   - **Koyulaşan renkler:** Birkaç saat veya gün öncesine ait haberler.

2. **Üst/Alt Kontrol Çubuğu (Toolbar):**
   - **Kategoriler:** Haritada hangi haber türlerinin görüneceğini filtreler.
   - **Seçenekler (Options):** Harita düzeni, tema, kategori başına düşen haber adedi gibi ayarları yönetir.
   - **Tam Ekran:** Odaklanarak okumak için haritayı tam ekrana genişletir.
   - **Ara:** Harita üzerinde canlı kelime veya regex araması yapar.
   - **Kaynaklar:** Özel haber beslemeleri eklemenizi sağlar.
   - **🔗 Panoyu Paylaş:** Oluşturduğunuz filtreleri tek tıkla kopyalar.
   - **TR / EN:** Tek tıkla Türkçe ve İngilizce arasında arayüz dilini değiştirir.

---

## 2. Haberleri Okuma, Kaynaklar ve Sesli Dinleme

- **Doğrudan Habere Gitme:**
   - Haritadaki herhangi bir haber kutusuna tıkladığınızda doğrudan ilgili haberin orijinal kaynağına yönlendirilirsiniz.
- **Detay ve Özet Modalı:**
   - Seçenekler menüsünden *"Bağlantıyı açmadan önce kaynakları göster"* tercihini açarsanız, tıklanan haberin kaynaklarını listeleyen temiz detay penceresi açılır.
- **🔊 Sesli Dinleme (Text-to-Speech):**
   - Haber detay penceresindeki **"🔊 Sesli Dinle"** butonuna basarak haberin başlığını ve özetini tarayıcınızın veya masaüstü uygulamanızın yerel ses motoruyla dinleyebilirsiniz.
- **📋 Bağlantı Kopyalama:**
   - **"📋 Bağlantıyı Kopyala"** butonu ile haber linkini anında panoya alabilirsiniz.

---

## 3. 📚 Hazır Kaynak Kataloğu ve Popüler Beslemeler

Kendi özel haber panonuzu oluşturmak için elle RSS adresi aramanıza gerek yoktur:

1. Üst menüden **"Kaynaklar"** butonuna tıklayın.
2. Açılan pencerede **"Katalog / Önerilenler"** sekmesine gelin.
3. Kategorilerden filtreleyin:
   - **Gündem:** Anadolu Ajansı, TRT Haber, BBC Türkçe, Sözcü, NTV, T24.
   - **Teknoloji:** Webrazzi, ShiftDelete.Net, DonanımHaber, Webtekno, TechCrunch, The Verge, Hacker News.
   - **Ekonomi:** Bloomberg HT, Dünya Gazetesi.
   - **Dünya:** BBC News, Reuters, The Guardian.
4. İstediğiniz kaynağın yanındaki **"+ Haritaya Ekle"** butonuna basın.

---

## 4. 🔍 Kendi RSS veya Google Dork Aramanızı Ekleyin

- **Özel RSS / Atom Beslemesi:**
   - "Kaynaklar" -> "RSS / Atom Beslemesi" sekmesine dilediğiniz herhangi bir sitenin RSS linkini yapıştırın (Örn: `https://feeds.bbci.co.uk/news/rss.xml`).
   - İstediğiniz rengi seçin ve "Besleme Ekle"ye tıklayın.
   - Masaüstü uygulamasında **Zero-CORS IPC Motoru** sayesinde doğrudan ve sıfır gecikmeyle çekilir.

- **Google News Dork Araması:**
   - "Google News Araması" sekmesinden `site:bloomberght.com "yapay zeka" when:7d` gibi gelişmiş kriterler belirleyip haritanıza ekleyebilirsiniz.

---

## 5. 📥/📤 OPML ile RSS İçe ve Dışa Aktarma

Diğer RSS okuyuculardaki (Feedly, Inoreader vb.) kaynaklarınızı ÖzelHaber'e kolayca aktarabilirsiniz:
- **İçe Aktarma:** "Kaynaklar" penceresindeki **"📥 OPML İçe Aktar"** butonuna tıklayın ve `.opml` veya `.xml` dosyanızı seçin.
- **Dışa Aktarma:** Kayıtlı özel kaynaklarınızı yedeklemek için **"📤 OPML Dışa Aktar"** butonuna tıklayarak tek tıkla standart OPML 2.0 dosyanızı indirin.

---

## 6. 🎨 Görsel Temalar ve Kişiselleştirme

**Seçenekler (Options)** penceresinden:
- **Görsel Tema:**
   - **Klasik Koyu:** Haber başlıklarının canlı renklerle parladığı klasik koyu arka plan.
   - **AMOLED Siyah:** OLED ekranlar için saf siyah (`#000000`) zemin, pil tasarrufu sağlar.
   - **Açık Mod:** Gündüz veya parlak ışıkta rahat okuma için açık arayüz.
- **Düzen Biçimi:**
   - **Treemap:** Klasik mozaik harita.
   - **Treemap (Birleşik):** Tüm kategorilerin tek bir haritada harmanlandığı görünüm.
   - **Izgara (Grid):** Eşit boyutlu kutulardan oluşan derli toplu ızgara düzeni.

---

## 7. 🔗 Panoyu Paylaşma (Stateful URLs)

Hazırladığınız haber panosunu paylaşmak için:
1. Üst bardaki **"🔗 Panoyu Paylaş"** butonuna tıklayın.
2. Haritanızdaki seçili bölge, arama terimi ve filtreleri içeren özel URL panonuza kopyalanır.

---

## 8. 🪟 Windows Masaüstü Uygulaması ve Ekran Koruyucu

ÖzelHaber Windows masaüstü sürümü, web deneyimini gelişmiş yerel Windows yetenekleriyle birleştirir:

- **Masaüstü Panosu (`ÖzelHaber.exe`):**
  - Masaüstündeki simgeden açılır.
  - Kapatıldığında sistem tepsisine (saat yanına) küçülür, arka planda hazır bekler.
  - Tek örnek koruması (`Single Instance Lock`) ile mükerrer pencereler açılmaz.
  - Tepsi menüsünden *"Windows ile Birlikte Başlat"* açılarak bilgisayar açılışında otomatik başlaması sağlanabilir.

- **Windows Ekran Koruyucusu (`ÖzelHaber.scr`):**
  - Kurulumla birlikte sisteminize otomatik olarak yüklenir.
  - Başlat Menüsündeki *"ÖzelHaber Ekran Koruyucu"* kısayolundan hemen çalıştırılabilir.
  - Windows'un ekran koruyucusu olarak ayarlamak için: `Windows Ayarları → Kişiselleştirme → Kilit Ekranı → Ekran Koruyucu` bölümünden seçilebilir.
  - Tam ekran modunda çalışır, ekranın uykuya geçmesini engeller; **fare hareketi, tıklama veya klavye tuşuna basıldığında** anında güvenle kapanır.

- **Uygulamayı Kaldırma:**
  - `Denetim Masası → Program Ekle/Kaldır` üzerinden veya kurulum klasöründeki `Uninstall ÖzelHaber.exe` çalıştırılarak tek tıkla sistemden temizlenir.

---

## 9. 📱 Mobil Kullanım ve PWA Olarak Yükleme

- Mobil cihazlarda dokunmatik dostu alt çekmece (Bottom Sheet) ile çalışır.
- **PWA Yükleme:** Tarayıcı menüsünden *"Ana Ekrana Ekle"* veya *"Uygulamayı Yükle"* seçilerek telefonda yerel uygulama gibi çalıştırılabilir.

---

## 10. ⌨️ Klavye Kısayolları ve İpuçları

- <kbd>Esc</kbd>: Açık olan tüm modalları, arama pencerelerini ve özet ekranlarını kapatır.
- <kbd>/</kbd>: Canlı arama kutusunu anında açar.
- <kbd>O</kbd>: Seçenekler (Options) penceresini açar.
- <kbd>S</kbd>: Kaynaklar (Sources) penceresini açar.
- <kbd>Alt</kbd> + **Kategoriye Tıklama:** Sadece o kategoriyi aktif yapar, diğerlerinin tümünü kapatır (Odaklanma modu). Tekrar tıklandığında tüm kategorileri geri açar.
- **Ekranı Açık Tut (Keep Screen On):** Ofisinizde veya televizyonunuzda bilgi panosu (dashboard) olarak kullanıyorsanız bu seçeneği işaretleyin; ekranınız asla uyku moduna geçmez.
