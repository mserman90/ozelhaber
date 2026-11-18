/**
 * Free & Zero-Key AI Summary and Analysis Engine
 * Uses public free LLM endpoints (Pollinations AI) with local heuristic NLP fallback.
 * Requires NO API keys and has NO usage costs.
 */

export interface AISummaryResult {
  summary: string[]
  sentiment: 'positive' | 'neutral' | 'negative' | 'critical'
  keyTakeaway: string
  tags: string[]
  modelUsed: string
  isFallback: boolean
}

export async function generateFreeAISummary(
  title: string,
  source: string = 'Haber Kaynağı',
  locale: 'tr' | 'en' = 'tr'
): Promise<AISummaryResult> {
  const isTr = locale === 'tr'

  const systemPrompt = isTr
    ? 'Sen tarafsız ve profesyonel bir haber analistisin. Verilen haber başlığı ve kaynağı inceleyerek okuyucuya en önemli noktaları maddeler halinde özetle. Yanıtını YALNIZCA geçerli bir JSON formatında ver, markdown kod blokları veya ekstra metin ekleme.'
    : 'You are an objective, professional news analyst. Examine the given headline and source, then summarize the key points for the reader. Output ONLY valid JSON, no markdown backticks, no preamble.'

  const userPrompt = isTr
    ? `Haber Başlığı: "${title}"
Haber Kaynağı: "${source}"

Lütfen şu JSON şemasına birebir uyarak yanıt üret:
{
  "summary": [
    "Haberin ne hakkında olduğunu açıklayan net ilk madde",
    "Gelişmenin olası arka planı, nedeni veya etkisini belirten ikinci madde",
    "Gelişmeyle ilgili dikkat çeken kilit nokta veya sonraki beklenti"
  ],
  "sentiment": "positive" | "neutral" | "negative" | "critical",
  "keyTakeaway": "Haberden çıkarılacak tek cümlelik net sonuç",
  "tags": ["Etiket1", "Etiket2", "Etiket3"]
}`
    : `Headline: "${title}"
Source: "${source}"

Please reply matching this JSON schema exactly:
{
  "summary": [
    "Clear point explaining the core news event",
    "Background context, cause or implication",
    "Key takeaway or next expectation"
  ],
  "sentiment": "positive" | "neutral" | "negative" | "critical",
  "keyTakeaway": "One-sentence executive summary",
  "tags": ["Tag1", "Tag2", "Tag3"]
}`

  // Strategy 1: Free Pollinations AI Inference (Open model: Mistral / Qwen / GPT-4o-mini free pool)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 9000)

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'mistral',
        jsonMode: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const rawText = await response.text()
      // Extract clean JSON even if enclosed in markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed && Array.isArray(parsed.summary)) {
          return {
            summary: parsed.summary,
            sentiment: normalizeSentiment(parsed.sentiment),
            keyTakeaway: parsed.keyTakeaway || title,
            tags: Array.isArray(parsed.tags) ? parsed.tags : [source],
            modelUsed: 'Free Open-LLM (Mistral AI)',
            isFallback: false,
          }
        }
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // Strategy 2: Client-side / Offline Heuristic NLP Engine
  return generateHeuristicSummary(title, source, locale)
}

function normalizeSentiment(val: any): 'positive' | 'neutral' | 'negative' | 'critical' {
  if (val === 'positive' || val === 'negative' || val === 'critical') return val
  return 'neutral'
}

export function generateHeuristicSummary(
  title: string,
  source: string = 'Haber',
  locale: 'tr' | 'en' = 'tr'
): AISummaryResult {
  const cleanTitle = title.replace(/\s*-\s*[^-]+$/, '').trim()
  const isTr = locale === 'tr'
  const lower = cleanTitle.toLowerCase()

  let sentiment: 'positive' | 'neutral' | 'negative' | 'critical' = 'neutral'

  const criticalKeywords = ['son dakika', 'acil', 'uyarı', 'alarm', 'deprem', 'facia', 'breaking', 'urgent', 'warning', 'alert', 'disaster']
  const positiveKeywords = ['rekor', 'başarı', 'artış', 'müjde', 'anlaşma', 'kazandı', 'yükseliş', 'tarihi', 'büyüme', 'growth', 'record', 'success', 'win', 'peace', 'rise', 'breakthrough', 'gain']
  const negativeKeywords = ['kriz', 'savaş', 'ölüm', 'düşüş', 'çöktü', 'tepki', 'skandal', 'yangın', 'zam', 'enflasyon', 'crisis', 'war', 'death', 'crash', 'drop', 'fall', 'fail', 'killed', 'arrested']

  if (criticalKeywords.some(w => lower.includes(w))) {
    sentiment = 'critical'
  } else if (positiveKeywords.some(w => lower.includes(w))) {
    sentiment = 'positive'
  } else if (negativeKeywords.some(w => lower.includes(w))) {
    sentiment = 'negative'
  }

  // Extract smart tags from keywords
  const possibleTags: string[] = [source]
  if (lower.includes('yapay zeka') || lower.includes('ai') || lower.includes('teknoloji') || lower.includes('tech')) {
    possibleTags.push(isTr ? 'Teknoloji & Yapay Zeka' : 'Tech & AI')
  }
  if (lower.includes('ekonomi') || lower.includes('enflasyon') || lower.includes('faiz') || lower.includes('borsa') || lower.includes('market') || lower.includes('economy')) {
    possibleTags.push(isTr ? 'Ekonomi & Piyasalar' : 'Finance & Economy')
  }
  if (lower.includes('türkiye') || lower.includes('ankara') || lower.includes('istanbul')) {
    possibleTags.push('Türkiye')
  }
  if (lower.includes('dünya') || lower.includes('abd') || lower.includes('rusya') || lower.includes('avrupa') || lower.includes('global')) {
    possibleTags.push(isTr ? 'Küresel Gelişmeler' : 'Global Affairs')
  }

  if (isTr) {
    return {
      summary: [
        `Gelişme Özeti: "${cleanTitle}"`,
        `${source} tarafından aktarılan bu haber, ilgili kategoride öne çıkan sıcak başlıklar arasında yer alıyor.`,
        'Detaylı içerik, uzman görüşleri ve gelişmeler için haber kaynağını ziyaret edebilirsiniz.',
      ],
      sentiment,
      keyTakeaway: cleanTitle,
      tags: possibleTags,
      modelUsed: 'Yerel NLP Motoru (Anahtarsız & Çevrimdışı)',
      isFallback: true,
    }
  }

  return {
    summary: [
      `Key Event: "${cleanTitle}"`,
      `Reported prominently by ${source} as a notable story in its section.`,
      'Follow the original story link below for in-depth coverage and updates.',
    ],
    sentiment,
    keyTakeaway: cleanTitle,
    tags: possibleTags,
    modelUsed: 'Local NLP Engine (Zero-Key & Offline)',
    isFallback: true,
  }
}
