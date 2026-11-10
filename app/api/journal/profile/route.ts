import { NextResponse } from 'next/server'
import { journalProfile, recentTopics } from '@/lib/journalProfile'

export async function GET() {
  return NextResponse.json({ profile: journalProfile, articleCount: recentTopics.length })
}
