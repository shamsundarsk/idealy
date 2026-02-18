# 🚀 START HERE - Idealy MVP Setup

## ✅ Configuration Complete

Your new Supabase database is configured:
- **Project**: jawoyfnrhunzyudwqrmp
- **URL**: https://jawoyfnrhunzyudwqrmp.supabase.co
- **Password**: SHAMpavi@2217 (URL-encoded as `SHAMpavi%402217`)

## 🎯 Next: Create Database Tables (2 minutes)

### Quick Steps:

1. **Open**: https://supabase.com/dashboard/project/jawoyfnrhunzyudwqrmp

2. **Click**: "SQL Editor" → "New Query"

3. **Copy & Paste** this SQL:

```sql
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

CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_source ON problems(source);
CREATE INDEX IF NOT EXISTS idx_problems_opportunity_score ON problems(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_started_at ON scraping_jobs(started_at DESC);
```

4. **Click**: "Run" (or Cmd+Enter)

5. **Verify**: Go to "Table Editor" → See `problems` and `scraping_jobs` tables ✅

---

## 🏃 Then: Start the App

```bash 
npm run dev
```

Open http://localhost:3000 → Click "Discover Problems" → Click "Scrape Now"

Wait 2-3 minutes → See problems! 🎉

---

## 📚 Full Documentation

- **DO_THIS_NOW.md** - Complete 5-minute setup guide
- **QUICK_START.md** - Detailed quick start
- **DATABASE_SETUP.md** - Database setup details
- **CURRENT_STATUS.md** - Full project status

---

## 🆘 Need Help?

Check console logs:
- **Browser**: Press F12 → Console tab
- **Terminal**: Look for `[Idealy]` messages

Common issues:
- No problems? → Check GROQ_API_KEY is valid
- Database errors? → Verify tables created in Step 3
- Rate limits? → Wait 1 minute and try again

---

**TL;DR**: Run SQL in Supabase → `npm run dev` → Click "Scrape Now" → Done! 🚀
