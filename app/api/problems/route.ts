import { NextRequest, NextResponse } from 'next/server'
import { getProblems, getProblemStats } from '@/lib/db-problems'
import { ProblemStatus } from '@/lib/problem-schemas'

/**
 * GET /api/problems
 * List problems with filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const status = searchParams.get('status') as ProblemStatus | null
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') as any || 'opportunity_score'
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    const stats = searchParams.get('stats') === 'true'

    // Get problems
    const result = await getProblems({
      status: status || undefined,
      category: category || undefined,
      source: source || undefined,
      limit,
      offset,
      sortBy,
      sortOrder,
    })

    // Get stats if requested
    let statistics = null
    if (stats) {
      statistics = await getProblemStats()
    }

    return NextResponse.json({
      success: true,
      problems: result.problems,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      stats: statistics,
    })
  } catch (error: any) {
    console.error('[Idealy] Problem fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch problems',
      },
      { status: 500 }
    )
  }
}
