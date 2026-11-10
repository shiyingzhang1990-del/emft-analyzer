import type { ManuscriptSection, ParsedManuscript } from '@/types/journal'

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  abstract: [/\babstract\b/i],
  keywords: [/\bkeywords?\b/i, /\bkey\s+words?\b/i],
  jel: [/\bjel\b/i, /\bjel\s+classification\b/i],
  introduction: [/\b1\.?\s*introduction\b/i, /^introduction$/im],
  literature: [/\bliterature\s+review\b/i, /\brelated\s+literature\b/i, /\btheoretical\s+background\b/i],
  hypotheses: [/\bhypothes[ie]s\b/i, /\btheoretical\s+framework\b/i],
  researchDesign: [/\bresearch\s+design\b/i, /\bmethodology\b/i, /\bdata\s+and\s+method\b/i],
  sampleSelection: [/\bsample\s+selection\b/i, /\bdata\s+source\b/i, /\bsample\s+and\s+data\b/i],
  variableDefinitions: [/\bvariable\s+def/i, /\bvariable\s+selection\b/i, /\bmeasurement\b/i],
  baselineRegression: [/\bbaseline\s+reg/i, /\bbenchmark\s+reg/i, /\bmain\s+result/i, /\bempirical\s+result/i],
  mechanismTests: [/\bmechanism\s+test/i, /\bchannel\s+test/i, /\bmechanism\s+anal/i],
  robustnessTests: [/\brobustness\b/i, /\bsensitivity\s+anal/i],
  endogeneityTests: [/\bendogeneit/i, /\binstrumental\s+var/i, /\bpsm\b/i, /\bpropensity\s+score\b/i],
  heterogeneityAnalysis: [/\bheterogene/i, /\bsubgroup\b/i, /\bcross-sectional\s+var/i],
  policyImplications: [/\bpolicy\s+impl/i, /\bpractical\s+impl/i],
  conclusion: [/\bconclusion\b/i, /\bconcluding\s+remark/i],
  references: [/\breferences?\b/i, /\bbibliograph/i],
}

export function parseManuscriptText(text: string): ParsedManuscript {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const fullText = text

  // Extract title (first non-empty line or line before abstract)
  let title = ''
  for (const line of lines.slice(0, 10)) {
    if (line.length > 20 && line.length < 200 && !/abstract|keyword/i.test(line)) {
      title = line
      break
    }
  }

  // Extract abstract
  let abstract = ''
  const absIdx = lines.findIndex(l => /^abstract$/i.test(l))
  if (absIdx >= 0) {
    const absLines: string[] = []
    for (let i = absIdx + 1; i < Math.min(absIdx + 20, lines.length); i++) {
      if (/^keywords?|^jel|^1\.|^introduction/i.test(lines[i])) break
      absLines.push(lines[i])
    }
    abstract = absLines.join(' ')
  }

  // Extract keywords
  let keywords: string[] = []
  const kwIdx = lines.findIndex(l => /^keywords?:/i.test(l))
  if (kwIdx >= 0) {
    const kwLine = lines[kwIdx].replace(/^keywords?:\s*/i, '')
    keywords = kwLine.split(/[;,]/).map(k => k.trim()).filter(Boolean)
  }


  // Detect sections
  const sections: ManuscriptSection[] = []
  for (const [sectionName, patterns] of Object.entries(SECTION_PATTERNS)) {
    const present = patterns.some(p => p.test(fullText))
    let content = ''
    if (present) {
      const matchIdx = lines.findIndex(l => patterns.some(p => p.test(l)))
      if (matchIdx >= 0) {
        content = lines.slice(matchIdx, matchIdx + 5).join(' ')
      }
    }
    sections.push({ name: sectionName, present, content })
  }

  // Count words
  const wordCount = fullText.split(/\s+/).filter(Boolean).length

  // Count tables
  const tableMatches = fullText.match(/\bTable\s+\d+/gi) || []
  const tableCount = new Set(tableMatches.map(t => t.toLowerCase())).size

  // Count references
  const refSection = fullText.match(/references?\s*\n([\s\S]*?)$/i)
  const referenceCount = refSection
    ? (refSection[1].match(/^\s*[A-Z][a-z]+,?\s+[A-Z]/gm) || []).length
    : 0

  // Extract references lines
  const references: string[] = []
  if (refSection?.[1]) {
    refSection[1].split('\n').map(l => l.trim()).filter(Boolean).slice(0, 200).forEach(r => references.push(r))
  }

  return {
    title,
    abstract,
    keywords,
    sections,
    references,
    fullText,
    wordCount,
    tableCount,
    referenceCount,
  }
}
