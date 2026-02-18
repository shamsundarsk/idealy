# ⚡ DO THIS NOW - Get Idealy Working

## 🎯 Goal
Get your MVP working in 5 minutes!

## 📋 Step-by-Step Instructions

### Step 1: Create Database Tables (2 minutes)

1. **Open this URL in your browser**:
   ```
   https://supabase.com/dashboard/project/jawoyfnrhunzyudwqrmp
   ```

2. **Click "SQL Editor"** in the left sidebar

3. **Click "New Query"** button

4. **Copy this ENTIRE SQL block** and paste it:

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

5. **Click "Run"** (or press Cmd+Enter / Ctrl+Enter)

6. **You should see**: "Success. No rows returned"

7. **Verify**: Click "Table Editor" in left sidebar → You should see `problems` and `scraping_jobs` tables

✅ **Done!** Tables are created.

---

### Step 2: Start the Server (30 seconds)

Open your terminal in the project folder and run:

```bash
npm run dev
```

Wait for:
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

✅ **Done!** Server is running.

---

### Step 3: Test Scraping (3 minutes)

1. **Open browser**: http://localhost:3000

2. **Click "Discover Problems"** tab

3. **Click "Scrape Now"** button (big blue button)

4. **Wait 2-3 minutes** - You'll see:
   - "Scraping in progress..."
   - Progress updates
   - "Scraping complete!"

5. **See results**: Problems will appear in the UI

✅ **Done!** Scraping works!

---

### Step 4: Verify Database (1 minute)

1. **Go back to Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/jawoyfnrhunzyudwqrmp
   ```

2. **Click "Table Editor"** → Select `problems` table

3. **You should see**: Rows with problem data:
   - Titles
   - Descriptions
   - Opportunity scores
   - Categories
   - Existing solutions

✅ **Done!** Data is being saved!

---

## 🎉 Success!

If you completed all 4 steps, your MVP is working! You now have:

- ✅ Real problems scraped from Hacker News and GitHub
- ✅ AI analysis with opportunity scores
- ✅ Data saved to Supabase database
- ✅ Working UI to browse problems

## 🐛 Troubleshooting

### "No problems found after scraping"

**Check browser console** (F12):
- Look for red errors
- Check if API key is valid
- Verify rate limits not hit

**Check terminal logs**:
- Look for AI validation errors
- Check database connection errors
- Verify scraping completed

**Solutions**:
1. Wait 1 minute and try again (rate limits)
2. Check GROQ_API_KEY in `.env.local`
3. Verify database tables exist in Supabase

### "Database connection failed"

**Check**:
1. Tables created in Step 1?
2. `.env.local` has correct DATABASE_URL?
3. Supabase project is active?

**Try**:
```bash
node test-db-connection.js
```

If it fails, the app might still work (Next.js has different network context).

### "AI validation errors"

This is normal - AI sometimes returns invalid data. The system will:
- Skip invalid problems
- Continue with valid ones
- Show success rate in logs

Expected: 50-80% success rate is normal.

## 📊 What to Expect

### First Scrape Results
- **Hacker News**: 2-5 problems
- **GitHub Issues**: 5-10 problems
- **Total**: 10-15 problems
- **Time**: 2-3 minutes
- **Success Rate**: 50-80%

### Console Output
```
[Idealy] 🚀 Starting batch analysis of 10 problems...
[Idealy] ⏱️  Estimated time: 150 seconds
[Idealy] 📝 Processing 1/10 (hackernews)...
[Idealy] ✅ Success: API rate limiting issues
[Idealy] 📝 Processing 2/10 (github)...
[Idealy] ✅ Success: Memory leak in production
...
[Idealy] 🎉 Batch analysis complete!
[Idealy] 📊 Results: 7 successful, 3 failed/skipped out of 10 total
[Idealy] 📈 Success rate: 70.0%
```

## 🚀 Next Steps

Once scraping works:

1. **Add backup API keys** (optional but recommended):
   - Edit `.env.local`
   - Add `GROQ_API_KEY_BACKUP_1`, `GROQ_API_KEY_BACKUP_2`, etc.
   - Get more keys from https://console.groq.com/keys

2. **Test blueprint generation**:
   - Click on a problem
   - Click "Generate Blueprint"
   - See AI-generated solution

3. **Test code generation**:
   - After blueprint, click "Generate Code"
   - See code scaffolding in Monaco editor

4. **Explore the data**:
   - Sort by opportunity score
   - Filter by category
   - Check existing solutions

## 📚 More Info

- `QUICK_START.md` - Detailed quick start guide
- `DATABASE_SETUP.md` - Database setup details
- `CURRENT_STATUS.md` - Full status report
- `README.md` - Project overview

---

**TL;DR**: 
1. Run SQL in Supabase Dashboard (Step 1)
2. Run `npm run dev` (Step 2)
3. Click "Scrape Now" (Step 3)
4. Wait 3 minutes
5. See problems! 🎉
