/**
 * Pre-build News Snapshot Generator
 * Fetches real-time Google News RSS feeds for top editions and saves them
 * as static JSON snapshots under public/data/cache/
 * Ensures GitHub Pages loads rich, real-time news with ZERO CORS issues.
 */

import fs from 'node:fs'
import path from 'node:path'

const EDITIONS = ['TR_tr', 'GB_en', 'US_en']
const TIMEOUT_MS = 10000

function decodeHtml(str = '') {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

function parseItemsFromXml(xml) {
  const articles = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

  for (const match of itemMatches) {
    const itemContent = match[1]

    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/)
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/)
    const guidMatch = itemContent.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
    const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/)

    if (!titleMatch || !linkMatch) continue

    let rawTitle = decodeHtml(titleMatch[1].trim())
    const url = decodeHtml(linkMatch[1].trim())
    const id = guidMatch ? guidMatch[1].trim() : url || rawTitle
    const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString()

    let sourceName = 'Haber'
    const sourceTailMatch = rawTitle.match(/\s*-\s*([^-]+)$/)
    if (sourceTailMatch) {
      sourceName = sourceTailMatch[1].trim()
      rawTitle = rawTitle.substring(0, sourceTailMatch.index).trim()
    }

    const sources = []
    if (descMatch) {
      const descText = decodeHtml(descMatch[1])
      const liMatches = descText.matchAll(/<li><a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>.*?<font[^>]*>([\s\S]*?)<\/font><\/li>/g)
      for (const li of liMatches) {
        const subUrl = li[1].trim()
        let subTitle = decodeHtml(li[2].replace(/<[^>]*>/g, '').trim())
        const sName = decodeHtml(li[3].replace(/<[^>]*>/g, '').trim())
        const sTail = ` - ${sName}`
        if (sName && subTitle.endsWith(sTail)) {
          subTitle = subTitle.substring(0, subTitle.length - sTail.length)
        }
        sources.push({
          id: sName.toLowerCase().replace(/\s+/g, '_'),
          name: sName,
          title: subTitle,
          url: subUrl,
        })
      }
    }

    if (sources.length === 0) {
      sources.push({
        id: sourceName.toLowerCase().replace(/\s+/g, '_'),
        name: sourceName,
        title: rawTitle,
        url,
      })
    }

    articles.push({
      id,
      title: rawTitle,
      url,
      publishedAt,
      sources,
      imageURL: '',
    })
  }

  return articles
}

async function fetchTopicFeed(topicPath) {
  const url = `https://news.google.com/rss/topics${topicPath}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': '',
      },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

async function run() {
  const cacheDir = path.resolve('public', 'data', 'cache')
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true })
  }

  console.log('⚡ Starting Google News Snapshot Generator...')

  for (const ed of EDITIONS) {
    const edFile = path.resolve('public', 'editions', `${ed}.json`)
    if (!fs.existsSync(edFile)) continue

    const edConfig = JSON.parse(fs.readFileSync(edFile, 'utf8'))
    console.log(`\n📦 Processing edition: ${ed}`)

    for (const [cat, topicPath] of Object.entries(edConfig)) {
      try {
        console.log(`  Fetching ${ed} -> ${cat}...`)
        const xml = await fetchTopicFeed(topicPath)
        const articles = parseItemsFromXml(xml)

        const payload = {
          title: cat.toUpperCase(),
          category: cat,
          edition: ed,
          generatedAt: new Date().toISOString(),
          articles: articles.slice(0, 50),
        }

        const outPath = path.join(cacheDir, `${ed}_${cat}.json`)
        fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
        if (cat === 'nation') {
          fs.writeFileSync(path.join(cacheDir, `${ed}_national.json`), JSON.stringify(payload, null, 2), 'utf8')
        }
        console.log(`  ✓ Saved ${payload.articles.length} articles to ${ed}_${cat}.json`)
      } catch (err) {
        console.warn(`  ⚠️ Failed to fetch ${ed} ${cat}: ${err.message}`)
      }
    }
  }

  console.log('\n🎉 Finished snapshot generation.')
}

run().catch(console.error)
