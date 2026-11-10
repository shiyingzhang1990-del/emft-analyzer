import profileData from '@/data/zgkjlt_profile.json'
import topicsData from '@/data/zgkjlt_topics.json'
import type { JournalProfile, RecentTopic } from '@/types/journal'

export const journalProfile: JournalProfile = profileData as JournalProfile
export const recentTopics: RecentTopic[] = topicsData as RecentTopic[]

export type TopicArticle = RecentTopic
