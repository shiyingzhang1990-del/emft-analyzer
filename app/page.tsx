'use client'
import { useEffect, useState } from 'react'
import { BarChart3, BookOpen, FileSearch, Lightbulb, ArrowRight, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null)
  const [loadingSample, setLoadingSample] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/journal/profile').then(r => r.json()).then(d => setProfile(d.profile))
  }, [])

  const loadSample = async () => {
    setLoadingSample(true)
    const res = await fetch('/api/manuscript/sample')
    const sample = await res.json()
    localStorage.setItem('zgkjlt-current', JSON.stringify(sample))
    const historyRaw = localStorage.getItem('zgkjlt-history')
    const history = historyRaw ? JSON.parse(historyRaw) : []
    localStorage.setItem('zgkjlt-history', JSON.stringify([sample, ...history].slice(0, 20)))
    router.push('/report')
    setLoadingSample(false)
  }

  const cards = [
    { href: '/profile', title: '期刊主题画像', desc: '查看《中国科技论坛》定位、偏好与不适配主题', icon: BookOpen },
    { href: '/style', title: '投稿风格与格式规范', desc: '按CSSCI编辑逻辑检查标题、摘要、引言与结构', icon: FileSearch },
    { href: '/upload', title: '论文上传评分', desc: '上传docx/pdf/txt，自动解析并生成编辑视角评分', icon: BarChart3 },
    { href: '/suggestions', title: '逐条修改建议', desc: '点击建议卡片查看可替换文本和预计提分', icon: Lightbulb },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">中国科技论坛投稿适配度分析系统</h1>
        <p className="text-slate-300 text-sm max-w-3xl">
          帮助作者从期刊编辑视角评估论文是否适合《中国科技论坛》，输出主题契合度、格式规范、逻辑结构与修改建议。
        </p>
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 max-w-4xl">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          本系统给出的接收概率为基于期刊偏好、格式规范、主题契合度、论文质量和编辑初审标准的模型化估计，不代表期刊官方意见，也不构成录用承诺。
        </div>
        <button
          onClick={loadSample}
          disabled={loadingSample}
          className="mt-4 text-sm px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-60"
        >
          {loadingSample ? '正在加载示例...' : '查看示例分析'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {cards.map(c => (
          <Link key={c.href} href={c.href} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 hover:border-blue-500/40 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-300 font-semibold">
                <c.icon size={15} /> {c.title}
              </div>
              <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-300" />
            </div>
            <p className="text-sm text-slate-400">{c.desc}</p>
          </Link>
        ))}
      </div>

      {profile && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-3">期刊画像摘要</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500 mb-1">重点方向</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.scope.slice(0, 8).map((s: string) => (
                  <span key={s} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-slate-500 mb-1">偏好风格关键词</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.styleKeywords.map((s: string) => (
                  <span key={s} className="text-xs bg-blue-500/15 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
