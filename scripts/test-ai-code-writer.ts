/**
 * Test script for AI Code Writer
 * Run with: npx ts-node scripts/test-ai-code-writer.ts
 */

async function testAiCodeWriter() {
  console.log('\n=== Testing AI Code Writer API ===\n')

  const testCases = [
    {
      name: 'Add error handling',
      prompt: 'Add try-catch error handling to this function',
      currentCode: `function fetchData(url: string) {
  const response = fetch(url)
  return response.json()
}`,
      language: 'typescript',
    },
    {
      name: 'Add TypeScript types',
      prompt: 'Add proper TypeScript types and interfaces',
      currentCode: `function processUser(user) {
  return {
    name: user.name,
    email: user.email,
    age: user.age
  }
}`,
      language: 'typescript',
    },
    {
      name: 'Create new component',
      prompt: 'Create a React component for a login form with email and password fields',
      currentCode: '',
      language: 'typescript',
    },
  ]

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`)
    console.log(`Prompt: "${testCase.prompt}"`)
    console.log(`Language: ${testCase.language}`)

    try {
      const response = await fetch('http://localhost:3000/api/ai-code-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testCase.prompt,
          currentFile: 'test.ts',
          currentCode: testCase.currentCode,
          language: testCase.language,
          projectContext: {
            files: ['test.ts', 'index.ts'],
            dependencies: { react: '^18.0.0' },
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Success!')
        console.log(`Provider: ${data.provider}`)
        console.log(`Model: ${data.model}`)
        if (data.explanation) {
          console.log(`Explanation: ${data.explanation}`)
        }
        console.log('\nGenerated Code:')
        console.log('---')
        console.log(data.code.substring(0, 300) + (data.code.length > 300 ? '...' : ''))
        console.log('---')
      } else {
        console.log('❌ Failed:', data.error)
      }
    } catch (error: any) {
      console.log('❌ Error:', error.message)
    }

    // Wait between tests
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
}

async function checkEnvironment() {
  console.log('🔍 Checking Environment Configuration\n')

  const provider = process.env.AI_PROVIDER || 'groq'
  const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY
  const model = process.env.AI_MODEL

  console.log(`Provider: ${provider}`)
  console.log(`API Key: ${apiKey ? '✅ Configured' : '❌ Missing'}`)
  console.log(`Model: ${model || 'Using default'}`)

  if (!apiKey) {
    console.error('\n❌ Error: No AI API key configured!')
    console.error('Please set one of: AI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY')
    console.error('\nFor Groq (recommended for testing):')
    console.error('1. Sign up at https://console.groq.com')
    console.error('2. Get API key from https://console.groq.com/keys')
    console.error('3. Add to .env.local: GROQ_API_KEY=your_key_here')
    process.exit(1)
  }

  console.log('\n✅ Environment configured correctly\n')
}

async function main() {
  console.log('🚀 AI Code Writer - Test Suite')
  console.log('================================')

  await checkEnvironment()
  await testAiCodeWriter()

  console.log('\n✅ All tests complete!')
  console.log('\nNext steps:')
  console.log('1. Test in the Web IDE by opening a project')
  console.log('2. Select a file and use the AI Assistant tab')
  console.log('3. Try quick commands or custom prompts')
}

main().catch(console.error)
