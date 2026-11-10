'use client'
import { useEffect, useState } from 'react'

export default function HistoryPage() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('zgkjlt-history')
    setRows(raw ? JSON.parse(raw) : [])
  }, [])

  const open = (r: any) => {
    localStorage.setItem('zgkjlt-current', JSON.stringify(r))
    window.location.href = '/report'
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">历史记录</h1>
      {rows.length === 0 ? (
        <div className="text-slate-500">暂无历史分析记录。</div>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <button key={r.id} onClick={() => open(r)} className="w-full text-left bg-slate-800/60 border border-slate-700 rounded-lg p-4 hover:border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">{r.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(r.uploadedAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-blue-300">{r.report.overallScore}/100</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
