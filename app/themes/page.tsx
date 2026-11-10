'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, Globe, Cpu, BookOpen, ExternalLink } from 'lucide-react'

const COLORS = ['#f59e0b','#3b82f6','#10b981','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16']

export default function ThemesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/journal/themes').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8 text-slate-400">Loading theme analysis...</div>

  const { clusters, keywords, methods, regions, articles } = data

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp size={20} className="text-amber-400" /> Recent Themes</h1>
        <p className="text-slate-400 text-sm mt-1">EMFT近3个月发表文章主题分析 · {articles.length} articles tracked · Jan–Apr 2026</p>
      </div>

      {/* Summary Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-sm text-amber-200">
        <strong>近期趋势摘要：</strong> EMFT近3个月文章明显偏好基于新兴市场微观数据的实证研究，尤其关注数字金融、绿色金融、公司治理、投资者行为、资本市场反应和政策冲击。对于中国A股公司治理类文章，如能强调 emerging-market institutional context、policy implications 和 robust empirical identification，则与期刊偏好较匹配。
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Cpu size={13} className="text-blue-400" /> Method Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={methods} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="method" tick={{ fill: '#94a3b8', fontSize: 10 }} width={90} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Globe size={13} className="text-green-400" /> Region Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={regions} dataKey="count" nameKey="region" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0)*100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                {regions.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><TrendingUp size={13} className="text-amber-400" /> Topic Hotness</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={clusters.slice(0,6)} layout="vertical">
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} width={110} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="hotness" fill="#f59e0b" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Topic Clusters */}
      <h2 className="font-semibold text-white mb-3 flex items-center gap-2"><BookOpen size={14} className="text-amber-400" /> Topic Clusters</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {clusters.map((c: any) => (
          <div key={c.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-white text-sm">{c.name}</h3>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{c.articleCount} articles</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {c.keywords.slice(0,5).map((k: string) => (
                <span key={k} className="text-xs bg-slate-700/80 text-slate-400 px-2 py-0.5 rounded-full">{k}</span>
              ))}
            </div>
            <div className={`text-xs px-2 py-1 rounded-lg ${c.relevanceToGovernance.startsWith('Very High') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : c.relevanceToGovernance.startsWith('High') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700/50 text-slate-400 border border-slate-600'}`}>
              Relevance to governance/incentive research: {c.relevanceToGovernance}
            </div>
            {c.representativeArticles.length > 0 && (
              <div className="mt-2 text-xs text-slate-500">
                <span className="text-slate-600">Rep. article: </span>{c.representativeArticles[0].slice(0,70)}...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Keywords */}
      <h2 className="font-semibold text-white mb-3">High-Frequency Keywords</h2>
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {keywords.slice(0,25).map((k: any) => (
            <span key={k.keyword} className="text-xs px-3 py-1 rounded-full border" style={{ fontSize: `${Math.max(10, Math.min(16, 10 + k.count * 2))}px`, background: `rgba(245,158,11,${Math.min(0.3, k.count * 0.08)})`, borderColor: `rgba(245,158,11,${Math.min(0.5, k.count * 0.15)})`, color: k.count >= 3 ? '#fbbf24' : '#94a3b8' }}>
              {k.keyword} ({k.count})
            </span>
          ))}
        </div>
      </div>

      {/* Article List */}
      <h2 className="font-semibold text-white mb-3">Recent Articles</h2>
      <div className="space-y-3">
        {articles.map((a: any) => (
          <div key={a.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-1">{a.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  <span>{a.authors.join(', ')}</span>
                  <span>·</span>
                  <span>{a.date}</span>
                  <span>·</span>
                  <span className="text-blue-400">{a.method}</span>
                  <span>·</span>
                  <span className="text-green-400">{a.region}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {a.keywords.slice(0,5).map((k: string) => (
                    <span key={k} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{k}</span>
                  ))}
                </div>
              </div>
              <a href={`https://doi.org/${a.doi}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-400 transition-colors flex-shrink-0">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
