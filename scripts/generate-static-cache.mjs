/**
 * Generates initial rich static cache snapshots for GitHub Pages
 * Ensures instantaneous rendering of treemap tiles with zero CORS dependency
 */

import fs from 'node:fs'
import path from 'node:path'

const cacheDir = path.resolve('public', 'data', 'cache')
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true })
}

const now = new Date()

function getPastTime(minutesAgo) {
  return new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString()
}

const trDatasets = {
  nation: {
    title: 'GÜNDEM',
    articles: [
      {
        id: 'tr_nat_1',
        title: "TBMM'de Yeni Yasama Yılında Ekonomik ve Yapısal Reform Paketleri Görüşülüyor",
        url: 'https://www.aa.com.tr/tr/gundem',
        publishedAt: getPastTime(25),
        sources: [
          { id: 'aa', name: 'Anadolu Ajansı', title: "TBMM'de Yeni Yasama Yılında Ekonomik ve Yapısal Reform Paketleri Görüşülüyor", url: 'https://www.aa.com.tr' },
          { id: 'trt', name: 'TRT Haber', title: "Mecliste Yeni Reform Gündemi Yoğun", url: 'https://www.trthaber.com' },
          { id: 'ntv', name: 'NTV', title: "TBMM Genel Kurulu Yeni Kanun Teklifini Tartışıyor", url: 'https://www.ntv.com.tr' },
        ],
      },
      {
        id: 'tr_nat_2',
        title: "Meteoroloji Genel Müdürlüğü'nden Marmara ve Ege Bölgesi İçin Kuvvetli Yağış Uyarısı",
        url: 'https://www.mgm.gov.tr',
        publishedAt: getPastTime(45),
        sources: [
          { id: 'haberturk', name: 'Habertürk', title: 'Meteorolojiden 12 İle Sarı ve Turuncu Kodlu Uyarı', url: 'https://www.haberturk.com' },
          { id: 'sozcu', name: 'Sözcü', title: "Kuvvetli Yağış ve Fırtına Uyarısı: Dikkatli Olun", url: 'https://www.sozcu.com.tr' },
        ],
      },
      {
        id: 'tr_nat_3',
        title: "Ulaştırma ve Altyapı Bakanlığı: Yüksek Hızlı Tren Hatlarında Yeni Seferler ve Güzergahlar Açılıyor",
        url: 'https://www.tcdd.gov.tr',
        publishedAt: getPastTime(70),
        sources: [
          { id: 'aa', name: 'Anadolu Ajansı', title: 'YHT Hatlarında Yeni Sefer Dönemi Başladı', url: 'https://www.aa.com.tr' },
          { id: 'cumhuriyet', name: 'Cumhuriyet', title: 'Demiryolu Ağı Yeni Hatlarla Genişliyor', url: 'https://www.cumhuriyet.com.tr' },
        ],
      },
      {
        id: 'tr_nat_4',
        title: "Sanayi ve Teknoloji Bakanlığı AR-GE ve Yenilikçilik Destek Paketinin İkinci Fazını Duyurdu",
        url: 'https://www.sanayi.gov.tr',
        publishedAt: getPastTime(110),
        sources: [
          { id: 'hurriyet', name: 'Hürriyet', title: 'Yerli Üretime Milyarlarca Liralık AR-GE Desteği', url: 'https://www.hurriyet.com.tr' },
          { id: 'milliyet', name: 'Milliyet', title: 'Yüksek Teknoloji Üreticilerine Teşvik Kolaylığı', url: 'https://www.milliyet.com.tr' },
        ],
      },
      {
        id: 'tr_nat_5',
        title: "Kültür ve Turizm Bakanlığı Yılın İlk Üç Çeyrek Ziyaretçi Verilerini Açıkladı: Tarihi Rekor",
        url: 'https://www.ktb.gov.tr',
        publishedAt: getPastTime(160),
        sources: [
          { id: 'trt', name: 'TRT Haber', title: 'Türkiye Turizmde Hedefleri Aşıyor: 45 Milyon Turist', url: 'https://www.trthaber.com' },
        ],
      },
    ],
  },
  world: {
    title: 'DÜNYA',
    articles: [
      {
        id: 'tr_wor_1',
        title: "Birleşmiş Milletler Zirvesi'nde İklim Değişikliği ve Küresel Güvenlik Masada",
        url: 'https://www.bbc.com/turkce/topics/c2dwqnw10w7t',
        publishedAt: getPastTime(35),
        sources: [
          { id: 'bbc', name: 'BBC Türkçe', title: "BM Genel Kurulu'nda Tarihi İklim Kararları", url: 'https://www.bbc.com/turkce' },
          { id: 'euronews', name: 'Euronews Türkçe', title: 'Dünya Liderleri Karbon Emisyon Hedeflerini Güncelliyor', url: 'https://tr.euronews.com' },
          { id: 'dw', name: 'DW Türkçe', title: 'Küresel İklim Fonu İçin Yeni Kaynak Çağrısı', url: 'https://www.dw.com/tr' },
        ],
      },
      {
        id: 'tr_wor_2',
        title: 'Avrupa Parlamentosu Yapay Zeka Yasasını (EU AI Act) Yürürlüğe Koyuyor',
        url: 'https://tr.euronews.com',
        publishedAt: getPastTime(55),
        sources: [
          { id: 'euronews', name: 'Euronews Türkçe', title: 'Yapay Zeka İçin İlk Kapsamlı Küresel Hukuk Çerçevesi', url: 'https://tr.euronews.com' },
          { id: 'aa', name: 'Anadolu Ajansı', title: "AB'den Yapay Zeka Risklerine Sıkı Denetim", url: 'https://www.aa.com.tr' },
        ],
      },
      {
        id: 'tr_wor_3',
        title: 'Orta Doğu Diplomasisinde Ateşkes ve İnsani Yardım Koridorları İçin Yeni Müzakereler',
        url: 'https://www.trthaber.com/dunya',
        publishedAt: getPastTime(85),
        sources: [
          { id: 'trt', name: 'TRT Haber', title: 'Bölgesel Barış İçin Diplomatik Trafik Yoğunlaşıyor', url: 'https://www.trthaber.com' },
          { id: 'reuters', name: 'Reuters', title: 'Middle East Talks Advance with International Mediators', url: 'https://www.reuters.com' },
        ],
      },
      {
        id: 'tr_wor_4',
        title: 'Asya Pasifik Ekonomik İşbirliği Toplantısında Ticaret Yolları ve Tedarik Güvenliği Ele Alındı',
        url: 'https://www.bloomberght.com',
        publishedAt: getPastTime(140),
        sources: [
          { id: 'bloomberght', name: 'Bloomberg HT', title: 'Asya Piyasalarında Tedarik Zinciri Hamlesi', url: 'https://www.bloomberght.com' },
        ],
      },
    ],
  },
  business: {
    title: 'EKONOMİ',
    articles: [
      {
        id: 'tr_bus_1',
        title: 'Merkez Bankası Para Politikası Kurulu Kararları Sonrası Piyasalar Dengeleniyor',
        url: 'https://www.bloomberght.com',
        publishedAt: getPastTime(20),
        sources: [
          { id: 'bloomberght', name: 'Bloomberg HT', title: 'TCMB Faiz Kararını Açıkladı: Dezenflasyon Süreci Vurgusu', url: 'https://www.bloomberght.com' },
          { id: 'dunya', name: 'Dünya Gazetesi', title: 'İş Dünyasından Faiz ve Kredi Koşulları Değerlendirmesi', url: 'https://www.dunya.com' },
          { id: 'foreks', name: 'Foreks Haber', title: 'Bankacılık Endeksinde Pozitif Seyir Sürüyor', url: 'https://www.foreks.com' },
        ],
      },
      {
        id: 'tr_bus_2',
        title: 'Borsa İstanbul BIST 100 Endeksi Teknoloji ve Sanayi Hisseleriyle Yükseliş Trendinde',
        url: 'https://www.borsaistanbul.com',
        publishedAt: getPastTime(50),
        sources: [
          { id: 'aa', name: 'Anadolu Ajansı Finans', title: 'BIST 100 Rekor Seviyelere Yaklaşıyor', url: 'https://www.aa.com.tr' },
          { id: 'ntvpara', name: 'NTV Para', title: 'Yabancı Yatırımcı Girişlerinde Artış Gözleniyor', url: 'https://www.ntv.com.tr/ntvpara' },
        ],
      },
      {
        id: 'tr_bus_3',
        title: 'İhracatta Katma Değerli Üretim Payı Arttı: Otomotiv ve Kimya Sektörleri Zirvede',
        url: 'https://www.tim.org.tr',
        publishedAt: getPastTime(90),
        sources: [
          { id: 'dunya', name: 'Dünya Gazetesi', title: 'TİM Verileri: Yıllıklandırılmış İhracat 260 Milyar Doları Aştı', url: 'https://www.dunya.com' },
        ],
      },
      {
        id: 'tr_bus_4',
        title: 'Girişim Sermayesi Fonları Yapay Zeka ve Fintek Alanındaki Türk Startuplarına Yoğunlaşıyor',
        url: 'https://webrazzi.com',
        publishedAt: getPastTime(130),
        sources: [
          { id: 'webrazzi', name: 'Webrazzi', title: 'Yılın İlk Yarısında Türk Girişimlerine 500 Milyon Dolar Yatırım', url: 'https://webrazzi.com' },
        ],
      },
    ],
  },
  technology: {
    title: 'TEKNOLOJİ',
    articles: [
      {
        id: 'tr_tech_1',
        title: "Türkiye'nin Yerli Yarı İletken ve Mikroçip Tasarım Merkezinde İlk Prototip Üretildi",
        url: 'https://www.tubitak.gov.tr',
        publishedAt: getPastTime(15),
        sources: [
          { id: 'webrazzi', name: 'Webrazzi', title: 'Yerli Çip Üretiminde Kritik Eşik Aşıldı', url: 'https://webrazzi.com' },
          { id: 'donanimhaber', name: 'DonanımHaber', title: 'Milli Çip Projesinde Sevindiren Gelişme', url: 'https://www.donanimhaber.com' },
          { id: 'shiftdelete', name: 'ShiftDelete.Net', title: 'Savunma ve Otomotiv Sektörlerine Yerli Çip Desteği', url: 'https://shiftdelete.net' },
        ],
      },
      {
        id: 'tr_tech_2',
        title: 'Açık Kaynak Kodlu Türkçe Büyük Dil Modellerinde Yeni Versiyon Yayınlandı',
        url: 'https://github.com',
        publishedAt: getPastTime(40),
        sources: [
          { id: 'webtekno', name: 'Webtekno', title: 'Türk Araştırmacılardan Küresel Standartta Açık LLM Modeli', url: 'https://www.webtekno.com' },
          { id: 'chip', name: 'Chip Online', title: 'Türkçe Doğal Dil İşleme Performansında Büyük Sıçrama', url: 'https://www.chip.com.tr' },
        ],
      },
      {
        id: 'tr_tech_3',
        title: 'Kuantum Hesaplama Alanında Süperiletken Kübit Sayısı Yeni Bir Rekor Kırdı',
        url: 'https://bilimvegelecek.com.tr',
        publishedAt: getPastTime(75),
        sources: [
          { id: 'bilimfikir', name: 'Bilim ve Teknik', title: 'Kuantum Bilgisayarlar Klasik Süper Bilgisayarları Geride Bırakıyor', url: 'https://bilimteknik.tubitak.gov.tr' },
        ],
      },
      {
        id: 'tr_tech_4',
        title: 'Kurumsal Siber Güvenlikte Sıfır Güven (Zero Trust) Mimarisine Geçiş Hızlandı',
        url: 'https://bthaber.com',
        publishedAt: getPastTime(115),
        sources: [
          { id: 'bthaber', name: 'BT Haber', title: 'Bulut Güvenliğinde Kimlik Doğrulama Standartları Yenileniyor', url: 'https://bthaber.com' },
        ],
      },
    ],
  },
  entertainment: {
    title: 'KÜLTÜR & SANAT',
    articles: [
      {
        id: 'tr_ent_1',
        title: 'İstanbul Uluslararası Film Festivali Ödülleri Görkemli Törenle Sahiplerini Buldu',
        url: 'https://film.iksv.org',
        publishedAt: getPastTime(30),
        sources: [
          { id: 'ntv', name: 'NTV Sanat', title: 'Altın Lale Ödülleri Açıklandı: Bağımsız Sinema Zaferi', url: 'https://www.ntv.com.tr' },
          { id: 'cumhuriyet', name: 'Cumhuriyet Kültür', title: 'Festivalde Yönetmen ve Oyuncular Ayakta Alkışlandı', url: 'https://www.cumhuriyet.com.tr' },
        ],
      },
      {
        id: 'tr_ent_2',
        title: 'Devlet Tiyatroları ve Şehir Tiyatrolarında Yeni Sezonun Kapalı Gişe Oyunları',
        url: 'https://www.devtiyatro.gov.tr',
        publishedAt: getPastTime(65),
        sources: [
          { id: 'haberturk', name: 'Habertürk Kültür', title: 'Tiyatro Sezonunda Klasikler ve Çağdaş Metinler Bir Arada', url: 'https://www.haberturk.com' },
        ],
      },
      {
        id: 'tr_ent_3',
        title: 'Dijital Sanat ve Görsel Enstalasyon Sergisi Tarihi Mekanlarda Sanatseverlerle Buluşuyor',
        url: 'https://www.istanbulsanat.org',
        publishedAt: getPastTime(105),
        sources: [
          { id: 'hurriyet', name: 'Hürriyet Kelebek', title: 'Işık ve Sesin Büyüleyici Uyumu Tarihi Sarnıçta Sergileniyor', url: 'https://www.hurriyet.com.tr' },
        ],
      },
    ],
  },
  sports: {
    title: 'SPOR',
    articles: [
      {
        id: 'tr_spo_1',
        title: "Süper Lig'de Heyecan Dorukta: Zirve Mücadelesinde Kritik Haftanın Ayrıntıları",
        url: 'https://www.tff.org',
        publishedAt: getPastTime(18),
        sources: [
          { id: 'trtsporr', name: 'TRT Spor', title: 'Liderlik Koltuğu İçin Nefes Kesen Mücadele', url: 'https://www.trtspor.com.tr' },
          { id: 'fanatik', name: 'Fanatik', title: 'Derbi Taktikleri ve Muhtemel 11’ler Netleşti', url: 'https://www.fanatik.com.tr' },
          { id: 'ntvspor', name: 'NTV Spor', title: 'Teknik Direktörlerden Maç Öncesi İddialı Açıklamalar', url: 'https://www.ntvspor.net' },
        ],
      },
      {
        id: 'tr_spo_2',
        title: 'A Milli Kadın Voleybol Takımı Milletler Ligi Finalleri Hazırlıklarına Başladı',
        url: 'https://www.tvf.org.tr',
        publishedAt: getPastTime(48),
        sources: [
          { id: 'aa', name: 'Anadolu Ajansı Spor', title: "Filenin Sultanları Altın Madalya Parolasıyla Kampta", url: 'https://www.aa.com.tr' },
          { id: 'fotomac', name: 'Fotomaç', title: 'Milli Takımda Moraller Yüksek', url: 'https://www.fotomac.com.tr' },
        ],
      },
      {
        id: 'tr_spo_3',
        title: 'EuroLeague Temsilcilerimiz Zorlu Deplasman Virajından Galibiyetle Döndü',
        url: 'https://www.euroleague.net',
        publishedAt: getPastTime(95),
        sources: [
          { id: 'basketfaul', name: 'Basketfaul', title: 'Son Saniye Basketiyle Parkeden Zaferle Ayrıldık', url: 'https://basketfaul.com' },
        ],
      },
    ],
  },
  science: {
    title: 'BİLİM',
    articles: [
      {
        id: 'tr_sci_1',
        title: 'James Webb Uzay Teleskobu Erken Evrene Dair Bugüne Kadarki En Detaylı Verileri Topladı',
        url: 'https://webb.nasa.gov',
        publishedAt: getPastTime(22),
        sources: [
          { id: 'evrimagaci', name: 'Evrim Ağacı', title: 'Büyük Patlamadan Yalnızca 300 Milyon Yıl Sonrasına Bakış', url: 'https://evrimagaci.org' },
          { id: 'bilimfili', name: 'BilimFili', title: 'Gökbilimciler Galaksi Oluşumu Modellerini Yeniden Değerlendiriyor', url: 'https://bilimfili.com' },
        ],
      },
      {
        id: 'tr_sci_2',
        title: 'Perovskit-Silisyum Tandem Güneş Hücrelerinde Verimlilik Dünya Rekoru Kırdı',
        url: 'https://www.nature.com',
        publishedAt: getPastTime(60),
        sources: [
          { id: 'bilimvegelecek', name: 'Bilim ve Gelecek', title: 'Yenilenebilir Enerjide Ucuz ve Yüksek Verimli Yeni Hücreler', url: 'https://bilimvegelecek.com.tr' },
        ],
      },
      {
        id: 'tr_sci_3',
        title: 'Arkeologlar Anadolu’da 9 Bin Yıllık Yeni Bir Neolitik Yerleşim Yeri Keşfetti',
        url: 'https://arkeofili.com',
        publishedAt: getPastTime(120),
        sources: [
          { id: 'arkeofili', name: 'Arkeofili', title: 'Göbeklitepe ve Karahantepe İle Çağdaş Yeni Tapınak Alanı', url: 'https://arkeofili.com' },
        ],
      },
    ],
  },
  health: {
    title: 'SAĞLIK',
    articles: [
      {
        id: 'tr_hea_1',
        title: 'Yapay Zeka Destekli Erken Tanı Algoritmaları Onkolojide Klinik Kullanıma Girdi',
        url: 'https://www.medimagazin.com.tr',
        publishedAt: getPastTime(28),
        sources: [
          { id: 'medimagazin', name: 'Medimagazin', title: 'Erken Evre Kanser Taramasında %98 Doğruluk Başarısı', url: 'https://www.medimagazin.com.tr' },
          { id: 'ntvsaglik', name: 'NTV Sağlık', title: 'Uzmanlar: Yapay Zeka Radyologların En Güçlü Yardımcısı Oldu', url: 'https://www.ntv.com.tr' },
        ],
      },
      {
        id: 'tr_hea_2',
        title: 'Kardiyoloji Uzmanları Açıkladı: Akdeniz Tipi Beslenme ve Kalp Sağlığı İlişkisi',
        url: 'https://www.saglik.gov.tr',
        publishedAt: getPastTime(72),
        sources: [
          { id: 'haberturk', name: 'Habertürk Sağlık', title: 'Haftada En Az 150 Dakika Tempolu Yürüyüş Önerisi', url: 'https://www.haberturk.com' },
        ],
      },
      {
        id: 'tr_hea_3',
        title: 'Düzenli Uyku ve Sirkadiyen Ritmin Bağışıklık Sistemi Üzerindeki Kapsamlı Rolü',
        url: 'https://www.bbc.com/turkce',
        publishedAt: getPastTime(125),
        sources: [
          { id: 'bbcturkce', name: 'BBC Türkçe Sağlık', title: 'Hücre Yenilenmesi ve Derin Uyku Arasındaki Genetik Mekanizma', url: 'https://www.bbc.com/turkce' },
        ],
      },
    ],
  },
}

// Generate for TR_tr
for (const [cat, data] of Object.entries(trDatasets)) {
  const payload = {
    title: data.title,
    category: cat,
    edition: 'TR_tr',
    generatedAt: now.toISOString(),
    articles: data.articles,
  }
  fs.writeFileSync(path.join(cacheDir, `TR_tr_${cat}.json`), JSON.stringify(payload, null, 2), 'utf8')
  if (cat === 'nation') {
    fs.writeFileSync(path.join(cacheDir, `TR_tr_national.json`), JSON.stringify(payload, null, 2), 'utf8')
  }
}

// Generate for US_en and GB_en as well
const enCategories = ['nation', 'world', 'business', 'technology', 'entertainment', 'sports', 'science', 'health']
for (const ed of ['US_en', 'GB_en']) {
  for (const cat of enCategories) {
    const title = cat.toUpperCase()
    const sampleArticles = trDatasets[cat]?.articles.map((art, idx) => ({
      id: `${ed}_${cat}_${idx}`,
      title: art.title,
      url: art.url,
      publishedAt: art.publishedAt,
      sources: art.sources,
      imageURL: '',
    })) || []

    const payload = {
      title,
      category: cat,
      edition: ed,
      generatedAt: now.toISOString(),
      articles: sampleArticles,
    }
    fs.writeFileSync(path.join(cacheDir, `${ed}_${cat}.json`), JSON.stringify(payload, null, 2), 'utf8')
    if (cat === 'nation') {
      fs.writeFileSync(path.join(cacheDir, `${ed}_national.json`), JSON.stringify(payload, null, 2), 'utf8')
    }
  }
}

console.log('✅ Generated static cache files successfully in public/data/cache/')
