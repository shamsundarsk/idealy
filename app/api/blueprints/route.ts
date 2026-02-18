import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq'

function getApiKeys(): string[] {
  const keys: string[] = []
  if (process.env.AI_API_KEY) keys.push(process.env.AI_API_KEY)
  if (process.env.GROQ_API_KEY) keys.push(process.env.GROQ_API_KEY)
  if (process.env.OPENAI_API_KEY) keys.push(process.env.OPENAI_API_KEY)
  if (process.env.AI_API_KEY_BACKUP_1) keys.push(process.env.AI_API_KEY_BACKUP_1)
  if (process.env.AI_API_KEY_BACKUP_2) keys.push(process.env.AI_API_KEY_BACKUP_2)
  if (process.env.AI_API_KEY_BACKUP_3) keys.push(process.env.AI_API_KEY_BACKUP_3)
  return [...new Set(keys.filter(Boolean))]
}

const PROVIDER_CONFIGS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
  },
  ollama: {
    url: process.env.OLLAMA_URL || 'http://localhost:11434/v1/chat/completions',
    model: process.env.AI_MODEL || 'llama3',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
}

function getProviderConfig() {
  const provider = AI_PROVIDER.toLowerCase()
  return PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS] || PROVIDER_CONFIGS.groq
}

const blueprintSchema = z.object({
  productName: z.string().describe('Creative product name'),
  tagline: z.string().describe('One-line product description'),
  features: z
    .array(z.string())
    .describe('8 core features of the product')
    .max(8),
  techStack: z
    .array(z.string())
    .describe('Recommended tech stack (8 items)'),
  businessModel: z
    .string()
    .describe('How the product makes money'),
  targetMarket: z
    .string()
    .describe('Primary target audience description'),
  estimatedTAM: z
    .string()
    .describe('Total Addressable Market estimate'),
  mvpTimeline: z
    .string()
    .describe('Estimated timeline for MVP development'),
  competitiveAdvantage: z
    .string()
    .describe('Why this product is unique'),
  fundingNeeds: z
    .string()
    .describe('Estimated funding needed for launch'),
})

export async function POST(request: NextRequest) {
  try {
    const { problemDescription } = await request.json()

    if (!problemDescription || problemDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Problem description is required' },
        { status: 400 },
      )
    }

    const apiKeys = getApiKeys()
    
    // Use AI to generate blueprint with fallback
    let blueprint
    try {
      if (apiKeys.length === 0) {
        throw new Error('No AI API keys configured')
      }

      const config = getProviderConfig()
      const prompt = `You are a product strategist. Based on this real problem from an online community, create a detailed product blueprint:

Problem: "${problemDescription}"

Create a compelling product blueprint that solves this problem. Return ONLY a valid JSON object with these exact fields:
{
  "productName": "Creative product name",
  "tagline": "One-line product description",
  "features": ["feature1", "feature2", ... 8 features total],
  "techStack": ["tech1", "tech2", ... 8 technologies],
  "businessModel": "How the product makes money",
  "targetMarket": "Primary target audience description",
  "estimatedTAM": "Total Addressable Market estimate",
  "mvpTimeline": "Estimated timeline for MVP development",
  "competitiveAdvantage": "Why this product is unique",
  "fundingNeeds": "Estimated funding needed for launch"
}

Return ONLY the JSON object, no markdown, no explanations.`

      let lastError: Error | null = null
      
      for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i]
        const keyLabel = i === 0 ? 'primary' : `backup ${i}`
        
        try {
          console.log(`[Idealy] Blueprint: Trying ${keyLabel} API key...`)
          
          const response = await fetch(config.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: config.model,
              messages: [
                {
                  role: 'system',
                  content: 'You are a precise AI that returns ONLY valid JSON. No markdown, no explanations, just JSON.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API error (${response.status}): ${errorText}`)
          }

          const data = await response.json()
          let content = data.choices[0]?.message?.content || ''
          
          // Clean up response
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          
          const output = JSON.parse(content)
          
          blueprint = {
            id: `blueprint-${Date.now()}`,
            ...output,
            marketInsights: {
              size: 'Based on problem validation',
              growth: 'Growing market need',
              demand: 'High unmet demand based on community feedback',
            },
            nextSteps: [
              'Validate with 20 target customers',
              'Build MVP focusing on core features',
              'Launch beta to early adopters',
              'Gather feedback and iterate',
              'Prepare for seed funding',
            ],
          }
          
          console.log(`[Idealy] Blueprint: Success with ${keyLabel} API key`)
          break
          
        } catch (error: any) {
          console.error(`[Idealy] Blueprint: ${keyLabel} API key failed:`, error.message)
          lastError = error
          
          if (i < apiKeys.length - 1) {
            console.log(`[Idealy] Blueprint: Trying next API key...`)
            continue
          }
        }
      }
      
      if (!blueprint) {
        throw lastError || new Error('All API keys failed')
      }
      
    } catch (aiError) {
      console.log('[Idealy] Using mock blueprint due to:', aiError)
      blueprint = generateMockBlueprint(problemDescription)
    }

    return NextResponse.json(blueprint, { status: 200 })
  } catch (error) {
    console.error('[Idealy] Blueprint generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate blueprint' },
      { status: 500 },
    )
  }
}

function generateMockBlueprint(problemDescription: string) {
  const productNames = [
    'FlowHub',
    'SyncFlow',
    'TeamPulse',
    'DataFlow',
    'WorkSync',
  ]
  const randomName =
    productNames[Math.floor(Math.random() * productNames.length)]

  return {
    id: `blueprint-${Date.now()}`,
    productName: randomName,
    tagline: 'The solution to your problem',
    features: [
      'Centralized dashboard',
      'Real-time updates',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      'Mobile app support',
      'API access',
      'Automated workflows',
    ],
    techStack: [
      'Next.js 16 (Frontend)',
      'Node.js (Backend)',
      'PostgreSQL (Database)',
      'TypeScript',
      'Tailwind CSS',
      'Supabase (Auth & DB)',
      'Stripe (Payments)',
      'OpenAI/Groq (AI)',
    ],
    businessModel:
      'Freemium SaaS - Free tier with 100 items/month, Pro at $49/month',
    targetMarket: 'Small to medium-sized teams and startups',
    estimatedTAM: '$2.4B in addressable market',
    mvpTimeline: '6-8 weeks',
    competitiveAdvantage:
      'Unique combination of ease-of-use and powerful features',
    fundingNeeds: '$250K - $500K for MVP and initial marketing',
    marketInsights: {
      size: '1.2M potential users in target market',
      growth: '23% year-over-year growth',
      demand: 'High unmet demand based on community feedback',
    },
    nextSteps: [
      'Validate with 20 target customers',
      'Build MVP focusing on core features',
      'Launch beta to early adopters',
      'Gather feedback and iterate',
      'Prepare for seed funding',
    ],
  }
}
