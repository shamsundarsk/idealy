import { NextRequest, NextResponse } from 'next/server'
import { analyzeProblem, analyzeUserSubmission } from '@/lib/ai-analyzer'
import { saveProblem } from '@/lib/db-problems'
import { RawProblemInputSchema } from '@/lib/problem-schemas'

/**
 * POST /api/problems/analyze
 * Analyze a single problem from any source
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if it's a user submission (simple string) or structured input
    if (typeof body.content === 'string' && !body.source) {
      // User submission - quick analysis
      const analysis = await analyzeUserSubmission(body.content)

      return NextResponse.json({
        success: true,
        analysis,
        message: 'Problem analyzed successfully',
      })
    }

    // Structured input - full analysis pipeline
    const input = RawProblemInputSchema.parse(body)
    const analyzed = await analyzeProblem(input)

    if (!analyzed) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid problem found in content',
        },
        { status: 400 }
      )
    }

    // Save to database if requested
    if (body.save !== false) {
      await saveProblem(analyzed)
    }

    return NextResponse.json({
      success: true,
      problem: analyzed,
      message: 'Problem analyzed and saved successfully',
    })
  } catch (error: any) {
    console.error('[Idealy] Problem analysis API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze problem',
      },
      { status: 500 }
    )
  }
}
