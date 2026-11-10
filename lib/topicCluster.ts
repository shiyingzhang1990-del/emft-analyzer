import type { RecentTopic } from '@/types/journal'

export interface TopicCluster {
  id: string
  name: string
  keywords: string[]
  articleCount: number
  representativeTitles: string[]
  hotness: number
}

const CLUSTERS = [
  '科技政策与科技体制改革',
  '企业创新与创新激励',
  '数字经济与产业融合',
  '区域创新与创新生态系统',
  '绿色创新与可持续发展',
  '人工智能与政府治理',
  '科技金融与资本市场',
  '知识产权与技术转移',
  '国际科技合作与竞争',
  '新质生产力与产业升级',
]

export function clusterTopics(topics: RecentTopic[]): TopicCluster[] {
  return CLUSTERS.map((name, idx) => {
    const rows = topics.filter(t => t.topicCluster === name)
    const freq: Record<string, number> = {}
    rows.forEach(r => r.keywords.forEach(k => {
      const key = k.trim()
      freq[key] = (freq[key] || 0) + 1
    }))

    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k]) => k)

    return {
      id: `cluster-${idx + 1}`,
      name,
      keywords,
      articleCount: rows.length,
      representativeTitles: rows.slice(0, 3).map(r => r.title),
      hotness: rows.length === 0 ? 0 : Math.round(rows.reduce((s, r) => s + r.relevanceScore, 0) / rows.length),
    }
  }).filter(c => c.articleCount > 0)
}

export function keywordFrequency(topics: RecentTopic[]) {
  const freq: Record<string, number> = {}
  topics.forEach(t => t.keywords.forEach(k => { freq[k] = (freq[k] || 0) + 1 }))
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([keyword, count]) => ({ keyword, count }))
}

export function trendByCluster(topics: RecentTopic[]) {
  return clusterTopics(topics).map(c => ({ topic: c.name, hotness: c.hotness, count: c.articleCount }))
}

export function radarByCluster(topics: RecentTopic[]) {
  return clusterTopics(topics).map(c => ({
    dimension: c.name.replace('与', '·'),
    score: Math.min(100, c.hotness),
    fullMark: 100,
  }))
}
