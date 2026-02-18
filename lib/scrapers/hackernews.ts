import { RawProblemInput } from '../problem-schemas'

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0'

interface HNItem {
  id: number
  type: string
  by: string
  time: number
  text?: string
  title?: string
  url?: string
  score?: number
  descendants?: number
}

/**
 * Fetch top stories from Hacker News
 */
export async function fetchHNTopStories(limit = 30): Promise<number[]> {
  try {
    const response = await fetch(`${HN_API_BASE}/topstories.json`)
    const data = await response.json()
    return data.slice(0, limit)
  } catch (error) {
    console.error('[Idealy] Failed to fetch HN top stories:', error)
    return []
  }
}

/**
 * Fetch Ask HN stories (more likely to contain problems)
 * Focus on posts where people ask for solutions
 */
export async function fetchHNAskStories(limit = 100): Promise<number[]> {
  try {
    const response = await fetch(`${HN_API_BASE}/askstories.json`)
    const data = await response.json()
    return data.slice(0, limit)
  } catch (error) {
    console.error('[Idealy] Failed to fetch HN ask stories:', error)
    return []
  }
}

/**
 * Fetch item details by ID
 */
export async function fetchHNItem(id: number): Promise<HNItem | null> {
  try {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`[Idealy] Failed to fetch HN item ${id}:`, error)
    return null
  }
}

/**
 * Check if HN item contains a USER PROBLEM (not technical bugs)
 * VERY STRICT filtering - reject 90% of content
 */
function isProblemRelated(item: HNItem): boolean {
  const title = item.title?.toLowerCase() || ''
  const text = item.text?.toLowerCase() || ''
  const content = title + ' ' + text

  // IMMEDIATELY REJECT technical content
  const technicalRejectKeywords = [
    'error',
    'exception',
    'bug',
    'crash',
    'compile',
    'syntax',
    'typescript',
    'javascript',
    'webpack',
    'node_modules',
    'stack trace',
    'npm',
    'yarn',
    'package',
    '404',
    '500',
    'undefined',
    'null',
    'memory leak',
    'performance issue',
    'api error',
    'cors',
    'authentication failed',
    'database error',
    'connection timeout',
    'build failed',
    'test failed',
    'deployment',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'server',
    'backend',
    'frontend',
    'react',
    'vue',
    'angular',
    'next.js',
    'how to',
    'how do i',
    'help with',
    'debug',
    'fix',
  ]
  
  if (technicalRejectKeywords.some((keyword) => content.includes(keyword))) {
    return false
  }

  // ONLY ACCEPT if it has STRONG user problem indicators
  const strongUserProblemKeywords = [
    'ask hn: looking for',
    'ask hn: need',
    'ask hn: struggling',
    'ask hn: frustrated',
    'ask hn: wish there was',
    'ask hn: is there a tool',
    'ask hn: is there an app',
    'ask hn: what do you use for',
    'ask hn: how do you manage',
    'ask hn: how do you handle',
    'i spend hours',
    'i waste time',
    'i struggle with',
    'i need a tool',
    'i need an app',
    'i wish there was',
    'looking for a tool',
    'looking for an app',
    'looking for a solution',
    'is there a better way',
    'is there an alternative',
    'tired of',
    'frustrated with',
    'pain point',
    'time consuming',
    'manual process',
    'no good tool',
    'too expensive',
    'cant afford',
  ]

  // Must have at least one strong indicator
  const hasStrongIndicator = strongUserProblemKeywords.some((keyword) => content.includes(keyword))
  
  if (!hasStrongIndicator) {
    return false
  }

  // Additional validation: must be asking about a problem, not a solution
  const solutionKeywords = [
    'i built',
    'i created',
    'i made',
    'show hn',
    'launch',
    'released',
    'announcing',
  ]
  
  if (solutionKeywords.some((keyword) => content.includes(keyword))) {
    return false
  }

  return true
}

/**
 * Convert HN item to RawProblemInput
 */
function hnItemToRawProblem(item: HNItem): RawProblemInput {
  const content = item.text
    ? `${item.title}\n\n${item.text}`
    : item.title || 'No content'

  return {
    source: 'hackernews',
    content: content,
    url: `https://news.ycombinator.com/item?id=${item.id}`,
    timestamp: new Date(item.time * 1000).toISOString(),
  }
}

/**
 * Scrape Hacker News for problems
 * VERY STRICT filtering - only accept clear business opportunities
 */
export async function scrapeHackerNews(
  limit = 100
): Promise<RawProblemInput[]> {
  console.log('[Idealy] Starting Hacker News scraping (strict filtering)...')

  try {
    // Fetch Ask HN stories (more likely to have problems)
    const storyIds = await fetchHNAskStories(limit)
    console.log(`[Idealy] Found ${storyIds.length} Ask HN stories`)

    const rawProblems: RawProblemInput[] = []

    // Fetch each story
    for (const id of storyIds) {
      const item = await fetchHNItem(id)

      if (!item) continue

      // STRICT filter for problem-related content
      if (isProblemRelated(item)) {
        rawProblems.push(hnItemToRawProblem(item))
        console.log(`[Idealy] ✅ Found potential problem: ${item.title?.substring(0, 60)}...`)
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
      
      // Stop if we have enough
      if (rawProblems.length >= 20) {
        console.log(`[Idealy] Reached 20 potential problems, stopping early`)
        break
      }
    }

    console.log(
      `[Idealy] Found ${rawProblems.length} high-quality problem posts from HN`
    )
    return rawProblems
  } catch (error) {
    console.error('[Idealy] HN scraping failed:', error)
    return []
  }
}

/**
 * Scrape specific HN thread by ID
 */
export async function scrapeHNThread(
  threadId: number
): Promise<RawProblemInput | null> {
  const item = await fetchHNItem(threadId)
  if (!item) return null

  return hnItemToRawProblem(item)
}
