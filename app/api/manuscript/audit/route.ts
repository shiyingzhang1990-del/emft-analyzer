import { NextRequest, NextResponse } from 'next/server'
import { parseManuscriptText } from '@/lib/manuscriptParser'
import { scoreZGKJLT } from '@/lib/scoringEngine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text } = body
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }
    const parsed = parseManuscriptText(text)
    const report = scoreZGKJLT(parsed)
    return NextResponse.json({ parsed, report })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
