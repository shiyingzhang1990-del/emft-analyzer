import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

const URL = 'http://www.zgkjlt.org.cn/CN/volumn/home.shtml'

export async function GET() {
  try {
    const res = await fetch(URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZGKJLT-MVP/1.0)' },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `抓取失败: ${res.status}` }, { status: 502 })
    }

    const html = await res.text()
    const $ = cheerio.load(html)
    const topics: any[] = []

    $('a').each((_, el) => {
      const title = $(el).text().trim()
      if (title.length >= 8 && title.length <= 80) {
        topics.push({
          title,
          keywords: [],
          abstract: '',
          year: new Date().getFullYear(),
          issue: '官网抓取',
          topicCluster: '待分类',
          relevanceScore: 70,
        })
      }
    })

    return NextResponse.json({ ok: true, count: topics.length, topics: topics.slice(0, 80) })
  } catch (e) {
    return NextResponse.json({ ok: false, error: `抓取异常: ${String(e)}` }, { status: 500 })
  }
}
