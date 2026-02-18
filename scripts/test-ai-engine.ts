/**
 * Test script for AI Problem Analysis Engine
 * Run with: npx ts-node scripts/test-ai-engine.ts
 */

import { analyzeProblem, analyzeUserSubmission } from '../lib/ai-analyzer'
import { RawProblemInput } from '../lib/problem-schemas'

async function testUserSubmission() {
  console.log('\n=== Testing User Submission Analysis ===\n')

  const userInput = `I spend 2 hours every week manually copying customer feedback from emails, Slack messages, and support tickets into a spreadsheet. There's no good tool that automatically consolidates all this feedback in one place with sentiment analysis.`

  try {
    const analysis = await analyzeUserSubmission(userInput)
    console.log('✅ Analysis Complete!\n')
    console.log('Title:', analysis.title)
    console.log('Status:', analysis.status)
    console.log('Opportunity Score:', analysis.opportunity_score)
    console.log('Recommendation:', analysis.recommendation)
    console.log('\nExisting Solutions:', analysis.existing_solutions.length)
    analysis.existing_solutions.forEach((sol, i) => {
      console.log(`  ${i + 1}. ${sol.name}`)
      console.log(`     Limitations: ${sol.limitations}`)
    })
    console.log('\nGap Analysis:', analysis.gap_analysis)
    console.log('\nReasoning:', analysis.reasoning)
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function testStructuredAnalysis() {
  console.log('\n=== Testing Structured Problem Analysis ===\n')

  const input: RawProblemInput = {
    source: 'hackernews',
    content: `Ask HN: Anyone else frustrated with managing multiple API keys across different projects? I have 50+ API keys scattered across .env files, password managers, and team wikis. Every time I rotate a key, I have to update it in 10 different places. Looking for a better solution.`,
    url: 'https://news.ycombinator.com/item?id=12345',
    timestamp: new Date().toISOString(),
  }

  try {
    const analyzed = await analyzeProblem(input)

    if (!analyzed) {
      console.log('❌ No problem found in content')
      return
    }

    console.log('✅ Analysis Complete!\n')
    console.log('ID:', analyzed.id)
    console.log('Title:', analyzed.title)
    console.log('Category:', analyzed.category)
    console.log('Severity:', analyzed.severity)
    console.log('Status:', analyzed.status)
    console.log('Confidence:', analyzed.confidence_score + '%')
    console.log('\nScores:')
    console.log('  Opportunity:', analyzed.opportunity_score)
    console.log('  Build Potential:', analyzed.build_potential_score)
    console.log('  Severity:', analyzed.severity_score)
    console.log('\nRecommendation:', analyzed.build_recommendation)
    console.log('\nExisting Solutions:', analyzed.existing_solutions.length)
    analyzed.existing_solutions.forEach((sol, i) => {
      console.log(`  ${i + 1}. ${sol.name}`)
    })
    console.log('\nGap Analysis:', analyzed.gap_analysis.substring(0, 200) + '...')
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function main() {
  console.log('🚀 AI Problem Analysis Engine - Test Suite')
  console.log('==========================================')

  // Check environment
  if (!process.env.OPENAI_API_KEY && !process.env.AI_API_KEY) {
    console.error('\n❌ Error: No AI API key configured!')
    console.error('Please set OPENAI_API_KEY or AI_API_KEY in .env.local')
    process.exit(1)
  }

  console.log('✅ AI API key configured')
  console.log('Model:', process.env.AI_MODEL || 'gpt-4o-mini')

  // Run tests
  await testUserSubmission()
  await testStructuredAnalysis()

  console.log('\n✅ All tests complete!')
}

main().catch(console.error)
