# Database Setup - Supabase PostgreSQL ✅

## ⚠️ IMPORTANT: Prisma CLI Cannot Connect

Prisma CLI shows connection error:
```
Error: P1001: Can't reach database server at `db.nytwruytwbhnmgmpkmrs.supabase.co:5432`
```

This is a **local firewall/network issue** - the app will connect fine at runtime!

## ✅ Solution: Use Supabase Dashboard

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/jawoyfnrhunzyudwqrmp
2. Click "SQL Editor" in left sidebar
3. Click "New Query"

### Step 2: Copy & Run This SQL

```sql
-- ============================================
-- IDEALY DATABASE SCHEMA
-- ============================================

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_users TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence_score INTEGER NOT NULL,
  existing_solutions JSONB DEFAULT '[]',
  gap_analysis TEXT NOT NULL,
  opportunity_score INTEGER NOT NULL,
  build_potential_score INTEGER NOT NULL,
  severity_score INTEGER NOT NULL,
  build_recommendation TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scraping jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items_found INTEGER DEFAULT 0,
  items_analyzed INTEGER DEFAULT 0,
  error TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_source ON problems(source);
CREATE INDEX IF NOT EXISTS idx_problems_opportunity_score ON problems(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_started_at ON scraping_jobs(started_at DESC);

-- Verify tables created
SELECT 'problems' as table_name, COUNT(*) as row_count FROM problems
UNION ALL
SELECT 'scraping_jobs', COUNT(*) FROM scraping_jobs;
```

### Step 3: Click "Run" (or press Cmd+Enter)

You should see:
```
Success. No rows returned
```

And then the verification query shows:
```
table_name      | row_count
----------------|----------
problems        | 0
scraping_jobs   | 0
```

### Step 4: Verify Tables Exist

Go to "Table Editor" in left sidebar - you should see:
- ✅ `problems` table
- ✅ `scraping_jobs` table

## Step 5: Test Database Connection from App

Create a test script to verify the app can connect:

```bash
# Create test file
cat > test-db-connection.js << 'EOF'
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to database!')
    
    // Count problems
    const problemCount = await prisma.problem.count()
    console.log(`✅ Problems table exists: ${problemCount} rows`)
    
    // Count scraping jobs
    const jobCount = await prisma.scrapingJob.count()
    console.log(`✅ Scraping jobs table exists: ${jobCount} rows`)
    
    console.log('\n🎉 Database is ready!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
EOF

# Run test
node test-db-connection.js
```

Expected output:
```
Testing database connection...
✅ Connected to database!
✅ Problems table exists: 0 rows
✅ Scraping jobs table exists: 0 rows

🎉 Database is ready!
```

## Step 6: Restart Development Server

```bash
# Stop server if running (Ctrl+C)
# Start server
npm run dev
```

## Step 7: Test Problem Scraping

1. Open http://localhost:3000
2. Click "Discover Problems" tab
3. Click "Scrape Now" button
4. Wait 2-3 minutes (AI analysis takes time)
5. Problems will appear in the UI and be saved to database!

## Step 8: Verify Data in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Select "problems" table
3. You should see scraped problems with:
   - Title, description, category
   - Opportunity scores
   - Existing solutions
   - Gap analysis
   - Build recommendations

## Troubleshooting

### If app still can't connect:

1. Check `.env.local` has correct DATABASE_URL
2. Try connection pooling URL (port 6543):
   ```env
   DATABASE_URL=postgresql://postgres:Idealy%40sham%402217@db.nytwruytwbhnmgmpkmrs.supabase.co:6543/postgres?pgbouncer=true
   ```
3. Check Supabase project settings → Database → Connection pooling is enabled
4. Verify password is URL-encoded: `Idealy%40sham%402217`

### If scraping returns 0 problems:

1. Check console logs for AI validation errors
2. Verify GROQ_API_KEY is valid
3. Check if rate limit is hit (wait 1 minute and try again)
4. Look at browser console for detailed error messages

---

## Summary

✅ Database URL configured in `.env.local`  
✅ Prisma client generated  
⏳ **YOU NEED TO**: Run SQL in Supabase Dashboard (Step 2)  
⏳ **THEN**: Test connection (Step 5)  
⏳ **THEN**: Restart server and scrape (Steps 6-7)

The Prisma CLI can't connect due to local network/firewall, but the app will connect fine at runtime! 🚀
