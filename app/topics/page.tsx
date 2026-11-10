'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'

export default function TopicsPage() {
  const [data, setData] = useState<any>(null)
  const [manualHtml, setManualHtml] = useState('')
  const [status, setStatus] = useState('')

  const loadBase = () => {
    fetch('/api/journal/themes').then(r => r.json()).then(setData)
  }

  useEffect(() => {
    loadBase()
  }, [])

  const scrapeOfficial = async () => {
    setStatus('正在抓取官网目录...')
    const res = await fetch('/api/journal/scrape')
    const json = await res.json()
    if (!json.ok) {
      setStatus(`抓取失败：${json.error}。请使用手动导入。`)
      return
    }
    setData((prev: any) => ({ ...prev, topics: json.topics }))
    setStatus(`抓取成功：导入 ${json.count} 条标题（未自动带摘要关键词）。`)
  }

  const importManual = async () => {
    if (!manualHtml.trim()) return
    setStatus('正在解析手动导入HTML...')
    const res = await fetch('/api/journal/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: manualHtml }),
    })
    const json = await res.json()
    if (json.error) {
      setStatus(`导入失败：${json.error}`)
      return
    }
    setData((prev: any) => ({ ...prev, topics: json.topics }))
    setStatus(`导入成功：解析 ${json.count} 条标题。`)
  }

  if (!data) return <div className="p-8 text-slate-400">加载中...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">近期主题分析</h1>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={scrapeOfficial} className="text-xs px-3 py-1.5 rounded bg-blue-500 text-white">尝试抓取官网目录</button>
          <button onClick={loadBase} className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-200">恢复内置样本</button>
        </div>
        <p className="text-xs text-slate-500 mb-2">若官网抓取失败，请将目录页HTML粘贴到下方手动导入。</p>
        <textarea value={manualHtml} onChange={e => setManualHtml(e.target.value)} className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300" placeholder="粘贴目录页HTML..." />
        <div className="mt-2 flex items-center gap-2">
          <button onClick={importManual} className="text-xs px-3 py-1.5 rounded bg-amber-500 text-slate-900">手动导入HTML</button>
          <span className="text-xs text-slate-400">{status}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 col-span-2">
          <h3 className="text-sm font-semibold text-white mb-3">主题热度条形图</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.trend}>
              <XAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="hotness" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">高频关键词</h3>
          <div className="flex flex-wrap gap-2">
            {data.keywords.slice(0, 25).map((k: any) => (
              <span key={k.keyword} className="text-xs px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
                {k.keyword} ({k.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">主题分布雷达图</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.radar}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">近期期刊关注重点</h3>
          <div className="space-y-2">
            {data.clusters.slice(0, 8).map((c: any) => (
              <div key={c.id} className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{c.name}</span>
                  <span className="text-xs text-blue-300">热度 {c.hotness}</span>
                </div>
                <p className="text-xs text-slate-400">相关文章：{c.articleCount} 篇</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">样本文章（可手动导入替换）</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(data.topics || []).map((a: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-slate-700/20 border border-slate-700">
              <div className="text-sm text-white mb-1">{a.title}</div>
              <div className="text-xs text-slate-500">{a.issue || '未标注期号'} · {a.topicCluster || '待分类'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
