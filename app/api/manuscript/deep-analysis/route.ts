import { NextRequest, NextResponse } from 'next/server'
import { parseManuscriptText } from '@/lib/manuscriptParser'
import { scoreZGKJLT } from '@/lib/scoringEngine'
import { getProvider } from '@/lib/aiProvider'

export async function POST(req: NextRequest) {
  try {
    const { text, provider = 'claude' } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const parsed = parseManuscriptText(text)
    const ruleReport = scoreZGKJLT(parsed)

    const p = getProvider(provider)
    const aiReport = await p.analyze({ text })

    return NextResponse.json({ parsed, ruleReport, aiReport, usedAI: !!aiReport })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
