import { NextResponse } from 'next/server'
import { recentTopics } from '@/lib/journalProfile'
import { clusterTopics, keywordFrequency, radarByCluster, trendByCluster } from '@/lib/topicCluster'

export async function GET() {
  const clusters = clusterTopics(recentTopics)
  const keywords = keywordFrequency(recentTopics)
  const trend = trendByCluster(recentTopics)
  const radar = radarByCluster(recentTopics)
  return NextResponse.json({ clusters, keywords, trend, radar, articleCount: recentTopics.length, topics: recentTopics })
}
