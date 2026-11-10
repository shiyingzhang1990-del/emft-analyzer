import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import TopStatusBar from '@/components/TopStatusBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '中国科技论坛投稿适配度分析系统',
  description: '中国科技论坛投稿前适配度、格式规范与编辑视角分析工具',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen">
            <TopStatusBar />
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
