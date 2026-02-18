import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, currentFile, currentCode, projectContext } = await request.json()

    // Using OpenAI-compatible API (can be replaced with any open-source LLM)
    // Options: Ollama, LM Studio, Together AI, Groq, etc.
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY
    const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
    const model = process.env.AI_MODEL || 'gpt-4'

    if (!apiKey) {
      // Fallback to mock response for demo
      return NextResponse.json({
        success: true,
        code: generateMockCode(prompt, currentCode),
        message: 'Using mock AI (configure API key for real AI)',
      })
    }

    const systemPrompt = `You are an expert code assistant. You help developers write, refactor, and debug code.
Current file: ${currentFile}
Project files: ${projectContext.files.join(', ')}
Dependencies: ${Object.keys(projectContext.dependencies).join(', ')}

When modifying code:
1. Maintain the existing code style and structure
2. Add proper TypeScript types
3. Include error handling
4. Add helpful comments
5. Follow best practices
6. Return ONLY the modified code, no explanations

Current code:
\`\`\`
${currentCode}
\`\`\``

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error('AI API request failed')
    }

    const data = await response.json()
    const generatedCode = data.choices[0]?.message?.content || currentCode

    // Extract code from markdown if present
    const codeMatch = generatedCode.match(/```[\w]*\n([\s\S]*?)\n```/)
    const cleanCode = codeMatch ? codeMatch[1] : generatedCode

    return NextResponse.json({
      success: true,
      code: cleanCode,
      message: 'Code generated successfully',
    })
  } catch (error) {
    console.error('AI Code Agent Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate code',
      },
      { status: 500 }
    )
  }
}

// Mock code generation for demo purposes
function generateMockCode(prompt: string, currentCode: string): string {
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('error handling') || lowerPrompt.includes('try catch')) {
    return addErrorHandling(currentCode)
  }

  if (lowerPrompt.includes('typescript') || lowerPrompt.includes('types')) {
    return addTypeScript(currentCode)
  }

  if (lowerPrompt.includes('comment') || lowerPrompt.includes('document')) {
    return addComments(currentCode)
  }

  if (lowerPrompt.includes('async') || lowerPrompt.includes('await')) {
    return convertToAsync(currentCode)
  }

  // Default: add a comment
  return `// AI: Modified based on: "${prompt}"\n${currentCode}`
}

function addErrorHandling(code: string): string {
  if (code.includes('try')) return code
  
  return `try {
  ${code.split('\n').map(line => '  ' + line).join('\n')}
} catch (error) {
  console.error('Error:', error)
  throw error
}`
}

function addTypeScript(code: string): string {
  return `// TypeScript types added
${code}`
}

function addComments(code: string): string {
  return `/**
 * Function description
 * @returns Result
 */
${code}`
}

function convertToAsync(code: string): string {
  if (code.includes('async')) return code
  
  return code.replace(/function\s+(\w+)/, 'async function $1')
}
