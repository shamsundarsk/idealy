import { NextRequest, NextResponse } from 'next/server'

// AI Provider configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq'

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

const PROVIDER_CONFIGS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: process.env.AI_MODEL || 'mixtral-8x7b-32768',
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

/**
 * POST /api/ai-code-writer
 * AI-powered code writing and modification with multi-key fallback
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, currentFile, currentCode, language, projectContext } = await request.json()

    const apiKeys = getApiKeys()
    
    if (apiKeys.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No AI API keys configured. Set AI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY',
        },
        { status: 500 }
      )
    }

    console.log(`[Idealy] AI Code Writer: ${apiKeys.length} API key(s) available for fallback`)

    // Build context-aware prompt
    const systemPrompt = buildSystemPrompt(currentFile, language, projectContext)
    const userPrompt = buildUserPrompt(prompt, currentCode, language)
    const config = getProviderConfig()

    // Try each API key until one succeeds
    let lastError: Error | null = null
    
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i]
      const keyLabel = i === 0 ? 'primary' : `backup ${i}`
      
      try {
        console.log(`[Idealy] Trying ${keyLabel} API key...`)
        
        const response = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 4000,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()
        let generatedCode = data.choices[0]?.message?.content || ''

        // Extract code from markdown if present
        const result = extractCode(generatedCode, language)

        console.log(`[Idealy] Success with ${keyLabel} API key`)

        return NextResponse.json({
          success: true,
          code: result.code,
          explanation: result.explanation,
          provider: AI_PROVIDER,
          model: config.model,
          keyUsed: keyLabel,
        })
      } catch (error: any) {
        console.error(`[Idealy] ${keyLabel} API key failed:`, error.message)
        lastError = error
        
        // If this is a rate limit error and we have more keys, try next one
        if (i < apiKeys.length - 1) {
          console.log(`[Idealy] Trying next API key...`)
          continue
        }
      }
    }

    // All keys failed
    throw lastError || new Error('All API keys failed')
    
  } catch (error: any) {
    console.error('[Idealy] AI code writer error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate code',
      },
      { status: 500 }
    )
  }
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt(
  currentFile: string,
  language: string,
  projectContext: any
): string {
  return `You are an expert code assistant integrated into a web-based IDE. You help developers write, modify, and improve code.

CONTEXT:
- Current file: ${currentFile || 'new file'}
- Language: ${language}
- Project files: ${projectContext.files?.slice(0, 10).join(', ') || 'none'}
- Dependencies: ${Object.keys(projectContext.dependencies || {}).slice(0, 10).join(', ') || 'none'}

RULES:
1. Return ONLY the complete, modified code - no explanations in the code
2. Maintain existing code style and formatting
3. Add proper TypeScript types if applicable
4. Include helpful comments for complex logic
5. Follow best practices for ${language}
6. Preserve imports and dependencies
7. Make minimal changes to achieve the goal
8. Ensure code is production-ready

If you want to explain changes, add a brief explanation AFTER the code block in this format:
\`\`\`${language}
[code here]
\`\`\`

EXPLANATION: [brief explanation]

If the request is unclear or impossible, return the original code with a comment explaining why.`
}

/**
 * Build user prompt
 */
function buildUserPrompt(prompt: string, currentCode: string, language: string): string {
  if (!currentCode || currentCode.trim() === '') {
    return `Create new ${language} code for: ${prompt}

Return complete, working code.`
  }

  return `Current code:
\`\`\`${language}
${currentCode}
\`\`\`

Task: ${prompt}

Return the complete modified code.`
}

/**
 * Extract code from AI response
 */
function extractCode(response: string, language: string): { code: string; explanation?: string } {
  // Check for explanation
  let explanation: string | undefined
  const explanationMatch = response.match(/EXPLANATION:\s*(.+?)(?:\n|$)/i)
  if (explanationMatch) {
    explanation = explanationMatch[1].trim()
    response = response.replace(/EXPLANATION:\s*.+?(?:\n|$)/i, '')
  }

  // Try to extract code from markdown
  const codeBlockRegex = new RegExp(`\`\`\`(?:${language}|typescript|javascript|tsx|jsx)?\\n([\\s\\S]*?)\\n?\`\`\``, 'i')
  const match = response.match(codeBlockRegex)

  if (match) {
    return {
      code: match[1].trim(),
      explanation,
    }
  }

  // If no code block, check if response looks like code
  const looksLikeCode = response.includes('function') ||
    response.includes('const') ||
    response.includes('import') ||
    response.includes('export') ||
    response.includes('class') ||
    response.includes('{') ||
    response.includes('}')

  if (looksLikeCode) {
    return {
      code: response.trim(),
      explanation,
    }
  }

  // Return as-is if we can't determine
  return {
    code: response.trim(),
    explanation,
  }
}
