'use client'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('claude')

  useEffect(() => {
    setApiKey(localStorage.getItem('zgkjlt-api-key') || '')
    setProvider(localStorage.getItem('zgkjlt-ai-provider') || 'claude')
  }, [])

  const save = () => {
    localStorage.setItem('zgkjlt-api-key', apiKey)
    localStorage.setItem('zgkjlt-ai-provider', provider)
    alert('设置已保存')
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-4">设置</h1>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-4">
        <h2 className="text-white font-semibold text-sm mb-3">AI Provider（预留）</h2>
        <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200">
          <option value="claude">Claude</option>
          <option value="openai">OpenAI（预留）</option>
          <option value="local">Local Model（预留）</option>
        </select>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-4">
        <h2 className="text-white font-semibold text-sm mb-3">ANTHROPIC_API_KEY（本地存储演示）</h2>
        <input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        />
        <p className="text-xs text-slate-500 mt-2">MVP默认使用内置规则引擎评分；配置后可接入深度分析接口。</p>
      </div>

      <button onClick={save} className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm">保存设置</button>
    </div>
  )
}
