const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing database connection...')
    console.log('📍 Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to database!')
    
    // Try to query tables
    try {
      const problemCount = await prisma.problem.count()
      console.log(`✅ Problems table exists: ${problemCount} rows`)
    } catch (error) {
      console.log('❌ Problems table does not exist yet')
      console.log('   Run SQL in Supabase Dashboard (see DATABASE_SETUP.md)')
    }
    
    try {
      const jobCount = await prisma.scrapingJob.count()
      console.log(`✅ Scraping jobs table exists: ${jobCount} rows`)
    } catch (error) {
      console.log('❌ Scraping jobs table does not exist yet')
      console.log('   Run SQL in Supabase Dashboard (see DATABASE_SETUP.md)')
    }
    
    console.log('\n🎉 Database connection works!')
    console.log('📝 Next: Create tables using SQL in Supabase Dashboard')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.log('\n💡 Possible solutions:')
    console.log('1. Check DATABASE_URL in .env.local')
    console.log('2. Verify Supabase project is running')
    console.log('3. Try connection pooling URL (port 6543)')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
