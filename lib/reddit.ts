// Reddit API integration for discovering problems
// This service fetches real problems from Reddit subreddits

export interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  subreddit: string
  upvotes: number
  num_comments: number
  created_utc: number
  url: string
}

export interface ProblemFromReddit {
  id: string
  title: string
  description: string
  category: string
  votes: number
  platform: 'reddit'
  tags: string[]
  source_url: string
}

const RELEVANT_SUBREDDITS = [
  'r/startups',
  'r/webdev',
  'r/entrepreneurs',
  'r/SaaS',
  'r/productmanagement',
  'r/100DaysOfCode',
  'r/learnprogramming',
  'r/nocode',
  'r/Freelance',
  'r/smallbusiness',
]

const PROBLEM_KEYWORDS = [
  'need',
  'looking for',
  'struggling with',
  'problem with',
  'issue with',
  'frustrated',
  'wish there was',
  'would be great if',
  'dont have time',
  'too expensive',
  'no good tool',
  'manual process',
  'time consuming',
]

/**
 * Fetch recent posts from Reddit
 * Note: Reddit requires authentication. You'll need to set up:
 * - REDDIT_CLIENT_ID
 * - REDDIT_CLIENT_SECRET
 * - REDDIT_USERNAME
 * - REDDIT_PASSWORD
 */
export async function fetchRedditProblems(
  limit: number = 50,
): Promise<ProblemFromReddit[]> {
  try {
    // In production, you would:
    // 1. Authenticate with Reddit API
    // 2. Fetch posts from relevant subreddits
    // 3. Filter for problem-related posts
    // 4. Transform into our Problem format

    const accessToken = await getRedditAccessToken()
    if (!accessToken) {
      console.log('[Idealy] Reddit authentication not configured, using mock data')
      return getMockRedditProblems()
    }

    const problems: ProblemFromReddit[] = []

    for (const subreddit of RELEVANT_SUBREDDITS.slice(0, 3)) {
      const posts = await fetchSubredditPosts(subreddit, accessToken, 15)
      const filtered = filterProblemPosts(posts)
      problems.push(...filtered)
    }

    return problems.sort((a, b) => b.votes - a.votes).slice(0, limit)
  } catch (error) {
    console.error('[Idealy] Reddit fetch error:', error)
    return getMockRedditProblems()
  }
}

async function getRedditAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const username = process.env.REDDIT_USERNAME
  const password = process.env.REDDIT_PASSWORD

  if (!clientId || !clientSecret || !username || !password) {
    return null
  }

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Idealy:v1.0',
      },
      body: `grant_type=password&username=${username}&password=${password}`,
    })

    if (!response.ok) {
      console.error('[Idealy] Reddit authentication failed')
      return null
    }

    const data = (await response.json()) as { access_token: string }
    return data.access_token
  } catch (error) {
    console.error('[Idealy] Reddit token error:', error)
    return null
  }
}

async function fetchSubredditPosts(
  subreddit: string,
  accessToken: string,
  limit: number,
): Promise<RedditPost[]> {
  try {
    const response = await fetch(
      `https://oauth.reddit.com/${subreddit}/new?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'Idealy:v1.0',
        },
      },
    )

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as any
    return (
      data.data?.children?.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext,
        author: child.data.author,
        subreddit: child.data.subreddit,
        upvotes: child.data.ups,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        url: `https://reddit.com${child.data.permalink}`,
      })) || []
    )
  } catch (error) {
    console.error('[Idealy] Subreddit fetch error:', error)
    return []
  }
}

function filterProblemPosts(posts: RedditPost[]): ProblemFromReddit[] {
  return posts
    .filter((post) => {
      const text = `${post.title} ${post.selftext}`.toLowerCase()
      return PROBLEM_KEYWORDS.some((keyword) => text.includes(keyword))
    })
    .map((post) => ({
      id: post.id,
      title: post.title,
      description:
        post.selftext.substring(0, 200) ||
        'See full post on Reddit for details',
      category: categorizeProblem(post.title + ' ' + post.selftext),
      votes: post.upvotes,
      platform: 'reddit',
      tags: extractTags(post.title),
      source_url: post.url,
    }))
}

function categorizeProblem(text: string): string {
  const categories: Record<string, string[]> = {
    Productivity: [
      'time',
      'productivity',
      'workflow',
      'automation',
      'management',
      'organize',
    ],
    Hiring: ['freelancer', 'hire', 'talent', 'recruitment', 'contractor'],
    'Project Management': [
      'project',
      'deadline',
      'tracking',
      'task',
      'team',
      'collaboration',
    ],
    'Customer Service': [
      'customer',
      'support',
      'service',
      'feedback',
      'communication',
    ],
    'Data Management': ['data', 'database', 'spreadsheet', 'analytics', 'report'],
    'Social Media': [
      'social',
      'instagram',
      'facebook',
      'twitter',
      'content',
      'marketing',
    ],
    Finance: ['payment', 'invoice', 'accounting', 'expense', 'billing'],
    'Learning & Development': [
      'learning',
      'training',
      'education',
      'skill',
      'course',
    ],
  }

  const textLower = text.toLowerCase()
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => textLower.includes(keyword))) {
      return category
    }
  }

  return 'General'
}

function extractTags(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/)
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'is',
    'are',
    'to',
    'for',
    'of',
    'with',
  ])

  return words
    .filter((word) => word.length > 4 && !stopWords.has(word))
    .slice(0, 3)
    .map((word) => word.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
}

function getMockRedditProblems(): ProblemFromReddit[] {
  return [
    {
      id: 'reddit_1',
      title: 'I spend 2 hours every week managing customer feedback across email and Slack',
      description:
        'Customer feedback comes from multiple channels and there is no centralized way to track it.',
      category: 'Productivity',
      votes: 245,
      platform: 'reddit' as 'reddit',
      tags: ['Feedback', 'Management', 'SaaS'],
      source_url: 'https://reddit.com/r/startups',
    },
    {
      id: 'reddit_2',
      title: 'Finding reliable freelancers is incredibly difficult',
      description:
        'Most platforms have quality issues or are too expensive for small projects.',
      category: 'Hiring',
      votes: 198,
      platform: 'reddit' as 'reddit',
      tags: ['Freelance', 'Hiring', 'Marketplace'],
      source_url: 'https://reddit.com/r/entrepreneurs',
    },
    {
      id: 'reddit_3',
      title: 'Our team spends too much time tracking deadlines across multiple tools',
      description:
        'We use Jira, Asana, and Monday. There is no unified view of all deadlines.',
      category: 'Project Management',
      votes: 167,
      platform: 'reddit' as 'reddit',
      tags: ['ProjectMgmt', 'Tools', 'Integration'],
      source_url: 'https://reddit.com/r/webdev',
    },
    {
      id: 'reddit_4',
      title: 'Small restaurants struggle with affordable inventory management',
      description:
        'Current POS systems are too expensive. Need simple inventory tracking for small businesses.',
      category: 'Restaurant Tech',
      votes: 134,
      platform: 'reddit' as 'reddit',
      tags: ['SMB', 'Inventory', 'POS'],
      source_url: 'https://reddit.com/r/smallbusiness',
    },
    {
      id: 'reddit_5',
      title: 'Managing multiple social media accounts is a nightmare',
      description:
        'Existing tools are either too expensive or too complex. Need simple multi-account management.',
      category: 'Social Media',
      votes: 112,
      platform: 'reddit' as 'reddit',
      tags: ['Social', 'Content', 'Marketing'],
      source_url: 'https://reddit.com/r/SaaS',
    },
  ]
}
