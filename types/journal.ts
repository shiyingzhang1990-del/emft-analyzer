export interface ScoringRule {
  dimension: string
  maxScore: number
  description: string
}

export interface JournalProfile {
  name: string
  scope: string[]
  preferredTopics: string[]
  unsuitableTopics: string[]
  styleKeywords: string[]
  formatRules: string[]
  scoringRules: ScoringRule[]
}

export interface ScoreDimension {
  name: string
  score: number
  maxScore: number
  reason: string
  improvement: string
}

export interface RevisionSuggestion {
  id: string
  section: string
  type: string
  severity: 'high' | 'medium' | 'low'
  title: string
  currentProblem: string
  journalMismatch: string
  recommendation: string
  exampleRewrite: string
  literatureDirection: string
  scoreImpact: number
  probabilityImpact: string
  originalExcerpt?: string
}

export interface ManuscriptSection {
  name: string
  present: boolean
  content: string
}

export interface ParsedManuscript {
  title: string
  abstract: string
  keywords: string[]
  sections: ManuscriptSection[]
  references: string[]
  fullText: string
  wordCount: number
  tableCount: number
  referenceCount: number
}

export interface AcceptanceProbability {
  min: number
  max: number
  explanation: string
}

export interface PaperAnalysis {
  id: string
  title: string
  abstract: string
  keywords: string[]
  sections: ManuscriptSection[]
  references: string[]
  uploadedAt: string
  journalScore: number
  acceptanceProbability: AcceptanceProbability
  suggestions: RevisionSuggestion[]
}

export interface RecentTopic {
  title: string
  keywords: string[]
  abstract: string
  year: number
  issue: string
  topicCluster: string
  relevanceScore: number
}

export interface AnalysisReport {
  overallScore: number
  recommendationLevel: string
  acceptanceProbability: AcceptanceProbability
  editorialSummary: string
  dimensionScores: ScoreDimension[]
  majorRisks: string[]
  revisionSuggestions: RevisionSuggestion[]
  recommendedStructure: Array<{ sectionTitle: string; writingFocus: string }>
  suggestedStrategy: string
  journalDisclaimer: string
}
