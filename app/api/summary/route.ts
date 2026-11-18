export const runtime = 'nodejs'

interface SummaryRequest {
  title: string
  url?: string
  source?: string
  locale?: 'tr' | 'en'
  apiKey?: string
}

export async function POST(request: Request) {
  try {
    const body: SummaryRequest = await request.json()
    const { title, url, source, locale = 'tr', apiKey: userApiKey } = body

    if (!title || typeof title !== 'string') {
      return Response.json({ error: 'Title is required' }, { status: 400 })
    }

    const apiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY?.trim()

    if (apiKey) {
      try {
        const aiResult = await generateGeminiSummary(title, source, locale, apiKey)
        if (aiResult) {
          return Response.json(aiResult)
        }
      } catch (geminiError) {
        console.warn('[AI Summary] Gemini API call failed, falling back to heuristic summary:', geminiError)
      }
    }

    // Fallback heuristic context analyzer when no API key is provided or API failed
    const fallbackResult = generateFallbackSummary(title, source, locale)
    return Response.json(fallbackResult)
  } catch (error) {
    console.error('[AI Summary] Unexpected error:', error)
    return Response.json({ error: 'Failed to process summary' }, { status: 500 })
  }
}

async function generateGeminiSummary(
  title: string,
  source: string | undefined,
  locale: 'tr' | 'en',
  apiKey: string
) {
  const languageInstruction =
    locale === 'tr'
      ? 'Yanıtını mutlaka TÜRKÇE olarak ver.'
      : 'Provide your response in ENGLISH.'

  const prompt = `Sen uzman bir haber editörü ve analistisin. Aşağıdaki haber başlığı ve kaynağı inceleyerek okuyucu için hızlı ve net bir analiz hazırla.
${languageInstruction}

Haber Başlığı: "${title}"
Haber Kaynağı: "${source || 'Bilinmiyor'}"

Lütfen yalnızca geçerli bir JSON çıktısı üret. Biçim şöyle olmalıdır:
{
  "summary": [
    "Haberin temel konusunu ve ne olduğunu belirten ilk madde",
    "Gelişmenin olası sebebi, arka planı veya etkisini belirten ikinci madde",
    "Konuyla ilgili dikkat çeken kilit detay veya sonraki adımı belirten üçüncü madde"
  ],
  "sentiment": "positive" | "neutral" | "negative" | "critical",
  "keyTakeaway": "Haberden çıkarılacak tek cümlelik en önemli özet/sonuç cümlesi",
  "tags": ["Konu1", "Konu2", "Konu3"]
}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(12000),
    }
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Gemini API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) {
    throw new Error('Empty response from Gemini')
  }

  const parsed = JSON.parse(content)
  return {
    summary: Array.isArray(parsed.summary) ? parsed.summary : [title],
    sentiment: parsed.sentiment || 'neutral',
    keyTakeaway: parsed.keyTakeaway || title,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    isFallback: false,
  }
}

function generateFallbackSummary(
  title: string,
  source: string | undefined,
  locale: 'tr' | 'en'
) {
  const cleanTitle = title.replace(/\s*-\s*[^-]+$/, '').trim()
  const isTr = locale === 'tr'

  // Basic sentiment heuristic
  const lower = cleanTitle.toLowerCase()
  let sentiment: 'positive' | 'neutral' | 'negative' | 'critical' = 'neutral'

  const negativeWords = ['kriz', 'savaş', 'ölüm', 'arttı', 'düşüş', 'çöktü', 'tepki', 'skandal', 'yangın', 'zam', 'enflasyon', 'crisis', 'war', 'death', 'crash', 'drop', 'fall', 'fail', 'killed', 'arrested']
  const positiveWords = ['rekor', 'başarı', 'artış', 'müjde', 'anlaşma', 'kazandı', 'yükseliş', 'tarihi', 'büyüme', 'growth', 'record', 'success', 'win', 'peace', 'rise', 'breakthrough', 'gain']
  const criticalWords = ['son dakika', 'acil', 'uyarı', 'alarm', 'deprem', 'breaking', 'urgent', 'warning', 'alert']

  if (criticalWords.some(w => lower.includes(w))) {
    sentiment = 'critical'
  } else if (positiveWords.some(w => lower.includes(w))) {
    sentiment = 'positive'
  } else if (negativeWords.some(w => lower.includes(w))) {
    sentiment = 'negative'
  }

  if (isTr) {
    return {
      summary: [
        `Gelişme: "${cleanTitle}"`,
        source ? `Bu gelişme ilk olarak ${source} tarafından servis edildi.` : 'İlgili gelişme basın kaynaklarınca gündeme taşındı.',
        'Haberin tam içeriğini ve kaynak detaylarını aşağıdaki bağlantıdan inceleyebilirsiniz.',
      ],
      sentiment,
      keyTakeaway: cleanTitle,
      tags: [source || 'Gündem', 'Haber'],
      isFallback: true,
      note: 'Daha derin yapay zeka analizleri için Ayarlar menüsünden Gemini API anahtarınızı ekleyebilirsiniz.',
    }
  }

  return {
    summary: [
      `Headline: "${cleanTitle}"`,
      source ? `Originally reported by ${source}.` : 'Reported across international news feeds.',
      'Check out the full article link below for complete details.',
    ],
    sentiment,
    keyTakeaway: cleanTitle,
    tags: [source || 'News', 'Global'],
    isFallback: true,
    note: 'For deeper AI analysis, you can add your Gemini API key in Options.',
  }
}
