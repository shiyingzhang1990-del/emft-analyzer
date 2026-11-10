'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, TrendingUp, FileUp, BarChart3, Lightbulb, History, Settings, ExternalLink } from 'lucide-react'

const nav = [
  { href: '/', label: '首页', icon: Home },
  { href: '/profile', label: '期刊画像', icon: BookOpen },
  { href: '/topics', label: '近期主题', icon: TrendingUp },
  { href: '/style', label: '风格规范', icon: BookOpen },
  { href: '/upload', label: '上传论文', icon: FileUp },
  { href: '/report', label: '分析报告', icon: BarChart3 },
  { href: '/suggestions', label: '修改建议', icon: Lightbulb },
  { href: '/history', label: '历史记录', icon: History },
  { href: '/settings', label: '设置', icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-sm">科</div>
          <span className="font-bold text-white text-sm">投稿适配分析系统</span>
        </div>
        <p className="text-xs text-slate-500 leading-tight">《中国科技论坛》编辑视角辅助工具</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <a
          href="http://www.zgkjlt.org.cn/CN/volumn/home.shtml"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-300 transition-colors"
        >
          <ExternalLink size={12} />
          中国科技论坛官网目录
        </a>
        <p className="text-xs text-slate-600 mt-2">
          仅供投稿前自查参考。<br />
          不代表期刊官方意见。
        </p>
      </div>
    </aside>
  )
}
