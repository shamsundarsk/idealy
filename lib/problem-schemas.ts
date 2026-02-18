import { z } from 'zod'

// Input source types
export const SourceType = z.enum([
  'hackernews',
  'github',
  'producthunt',
  'indiehackers',
  'user',
])

// Problem status
export const ProblemStatus = z.enum(['SOLVED', 'PARTIALLY_SOLVED', 'UNSOLVED'])

// Build recommendation
export const BuildRecommendation = z.enum([
  'BUILD',
  'IMPROVE_EXISTING',
  'DO_NOT_BUILD',
])

// Severity levels
export const SeverityLevel = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])

// Category types
export const CategoryType = z.enum([
  'Productivity',
  'Developer Tools',
  'Business',
  'Communication',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Education',
  'Healthcare',
  'E-commerce',
  'Social',
  'Entertainment',
  'Other',
])

// Input schema for raw content
export const RawProblemInputSchema = z.object({
  source: SourceType,
  content: z.string(),
  url: z.string().url().optional(),
  timestamp: z.string().datetime().optional(),
})

// Existing solution schema
export const ExistingSolutionSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  limitations: z.string().optional(),
})

// Extracted problem schema (Step 1)
export const ExtractedProblemSchema = z.object({
  has_problem: z.boolean(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  affected_users: z.string().nullable().optional(),
  category: CategoryType.nullable().optional(),
  severity: SeverityLevel.nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
})

// Structured problem schema (Step 2)
export const StructuredProblemSchema = z.object({
  title: z.string(),
  description: z.string(),
  affected_users: z.string(),
  category: CategoryType,
  severity: SeverityLevel,
  source: SourceType,
  source_url: z.string().url().optional(),
  created_at: z.string().datetime(),
})

// Solution analysis schema (Step 3)
export const SolutionAnalysisSchema = z.object({
  status: ProblemStatus,
  confidence_score: z.number().min(0).max(100),
  existing_solutions: z.array(ExistingSolutionSchema),
  gap_analysis: z.string(),
  opportunity_score: z.number().min(0).max(100),
  build_recommendation: BuildRecommendation,
  reasoning: z.string(),
})

// Ranking scores schema (Step 4)
export const RankingScoresSchema = z.object({
  severity_score: z.number().min(0).max(100),
  opportunity_score: z.number().min(0).max(100),
  build_potential_score: z.number().min(0).max(100),
  market_size_score: z.number().min(0).max(100),
  competition_score: z.number().min(0).max(100),
})

// Final analyzed problem schema
export const AnalyzedProblemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string(),
  description: z.string(),
  affected_users: z.string(),
  category: CategoryType,
  severity: SeverityLevel,
  status: ProblemStatus,
  confidence_score: z.number().min(0).max(100),
  existing_solutions: z.array(ExistingSolutionSchema),
  gap_analysis: z.string(),
  opportunity_score: z.number().min(0).max(100),
  build_potential_score: z.number().min(0).max(100),
  severity_score: z.number().min(0).max(100),
  build_recommendation: BuildRecommendation,
  source: SourceType,
  source_url: z.string().url().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
})

// User submission analysis response
export const UserSubmissionAnalysisSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: ProblemStatus,
  confidence_score: z.number().min(0).max(100),
  existing_solutions: z.array(ExistingSolutionSchema),
  gap_analysis: z.string(),
  opportunity_score: z.number().min(0).max(100),
  recommendation: BuildRecommendation,
  reasoning: z.string(),
  suggested_category: CategoryType,
  estimated_market_size: z.string(),
})

// Types
export type SourceType = z.infer<typeof SourceType>
export type ProblemStatus = z.infer<typeof ProblemStatus>
export type BuildRecommendation = z.infer<typeof BuildRecommendation>
export type SeverityLevel = z.infer<typeof SeverityLevel>
export type CategoryType = z.infer<typeof CategoryType>
export type RawProblemInput = z.infer<typeof RawProblemInputSchema>
export type ExistingSolution = z.infer<typeof ExistingSolutionSchema>
export type ExtractedProblem = z.infer<typeof ExtractedProblemSchema>
export type StructuredProblem = z.infer<typeof StructuredProblemSchema>
export type SolutionAnalysis = z.infer<typeof SolutionAnalysisSchema>
export type RankingScores = z.infer<typeof RankingScoresSchema>
export type AnalyzedProblem = z.infer<typeof AnalyzedProblemSchema>
export type UserSubmissionAnalysis = z.infer<typeof UserSubmissionAnalysisSchema>
