'use client'
import { useEffect, useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

type Suggestion = {
  id: string
  section: string
  type: string
  severity: 'high' | 'medium' | 'low'
  title: string
  currentProblem: string
  journalMismatch: string
  recommendation: string
  exampleRewrite: string
  literatureDirection: string
  scoreImpact: number
  probabilityImpact: string
  originalExcerpt?: string
}

function severityStyle(level: Suggestion['severity']) {
  if (level === 'high') return 'border-red-500/40 bg-red-500/10 text-red-300'
  if (level === 'medium') return 'border-amber-500/40 bg-amber-500/10 text-amber-300'
  return 'border-blue-500/40 bg-blue-500/10 text-blue-300'
}

export default function SuggestionsPage() {
  const [record, setRecord] = useState<any>(null)
  const [selected, setSelected] = useState<Suggestion | null>(null)
  const [doneIds, setDoneIds] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const cur = localStorage.getItem('zgkjlt-current')
    setRecord(cur ? JSON.parse(cur) : null)
    const done = localStorage.getItem('zgkjlt-done-suggestions')
    setDoneIds(done ? JSON.parse(done) : [])
  }, [])

  if (!record) return <div className="p-8 text-slate-400">暂无建议，请先上传并分析论文。</div>

  const suggestions: Suggestion[] = record.report.revisionSuggestions || []

  const toggleDone = (id: string) => {
    const next = doneIds.includes(id) ? doneIds.filter(x => x !== id) : [...doneIds, id]
    setDoneIds(next)
    localStorage.setItem('zgkjlt-done-suggestions', JSON.stringify(next))
  }

  const reScore = () => {
    const bonus = doneIds.length * 2
    const cloned = JSON.parse(JSON.stringify(record))
    cloned.report.overallScore = Math.min(100, cloned.report.overallScore + bonus)
    localStorage.setItem('zgkjlt-current', JSON.stringify(cloned))
    setRecord(cloned)
  }

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-white">逐条修改建议</h1>
        <div className="flex items-center gap-2">
          <button onClick={reScore} className="text-xs px-3 py-1.5 rounded bg-blue-500 text-white">已修改后重新评分</button>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-5">每条建议均包含：原文问题、与期刊风格不匹配原因、具体修改方向、示范文本、预计提分。</p>

      <div className="grid grid-cols-[1fr_420px] gap-5">
        <div className="space-y-3">
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={`w-full text-left border rounded-xl p-4 transition-colors ${severityStyle(s.severity)} ${doneIds.includes(s.id) ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold">{s.title}</div>
                <span className="text-xs px-2 py-0.5 rounded-full border border-current">{s.severity === 'high' ? '高' : s.severity === 'medium' ? '中' : '低'}</span>
              </div>
              <p className="text-xs text-slate-200 mb-2">[{s.section}] {s.type}</p>
              <p className="text-xs text-slate-300 line-clamp-2">{s.currentProblem}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-300">预计提分 +{s.scoreImpact}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleDone(s.id) }}
                  className="text-xs px-2 py-0.5 rounded border border-slate-500 text-slate-100"
                >
                  {doneIds.includes(s.id) ? '取消已修改' : '标记已修改'}
                </button>
              </div>
            </button>
          ))}
        </div>

        <div className="sticky top-6 h-[calc(100vh-80px)] bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-y-auto">
          {!selected ? (
            <div className="text-slate-500 text-sm">点击左侧建议卡片查看详细说明。</div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-white font-semibold pr-3">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-200"><X size={14} /></button>
              </div>

              <div className="space-y-3 text-sm">
                <section>
                  <h3 className="text-slate-300 mb-1">原文问题</h3>
                  <p className="text-slate-400">{selected.currentProblem}</p>
                  {selected.originalExcerpt && <p className="text-xs mt-1 text-slate-500">原文片段：{selected.originalExcerpt}</p>}
                </section>

                <section>
                  <h3 className="text-slate-300 mb-1">为什么不符合《中国科技论坛》风格</h3>
                  <p className="text-slate-400">{selected.journalMismatch}</p>
                </section>

                <section>
                  <h3 className="text-slate-300 mb-1">具体修改方向</h3>
                  <p className="text-slate-400">{selected.recommendation}</p>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-slate-300">可直接替换的示范文本</h3>
                    <button onClick={() => copyText(selected.exampleRewrite)} className="text-xs text-blue-300 flex items-center gap-1">{copied ? <><Check size={12} />已复制</> : <><Copy size={12} />复制</>}</button>
                  </div>
                  <pre className="text-xs whitespace-pre-wrap bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200">{selected.exampleRewrite}</pre>
                </section>

                <section>
                  <h3 className="text-slate-300 mb-1">推荐补充理论/文献方向</h3>
                  <p className="text-slate-400">{selected.literatureDirection}</p>
                </section>

                <section className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-2">
                    <div className="text-xs text-slate-500">预计提分</div>
                    <div className="text-sm text-blue-300">+{selected.scoreImpact}</div>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-2">
                    <div className="text-xs text-slate-500">接收概率影响</div>
                    <div className="text-sm text-amber-300">{selected.probabilityImpact}</div>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
