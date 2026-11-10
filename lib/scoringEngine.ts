import type { AnalysisReport, ParsedManuscript, RevisionSuggestion, ScoreDimension } from '@/types/journal'

const POSITIVE_TOPICS = [
  '科技创新', '科技政策', '创新管理', '产业创新', '技术创新', '数字经济', '人工智能',
  '区域创新', '创新生态', '科技金融', '知识产权', '绿色创新', '新质生产力', '高质量发展',
  '创新驱动', '产学研', '科技体制', '科技治理', '创新链', '产业链',
]

const WEAK_TOPICS = ['财务绩效', '审计质量', '内部控制', '公司治理', '盈余管理', '税收规避', '薪酬激励']
const AI_STYLE_PHRASES = ['具有重要意义', '提供有益借鉴', '在新时代背景下', '不断推进', '深入探讨', '赋能', '助力', '路径', '机制']

function hasAny(text: string, words: string[]) {
  return words.filter(w => text.includes(w))
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function scoreZGKJLT(ms: ParsedManuscript): AnalysisReport {
  const full = ms.fullText
  const titleAbsKw = `${ms.title} ${ms.abstract} ${ms.keywords.join(' ')}`

  const positiveMatches = hasAny(titleAbsKw, POSITIVE_TOPICS)
  const weakMatches = hasAny(titleAbsKw, WEAK_TOPICS)

  // 1 主题契合度 20
  let topicScore = clamp(8 + positiveMatches.length * 2 - (weakMatches.length > 0 && positiveMatches.length < 2 ? 4 : 0), 0, 20)
  const topicReason = positiveMatches.length >= 4
    ? `标题/摘要/关键词包含多个期刊偏好主题：${positiveMatches.slice(0, 6).join('、')}。`
    : '主题与科技政策/创新管理的连接仍偏弱，需强化政策与治理外延。'

  // 2 问题意识 15
  let problemScore = 0
  if (/国家战略|创新驱动|中国式现代化|自立自强|政策/.test(full)) problemScore += 4
  if (/研究问题|本文关注|本文试图回答|本文旨在/.test(full)) problemScore += 4
  if (/文献缺口|研究不足|尚未充分/.test(full)) problemScore += 4
  if (/现实背景|实践问题|现实困境/.test(full)) problemScore += 3

  // 3 理论贡献 15
  let theoryScore = 0
  if (/理论机制|作用机制|因果链条|传导机制/.test(full)) theoryScore += 5
  if (/理论贡献|边际贡献|本文贡献/.test(full)) theoryScore += 5
  if (/假设|命题|理论框架|分析框架/.test(full)) theoryScore += 5

  // 4 研究设计 15
  let designScore = 0
  const empirical = /回归|面板|模型|样本|变量|内生性|稳健性|异质性|机制检验/.test(full)
  const caseStudy = /案例|扎根|编码|访谈|证据链|过程追踪/.test(full)
  if (empirical) {
    if (/样本来源|样本选择|数据来源/.test(full)) designScore += 3
    if (/变量定义|变量测度/.test(full)) designScore += 3
    if (/模型设定|基准回归|固定效应/.test(full)) designScore += 3
    if (/内生性|工具变量|PSM|双重差分|安慰剂/.test(full)) designScore += 3
    if (/稳健性|机制检验|异质性/.test(full)) designScore += 3
  } else if (caseStudy) {
    if (/案例选择/.test(full)) designScore += 3
    if (/资料来源|数据来源/.test(full)) designScore += 3
    if (/编码过程|开放编码|主轴编码|选择编码/.test(full)) designScore += 3
    if (/证据链|三角验证/.test(full)) designScore += 3
    if (/理论抽象|机制模型/.test(full)) designScore += 3
  } else {
    if (/概念界定|理论论证|政策逻辑/.test(full)) designScore += 9
  }

  // 5 论证逻辑 10
  let logicScore = 0
  const sec = (name: string) => ms.sections.find(s => s.name === name)?.present
  if (sec('introduction')) logicScore += 2
  if (sec('literature') || sec('hypotheses')) logicScore += 2
  if (sec('researchDesign')) logicScore += 2
  if (sec('baselineRegression') || /结果分析|实证结果/.test(full)) logicScore += 2
  if (sec('conclusion')) logicScore += 2

  // 6 语言表达 10
  const aiCount = AI_STYLE_PHRASES.reduce((n, p) => n + ((full.match(new RegExp(p, 'g')) || []).length), 0)
  let langScore = clamp(10 - Math.floor(aiCount / 3), 3, 10)

  // 7 格式规范 10
  let formatScore = 0
  if (ms.abstract.length > 80) formatScore += 2
  if (ms.keywords.length >= 3) formatScore += 1
  if (ms.sections.filter(s => s.present).length >= 5) formatScore += 3
  if (ms.referenceCount > 0) formatScore += 2
  if (ms.tableCount > 0 || /图\s*\d|表\s*\d|table\s+\d/i.test(full)) formatScore += 2

  // 8 期刊风格匹配度 5
  let styleScore = 0
  if (/政策|战略|治理/.test(full)) styleScore += 2
  if (/理论|文献|框架/.test(full)) styleScore += 1
  if (/实践启示|政策建议|管理启示/.test(full)) styleScore += 2

  const dimensionScores: ScoreDimension[] = [
    {
      name: '主题契合度', score: topicScore, maxScore: 20,
      reason: topicReason,
      improvement: '将研究问题从企业内部管理上升到科技政策、创新治理或产业升级语境。',
    },
    {
      name: '问题意识', score: problemScore, maxScore: 15,
      reason: problemScore >= 11 ? '现实背景—文献缺口—研究问题链条较完整。' : '研究问题与现实政策情境连接不够紧密。',
      improvement: '引言按“国家战略背景-现实矛盾-文献不足-研究问题-边际贡献”重构。',
    },
    {
      name: '理论贡献', score: theoryScore, maxScore: 15,
      reason: theoryScore >= 11 ? '理论机制和边际贡献表达较明确。' : '仍存在变量关系描述多、理论解释少的问题。',
      improvement: '增加“X→资源配置/组织协同/风险承担→Y”的机制链条阐释。',
    },
    {
      name: '研究设计', score: designScore, maxScore: 15,
      reason: designScore >= 11 ? '研究设计要素较齐全。' : '研究设计关键环节（识别策略/证据链）仍需补足。',
      improvement: empirical ? '补充内生性处理、稳健性、机制检验和异质性分析。' : '强化案例选择理由、编码流程与证据链透明度。',
    },
    {
      name: '论证逻辑', score: logicScore, maxScore: 10,
      reason: logicScore >= 8 ? '结构推进较清晰。' : '章节之间衔接仍不够，论证链条断点较多。',
      improvement: '确保“背景→缺口→问题→机制→设计→结果→启示”逐层推进。',
    },
    {
      name: '语言表达', score: langScore, maxScore: 10,
      reason: aiCount > 6 ? '模板化表达较多，存在较明显AI痕迹。' : '语言整体较规范。',
      improvement: '减少口号式句型，增加具体变量、机制与证据表达。',
    },
    {
      name: '格式规范', score: formatScore, maxScore: 10,
      reason: formatScore >= 8 ? '格式要素较完整。' : '摘要、关键词、章节或参考文献规范性不足。',
      improvement: '补齐摘要六要素、关键词、图表编号和参考文献信息。',
    },
    {
      name: '期刊风格匹配度', score: styleScore, maxScore: 5,
      reason: styleScore >= 4 ? '具备政策性+综合性+学术性+实践性特征。' : '政策性与实践性表达不足。',
      improvement: '结论部分增加面向政府、企业、产业平台和金融机构的分层建议。',
    },
  ]

  const overallScore = dimensionScores.reduce((s, d) => s + d.score, 0)

  let acceptanceProbability = { min: 5, max: 10, explanation: '当前稿件与期刊偏好匹配度较低。' }
  if (overallScore >= 90) acceptanceProbability = { min: 35, max: 50, explanation: '编辑初审通过可能性较高，但不等于录用。' }
  else if (overallScore >= 80) acceptanceProbability = { min: 25, max: 40, explanation: '具备较强竞争力，建议重点打磨后投稿。' }
  else if (overallScore >= 70) acceptanceProbability = { min: 15, max: 30, explanation: '有一定机会，建议系统修改后再投。' }
  else if (overallScore >= 60) acceptanceProbability = { min: 8, max: 18, explanation: '存在较高风险，建议先完成结构性修改。' }

  const recommendationLevel =
    overallScore >= 85 ? '高度适配，建议重点打磨后投稿' :
    overallScore >= 75 ? '较适配，有较大投稿潜力' :
    overallScore >= 65 ? '存在一定风险，需要系统修改' :
    overallScore >= 50 ? '适配度偏弱，不建议直接投稿' :
    '不适合当前期刊，建议改投其他期刊'

  const majorRisks: string[] = []
  if (topicScore < 14) majorRisks.push('主题偏离期刊方向或政策外延不足')
  if (theoryScore < 9) majorRisks.push('理论机制不清晰，边际贡献不足')
  if (designScore < 9) majorRisks.push('研究设计与识别策略不充分')
  if (langScore < 7) majorRisks.push('语言表达模板化，存在AI痕迹')
  if (formatScore < 7) majorRisks.push('格式规范不完整（摘要/关键词/参考文献/图表）')
  if (majorRisks.length === 0) majorRisks.push('主要风险可控，重点关注政策语境和贡献表达强化')

  const suggestions: RevisionSuggestion[] = []
  if (topicScore < 16) {
    suggestions.push({
      id: 's-title-policy',
      section: '标题',
      type: '标题修改建议',
      severity: 'high',
      title: '标题政策语境不足，需从企业问题上升到科技创新治理问题',
      currentProblem: '当前标题强调企业层面，但缺少“科技政策/创新治理/产业升级”语义锚点。',
      journalMismatch: '《中国科技论坛》偏好回应国家科技战略与创新治理议题的标题。',
      recommendation: '在标题中加入政策工具、创新治理或产业升级语境，并突出因果关系。',
      exampleRewrite: '“创新激励政策、动态能力与企业持续性创新：基于高技术制造业的机制证据”',
      literatureDirection: '补充“科技政策工具组合”“创新治理机制”“新质生产力”方向文献。',
      scoreImpact: 4,
      probabilityImpact: '预计提升初审概率约 3%-6%',
      originalExcerpt: ms.title || '（未识别到标题）',
    })
  }

  if (!/研究背景|研究问题|理论机制|方法|发现|启示|政策/.test(ms.abstract)) {
    suggestions.push({
      id: 's-abstract-6',
      section: '摘要',
      type: '摘要修改建议',
      severity: 'high',
      title: '摘要六要素缺失，需重构为“背景-问题-方法-发现-贡献-启示”',
      currentProblem: '摘要未完整覆盖研究背景、研究目的、方法、主要发现、贡献与政策启示。',
      journalMismatch: '期刊初审常先看摘要完整性，缺项会直接降低送审意愿。',
      recommendation: '按六句模板重写，每句对应一个核心要素并给出可验证信息。',
      exampleRewrite: '在创新驱动发展战略持续推进背景下，本文聚焦高技术制造业企业持续性创新问题。基于XX数据库与XX年样本，采用XX模型识别创新激励对持续性创新的作用机制。研究发现……本文贡献在于……据此提出面向政府、企业与产业平台的政策建议……',
      literatureDirection: '补充近五年科技政策与企业持续性创新研究综述。',
      scoreImpact: 5,
      probabilityImpact: '预计提升初审概率约 4%-8%',
      originalExcerpt: ms.abstract.slice(0, 120) || '（未识别到摘要）',
    })
  }

  if (theoryScore < 10) {
    suggestions.push({
      id: 's-mechanism',
      section: '理论机制',
      type: '理论机制修改建议',
      severity: 'high',
      title: '机制链条不清，需从“X影响Y”升级为“X→机制变量→Y”',
      currentProblem: '当前论证停留在相关关系，缺少“为什么发生、如何发生”的中介机制解释。',
      journalMismatch: '《中国科技论坛》强调机制解释力，而非仅报告变量显著性。',
      recommendation: '补充资源配置、组织协同、风险承担、动态能力等机制通道，并与假设对应。',
      exampleRewrite: '本文提出：创新激励通过优化创新资源配置、强化跨部门协同与提升风险承担意愿，进而促进企业持续性创新。',
      literatureDirection: '补充“动态能力理论”“创新治理”“政策工具激励效应”文献。',
      scoreImpact: 4,
      probabilityImpact: '预计提升初审概率约 3%-6%',
      originalExcerpt: '（建议在理论分析与假设部分补充机制链条）',
    })
  }

  if (designScore < 10) {
    suggestions.push({
      id: 's-design',
      section: '研究设计',
      type: '研究设计修改建议',
      severity: 'high',
      title: '研究设计证据强度不足，需补足识别策略与扩展分析',
      currentProblem: '样本、变量或模型说明不充分，内生性处理与稳健性/异质性分析不完整。',
      journalMismatch: '期刊对方法严谨性要求较高，证据链不足易被认定为“论证不扎实”。',
      recommendation: empirical ? '增加内生性处理（IV/PSM/安慰剂）、稳健性检验、机制检验和异质性分析。' : '补充案例选择标准、编码流程、证据链与理论抽象步骤。',
      exampleRewrite: empirical
        ? '在基准回归之外，本文进一步采用PSM匹配与安慰剂检验处理潜在内生性，并通过异质性分析识别政策情境差异。'
        : '本文采用理论抽样选择案例，基于多源资料三角验证进行编码，并构建“政策触发-组织响应-创新结果”的机制模型。',
      literatureDirection: '补充方法论规范文献与同类CSSCI实证/案例研究。',
      scoreImpact: 6,
      probabilityImpact: '预计提升初审概率约 5%-10%',
      originalExcerpt: '（建议在研究设计与结果分析部分增补）',
    })
  }

  if (langScore < 8) {
    suggestions.push({
      id: 's-language',
      section: '语言表达',
      type: '语言表达修改建议',
      severity: 'medium',
      title: '模板化与口号化表达偏多，需改为证据驱动的学术表达',
      currentProblem: `检测到“${AI_STYLE_PHRASES.find(p => full.includes(p)) || '模板化表达'}”等高频套话。`,
      journalMismatch: '期刊偏好问题导向与证据导向表达，弱化口号式语句。',
      recommendation: '减少泛化判断，增加变量、机制与实证结果的具体描述。',
      exampleRewrite: '随着创新驱动战略推进，企业创新能力不再只是内部竞争优势来源，而是连接产业升级、技术突破与政策目标实现的重要组织基础。',
      literatureDirection: '参考近三年CSSCI科技政策研究论文语言范式。',
      scoreImpact: 2,
      probabilityImpact: '预计提升初审概率约 1%-3%',
      originalExcerpt: '（建议逐段替换口号式句子）',
    })
  }

  if (formatScore < 8) {
    suggestions.push({
      id: 's-format',
      section: '格式排版',
      type: '格式排版修改建议',
      severity: 'medium',
      title: '格式规范不足，影响编辑初审效率',
      currentProblem: '摘要结构、关键词数量、图表编号、参考文献完整性存在缺漏。',
      journalMismatch: '初审阶段格式不规范会被优先判定为“准备不足”。',
      recommendation: '统一标题层级、补齐图表编号与注释、核对参考文献年份卷期页码。',
      exampleRewrite: '表1 高技术制造业样本分布（2015-2024）\n注：样本来源于XX数据库，已剔除ST与缺失值样本。',
      literatureDirection: '参照《中国科技论坛》近两年参考文献与图表格式。',
      scoreImpact: 3,
      probabilityImpact: '预计提升初审概率约 2%-4%',
      originalExcerpt: '（建议全稿执行一次格式规范化检查）',
    })
  }

  const editorialSummary =
    overallScore >= 80
      ? '本文选题与《中国科技论坛》关注方向较为契合，具备一定的政策与创新治理价值。建议进一步强化理论机制与政策语境表达，提升论证深度后投稿。'
      : '本文与《中国科技论坛》存在一定契合基础，但当前在问题意识、理论机制或研究设计方面仍有明显短板。建议先完成结构化修改，再进行投稿。'

  const recommendedStructure = empirical
    ? [
        { sectionTitle: '一、引言', writingFocus: '国家战略背景、现实矛盾、文献缺口、研究问题与贡献' },
        { sectionTitle: '二、文献综述与理论分析', writingFocus: '梳理相关研究并提炼理论缺口' },
        { sectionTitle: '三、理论机制与研究假设', writingFocus: '构建因果链条并提出可检验假设' },
        { sectionTitle: '四、研究设计', writingFocus: '样本、变量、模型设定与识别策略' },
        { sectionTitle: '五、实证结果分析', writingFocus: '基准结果与经济意义解释' },
        { sectionTitle: '六、进一步分析', writingFocus: '机制检验、异质性分析与稳健性检验' },
        { sectionTitle: '七、结论与政策启示', writingFocus: '理论回应、政策建议、局限与未来研究' },
      ]
    : [
        { sectionTitle: '一、引言', writingFocus: '问题背景、研究动机与贡献' },
        { sectionTitle: '二、理论基础与分析框架', writingFocus: '理论视角与机制框架' },
        { sectionTitle: '三、案例选择与资料来源', writingFocus: '案例合理性与数据可信度' },
        { sectionTitle: '四、案例描述', writingFocus: '关键情境与演化过程' },
        { sectionTitle: '五、机制分析', writingFocus: '机制通道与证据链条' },
        { sectionTitle: '六、理论模型构建', writingFocus: '从案例现象抽象理论命题' },
        { sectionTitle: '七、研究结论与政策启示', writingFocus: '理论贡献、实践价值与政策建议' },
      ]

  const suggestedStrategy =
    overallScore >= 75
      ? '建议采用“重点打磨后直接投稿”策略：优先修复高严重度问题，再补强政策语境和机制表达。'
      : '建议采用“先大修再投稿”策略：先完成标题/摘要/引言/机制/研究设计的结构性重写，再进行格式细修。'

  return {
    overallScore,
    recommendationLevel,
    acceptanceProbability,
    editorialSummary,
    dimensionScores,
    majorRisks,
    revisionSuggestions: suggestions,
    recommendedStructure,
    suggestedStrategy,
    journalDisclaimer: '本系统给出的接收概率为基于期刊偏好、格式规范、主题契合度、论文质量和编辑初审标准的模型化估计，不代表期刊官方意见，也不构成录用承诺。',
  }
}
