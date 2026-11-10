'use client'
import { useState, useCallback } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

function ScoreRing({ score, max = 100 }: { score: number; max?: number }) {
  const pct = score / max
  const color = pct >= 0.8 ? '#10b981' : pct >= 0.6 ? '#f59e0b' : '#ef4444'
  const r = 36, circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={90} height={90} className="rotate-[-90deg]">
      <circle cx={45} cy={45} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
      <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={45} y={45} textAnchor="middle" dominantBaseline="central" fill={color}
        fontSize={18} fontWeight={700} style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}>
        {score}
      </text>
    </svg>
  )
}

function DimensionCard({ d, expanded, onToggle }: { d: any; expanded: boolean; onToggle: () => void }) {
  const pct = d.score / d.maxScore
  const color = pct >= 0.8 ? 'text-green-400' : pct >= 0.6 ? 'text-amber-400' : 'text-red-400'
  const barColor = pct >= 0.8 ? 'bg-green-500' : pct >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
      <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-700/30 transition-colors" onClick={onToggle}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">{d.name}</span>
            <span className={`text-sm font-bold ${color}`}>{d.score}/{d.maxScore}</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-500 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
          <p className="text-xs text-slate-500 mb-3">{d.explanation}</p>
          {d.details.length > 0 && (
            <div className="mb-2">
              {d.details.map((det: string, i: number) => (
                <div key={i} className="text-xs text-green-400 flex gap-1.5 mb-1"><CheckCircle size={10} className="flex-shrink-0 mt-0.5" />{det}</div>
              ))}
            </div>
          )}
          {d.suggestions.length > 0 && (
            <div>
              {d.suggestions.map((s: string, i: number) => (
                <div key={i} className="text-xs text-amber-300 flex gap-1.5 mb-1"><AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />{s}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AuditPage() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<any>(null)
  const [parsed, setParsed] = useState<any>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [activeTab, setActiveTab] = useState<'score' | 'reviewer' | 'roadmap' | 'checklist'>('score')

  const handleFile = useCallback(async (file: File) => {
    setLoading(true); setError(''); setReport(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const up = await fetch('/api/manuscript/upload', { method: 'POST', body: fd })
      if (!up.ok) throw new Error(await up.text())
      const { text } = await up.json()
      const au = await fetch('/api/manuscript/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      if (!au.ok) throw new Error(await au.text())
      const data = await au.json()
      setReport(data.report); setParsed(data.parsed)
    } catch (e: any) { setError(e.message || 'Upload failed') }
    setLoading(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const readinessColor = report?.readinessLevel === 'Ready for Submission' ? 'text-green-400 border-green-500/30 bg-green-500/10'
    : report?.readinessLevel === 'Revision Recommended' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-red-400 border-red-500/30 bg-red-500/10'

  const radarData = report?.dimensions?.map((d: any) => ({
    subject: d.name.replace(' and ', ' & ').replace('Empirical Design Quality', 'Empirical').replace('Theoretical Contribution', 'Theory').replace('Journal Scope Fit', 'Scope').replace('Topic Timeliness', 'Timeliness').replace('Tables and Reporting', 'Tables').replace('Language and Style', 'Language').replace('Reference Fit', 'References').replace('Structure and Logic', 'Structure'),
    score: Math.round((d.score / d.maxScore) * 100),
    fullMark: 100,
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText size={20} className="text-amber-400" /> Manuscript Audit
        </h1>
        <p className="text-slate-400 text-sm mt-1">上传稿件 · 8维度评分 · 审稿人模拟 · 修改路线图</p>
      </div>

      {/* Upload Zone */}
      {!report && (
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer mb-6 ${dragging ? 'border-amber-400 bg-amber-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input id="file-input" type="file" accept=".docx,.pdf,.txt" className="hidden" onChange={onInput} />
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Analyzing manuscript...</p>
            </div>
          ) : (
            <>
              <Upload size={32} className="text-slate-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Drop your manuscript here</p>
              <p className="text-slate-500 text-sm">Supports .docx, .pdf, .txt · Max 10MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 text-sm flex gap-2">
          <XCircle size={16} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {report && parsed && (
        <>
          {/* Score Header */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-6">
              <ScoreRing score={report.overallScore} />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-white">Overall Score: {report.overallScore}/100</h2>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${readinessColor}`}>{report.readinessLevel}</span>
                </div>
                <p className="text-slate-400 text-sm mb-3">Estimated fit probability: <span className="text-amber-400 font-semibold">{report.fitBand}</span></p>
                <div className="flex flex-wrap gap-2">
                  {report.strengths.map((s: string, i: number) => (
                    <span key={i} className="text-xs bg-green-500/10 border border-green-500/20 text-green-300 px-2 py-1 rounded-lg">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 space-y-1">
                <div>{parsed.wordCount.toLocaleString()} words</div>
                <div>{parsed.tableCount} tables</div>
                <div>{parsed.referenceCount} references</div>
                <div>{parsed.hypotheses.length} hypotheses</div>
              </div>
            </div>
          </div>

          {/* Risk Flags */}
          {report.risks.length > 0 && (
            <div className="mb-6 space-y-2">
              {report.risks.map((r: any, i: number) => (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border text-sm ${r.level === 'critical' ? 'bg-red-500/10 border-red-500/30' : r.level === 'major' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-700/30 border-slate-600'}`}>
                  <AlertTriangle size={14} className={`flex-shrink-0 mt-0.5 ${r.level === 'critical' ? 'text-red-400' : r.level === 'major' ? 'text-amber-400' : 'text-slate-400'}`} />
                  <div>
                    <span className={`font-semibold ${r.level === 'critical' ? 'text-red-300' : r.level === 'major' ? 'text-amber-300' : 'text-slate-300'}`}>[{r.level.toUpperCase()}] {r.category}: </span>
                    <span className="text-slate-300">{r.description}</span>
                    <span className="text-slate-500"> → {r.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-slate-800/60 border border-slate-700 rounded-xl p-1 w-fit">
            {(['score', 'reviewer', 'roadmap', 'checklist'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'score' ? 'Dimensions' : tab === 'reviewer' ? 'Reviewer Sim' : tab === 'roadmap' ? 'Roadmap' : 'Checklist'}
              </button>
            ))}
          </div>

          {/* Score Tab */}
          {activeTab === 'score' && (
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-3">
                {report.dimensions.map((d: any, i: number) => (
                  <DimensionCard key={i} d={d} expanded={!!expanded[i]} onToggle={() => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))} />
                ))}
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 h-fit">
                <h3 className="text-sm font-semibold text-white mb-4">Score Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar name="Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={(v: any) => [`${v}%`, 'Score']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Reviewer Tab */}
          {activeTab === 'reviewer' && (
            <div className="space-y-4">
              {report.reviewerSimulation.map((rv: any, i: number) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold text-white">{rv.reviewer}</span>
                      <span className="text-slate-500 text-sm ml-2">· Focus: {rv.focus}</span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${rv.verdict === 'Minor revision' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>{rv.verdict}</span>
                  </div>
                  <ul className="space-y-2">
                    {rv.comments.map((c: string, j: number) => (
                      <li key={j} className="text-sm text-slate-300 flex gap-2">
                        <span className="text-slate-600 flex-shrink-0">{j + 1}.</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Roadmap Tab */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              {[1, 2, 3].map(priority => {
                const items = report.revisionRoadmap.filter((r: any) => r.priority === priority)
                if (!items.length) return null
                const colors = ['', 'border-red-500/30 bg-red-500/5', 'border-amber-500/30 bg-amber-500/5', 'border-slate-600 bg-slate-800/30']
                const labels = ['', 'P1 — Must Fix', 'P2 — Should Fix', 'P3 — Nice to Have']
                const textColors = ['', 'text-red-400', 'text-amber-400', 'text-slate-400']
                return (
                  <div key={priority}>
                    <h3 className={`text-xs font-semibold mb-2 ${textColors[priority]}`}>{labels[priority]}</h3>
                    <div className="space-y-2">
                      {items.map((item: any, i: number) => (
                        <div key={i} className={`border rounded-xl p-4 ${colors[priority]}`}>
                          <div className="flex items-start gap-3">
                            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full flex-shrink-0">{item.section}</span>
                            <div>
                              <p className="text-sm text-slate-300 mb-1">{item.issue}</p>
                              <p className="text-xs text-slate-500">→ {item.action}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-2">
              {Object.entries(
                report.checklist.reduce((acc: any, item: any) => {
                  if (!acc[item.category]) acc[item.category] = []
                  acc[item.category].push(item)
                  return acc
                }, {})
              ).map(([cat, items]: [string, any]) => (
                <div key={cat} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-4 py-2 bg-slate-700/30 text-xs font-semibold text-slate-400">{cat}</div>
                  {items.map((item: any, i: number) => (
                    <div key={i} className="px-4 py-2.5 flex items-start gap-3 border-t border-slate-700/50">
                      {item.done
                        ? <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                        : <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />}
                      <span className={`text-sm ${item.done ? 'text-slate-300' : 'text-slate-400'}`}>{item.item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => { setReport(null); setParsed(null); setError('') }}
            className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← Upload another manuscript
          </button>
        </>
      )}
    </div>
  )
}
