import { NextRequest, NextResponse } from 'next/server'
import { scrapeHackerNews } from '@/lib/scrapers/hackernews'
import { scrapeGitHubIssues } from '@/lib/scrapers/github'
import { scrapeProductHunt } from '@/lib/scrapers/producthunt'
import { scrapeIndieHackers } from '@/lib/scrapers/indiehackers'
import { analyzeBatch } from '@/lib/ai-analyzer'
import { saveProblem, createScrapingJob, updateScrapingJob } from '@/lib/db-problems'

/**
 * POST /api/problems/scrape
 * Trigger scraping from various sources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source = 'hackernews', limit = 20 } = body

    // Create scraping job
    const job = await createScrapingJob(source)

    try {
      await updateScrapingJob(job.id, { status: 'running' })

      let rawProblems: any[] = []

      // Scrape based on source
      switch (source) {
        case 'hackernews':
          rawProblems = await scrapeHackerNews(limit)
          break
        case 'github':
          rawProblems = await scrapeGitHubIssues(limit)
          break
        case 'producthunt':
          rawProblems = await scrapeProductHunt(limit)
          break
        case 'indiehackers':
          rawProblems = await scrapeIndieHackers(limit)
          break
        case 'all':
          // Scrape from all sources
          const [hn, gh, ph, ih] = await Promise.all([
            scrapeHackerNews(Math.ceil(limit / 4)),
            scrapeGitHubIssues(Math.ceil(limit / 4)),
            scrapeProductHunt(Math.ceil(limit / 4)),
            scrapeIndieHackers(Math.ceil(limit / 4)),
          ])
          rawProblems = [...hn, ...gh, ...ph, ...ih]
          break
        default:
          throw new Error(`Unknown source: ${source}`)
      }

      await updateScrapingJob(job.id, { items_found: rawProblems.length })

      // Analyze problems with AI
      const analyzed = await analyzeBatch(rawProblems)
      await updateScrapingJob(job.id, { items_analyzed: analyzed.length })

      // Save to database
      let savedCount = 0
      for (const problem of analyzed) {
        try {
          await saveProblem(problem)
          savedCount++
        } catch (error) {
          console.error('[Idealy] Failed to save problem:', error)
        }
      }

      await updateScrapingJob(job.id, {
        status: 'completed',
        completed_at: new Date(),
      })

      return NextResponse.json({
        success: true,
        job_id: job.id,
        source,
        items_found: rawProblems.length,
        items_analyzed: analyzed.length,
        items_saved: savedCount,
        message: `Successfully scraped and analyzed ${savedCount} problems from ${source}`,
      })
    } catch (error: any) {
      await updateScrapingJob(job.id, {
        status: 'failed',
        error: error.message,
        completed_at: new Date(),
      })
      throw error
    }
  } catch (error: any) {
    console.error('[Idealy] Scraping API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to scrape problems',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/problems/scrape
 * Get scraping job status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')

    if (jobId) {
      // Get specific job status
      const { prisma } = await import('@/lib/db-problems')
      const job = await prisma.scrapingJob.findUnique({
        where: { id: jobId },
      })

      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        job,
      })
    }

    // Get recent jobs
    const { getRecentScrapingJobs } = await import('@/lib/db-problems')
    const jobs = await getRecentScrapingJobs(10)

    return NextResponse.json({
      success: true,
      jobs,
    })
  } catch (error: any) {
    console.error('[Idealy] Scraping status API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get scraping status',
      },
      { status: 500 }
    )
  }
}
