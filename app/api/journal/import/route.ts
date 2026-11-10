import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(req: NextRequest) {
  const { html } = await req.json().catch(() => ({ html: '' }))

  // MVP: 当线上抓取失败时，允许用户粘贴目录HTML并解析标题
  if (!html || typeof html !== 'string') {
    return NextResponse.json({ error: '请提供目录页HTML文本用于解析' }, { status: 400 })
  }

  const $ = cheerio.load(html)
  const rows: any[] = []

  $('a').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length >= 8 && text.length <= 80) {
      rows.push({ title: text, abstract: '', keywords: [], year: new Date().getFullYear(), issue: '手动导入', topicCluster: '待分类', relevanceScore: 70 })
    }
  })

  return NextResponse.json({ count: rows.length, topics: rows.slice(0, 80) })
}
