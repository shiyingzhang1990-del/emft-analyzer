'use client'
import { useEffect, useMemo, useState } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'

function grade(score: number) {
  if (score >= 85) return '高度适配'
  if (score >= 75) return '较适配'
  if (score >= 65) return '存在风险'
  if (score >= 50) return '适配度偏弱'
  return '不适合当前期刊'
}

export default function ReportPage() {
  const [record, setRecord] = useState<any>(null)

  useEffect(() => {
    const raw = localStorage.getItem('zgkjlt-current')
    setRecord(raw ? JSON.parse(raw) : null)
  }, [])

  const radarData = useMemo(() => {
    if (!record?.report?.dimensionScores) return []
    return record.report.dimensionScores.map((d: any) => ({
      dimension: d.name,
      score: Math.round((d.score / d.maxScore) * 100),
      fullMark: 100,
    }))
  }, [record])

  const exportMarkdown = () => {
    if (!record) return
    const r = record.report
    const md = `# 中国科技论坛投稿分析报告\n\n## 总览\n- 论文：${record.title}\n- 总分：${r.overallScore}/100\n- 等级：${grade(r.overallScore)}\n- 接收概率估计：${r.acceptanceProbability.min}% - ${r.acceptanceProbability.max}%\n- 建议：${r.suggestedStrategy}\n\n## 编辑初审意见模拟\n${r.editorialSummary}\n\n## 八维评分\n${r.dimensionScores.map((d: any) => `- ${d.name}: ${d.score}/${d.maxScore}（${d.reason}）`).join('\n')}\n\n## 风险提示\n${r.majorRisks.map((x: string) => `- ${x}`).join('\n')}\n\n## 免责声明\n${r.journalDisclaimer}\n`
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${record.title || 'analysis'}.md`
    a.click()
  }

  const exportHTML = () => {
    if (!record) return
    const r = record.report
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>分析报告</title></head><body style="font-family:Arial;padding:24px;line-height:1.7"><h1>中国科技论坛投稿分析报告</h1><p><b>论文：</b>${record.title}</p><p><b>总分：</b>${r.overallScore}/100</p><p><b>等级：</b>${grade(r.overallScore)}</p><p><b>接收概率估计：</b>${r.acceptanceProbability.min}% - ${r.acceptanceProbability.max}%</p><h2>编辑初审意见模拟</h2><p>${r.editorialSummary}</p><h2>风险提示</h2><ul>${r.majorRisks.map((x: string) => `<li>${x}</li>`).join('')}</ul><p style="margin-top:24px;color:#666">${r.journalDisclaimer}</p></body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${record.title || 'analysis'}.html`
    a.click()
  }

  if (!record) return <div className="p-8 text-slate-400">暂无分析记录，请先前往“上传论文”。</div>

  const r = record.report
  const refs: string[] = record.parsed?.references || []
  const yearMatches = refs.map(ref => {
    const m = ref.match(/(20\d{2}|19\d{2})/)
    return m ? Number(m[1]) : null
  }).filter((y: number | null): y is number => y !== null)
  const recentCount = yearMatches.filter(y => y >= new Date().getFullYear() - 5).length
  const recentRatio = refs.length ? Math.round((recentCount / refs.length) * 100) : 0
  const cssciHint = refs.filter(x => /中国科技论坛|管理世界|科研管理|中国工业经济|经济研究/.test(x)).length
  const ssciHint = refs.filter(x => /Journal|Review|Policy|Innovation|Research|Management/i.test(x)).length
  const refScore = Math.min(100, Math.round((recentRatio * 0.5) + (cssciHint * 8) + (ssciHint * 4)))

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">分析报告</h1>

      <div className="grid grid-cols-5 gap-3 mb-5">
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3"><div className="text-xs text-slate-500">总分</div><div className="text-xl text-blue-300 font-bold">{r.overallScore}</div></div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3"><div className="text-xs text-slate-500">推荐等级</div><div className="text-sm text-white mt-1">{grade(r.overallScore)}</div></div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3"><div className="text-xs text-slate-500">接收概率区间</div><div className="text-sm text-amber-300 mt-1">{r.acceptanceProbability.min}% - {r.acceptanceProbability.max}%</div></div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3"><div className="text-xs text-slate-500">是否建议投稿</div><div className="text-sm text-white mt-1">{r.overallScore >= 75 ? '建议修改后投稿' : '建议先系统大修'}</div></div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3"><div className="text-xs text-slate-500">导出</div><div className="flex gap-2 mt-1"><button onClick={exportMarkdown} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-200">Markdown</button><button onClick={exportHTML} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-200">HTML</button></div></div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3">八维雷达图</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3">编辑初审意见模拟</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">{r.editorialSummary}</p>
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">{r.journalDisclaimer}</div>
          <div className="mt-4">
            <h3 className="text-sm text-white mb-2">风险提示</h3>
            <ul className="space-y-1">
              {r.majorRisks.map((risk: string, i: number) => <li key={i} className="text-xs text-red-300">• {risk}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-5">
        <h2 className="text-white font-semibold mb-3">参考文献诊断</h2>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
            <div className="text-xs text-slate-500">识别文献数</div>
            <div className="text-lg text-blue-300 font-bold">{refs.length}</div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
            <div className="text-xs text-slate-500">近五年比例</div>
            <div className={`text-lg font-bold ${recentRatio >= 40 ? 'text-green-300' : 'text-amber-300'}`}>{recentRatio}%</div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
            <div className="text-xs text-slate-500">CSSCI期刊命中</div>
            <div className={`text-lg font-bold ${cssciHint >= 2 ? 'text-green-300' : 'text-amber-300'}`}>{cssciHint}</div>
          </div>
          <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
            <div className="text-xs text-slate-500">SSCI/英文期刊命中</div>
            <div className={`text-lg font-bold ${ssciHint >= 2 ? 'text-green-300' : 'text-amber-300'}`}>{ssciHint}</div>
          </div>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          {recentRatio < 40 && <p className="text-amber-300">• 近五年文献比例偏低，建议补充2020年以后的相关研究。</p>}
          {cssciHint === 0 && <p className="text-amber-300">• 未检测到CSSCI核心期刊引用，建议引用《中国科技论坛》《管理世界》《科研管理》等相关文章。</p>}
          {ssciHint === 0 && <p className="text-amber-300">• 未检测到英文期刊引用，建议补充SSCI相关文献以提升国际对话性。</p>}
          {refs.length === 0 && <p className="text-red-300">• 未能识别参考文献列表，请确认文档中包含"参考文献"章节。</p>}
          <p className="text-slate-500">注：系统仅做结构性诊断，不生成虚假文献。具体文献请通过知网、Web of Science等数据库核验。</p>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
        <div className="space-y-2">
          {r.dimensionScores.map((d: any) => (
            <div key={d.name} className="p-3 rounded-lg bg-slate-700/30 border border-slate-600">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white">{d.name}</span>
                <span className="text-sm text-blue-300">{d.score}/{d.maxScore}</span>
              </div>
              <p className="text-xs text-slate-400">{d.reason}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Link href="/suggestions" className="text-sm text-blue-300 hover:text-blue-200">查看逐条修改建议 →</Link>
      </div>
    </div>
  )
}
