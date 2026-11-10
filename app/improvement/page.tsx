'use client'
import { useState } from 'react'

const rewriteOptions = [
  '改写标题',
  '改写摘要',
  '改写引言',
  '改写理论机制',
  '改写结论',
  '改写政策建议',
  '降低AI痕迹',
  '提升CSSCI学术表达',
]

const templates: Record<string, { issue: string; rewrite: string; reason: string; fit: string }> = {
  改写标题: {
    issue: '原标题偏企业管理视角，科技政策语境不足。',
    rewrite: '创新激励政策、动态能力与企业持续性创新：基于高技术制造业的机制证据',
    reason: '补足政策工具与机制识别表述，增强期刊方向匹配。',
    fit: '更符合《中国科技论坛》“政策性+学术性”选题偏好。',
  },
  改写摘要: {
    issue: '摘要缺少研究问题与政策启示。',
    rewrite: '在创新驱动发展战略持续推进背景下，本文聚焦高技术制造业企业持续性创新问题……据此提出面向政府、企业与产业平台的分层政策建议。',
    reason: '按“背景-问题-方法-发现-贡献-启示”补齐摘要六要素。',
    fit: '符合中文CSSCI期刊摘要完整性要求。',
  },
  改写引言: {
    issue: '引言背景大而空，缺乏可检验研究问题。',
    rewrite: '第一段国家战略背景；第二段现实矛盾；第三段文献不足；第四段研究问题；第五段边际贡献。',
    reason: '建立标准引言推进链条，增强问题意识。',
    fit: '更符合编辑初审对引言结构的预期。',
  },
  改写理论机制: {
    issue: '仅有“X影响Y”，缺少中介机制。',
    rewrite: '创新激励通过优化资源配置、强化组织协同与提升风险承担，进而促进企业持续性创新。',
    reason: '把相关关系升级为可解释、可检验机制链条。',
    fit: '更符合期刊对机制解释力的要求。',
  },
  改写结论: {
    issue: '结论重复结果，缺少理论回应与局限讨论。',
    rewrite: '结论按“理论回应-管理启示-政策建议-研究局限-未来展望”重写。',
    reason: '突出研究边际贡献与后续研究路径。',
    fit: '符合CSSCI规范化结论写作。',
  },
  改写政策建议: {
    issue: '政策建议空泛，缺少执行主体与工具。',
    rewrite: '面向政府：优化创新补贴结构；面向企业：完善激励契约与研发治理；面向产业平台：强化协同创新；面向金融机构：完善科技金融支持。',
    reason: '将“应当/加强”类口号改为“主体-工具-目标”建议。',
    fit: '更符合《中国科技论坛》实践性导向。',
  },
  降低AI痕迹: {
    issue: '出现“具有重要意义”等高频模板表达。',
    rewrite: '将抽象口号替换为变量、机制、证据与政策情境。',
    reason: '减少重复句式和空泛词汇。',
    fit: '提升学术表达可信度。',
  },
  提升CSSCI学术表达: {
    issue: '句式口语化且论证密度不足。',
    rewrite: '用“研究发现—机制解释—文献对话—政策含义”四段式表达。',
    reason: '强化论证逻辑和学术语体。',
    fit: '更接近CSSCI期刊表达习惯。',
  },
}

export default function ImprovementPage() {
  const [mode, setMode] = useState('改写标题')
  const t = templates[mode]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">期刊适配型改写模块</h1>
      <p className="text-sm text-slate-400 mb-5">可选择局部改写功能，输出原文问题、改写后文本、修改理由与期刊匹配判断。</p>

      <div className="grid grid-cols-[240px_1fr] gap-5">
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2">
          {rewriteOptions.map(opt => (
            <button key={opt} onClick={() => setMode(opt)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${mode === opt ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-700/40'}`}>
              {opt}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-white font-semibold mb-1">原文问题</h2>
            <p className="text-sm text-slate-400">{t.issue}</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-1">改写后文本</h2>
            <pre className="text-sm text-slate-200 whitespace-pre-wrap bg-slate-900 border border-slate-700 rounded-lg p-3">{t.rewrite}</pre>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-1">修改理由</h2>
            <p className="text-sm text-slate-400">{t.reason}</p>
          </div>
          <div>
            <h2 className="text-white font-semibold mb-1">是否更符合《中国科技论坛》</h2>
            <p className="text-sm text-blue-300">{t.fit}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
