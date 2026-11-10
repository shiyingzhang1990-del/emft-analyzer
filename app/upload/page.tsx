'use client'
import { useEffect, useMemo, useState } from 'react'
import { Upload, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const raw = localStorage.getItem('zgkjlt-history')
    setHistory(raw ? JSON.parse(raw) : [])
  }, [])

  const currentName = useMemo(() => history[0]?.title || '未分析论文', [history])
  const currentScore = useMemo(() => history[0]?.report?.overallScore ?? '-', [history])

  const handleFile = async (file: File) => {
    setLoading(true); setError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const up = await fetch('/api/manuscript/upload', { method: 'POST', body: fd })
      if (!up.ok) throw new Error(await up.text())
      const { text, filename } = await up.json()

      const au = await fetch('/api/manuscript/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!au.ok) throw new Error(await au.text())
      const data = await au.json()

      const record = {
        id: crypto.randomUUID(),
        title: data.parsed.title || filename,
        uploadedAt: new Date().toISOString(),
        parsed: data.parsed,
        report: data.report,
      }
      const next = [record, ...history].slice(0, 20)
      localStorage.setItem('zgkjlt-history', JSON.stringify(next))
      localStorage.setItem('zgkjlt-current', JSON.stringify(record))
      setHistory(next)
      router.push('/report')
    } catch (e: any) {
      setError(e.message || '上传失败')
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">上传论文</h1>
      <p className="text-slate-400 text-sm mb-4">支持 docx/pdf/txt，自动解析标题、摘要、关键词、结构与参考文献。</p>

      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
          <div className="text-xs text-slate-500">当前分析论文</div>
          <div className="text-sm text-white mt-1 truncate">{currentName}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
          <div className="text-xs text-slate-500">当前总分</div>
          <div className="text-sm text-blue-300 mt-1">{currentScore}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 col-span-2">
          <div className="text-xs text-slate-500">说明</div>
          <div className="text-xs text-slate-300 mt-1">分析仅在本地执行；仅当你配置 API Key 并启用深度分析时才会调用外部模型。</div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${dragging ? 'border-blue-400 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => document.getElementById('upload-input')?.click()}
      >
        <input id="upload-input" className="hidden" type="file" accept=".docx,.pdf,.txt" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 text-sm">正在解析与评分...</p>
          </div>
        ) : (
          <>
            <Upload size={34} className="mx-auto text-slate-500 mb-3" />
            <p className="text-white font-medium">拖拽上传或点击选择文件</p>
            <p className="text-slate-500 text-sm mt-1">docx / pdf / txt</p>
          </>
        )}
      </div>

      {error && <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2"><AlertTriangle size={14} />{error}</div>}
    </div>
  )
}
