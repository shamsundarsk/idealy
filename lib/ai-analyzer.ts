import {
  RawProblemInput,
  ExtractedProblem,
  StructuredProblem,
  SolutionAnalysis,
  RankingScores,
  AnalyzedProblem,
  UserSubmissionAnalysis,
  ExtractedProblemSchema,
  SolutionAnalysisSchema,
  RankingScoresSchema,
  UserSubmissionAnalysisSchema,
} from './problem-schemas'

// AI Provider configuration - supports multiple providers
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq' // groq, ollama, openai
const AI_MODEL = process.env.AI_MODEL || getDefaultModel()

// Multi-key fallback system for redundancy
function getApiKeys(): string[] {
  const keys: string[] = []
  
  // Primary key
  if (process.env.AI_API_KEY) keys.push(process.env.AI_API_KEY)
  if (process.env.GROQ_API_KEY) keys.push(process.env.GROQ_API_KEY)
  if (process.env.OPENAI_API_KEY) keys.push(process.env.OPENAI_API_KEY)
  
  // Backup keys (for testing redundancy)
  if (process.env.AI_API_KEY_BACKUP_1) keys.push(process.env.AI_API_KEY_BACKUP_1)
  if (process.env.AI_API_KEY_BACKUP_2) keys.push(process.env.AI_API_KEY_BACKUP_2)
  if (process.env.AI_API_KEY_BACKUP_3) keys.push(process.env.AI_API_KEY_BACKUP_3)
  if (process.env.GROQ_API_KEY_BACKUP_1) keys.push(process.env.GROQ_API_KEY_BACKUP_1)
  if (process.env.GROQ_API_KEY_BACKUP_2) keys.push(process.env.GROQ_API_KEY_BACKUP_2)
  if (process.env.GROQ_API_KEY_BACKUP_3) keys.push(process.env.GROQ_API_KEY_BACKUP_3)
  
  // Remove duplicates
  return [...new Set(keys.filter(Boolean))]
}

// Provider-specific configurations
const PROVIDER_CONFIGS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'mixtral-8x7b-32768',
    temperature: 0.3,
    max_tokens: 2000,
  },
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434/v1/chat/completions',
    model: 'llama3',
    temperature: 0.3,
    max_tokens: 2000,
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 2000,
  },
}

function getDefaultModel(): string {
  const provider = AI_PROVIDER.toLowerCase()
  return PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]?.model || 'mixtral-8x7b-32768'
}

function getProviderConfig() {
  const provider = AI_PROVIDER.toLowerCase()
  const config = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]
  
  if (!config) {
    console.warn(`[Idealy] Unknown provider: ${provider}, defaulting to Groq`)
    return PROVIDER_CONFIGS.groq
  }
  
  return config
}

function getApiUrl(): string {
  // Allow custom URL override
  if (process.env.AI_API_URL) {
    return process.env.AI_API_URL
  }
  
  const config = getProviderConfig()
  return config.url
}

/**
 * STEP 1: Problem Extraction
 * Determines if content contains a real problem and extracts key information
 */
export async function extractProblem(
  content: string,
  source: string
): Promise<ExtractedProblem> {
  // Truncate content to avoid token limits
  const truncatedContent = content.substring(0, 1500)
  
  const prompt = `You are a STRICT problem extraction AI. Your job is to find BUSINESS OPPORTUNITIES and USER PAIN POINTS that could become SOFTWARE PRODUCTS.

Content: "${truncatedContent}"
Source: ${source}

⚠️ CRITICAL: REJECT 90% of content! Only accept EXTRAORDINARY business opportunities!

✅ ACCEPT ONLY IF ALL CONDITIONS ARE MET:
1. Describes a REAL USER PROBLEM (not a technical bug/error)
2. Multiple people would have this problem (market exists)
3. Could be solved by building a NEW SOFTWARE APPLICATION
4. Has clear business/revenue potential
5. Is NOT about fixing code, debugging, or technical errors

✅ PERFECT EXAMPLES (Accept these):
- "I spend 10 hours/week manually creating invoices for clients" → Invoice automation app
- "Our team wastes 2 hours daily in unnecessary meetings" → Meeting optimization tool
- "I can't find reliable freelancers for my projects" → Freelancer marketplace
- "Small businesses struggle to manage customer relationships" → Simple CRM
- "Content creators spend days editing videos manually" → AI video editor

❌ REJECT IMMEDIATELY (These are NOT business opportunities):
- "Node.js error: Cannot find module" → Technical bug
- "Next.js certificate not working" → Technical issue
- "TypeScript compilation failed" → Build error
- "Getting 404 error on my website" → Website bug
- "React component not rendering" → Code error
- "Database connection timeout" → Infrastructure issue
- "API returns 500 error" → Server error
- "Memory leak in production" → Performance bug
- "Webpack build fails" → Build tool error
- "ESLint configuration issue" → Tool configuration
- "Git merge conflict" → Version control issue
- "Docker container won't start" → DevOps issue
- "CSS not loading properly" → Styling bug
- "Authentication not working" → Feature bug
- "Tests are failing" → Test error
- "Package installation error" → Dependency issue
- "CORS error in browser" → Configuration issue
- "Environment variables not loading" → Config error

❌ ALSO REJECT:
- General complaints without clear problem
- Opinions or discussions
- Questions about how to code something
- Requests for code help
- Technical tutorials or guides
- Product announcements
- News articles
- Job postings

STRICT VALIDATION RULES:
1. If content mentions ANY error code (404, 500, etc.) → REJECT
2. If content mentions ANY programming language error → REJECT
3. If content is asking "how to code" something → REJECT
4. If content is about debugging → REJECT
5. If content is about fixing a bug → REJECT
6. If content doesn't describe a clear user pain point → REJECT
7. If you're not 100% sure it's a business opportunity → REJECT

Return ONLY valid JSON (no markdown, no code blocks):
{
  "has_problem": true or false,
  "title": "string" or null,
  "description": "string" or null,
  "affected_users": "string" or null,
  "category": "Productivity | Developer Tools | Business | Communication | Design | Marketing | Sales | Finance | Education | Healthcare | E-commerce | Social | Entertainment | Other" or null,
  "severity": "LOW | MEDIUM | HIGH | CRITICAL" or null,
  "rejection_reason": "string explaining why this is NOT a business opportunity" or null
}

REMEMBER: When in doubt, REJECT! We want quality over quantity!`

  try {
    const response = await callAI(prompt, 'extraction')
    const parsed = JSON.parse(response)
    
    // Clean up category if it has multiple values
    if (parsed.category && typeof parsed.category === 'string') {
      if (parsed.category.includes(',')) {
        parsed.category = parsed.category.split(',')[0].trim()
      }
      // Validate category is in allowed list
      const validCategories = ['Productivity', 'Developer Tools', 'Business', 'Communication', 'Design', 'Marketing', 'Sales', 'Finance', 'Education', 'Healthcare', 'E-commerce', 'Social', 'Entertainment', 'Other']
      if (!validCategories.includes(parsed.category)) {
        parsed.category = 'Other'
      }
    }
    
    // Validate severity
    if (parsed.severity && typeof parsed.severity === 'string') {
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
      if (!validSeverities.includes(parsed.severity)) {
        parsed.severity = 'MEDIUM'
      }
    }
    
    // Ensure null values are actually null, not empty strings
    if (parsed.title === '') parsed.title = null
    if (parsed.description === '') parsed.description = null
    if (parsed.affected_users === '') parsed.affected_users = null
    if (parsed.rejection_reason === '') parsed.rejection_reason = null
    
    const validated = ExtractedProblemSchema.parse(parsed)
    console.log('[Idealy] Problem extraction successful:', validated.has_problem ? validated.title : 'No problem found')
    return validated
    
  } catch (error: any) {
    console.error('[Idealy] Problem extraction failed:', error.message)
    if (error.message.includes('JSON')) {
      console.error('[Idealy] AI returned invalid JSON. Raw response might be malformed.')
    }
    return {
      has_problem: false,
      rejection_reason: `Failed to extract problem: ${error.message}`,
    }
  }
}

/**
 * STEP 2: Problem Structuring
 * Converts extracted problem into standardized format
 */
export function structureProblem(
  extracted: ExtractedProblem,
  input: RawProblemInput
): StructuredProblem | null {
  if (!extracted.has_problem || !extracted.title || !extracted.description) {
    return null
  }

  return {
    title: extracted.title,
    description: extracted.description,
    affected_users: extracted.affected_users || 'General users',
    category: extracted.category || 'Other',
    severity: extracted.severity || 'MEDIUM',
    source: input.source,
    source_url: input.url,
    created_at: input.timestamp || new Date().toISOString(),
  }
}

/**
 * STEP 3: Solution Detection & Analysis
 * Analyzes if problem is solved, partially solved, or unsolved
 */
export async function analyzeSolutions(
  problem: StructuredProblem
): Promise<SolutionAnalysis> {
  const prompt = `You are a market research AI. Analyze if this problem already has existing solutions.

Problem: "${problem.title}"
Description: "${problem.description}"
Affected Users: "${problem.affected_users}"
Category: ${problem.category}

CRITICAL RULES - FOLLOW EXACTLY:
1. Return ONLY valid JSON (no markdown, no code blocks)
2. status must be EXACTLY ONE of: SOLVED, PARTIALLY_SOLVED, UNSOLVED
3. confidence_score must be a number between 0-100
4. opportunity_score must be a number between 0-100
5. build_recommendation must be EXACTLY ONE of: BUILD, IMPROVE_EXISTING, DO_NOT_BUILD
6. existing_solutions must be an array (can be empty [])

EXAMPLE VALID RESPONSE:
{
  "status": "PARTIALLY_SOLVED",
  "confidence_score": 75,
  "existing_solutions": [
    {
      "name": "Existing Tool",
      "description": "What it does",
      "url": "https://example.com",
      "limitations": "What's missing"
    }
  ],
  "gap_analysis": "Current solutions lack X and Y features",
  "opportunity_score": 65,
  "build_recommendation": "IMPROVE_EXISTING",
  "reasoning": "Market has solutions but significant gaps exist"
}

Analyze:
1. Search your knowledge for existing solutions (products, tools, services)
2. Determine status:
   - SOLVED: Multiple good solutions exist, market is saturated
   - PARTIALLY_SOLVED: Some solutions exist but have significant gaps/limitations
   - UNSOLVED: No good solutions exist, clear market opportunity
3. List existing solutions (if any) with their limitations
4. Provide gap analysis: What's missing? What could be improved?
5. Calculate opportunity score (0-100): How big is the opportunity?
6. Recommend: BUILD (new solution), IMPROVE_EXISTING (better version), or DO_NOT_BUILD (saturated)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "status": "SOLVED | PARTIALLY_SOLVED | UNSOLVED",
  "confidence_score": 0-100,
  "existing_solutions": [
    {
      "name": "Solution name",
      "description": "What it does",
      "url": "optional url",
      "limitations": "What's missing or bad"
    }
  ],
  "gap_analysis": "Detailed analysis of market gaps and opportunities",
  "opportunity_score": 0-100,
  "build_recommendation": "BUILD | IMPROVE_EXISTING | DO_NOT_BUILD",
  "reasoning": "Why this recommendation"
}`

  try {
    const response = await callAI(prompt, 'solution-analysis')
    const parsed = JSON.parse(response)
    
    // Validate and fix status
    const validStatuses = ['SOLVED', 'PARTIALLY_SOLVED', 'UNSOLVED']
    if (!validStatuses.includes(parsed.status)) {
      console.warn('[Idealy] Invalid status, defaulting to UNSOLVED:', parsed.status)
      parsed.status = 'UNSOLVED'
    }
    
    // Validate and fix build_recommendation
    const validRecommendations = ['BUILD', 'IMPROVE_EXISTING', 'DO_NOT_BUILD']
    if (!validRecommendations.includes(parsed.build_recommendation)) {
      console.warn('[Idealy] Invalid recommendation, defaulting to BUILD:', parsed.build_recommendation)
      parsed.build_recommendation = 'BUILD'
    }
    
    // Ensure scores are numbers
    parsed.confidence_score = Number(parsed.confidence_score) || 50
    parsed.opportunity_score = Number(parsed.opportunity_score) || 50
    
    // Ensure existing_solutions is an array
    if (!Array.isArray(parsed.existing_solutions)) {
      parsed.existing_solutions = []
    }
    
    const validated = SolutionAnalysisSchema.parse(parsed)
    console.log('[Idealy] Solution analysis successful:', validated.status, `(${validated.opportunity_score}% opportunity)`)
    return validated
    
  } catch (error: any) {
    console.error('[Idealy] Solution analysis failed:', error.message)
    // Return safe default analysis
    return {
      status: 'UNSOLVED',
      confidence_score: 50,
      existing_solutions: [],
      gap_analysis: 'Unable to analyze existing solutions due to validation error',
      opportunity_score: 50,
      build_recommendation: 'BUILD',
      reasoning: 'Default recommendation due to analysis failure',
    }
  }
}

/**
 * STEP 4: Ranking & Scoring
 * Assigns scores for sorting and prioritization
 */
export async function calculateRankingScores(
  problem: StructuredProblem,
  analysis: SolutionAnalysis
): Promise<RankingScores> {
  const prompt = `You are a business opportunity scoring AI. Calculate scores for this problem.

Problem: "${problem.title}"
Description: "${problem.description}"
Category: ${problem.category}
Severity: ${problem.severity}
Status: ${analysis.status}
Existing Solutions: ${analysis.existing_solutions.length}

CRITICAL RULES - FOLLOW EXACTLY:
1. Return ONLY valid JSON (no markdown, no code blocks)
2. ALL scores must be numbers between 0-100
3. Use the provided opportunity_score: ${analysis.opportunity_score}

EXAMPLE VALID RESPONSE:
{
  "severity_score": 75,
  "opportunity_score": 65,
  "build_potential_score": 70,
  "market_size_score": 60,
  "competition_score": 80
}

Calculate scores (0-100):
1. severity_score: How painful is this problem? (based on severity and description)
2. opportunity_score: Market opportunity size (use: ${analysis.opportunity_score})
3. build_potential_score: How feasible/valuable to build? (consider complexity, market, competition)
4. market_size_score: Estimated market size (based on affected_users and category)
5. competition_score: How much competition? (100 = no competition, 0 = saturated)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "severity_score": 0-100,
  "opportunity_score": ${analysis.opportunity_score},
  "build_potential_score": 0-100,
  "market_size_score": 0-100,
  "competition_score": 0-100
}`

  try {
    const response = await callAI(prompt, 'ranking')
    const parsed = JSON.parse(response)
    
    // Ensure all scores are valid numbers
    parsed.severity_score = Number(parsed.severity_score) || 50
    parsed.opportunity_score = Number(parsed.opportunity_score) || analysis.opportunity_score
    parsed.build_potential_score = Number(parsed.build_potential_score) || 50
    parsed.market_size_score = Number(parsed.market_size_score) || 50
    parsed.competition_score = Number(parsed.competition_score) || 50
    
    // Clamp scores to 0-100
    Object.keys(parsed).forEach(key => {
      if (typeof parsed[key] === 'number') {
        parsed[key] = Math.max(0, Math.min(100, parsed[key]))
      }
    })
    
    const validated = RankingScoresSchema.parse(parsed)
    console.log('[Idealy] Ranking calculation successful:', `opportunity=${validated.opportunity_score}, severity=${validated.severity_score}`)
    return validated
    
  } catch (error: any) {
    console.error('[Idealy] Ranking calculation failed:', error.message)
    // Return calculated scores based on available data
    const severityMap: Record<string, number> = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 100 }
    return {
      severity_score: severityMap[problem.severity] || 50,
      opportunity_score: analysis.opportunity_score,
      build_potential_score: analysis.opportunity_score,
      market_size_score: 50,
      competition_score: analysis.existing_solutions.length === 0 ? 80 : 40,
    }
  }
}

/**
 * MAIN: Complete Problem Analysis Pipeline
 * Runs all 4 steps and returns final analyzed problem
 */
export async function analyzeProblem(
  input: RawProblemInput
): Promise<AnalyzedProblem | null> {
  const startTime = Date.now()
  console.log(`[Idealy] 🔍 Starting analysis for ${input.source}...`)

  try {
    // Step 1: Extract problem
    console.log('[Idealy] Step 1/4: Extracting problem...')
    const extracted = await extractProblem(input.content, input.source)
    
    if (!extracted.has_problem) {
      console.log('[Idealy] ❌ No valid problem found:', extracted.rejection_reason)
      return null
    }
    console.log('[Idealy] ✅ Problem extracted:', extracted.title)

    // Step 2: Structure problem
    console.log('[Idealy] Step 2/4: Structuring problem...')
    const structured = structureProblem(extracted, input)
    if (!structured) {
      console.log('[Idealy] ❌ Failed to structure problem')
      return null
    }
    console.log('[Idealy] ✅ Problem structured')

    // Step 3: Analyze solutions
    console.log('[Idealy] Step 3/4: Analyzing solutions...')
    const solutionAnalysis = await analyzeSolutions(structured)
    console.log('[Idealy] ✅ Solutions analyzed:', solutionAnalysis.status)

    // Step 4: Calculate ranking scores
    console.log('[Idealy] Step 4/4: Calculating scores...')
    const scores = await calculateRankingScores(structured, solutionAnalysis)
    console.log('[Idealy] ✅ Scores calculated')

    // Combine into final result
    const analyzed: AnalyzedProblem = {
      id: crypto.randomUUID(),
      title: structured.title,
      description: structured.description,
      affected_users: structured.affected_users,
      category: structured.category,
      severity: structured.severity,
      status: solutionAnalysis.status,
      confidence_score: solutionAnalysis.confidence_score,
      existing_solutions: solutionAnalysis.existing_solutions,
      gap_analysis: solutionAnalysis.gap_analysis,
      opportunity_score: scores.opportunity_score,
      build_potential_score: scores.build_potential_score,
      severity_score: scores.severity_score,
      build_recommendation: solutionAnalysis.build_recommendation,
      source: structured.source,
      source_url: structured.source_url,
      created_at: structured.created_at,
      updated_at: new Date().toISOString(),
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[Idealy] 🎉 Analysis complete in ${duration}s:`, analyzed.title)
    console.log(`[Idealy] 📊 Scores: opportunity=${analyzed.opportunity_score}, severity=${analyzed.severity_score}, status=${analyzed.status}`)
    
    return analyzed
    
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.error(`[Idealy] ❌ Analysis failed after ${duration}s:`, error.message)
    return null
  }
}

/**
 * USER SUBMISSION: Analyze user-submitted problem
 * Returns quick analysis for user feedback
 */
export async function analyzeUserSubmission(
  content: string
): Promise<UserSubmissionAnalysis> {
  const prompt = `You are a problem validation AI. A user submitted this problem statement. Analyze it comprehensively.

User Input: "${content}"

Provide:
1. Extract clear title and description
2. Determine if problem is SOLVED, PARTIALLY_SOLVED, or UNSOLVED
3. List existing solutions (if any)
4. Gap analysis: What's missing in current solutions?
5. Opportunity score (0-100)
6. Recommendation: BUILD, IMPROVE_EXISTING, or DO_NOT_BUILD
7. Reasoning for recommendation
8. Suggested category
9. Estimated market size (e.g., "Small niche", "Mid-market", "Large enterprise", "Mass market")

Return ONLY valid JSON:
{
  "title": "Clear problem title",
  "description": "Detailed description",
  "status": "SOLVED | PARTIALLY_SOLVED | UNSOLVED",
  "confidence_score": 0-100,
  "existing_solutions": [
    {
      "name": "Solution name",
      "description": "What it does",
      "limitations": "What's missing"
    }
  ],
  "gap_analysis": "What's missing in the market",
  "opportunity_score": 0-100,
  "recommendation": "BUILD | IMPROVE_EXISTING | DO_NOT_BUILD",
  "reasoning": "Why this recommendation",
  "suggested_category": "Category name",
  "estimated_market_size": "Market size description"
}`

  try {
    const response = await callAI(prompt, 'user-submission')
    const parsed = JSON.parse(response)
    return UserSubmissionAnalysisSchema.parse(parsed)
  } catch (error) {
    console.error('[Idealy] User submission analysis failed:', error)
    throw new Error('Failed to analyze problem submission')
  }
}

/**
 * Helper: Call AI API with provider-specific handling and multi-key fallback
 */
async function callAI(prompt: string, context: string): Promise<string> {
  const apiKeys = getApiKeys()
  
  if (apiKeys.length === 0) {
    throw new Error('No AI API keys configured. Set AI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY')
  }

  const config = getProviderConfig()
  const apiUrl = getApiUrl()
  const model = AI_MODEL || config.model

  console.log(`[Idealy] AI Analyzer (${context}): ${apiKeys.length} API key(s) available`)
  console.log(`[Idealy] Using AI provider: ${AI_PROVIDER}, model: ${model}`)

  // Try each API key until one succeeds
  let lastError: Error | null = null
  
  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i]
    const keyLabel = i === 0 ? 'primary' : `backup ${i}`
    
    try {
      console.log(`[Idealy] Trying ${keyLabel} API key for ${context}...`)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content:
                'You are a precise AI that returns ONLY valid JSON. No markdown, no explanations, just JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: config.temperature,
          max_tokens: config.max_tokens,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      let content = data.choices[0]?.message?.content || ''

      // Clean up response (remove markdown code blocks if present)
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      console.log(`[Idealy] Success with ${keyLabel} API key for ${context}`)
      return content
      
    } catch (error: any) {
      console.error(`[Idealy] ${keyLabel} API key failed for ${context}:`, error.message)
      lastError = error
      
      // If this is a rate limit error and we have more keys, try next one
      if (i < apiKeys.length - 1) {
        console.log(`[Idealy] Trying next API key...`)
        continue
      }
    }
  }

  // All keys failed
  throw lastError || new Error(`All API keys failed for ${context}`)
}

/**
 * Batch Analysis: Process multiple problems
 */
export async function analyzeBatch(
  inputs: RawProblemInput[]
): Promise<AnalyzedProblem[]> {
  console.log(`[Idealy] 🚀 Starting batch analysis of ${inputs.length} problems...`)
  console.log(`[Idealy] ⏱️  Estimated time: ${(inputs.length * 15)} seconds`)

  const results: AnalyzedProblem[] = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    console.log(`\n[Idealy] 📝 Processing ${i + 1}/${inputs.length} (${input.source})...`)
    
    try {
      const analyzed = await analyzeProblem(input)
      if (analyzed) {
        results.push(analyzed)
        successCount++
        console.log(`[Idealy] ✅ Success: ${analyzed.title}`)
      } else {
        failCount++
        console.log(`[Idealy] ⏭️  Skipped: No valid problem found`)
      }
      
      // Add delay to avoid rate limiting (except for last item)
      if (i < inputs.length - 1) {
        console.log('[Idealy] ⏳ Waiting 2s to avoid rate limits...')
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      
    } catch (error: any) {
      failCount++
      console.error(`[Idealy] ❌ Error processing problem ${i + 1}:`, error.message)
    }
  }

  console.log(`\n[Idealy] 🎉 Batch analysis complete!`)
  console.log(`[Idealy] 📊 Results: ${successCount} successful, ${failCount} failed/skipped out of ${inputs.length} total`)
  console.log(`[Idealy] 📈 Success rate: ${((successCount / inputs.length) * 100).toFixed(1)}%`)
  
  return results
}
