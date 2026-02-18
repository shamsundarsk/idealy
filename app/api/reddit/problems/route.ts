import { fetchRedditProblems } from '@/lib/reddit'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get('limit') || '50'
    const parsed_limit = Math.min(parseInt(limit), 100)

    const problems = await fetchRedditProblems(parsed_limit)

    return NextResponse.json(
      {
        success: true,
        problems,
        count: problems.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[Idealy] Reddit problems API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Reddit problems',
      },
      { status: 500 },
    )
  }
}
