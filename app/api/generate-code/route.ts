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

interface CodeGenerationRequest {
  productName: string
  blueprint: {
    features: string[]
    techStack: string[]
    businessModel: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productName, blueprint } = (await request.json()) as CodeGenerationRequest

    if (!productName || !blueprint) {
      return NextResponse.json(
        { error: 'Product name and blueprint are required' },
        { status: 400 },
      )
    }

    const apiKeys = getApiKeys()
    
    // Generate code scaffold using AI with fallback
    let codeScaffold
    try {
      if (apiKeys.length === 0) {
        throw new Error('No AI API keys configured')
      }

      const config = getProviderConfig()
      const prompt = `You are an expert full-stack developer. Generate a Next.js project structure and key file contents for this product:

Product: ${productName}
Features: ${blueprint.features.join(', ')}
Tech Stack: ${blueprint.techStack.join(', ')}
Business Model: ${blueprint.businessModel}

Provide:
1. Project directory structure
2. Key package.json dependencies
3. Database schema (SQL)
4. 2-3 key component/page code snippets

Format as JSON with keys: structure, dependencies, schema, code_snippets.`

      let lastError: Error | null = null
      
      for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i]
        const keyLabel = i === 0 ? 'primary' : `backup ${i}`
        
        try {
          console.log(`[Idealy] Code Gen: Trying ${keyLabel} API key...`)
          
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
              temperature: 0.5,
              max_tokens: 3000,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API error (${response.status}): ${errorText}`)
          }

          const data = await response.json()
          const text = data.choices[0]?.message?.content || ''
          
          codeScaffold = parseCodeResponse(text)
          console.log(`[Idealy] Code Gen: Success with ${keyLabel} API key`)
          break
          
        } catch (error: any) {
          console.error(`[Idealy] Code Gen: ${keyLabel} API key failed:`, error.message)
          lastError = error
          
          if (i < apiKeys.length - 1) {
            console.log(`[Idealy] Code Gen: Trying next API key...`)
            continue
          }
        }
      }
      
      if (!codeScaffold) {
        throw lastError || new Error('All API keys failed')
      }
      
    } catch (aiError) {
      console.log('[Idealy] Using template scaffold due to:', aiError)
      codeScaffold = generateDefaultScaffold(productName, blueprint)
    }

    // Ensure codeScaffold has all required fields
    if (!codeScaffold || !codeScaffold.codeSnippets) {
      console.log('[Idealy] Code scaffold missing data, using default')
      codeScaffold = generateDefaultScaffold(productName, blueprint)
    }

    console.log('[Idealy] Returning code scaffold with', Object.keys(codeScaffold.codeSnippets || {}).length, 'snippets')

    return NextResponse.json(codeScaffold, { status: 200 })
  } catch (error) {
    console.error('[Idealy] Code generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 },
    )
  }
}

function parseCodeResponse(text: string) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // Fall back to template
  }
  return generateDefaultScaffold('Product', { features: [], techStack: [], businessModel: '' })
}

function generateDefaultScaffold(
  productName: string,
  blueprint: { features: string[]; techStack: string[]; businessModel: string },
) {
  return {
    projectName: productName.toLowerCase().replace(/\s+/g, '-'),
    structure: {
      app: [
        'layout.tsx',
        'page.tsx',
        'globals.css',
        '(auth)/login/page.tsx',
        '(auth)/signup/page.tsx',
        '(dashboard)/dashboard/page.tsx',
        'api/auth/route.ts',
        'api/products/route.ts',
      ],
      components: [
        'ui/button.tsx',
        'ui/card.tsx',
        'header.tsx',
        'navigation.tsx',
        'dashboard-layout.tsx',
      ],
      lib: ['auth.ts', 'db.ts', 'utils.ts'],
      public: ['favicon.ico'],
    },
    dependencies: {
      next: '^16.0.0',
      react: '^19.0.0',
      typescript: '^5.0.0',
      tailwindcss: '^4.0.0',
      'supabase-js': '^2.0.0',
      '@supabase/auth-helpers-nextjs': '^0.10.0',
      zod: '^3.0.0',
      'react-hook-form': '^7.0.0',
    },
    databaseSchema: `
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products/Items table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_users_email ON users(email);
`,
    codeSnippets: {
      'app/page.tsx': generateLandingPageCode(productName),
      'app/layout.tsx': generateLayoutCode(),
      'lib/db.ts': generateDbCode(),
      'README.md': generateReadmeCode(productName, blueprint),
    },
    nextSteps: [
      'npm install',
      'Create .env.local with Supabase credentials',
      'npm run dev',
      'Start building features',
    ],
  }
}

function generateLandingPageCode(productName: string) {
  return `export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">${productName}</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Your product description here
      </p>
      <button className="px-6 py-3 bg-primary text-white rounded-lg">
        Get Started
      </button>
    </main>
  )
}`
}

function generateLayoutCode() {
  return `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Your Product',
  description: 'Product description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`
}

function generateDbCode() {
  return `import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select()
  
  if (error) throw error
  return data
}

export default supabase`
}

function generateReadmeCode(
  productName: string,
  blueprint: { features: string[]; techStack: string[]; businessModel: string },
) {
  return `# ${productName}

${blueprint.businessModel}

## Features

${blueprint.features.map((f) => `- ${f}`).join('\n')}

## Tech Stack

${blueprint.techStack.map((t) => `- ${t}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit http://localhost:3000

## Development

1. Create .env.local with your environment variables
2. Run \`npm run dev\`
3. Start building!

## Deployment

Deploy to Vercel for best Next.js experience.
`
}
