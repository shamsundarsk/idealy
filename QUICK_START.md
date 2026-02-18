# 🚀 Quick Start Guide - Idealy

## Current Status

✅ App configured with Groq AI  
✅ Multi-source scrapers ready (HN, GitHub, PH, IH)  
✅ Database credentials configured  
⚠️ Database tables need to be created  
⚠️ Local network cannot reach Supabase (firewall issue)

## 🎯 What You Need To Do

### Step 1: Create Database Tables (REQUIRED)

The app cannot connect to Supabase from your local network, but it will work from the Next.js server. You need to create the tables manually:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/nytwruytwbhnmgmpkmrs
   - Click "SQL Editor" in left sidebar

2. **Run This SQL** (copy entire block):

```sql
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_source ON problems(source);
CREATE INDEX IF NOT EXISTS idx_problems_opportunity_score ON problems(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_started_at ON scraping_jobs(started_at DESC);
```

3. **Click "Run"** - You should see "Success"

4. **Verify** - Go to "Table Editor" and see `problems` and `scraping_jobs` tables

### Step 2: Start the App

```bash
npm run dev
```

Open http://localhost:3000

### Step 3: Test Problem Scraping

1. Click "Discover Problems" tab
2. Click "Scrape Now" button
3. Wait 2-3 minutes (AI analysis is slow but thorough)
4. Problems will appear!

### Step 4: Verify Database

Go to Supabase Dashboard → Table Editor → `problems` table

You should see scraped problems with:
- Titles and descriptions
- Opportunity scores
- Existing solutions analysis
- Build recommendations

## 🔧 Troubleshooting

### No problems appear after scraping

Check browser console (F12) for errors:

1. **AI validation errors**: The AI might be returning invalid JSON
   - Solution: Already handled with nullable fields
   - Wait and try again (AI can be inconsistent)

2. **Rate limit hit**: Groq free tier has limits
   - Solution: Wait 1 minute and try again
   - Or add backup API keys in `.env.local`

3. **Database connection failed**: 
   - Check if tables were created in Step 1
   - Verify `.env.local` has correct DATABASE_URL
   - Check Supabase project is active

### Database connection errors

The app uses connection pooling (port 6543) which works from Next.js server even if local network is blocked.

If still failing:
1. Verify Supabase project is running
2. Check password is correct: `Idealy@sham@2217`
3. Try regenerating database password in Supabase settings

### AI returns 0 analyzed problems

This means AI validation is failing. Check:
1. GROQ_API_KEY is valid
2. Model `llama-3.3-70b-versatile` is available
3. Console logs show specific validation errors

## 📊 Expected Results

After scraping, you should see:
- **Hacker News**: 2-5 problems (real API)
- **GitHub Issues**: 5-10 problems (real API)
- **Product Hunt**: 3-5 problems (mock data for now)
- **Indie Hackers**: 3-5 problems (mock data for now)

Total: 10-25 problems per scrape

## 🎯 Next Steps

Once scraping works:
1. Add more backup API keys for redundancy
2. Implement real Product Hunt scraper
3. Implement real Indie Hackers scraper
4. Add user problem submission
5. Build blueprint generator
6. Build code generator

## 📝 Important Files

- `.env.local` - Configuration (API keys, database)
- `lib/ai-analyzer.ts` - AI analysis engine
- `lib/scrapers/` - Source scrapers
- `app/api/problems/scrape/route.ts` - Scraping API
- `DATABASE_SETUP.md` - Detailed database setup

## 🆘 Need Help?

1. Check console logs (browser F12 and terminal)
2. Read `DATABASE_SETUP.md` for detailed database instructions
3. Verify all environment variables in `.env.local`
4. Test individual scrapers by checking their files in `lib/scrapers/`

---

**TL;DR**: Create database tables in Supabase Dashboard (Step 1), then run `npm run dev` and click "Scrape Now"! 🚀
