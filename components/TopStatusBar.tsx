'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function level(score: number) {
  if (score >= 85) return '高度适配'
  if (score >= 75) return '较适配'
  if (score >= 65) return '存在风险'
  if (score >= 50) return '适配度偏弱'
  return '不适合当前期刊'
}

export default function TopStatusBar() {
  const [record, setRecord] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    const load = () => {
      const raw = localStorage.getItem('zgkjlt-current')
      setRecord(raw ? JSON.parse(raw) : null)
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  const score = useMemo(() => record?.report?.overallScore ?? '-', [record])
  const currentLevel = useMemo(() => (typeof score === 'number' ? level(score) : '-'), [score])

  return (
    <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-6 py-2.5 flex items-center justify-between">
      <div className="text-xs text-slate-400 flex items-center gap-4">
        <span>当前分析论文：<span className="text-slate-200">{record?.title || '未分析论文'}</span></span>
        <span>当前总分：<span className="text-blue-300">{score}</span></span>
        <span>当前适配等级：<span className="text-amber-300">{currentLevel}</span></span>
      </div>
      <div className="flex items-center gap-2">
        {pathname !== '/report' ? (
          <Link href="/report" className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200">查看/导出报告</Link>
        ) : (
          <span className="text-xs text-slate-500">请在报告页使用导出按钮</span>
        )}
      </div>
    </div>
  )
}
