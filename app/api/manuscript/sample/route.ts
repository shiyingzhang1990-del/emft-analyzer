import { NextResponse } from 'next/server'
import { parseManuscriptText } from '@/lib/manuscriptParser'
import { scoreZGKJLT } from '@/lib/scoringEngine'

const sampleText = `股权激励、动态能力与企业持续性创新：基于高技术制造业企业的案例研究

摘要
在创新驱动发展战略与新质生产力培育背景下，本文关注高技术制造业企业持续性创新问题。基于2016-2024年多源资料与案例证据，构建“创新激励—动态能力—持续性创新”机制框架。研究发现，股权激励通过优化创新资源配置、强化组织协同与风险承担，显著提升企业持续性创新能力。进一步分析表明，该作用在研发强度高、政策支持强的企业中更明显。本文从创新治理视角解释了激励契约与持续创新关系，并提出面向政府、企业和产业平台的政策建议。

关键词：股权激励；动态能力；持续性创新；高技术制造业；创新治理；新质生产力

一、引言
创新驱动发展战略持续推进，企业创新能力成为产业升级关键。现有研究多从公司治理讨论股权激励，较少纳入科技政策与创新治理语境。

二、文献综述与理论分析
已有研究关注激励与绩效关系，但对持续性创新机制解释不足。

三、理论机制与研究假设
股权激励通过资源配置、组织协同和风险承担影响持续性创新。

四、研究设计
说明样本来源、变量定义与识别策略。

五、结果分析
结果显示核心假设成立。

六、进一步分析
开展稳健性、机制与异质性分析。

七、结论与政策启示
面向政府部门：优化科技创新政策工具组合；面向企业：完善创新激励治理；面向产业平台：强化协同创新生态。

参考文献
王某某, 李某某. 2024. 科技政策与企业创新.
张某某. 2023. 创新治理机制研究.
刘某某. 2022. 动态能力与持续创新.
中国科技论坛编辑部. 2021. 科技创新政策研究范式.
Smith, J. 2020. Innovation Policy and Firm Dynamics.
`

export async function GET() {
  const parsed = parseManuscriptText(sampleText)
  const report = scoreZGKJLT(parsed)
  return NextResponse.json({
    id: 'sample-paper-001',
    title: '股权激励、动态能力与企业持续性创新：基于高技术制造业企业的案例研究',
    uploadedAt: new Date().toISOString(),
    parsed,
    report,
  })
}
