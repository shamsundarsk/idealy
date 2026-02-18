// Make Prisma optional - only use if database is configured
let prisma: any = null

try {
  const { PrismaClient } = require('@prisma/client')
  prisma = new PrismaClient()
} catch (error) {
  console.log('[Idealy] Database not configured, using mock data')
}

const isDatabaseAvailable = () => prisma !== null

/**
 * Save analyzed problem to database
 */
export async function saveProblem(problem: any) {
  if (!isDatabaseAvailable()) {
    console.log('[Idealy] Database not available, skipping save')
    return null
  }
  
  try {
    const saved = await prisma.problem.create({
      data: {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        affected_users: problem.affected_users,
        category: problem.category,
        severity: problem.severity,
        status: problem.status,
        confidence_score: problem.confidence_score,
        existing_solutions: problem.existing_solutions,
        gap_analysis: problem.gap_analysis,
        opportunity_score: problem.opportunity_score,
        build_potential_score: problem.build_potential_score,
        severity_score: problem.severity_score,
        build_recommendation: problem.build_recommendation,
        source: problem.source,
        source_url: problem.source_url,
        created_at: new Date(problem.created_at),
      },
    })
    return saved
  } catch (error) {
    console.error('[Idealy] Failed to save problem:', error)
    throw error
  }
}

/**
 * Get problems with filtering and sorting
 */
export async function getProblems(options: {
  status?: any
  category?: string
  source?: string
  limit?: number
  offset?: number
  sortBy?: 'opportunity_score' | 'severity_score' | 'build_potential_score' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}) {
  if (!isDatabaseAvailable()) {
    return {
      problems: [],
      total: 0,
      limit: options.limit || 50,
      offset: options.offset || 0,
    }
  }

  const {
    status,
    category,
    source,
    limit = 50,
    offset = 0,
    sortBy = 'opportunity_score',
    sortOrder = 'desc',
  } = options

  const where: any = {}
  if (status) where.status = status
  if (category) where.category = category
  if (source) where.source = source

  const problems = await prisma.problem.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    skip: offset,
  })

  const total = await prisma.problem.count({ where })

  return {
    problems,
    total,
    limit,
    offset,
  }
}

/**
 * Get problem by ID
 */
export async function getProblemById(id: string) {
  if (!isDatabaseAvailable()) return null
  return await prisma.problem.findUnique({
    where: { id },
  })
}

/**
 * Check if problem already exists (by title similarity)
 */
export async function problemExists(title: string): Promise<boolean> {
  if (!isDatabaseAvailable()) return false
  const existing = await prisma.problem.findFirst({
    where: {
      title: {
        contains: title,
        mode: 'insensitive',
      },
    },
  })
  return !!existing
}

/**
 * Get problem statistics
 */
export async function getProblemStats() {
  if (!isDatabaseAvailable()) {
    return {
      total: 0,
      unsolved: 0,
      partiallySolved: 0,
      solved: 0,
      byCategory: [],
      bySource: [],
    }
  }

  const total = await prisma.problem.count()
  const unsolved = await prisma.problem.count({ where: { status: 'UNSOLVED' } })
  const partiallySolved = await prisma.problem.count({
    where: { status: 'PARTIALLY_SOLVED' },
  })
  const solved = await prisma.problem.count({ where: { status: 'SOLVED' } })

  const byCategory = await prisma.problem.groupBy({
    by: ['category'],
    _count: true,
  })

  const bySource = await prisma.problem.groupBy({
    by: ['source'],
    _count: true,
  })

  return {
    total,
    unsolved,
    partiallySolved,
    solved,
    byCategory,
    bySource,
  }
}

/**
 * Create scraping job
 */
export async function createScrapingJob(source: string) {
  if (!isDatabaseAvailable()) {
    return { id: `mock-${Date.now()}`, source, status: 'pending' }
  }
  return await prisma.scrapingJob.create({
    data: {
      source,
      status: 'pending',
    },
  })
}

/**
 * Update scraping job
 */
export async function updateScrapingJob(
  id: string,
  data: {
    status?: string
    items_found?: number
    items_analyzed?: number
    completed_at?: Date
    error?: string
  }
) {
  if (!isDatabaseAvailable()) return null
  return await prisma.scrapingJob.update({
    where: { id },
    data,
  })
}

/**
 * Get recent scraping jobs
 */
export async function getRecentScrapingJobs(limit = 10) {
  if (!isDatabaseAvailable()) return []
  return await prisma.scrapingJob.findMany({
    orderBy: { started_at: 'desc' },
    take: limit,
  })
}

export { prisma, isDatabaseAvailable }
