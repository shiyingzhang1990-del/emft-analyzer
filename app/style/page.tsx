'use client'
import { BookOpen, CheckCircle, AlertTriangle } from 'lucide-react'

const sections = [
  {
    title: '标题规范',
    points: [
      '问题意识明确',
      '变量关系清晰',
      '体现科技政策或创新管理语境',
      '避免文学化、口号化、过宽泛',
    ],
    weak: '企业创新能力提升研究',
    better: '政府创新补贴、企业家精神与企业持续性创新：来自高技术制造业的经验证据',
  },
  {
    title: '摘要规范',
    points: ['研究背景', '研究问题', '理论机制', '数据与方法', '主要发现', '政策启示'],
  },
  {
    title: '引言规范',
    points: [
      '现实背景：国家战略、政策情境、产业问题',
      '理论缺口：已有研究不足',
      '研究问题：本文回答什么',
      '研究设计：数据与方法',
      '边际贡献：理论/方法/实践',
    ],
  },
  {
    title: '理论机制规范',
    points: [
      '有明确因果链条',
      '有理论支撑，不是变量堆砌',
      '解释“为什么”和“如何发生”',
      '实证论文可自然推导假设，案例论文可形成机制路径图',
    ],
  },
  {
    title: '研究设计规范',
    points: [
      '实证：样本来源、变量定义、模型设定、内生性、稳健性、机制、异质性',
      '案例：案例选择、数据来源、编码过程、证据链、理论抽象、机制模型',
    ],
  },
  {
    title: '结论与政策建议规范',
    points: ['理论回应', '管理启示', '政策建议', '研究局限', '未来展望'],
  },
  {
    title: '参考文献规范',
    points: [
      '近五年文献占比',
      'CSSCI/SSCI文献覆盖',
      '引用《中国科技论坛》相关文章',
      '避免伪造文献与格式缺失（年份/卷期/页码）',
    ],
  },
]

export default function StylePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen size={18} className="text-blue-300" />投稿风格与格式规范</h1>

      <div className="grid grid-cols-2 gap-5">
        {sections.map(s => (
          <div key={s.title} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-3">{s.title}</h2>
            <ul className="space-y-1 mb-3">
              {s.points.map(p => <li key={p} className="text-sm text-slate-300 flex gap-2"><CheckCircle size={13} className="text-green-400 mt-0.5" />{p}</li>)}
            </ul>

            {s.weak && s.better && (
              <div className="space-y-2">
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-2"><AlertTriangle size={12} className="inline mr-1" />较弱标题：{s.weak}</div>
                <div className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">优化标题：{s.better}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
