'use client'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    fetch('/api/journal/profile').then(r => r.json()).then(d => setProfile(d.profile))
  }, [])

  if (!profile) return <div className="p-8 text-slate-400">加载中...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">期刊画像</h1>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">期刊定位</h2>
          <ul className="space-y-1">
            {profile.scope.map((s: string) => <li key={s} className="text-sm text-slate-300">• {s}</li>)}
          </ul>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">办刊风格</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong className="text-blue-300">政策性：</strong>回应国家科技战略与创新驱动发展议题。</p>
            <p><strong className="text-blue-300">综合性：</strong>从企业问题上升到产业治理与科技政策层面。</p>
            <p><strong className="text-blue-300">学术性：</strong>具备理论框架、研究设计、数据支撑与规范论证。</p>
            <p><strong className="text-blue-300">实践性：</strong>提出可执行的政策建议与管理启示。</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold mb-3">适合主题（标签云）</h2>
        <div className="flex flex-wrap gap-2">
          {profile.preferredTopics.map((t: string) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">{t}</span>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-3">不太适合主题</h2>
        <ul className="space-y-1">
          {profile.unsuitableTopics.map((t: string) => <li key={t} className="text-sm text-slate-400">• {t}</li>)}
        </ul>
      </div>
    </div>
  )
}
