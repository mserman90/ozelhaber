# 📖 ÖzelHaber - Kapsamlı Kullanım Kılavuzu

**ÖzelHaber**, binlerce haber başlığı arasında kaybolmadan, gündemi en önemli maddeleri ve gerçek zamanlı görsel boyutlarıyla takip etmenizi sağlayan yeni nesil bir haber haritasıdır.

Bu kılavuzda uygulamanın tüm özelliklerini, kısayollarını ve püf noktalarını bulabilirsiniz.

---

## 📌 İçindekiler
1. [Hızlı Başlangıç ve Temel Arayüz](#1-hızlı-başlangıç-ve-temel-arayüz)
2. [Haberleri Okuma ve Detay Modalı](#2-haberleri-okuma-ve-detay-modalı)
3. [✨ Ücretsiz Yapay Zeka (AI) Haber Özeti](#3-ücretsiz-yapay-zeka-ai-haber-özeti)
4. [📚 Hazır Kaynak Kataloğundan Haber Ekleme](#4-hazır-kaynak-kataloğundan-haber-ekleme)
5. [🔍 Kendi RSS veya Google Dork Aramanızı Ekleyin](#5-kendi-rss-veya-google-dork-aramanızı-ekleyin)
6. [🎨 Görsel Temalar ve Kişiselleştirme](#6-görsel-temalar-ve-kişiselleştirme)
7. [🔗 Panoyu Paylaşma (Stateful URLs)](#7-panoyu-paylaşma-stateful-urls)
8. [📱 Mobil Kullanım ve PWA Olarak Yükleme](#8-mobil-kullanım-ve-pwa-olarak-yükleme)
9. [⌨️ Klavye Kısayolları ve İpuçları](#9-klavye-kısayolları-ve-ipuçları)

---

## 1. Hızlı Başlangıç ve Temel Arayüz

ÖzelHaber ekranı açıldığında iki ana bölgeden oluşur:

1. **Haber Mozaiği (Treemap Haritası):**
   - Ekranda gördüğünüz kutucukların büyüklüğü, haberin Google News sıralamasındaki önemini, kaynak çeşitliliğini veya güncelliğini temsil eder.
   - **Kutu ne kadar büyükse, o haber gündemde o kadar geniş yer bulmuştur.**
   - Kutunun rengi haberin kategorisini (Dünya, Ülke, Teknoloji, İş Dünyası vb.) belirtir.
   - **Parlak renkler:** Son dakikalarda girilen yepyeni haberler.
   - **Koyulaşan renkler:** Birkaç saat veya gün öncesine ait oturmuş haberler.

2. **Üst/Alt Kontrol Çubuğu (Toolbar):**
   - **Kategoriler:** Haritada hangi haber türlerinin görüneceğini filtreler.
   - **Seçenekler (Options):** Harita düzeni, tema, kategori başına düşen haber adedi gibi ayarları yönetir.
   - **Tam Ekran:** Odaklanarak okumak için haritayı tam ekrana genişletir.
   - **Ara:** Harita üzerinde canlı kelime veya regex araması yapar.
   - **Kaynaklar:** Özel haber beslemeleri eklemenizi sağlar.
   - **🔗 Panoyu Paylaş:** Oluşturduğunuz filtreleri tek tıkla kopyalar.
   - **TR / EN:** Tek tıkla Türkçe ve İngilizce arasında arayüz dilini değiştirir.

---

## 2. Haberleri Okuma ve Detay Modalı

- **Habere Tıklama:**
  - Haritadaki bir haber kutusuna tıkladığınızda **Haber Detay ve Özet Penceresi** açılır.
  - Açılan pencerede:
    - Haberin tam başlığı ve ana yayın organı,
    - Haberin yayınlanma saati,
    - **"📖 Haberi Orijinal Kaynakta Oku"** butonu,
    - Varsa aynı olayı aktaran alternatif diğer yayıncıların haber başlıkları listelenir.

---

## 3. ✨ Ücretsiz Yapay Zeka (AI) Haber Özeti

ÖzelHaber, **herhangi bir API anahtarı veya ödeme gerektirmeyen**, tamamen ücretsiz açık yapay zeka modelleri (Mistral AI / Pollinations) ile entegre çalışır.

1. Detay modalındaki **"✨ Yapay Zeka Özeti (Ücretsiz)"** butonuna tıklayın.
2. 1-2 saniye içinde yapay zeka haberi tarayarak şunları üretir:
   - **Kilit Çıkarım (Key Takeaway):** Haberin tek cümlelik ana fikri.
   - **3 Maddelik Hap Bilgi:** Haberin konusu, arka planı ve olası etkisi.
   - **Duygu / Ton Rozeti:** Haberin tonu anında analiz edilir:
     - 🟢 **Olumlu:** Başarı, rekor, anlaşma, bilimsel buluş.
     - 🔵 **Dengeli / Nötr:** Standart bilgilendirici haber.
     - 🔴 **Kritik / Olumsuz:** Kriz, düşüş, kaza.
     - 🚨 **Son Dakika / Acil:** Kritik önemdeki gelişmeler ve uyarılar.
   - **Akıllı Etiketler:** Konuyla ilgili otomatik etiketler.

> [!TIP]
> Çevrimdışıysanız veya genel yapay zeka servisine anlık erişilemiyorsa, sistem otomatik olarak **yerel kural tabanlı NLP motoruna** geçerek özet üretmeye kesintisiz devam eder.

---

## 4. 📚 Hazır Kaynak Kataloğundan Haber Ekleme

Kendi özel haber panonuzu oluşturmak için elle RSS adresi aramanıza gerek yoktur:

1. Üst menüden **"Kaynaklar"** butonuna tıklayın.
2. Açılan pencerede en baştaki **"Katalog / Önerilenler"** sekmesine gelin.
3. Kategorilerden filtreleyin:
   - **Gündem:** Anadolu Ajansı, TRT Haber, BBC Türkçe, Sözcü, NTV, T24.
   - **Teknoloji:** Webrazzi, ShiftDelete.Net, DonanımHaber, Webtekno, TechCrunch, The Verge, Hacker News.
   - **Ekonomi:** Bloomberg HT, Dünya Gazetesi.
   - **Dünya:** BBC News, Reuters, The Guardian.
4. İstediğiniz kaynağın yanındaki **"+ Haritaya Ekle"** butonuna basın.
5. Kaynak anında haritada kendi özel rengiyle bir blok olarak belirir!

---

## 5. 🔍 Kendi RSS veya Google Dork Aramanızı Ekleyin

- **Özel RSS / Atom Beslemesi:**
  - "Kaynaklar" -> "RSS / Atom Beslemesi" sekmesine dilediğiniz herhangi bir sitenin RSS linkini yapıştırın (Örn: `https://feeds.bbci.co.uk/news/rss.xml`).
  - İstediğiniz rengi seçin ve "Besleme Ekle"ye tıklayın.
  - Besleme güvenli sunucu proxy'miz üzerinden CORS sorunu olmadan çekilir.

- **Google News Dork Araması:**
  - Belirli bir konuyu veya şirketi takip etmek istiyorsanız "Google News Araması" sekmesini kullanın.
  - Örneğin: `site:bloomberght.com "yapay zeka" when:7d` gibi gelişmiş arama kriterleri belirleyip doğrudan haritada özel bir blok olarak izleyin!

---

## 6. 🎨 Görsel Temalar ve Kişiselleştirme

**Seçenekler (Options)** penceresinden:
- **Görsel Tema:**
  - **Klasik Koyu:** Haber başlıklarının canlı renklerle parladığı klasik koyu arka plan.
  - **AMOLED Siyah:** OLED ekranlar için saf siyah (`#000000`) zemin, pil tasarrufu sağlar.
  - **Açık Mod:** Gündüz veya parlak ışıkta rahat okuma için beyaz/gri tonlu arayüz.
- **Düzen Biçimi:**
  - **Treemap:** Klasik mozaik harita.
  - **Treemap (Birleşik):** Tüm kategorilerin tek bir dev treemap içinde harmanlandığı görünüm.
  - **Izgara (Grid):** Eşit boyutlu kutulardan oluşan derli toplu ızgara düzeni.
- **Renk Paleti:** Farklı renk kombinasyonları arasında seçim yapabilirsiniz.

---

## 7. 🔗 Panoyu Paylaşma (Stateful URLs)

Hazırladığınız haber panosunu bir arkadaşınıza veya iş arkadaşınıza göndermek çok kolaydır:
1. Üst bardaki **"🔗 Panoyu Paylaş"** butonuna tıklayın.
2. Haritanızdaki seçili bölge, arama terimi ve filtreleri içeren özel URL panonuza kopyalanır.
3. Bu linki açan herkes tam olarak sizin hazırladığınız haritayı görür.

---

## 8. 📱 Mobil Kullanım ve PWA Olarak Yükleme

ÖzelHaber, mobil ve tablet ekranlarda mükemmel çalışacak şekilde optimize edilmiştir:
- Mobilde haberlere dokunduğunuzda alttan yukarı doğru akıcı bir **Bottom Sheet (Çekmece)** açılır.
- **Ana Ekrana Ekleme (PWA):**
  - **iOS Safari:** Paylaş butonuna dokunun -> *"Ana Ekrana Ekle"* seçeneğini seçin.
  - **Android Chrome:** Menüden (üç nokta) -> *"Uygulamayı Yükle"* veya *"Ana Ekrana Ekle"* butonuna dokunun.
  - Uygulama telefonunuzda yerel bir mobil uygulama gibi tam ekran çalışır.

---

## 9. ⌨️ Klavye Kısayolları ve İpuçları

- <kbd>Alt</kbd> + **Kategoriye Tıklama:** Sadece o kategoriyi aktif yapar, diğerlerinin tümünü kapatır (Odaklanma modu). Tekrar basıldığında tüm kategorileri geri açar.
- <kbd>Esc</kbd>: Açık olan tüm modalları, arama pencerelerini ve özet ekranlarını kapatır.
- **Ekranı Açık Tut (Keep Screen On):** Ofisinizde veya televizyonunuzda bilgi panosu (dashboard) olarak kullanıyorsanız bu seçeneği işaretleyin; ekranınız asla uyku moduna geçmez.
