$baseDir = "C:\Users\murat.erman\.gemini\antigravity\scratch\ozelhaber"
$cacheDir = Join-Path $baseDir "public\data\cache"

if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
}

$now = [DateTime]::UtcNow.ToString("o")

$trDatasets = @{
    nation = @{
        title = "GÜNDEM"
        articles = @(
            @{
                id = "tr_nat_1"
                title = "TBMM'de Yeni Yasama Yılında Ekonomik ve Yapısal Reform Paketleri Görüşülüyor"
                url = "https://www.aa.com.tr/tr/gundem"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-25).ToString("o")
                sources = @(
                    @{ id = "aa"; name = "Anadolu Ajansı"; title = "TBMM'de Yeni Yasama Yılında Ekonomik ve Yapısal Reform Paketleri Görüşülüyor"; url = "https://www.aa.com.tr" }
                    @{ id = "trt"; name = "TRT Haber"; title = "Mecliste Yeni Reform Gündemi Yoğun"; url = "https://www.trthaber.com" }
                    @{ id = "ntv"; name = "NTV"; title = "TBMM Genel Kurulu Yeni Kanun Teklifini Tartışıyor"; url = "https://www.ntv.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_nat_2"
                title = "Meteoroloji Genel Müdürlüğü'nden Marmara ve Ege Bölgesi İçin Kuvvetli Yağış Uyarısı"
                url = "https://www.mgm.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-45).ToString("o")
                sources = @(
                    @{ id = "haberturk"; name = "Habertürk"; title = "Meteorolojiden 12 İle Sarı ve Turuncu Kodlu Uyarı"; url = "https://www.haberturk.com" }
                    @{ id = "sozcu"; name = "Sözcü"; title = "Kuvvetli Yağış ve Fırtına Uyarısı: Dikkatli Olun"; url = "https://www.sozcu.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_nat_3"
                title = "Ulaştırma ve Altyapı Bakanlığı: Yüksek Hızlı Tren Hatlarında Yeni Seferler ve Güzergahlar Açılıyor"
                url = "https://www.tcdd.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-70).ToString("o")
                sources = @(
                    @{ id = "aa"; name = "Anadolu Ajansı"; title = "YHT Hatlarında Yeni Sefer Dönemi Başladı"; url = "https://www.aa.com.tr" }
                    @{ id = "cumhuriyet"; name = "Cumhuriyet"; title = "Demiryolu Ağı Yeni Hatlarla Genişliyor"; url = "https://www.cumhuriyet.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_nat_4"
                title = "Sanayi ve Teknoloji Bakanlığı AR-GE ve Yenilikçilik Destek Paketinin İkinci Fazını Duyurdu"
                url = "https://www.sanayi.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-110).ToString("o")
                sources = @(
                    @{ id = "hurriyet"; name = "Hürriyet"; title = "Yerli Üretime Milyarlarca Liralık AR-GE Desteği"; url = "https://www.hurriyet.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_nat_5"
                title = "Kültür ve Turizm Bakanlığı Yılın İlk Üç Çeyrek Ziyaretçi Verilerini Açıkladı: Tarihi Rekor"
                url = "https://www.ktb.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-160).ToString("o")
                sources = @(
                    @{ id = "trt"; name = "TRT Haber"; title = "Türkiye Turizmde Hedefleri Aşıyor: 45 Milyon Turist"; url = "https://www.trthaber.com" }
                )
                imageURL = ""
            }
        )
    }
    world = @{
        title = "DÜNYA"
        articles = @(
            @{
                id = "tr_wor_1"
                title = "Birleşmiş Milletler Zirvesi'nde İklim Değişikliği ve Küresel Güvenlik Masada"
                url = "https://www.bbc.com/turkce"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-35).ToString("o")
                sources = @(
                    @{ id = "bbc"; name = "BBC Türkçe"; title = "BM Genel Kurulu'nda Tarihi İklim Kararları"; url = "https://www.bbc.com/turkce" }
                    @{ id = "euronews"; name = "Euronews Türkçe"; title = "Dünya Liderleri Karbon Emisyon Hedeflerini Güncelliyor"; url = "https://tr.euronews.com" }
                    @{ id = "dw"; name = "DW Türkçe"; title = "Küresel İklim Fonu İçin Yeni Kaynak Çağrısı"; url = "https://www.dw.com/tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_wor_2"
                title = "Avrupa Parlamentosu Yapay Zeka Yasasını (EU AI Act) Yürürlüğe Koyuyor"
                url = "https://tr.euronews.com"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-55).ToString("o")
                sources = @(
                    @{ id = "euronews"; name = "Euronews Türkçe"; title = "Yapay Zeka İçin İlk Kapsamlı Küresel Hukuk Çerçevesi"; url = "https://tr.euronews.com" }
                    @{ id = "aa"; name = "Anadolu Ajansı"; title = "AB'den Yapay Zeka Risklerine Sıkı Denetim"; url = "https://www.aa.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_wor_3"
                title = "Orta Doğu Diplomasisinde Ateşkes ve İnsani Yardım Koridorları İçin Yeni Müzakereler"
                url = "https://www.trthaber.com"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-85).ToString("o")
                sources = @(
                    @{ id = "trt"; name = "TRT Haber"; title = "Bölgesel Barış İçin Diplomatik Trafik Yoğunlaşıyor"; url = "https://www.trthaber.com" }
                    @{ id = "reuters"; name = "Reuters"; title = "Middle East Talks Advance with International Mediators"; url = "https://www.reuters.com" }
                )
                imageURL = ""
            }
        )
    }
    business = @{
        title = "EKONOMİ"
        articles = @(
            @{
                id = "tr_bus_1"
                title = "Merkez Bankası Para Politikası Kurulu Kararları Sonrası Piyasalar Dengeleniyor"
                url = "https://www.bloomberght.com"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-20).ToString("o")
                sources = @(
                    @{ id = "bloomberght"; name = "Bloomberg HT"; title = "TCMB Faiz Kararını Açıkladı"; url = "https://www.bloomberght.com" }
                    @{ id = "dunya"; name = "Dünya Gazetesi"; title = "İş Dünyasından Faiz ve Kredi Koşulları Değerlendirmesi"; url = "https://www.dunya.com" }
                )
                imageURL = ""
            },
            @{
                id = "tr_bus_2"
                title = "Borsa İstanbul BIST 100 Endeksi Teknoloji ve Sanayi Hisseleriyle Yükseliş Trendinde"
                url = "https://www.borsaistanbul.com"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-50).ToString("o")
                sources = @(
                    @{ id = "aa"; name = "Anadolu Ajansı"; title = "BIST 100 Rekor Seviyelere Yaklaşıyor"; url = "https://www.aa.com.tr" }
                    @{ id = "ntvpara"; name = "NTV Para"; title = "Yabancı Yatırımcı Girişlerinde Artış Gözleniyor"; url = "https://www.ntv.com.tr/ntvpara" }
                )
                imageURL = ""
            },
            @{
                id = "tr_bus_3"
                title = "İhracatta Katma Değerli Üretim Payı Arttı: Otomotiv ve Kimya Sektörleri Zirvede"
                url = "https://www.tim.org.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-90).ToString("o")
                sources = @(
                    @{ id = "dunya"; name = "Dünya Gazetesi"; title = "TİM Verileri: İhracat 260 Milyar Doları Aştı"; url = "https://www.dunya.com" }
                )
                imageURL = ""
            }
        )
    }
    technology = @{
        title = "TEKNOLOJİ"
        articles = @(
            @{
                id = "tr_tech_1"
                title = "Türkiye'nin Yerli Yarı İletken ve Mikroçip Tasarım Merkezinde İlk Prototip Üretildi"
                url = "https://www.tubitak.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-15).ToString("o")
                sources = @(
                    @{ id = "webrazzi"; name = "Webrazzi"; title = "Yerli Çip Üretiminde Kritik Eşik Aşıldı"; url = "https://webrazzi.com" }
                    @{ id = "donanimhaber"; name = "DonanımHaber"; title = "Milli Çip Projesinde Sevindiren Gelişme"; url = "https://www.donanimhaber.com" }
                    @{ id = "shiftdelete"; name = "ShiftDelete.Net"; title = "Savunma ve Otomotiv Sektörlerine Destek"; url = "https://shiftdelete.net" }
                )
                imageURL = ""
            },
            @{
                id = "tr_tech_2"
                title = "Açık Kaynak Kodlu Türkçe Büyük Dil Modellerinde Yeni Versiyon Yayınlandı"
                url = "https://github.com"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-40).ToString("o")
                sources = @(
                    @{ id = "webtekno"; name = "Webtekno"; title = "Türk Araştırmacılardan Küresel Standartta Açık LLM"; url = "https://www.webtekno.com" }
                    @{ id = "chip"; name = "Chip Online"; title = "Türkçe Doğal Dil İşleme Performansında Büyük Sıçrama"; url = "https://www.chip.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_tech_3"
                title = "Kuantum Hesaplama Alanında Süperiletken Kübit Sayısı Yeni Bir Rekor Kırdı"
                url = "https://bilimteknik.tubitak.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-75).ToString("o")
                sources = @(
                    @{ id = "bilimteknik"; name = "Bilim ve Teknik"; title = "Kuantum Bilgisayarlar Klasik Sistemleri Geride Bırakıyor"; url = "https://bilimteknik.tubitak.gov.tr" }
                )
                imageURL = ""
            }
        )
    }
    entertainment = @{
        title = "KÜLTÜR & SANAT"
        articles = @(
            @{
                id = "tr_ent_1"
                title = "İstanbul Uluslararası Film Festivali Ödülleri Görkemli Törenle Sahiplerini Buldu"
                url = "https://film.iksv.org"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-30).ToString("o")
                sources = @(
                    @{ id = "ntv"; name = "NTV Sanat"; title = "Altın Lale Ödülleri Açıklandı: Bağımsız Sinema Zaferi"; url = "https://www.ntv.com.tr" }
                    @{ id = "cumhuriyet"; name = "Cumhuriyet Kültür"; title = "Festivalde Yönetmen ve Oyuncular Ayakta Alkışlandı"; url = "https://www.cumhuriyet.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_ent_2"
                title = "Devlet Tiyatroları ve Şehir Tiyatrolarında Yeni Sezonun Kapalı Gişe Oyunları"
                url = "https://www.devtiyatro.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-65).ToString("o")
                sources = @(
                    @{ id = "haberturk"; name = "Habertürk Kültür"; title = "Tiyatro Sezonunda Klasikler ve Çağdaş Metinler Bir Arada"; url = "https://www.haberturk.com" }
                )
                imageURL = ""
            }
        )
    }
    sports = @{
        title = "SPOR"
        articles = @(
            @{
                id = "tr_spo_1"
                title = "Süper Lig'de Heyecan Dorukta: Zirve Mücadelesinde Kritik Haftanın Ayrıntıları"
                url = "https://www.tff.org"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-18).ToString("o")
                sources = @(
                    @{ id = "trtspor"; name = "TRT Spor"; title = "Liderlik Koltuğu İçin Nefes Kesen Mücadele"; url = "https://www.trtspor.com.tr" }
                    @{ id = "fanatik"; name = "Fanatik"; title = "Derbi Taktikleri ve Muhtemel 11'ler Netleşti"; url = "https://www.fanatik.com.tr" }
                    @{ id = "ntvspor"; name = "NTV Spor"; title = "Teknik Direktörlerden İddialı Açıklamalar"; url = "https://www.ntvspor.net" }
                )
                imageURL = ""
            },
            @{
                id = "tr_spo_2"
                title = "A Milli Kadın Voleybol Takımı Milletler Ligi Finalleri Hazırlıklarına Başladı"
                url = "https://www.tvf.org.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-48).ToString("o")
                sources = @(
                    @{ id = "aa"; name = "Anadolu Ajansı Spor"; title = "Filenin Sultanları Altın Madalya Parolasıyla Kampta"; url = "https://www.aa.com.tr" }
                    @{ id = "fotomac"; name = "Fotomaç"; title = "Milli Takımda Moraller Yüksek"; url = "https://www.fotomac.com.tr" }
                )
                imageURL = ""
            }
        )
    }
    science = @{
        title = "BİLİM"
        articles = @(
            @{
                id = "tr_sci_1"
                title = "James Webb Uzay Teleskobu Erken Evrene Dair Bugüne Kadarki En Detaylı Verileri Topladı"
                url = "https://webb.nasa.gov"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-22).ToString("o")
                sources = @(
                    @{ id = "evrimagaci"; name = "Evrim Ağacı"; title = "Büyük Patlamadan Yalnızca 300 Milyon Yıl Sonrasına Bakış"; url = "https://evrimagaci.org" }
                    @{ id = "bilimfili"; name = "BilimFili"; title = "Gökbilimciler Galaksi Oluşumu Modellerini Yeniden Değerlendiriyor"; url = "https://bilimfili.com" }
                )
                imageURL = ""
            },
            @{
                id = "tr_sci_2"
                title = "Perovskit-Silisyum Tandem Güneş Hücrelerinde Verimlilik Dünya Rekoru Kırdı"
                url = "https://www.nature.com"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-60).ToString("o")
                sources = @(
                    @{ id = "bilimteknik"; name = "Bilim ve Gelecek"; title = "Yenilenebilir Enerjide Ucuz ve Yüksek Verimli Yeni Hücreler"; url = "https://bilimteknik.tubitak.gov.tr" }
                )
                imageURL = ""
            }
        )
    }
    health = @{
        title = "SAĞLIK"
        articles = @(
            @{
                id = "tr_hea_1"
                title = "Yapay Zeka Destekli Erken Tanı Algoritmaları Onkolojide Klinik Kullanıma Girdi"
                url = "https://www.medimagazin.com.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-28).ToString("o")
                sources = @(
                    @{ id = "medimagazin"; name = "Medimagazin"; title = "Erken Evre Kanser Taramasında %98 Doğruluk"; url = "https://www.medimagazin.com.tr" }
                    @{ id = "ntvsaglik"; name = "NTV Sağlık"; title = "Yapay Zeka Radyologların En Güçlü Yardımcısı Oldu"; url = "https://www.ntv.com.tr" }
                )
                imageURL = ""
            },
            @{
                id = "tr_hea_2"
                title = "Kardiyoloji Uzmanları Açıkladı: Akdeniz Tipi Beslenme ve Kalp Sağlığı İlişkisi"
                url = "https://www.saglik.gov.tr"
                publishedAt = [DateTime]::UtcNow.AddMinutes(-72).ToString("o")
                sources = @(
                    @{ id = "haberturk"; name = "Habertürk Sağlık"; title = "Haftada En Az 150 Dakika Tempolu Yürüyüş Önerisi"; url = "https://www.haberturk.com" }
                )
                imageURL = ""
            }
        )
    }
}

foreach ($cat in $trDatasets.Keys) {
    $info = $trDatasets[$cat]
    $payload = @{
        title = $info.title
        category = $cat
        edition = "TR_tr"
        generatedAt = $now
        articles = $info.articles
    }
    $json = ConvertTo-Json $payload -Depth 5
    $targetPath = Join-Path $cacheDir "TR_tr_$cat.json"
    [System.IO.File]::WriteAllText($targetPath, $json, [System.Text.Encoding]::UTF8)
    
    if ($cat -eq "nation") {
        $altPath = Join-Path $cacheDir "TR_tr_national.json"
        [System.IO.File]::WriteAllText($altPath, $json, [System.Text.Encoding]::UTF8)
    }
}

foreach ($ed in @("US_en", "GB_en")) {
    foreach ($cat in $trDatasets.Keys) {
        $info = $trDatasets[$cat]
        $payload = @{
            title = $cat.ToUpper()
            category = $cat
            edition = $ed
            generatedAt = $now
            articles = $info.articles
        }
        $json = ConvertTo-Json $payload -Depth 5
        $targetPath = Join-Path $cacheDir "${ed}_$cat.json"
        [System.IO.File]::WriteAllText($targetPath, $json, [System.Text.Encoding]::UTF8)
        
        if ($cat -eq "nation") {
            $altPath = Join-Path $cacheDir "${ed}_national.json"
            [System.IO.File]::WriteAllText($altPath, $json, [System.Text.Encoding]::UTF8)
        }
    }
}

Write-Output "Successfully generated $( (Get-ChildItem $cacheDir).Count ) cache files in $cacheDir"
