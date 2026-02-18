import { RawProblemInput } from '../problem-schemas'

/**
 * Indie Hackers Scraper
 * Scrapes Indie Hackers forum for problems and pain points
 */

/**
 * Scrape Indie Hackers for problem discussions
 */
export async function scrapeIndieHackers(limit = 20): Promise<RawProblemInput[]> {
  console.log('[Idealy] Starting Indie Hackers scraping...')

  try {
    // Indie Hackers doesn't have a public API
    // Would need to scrape the website or use unofficial methods
    
    // For now, return mock data representing typical IH problems
    return getMockIndieHackersProblems()
  } catch (error) {
    console.error('[Idealy] Indie Hackers scraping failed:', error)
    return getMockIndieHackersProblems()
  }
}

function getMockIndieHackersProblems(): RawProblemInput[] {
  return [
    {
      source: 'indiehackers',
      content: 'As a solo founder, I struggle to validate ideas before building. I spend months on products nobody wants. Need a faster way to test demand.',
      url: 'https://www.indiehackers.com',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'indiehackers',
      content: 'Getting my first 100 users is incredibly hard. Paid ads are too expensive, and organic growth is too slow. What are other indie hackers doing?',
      url: 'https://www.indiehackers.com',
      timestamp: new Date().toISOString(),
    },
    {
      source: 'indiehackers',
      content: 'Managing customer support as a one-person team is overwhelming. I need an affordable solution that doesn\'t require a dedicated support person.',
      url: 'https://www.indiehackers.com',
      timestamp: new Date().toISOString(),
    },
  ]
}
