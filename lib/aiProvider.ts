export type AIProviderName = 'claude' | 'openai' | 'local'

export interface DeepAnalysisInput {
  text: string
}

export interface DeepAnalysisProvider {
  name: AIProviderName
  analyze(input: DeepAnalysisInput): Promise<any>
}

class RuleOnlyProvider implements DeepAnalysisProvider {
  name: AIProviderName = 'local'
  async analyze() {
    return null
  }
}

class ClaudeProvider implements DeepAnalysisProvider {
  name: AIProviderName = 'claude'
  async analyze(input: DeepAnalysisInput) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return null

    const prompt = `你是一名熟悉《中国科技论坛》、CSSCI期刊审稿标准、科技政策研究和创新管理研究的学术编辑。请从编辑初审视角分析用户论文。你不能承诺录用，只能基于主题契合度、问题意识、理论贡献、研究设计、论证逻辑、语言表达、格式规范和期刊风格匹配度给出评分、风险判断和修改建议。请输出结构化 JSON，不要输出无法解析的自然语言。\n\n论文文本：\n${input.text.slice(0, 120000)}`

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 3500,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!resp.ok) return null
    const data = await resp.json()
    const text = data?.content?.[0]?.text || ''
    try { return JSON.parse(text) } catch { return null }
  }
}

export function getProvider(name?: string): DeepAnalysisProvider {
  if (name === 'claude') return new ClaudeProvider()
  return new RuleOnlyProvider()
}
