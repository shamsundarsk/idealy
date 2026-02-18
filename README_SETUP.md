# 🎯 Idealy MVP - Setup Guide

## 📦 What You Have

A complete AI-powered problem discovery platform that:
- 🔍 Scrapes real problems from Hacker News & GitHub
- 🤖 Analyzes problems with AI (opportunity scores, solutions, gaps)
- 💾 Saves to Supabase database
- 🎨 Beautiful UI to browse and explore problems
- 🏗️ Blueprint generator for solutions
- 💻 Code generator with Monaco editor

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Database Tables (2 min)

Open: https://supabase.com/dashboard/project/jawoyfnrhunzyudwqrmp

Click: **SQL Editor** → **New Query**

Paste & Run:
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

### Step 2: Start Server (30 sec)

```bash
npm run dev
```

### Step 3: Test It (3 min)

1. Open: http://localhost:3000
2. Click: **"Discover Problems"** tab
3. Click: **"Scrape Now"** button
4. Wait: 2-3 minutes
5. See: Problems appear! 🎉

## 📊 What You'll See

### In the UI:
- Problem cards with titles and descriptions
- Opportunity scores (0-100)
- Categories (Developer Tools, Business, etc.)
- Existing solutions analysis
- Build recommendations

### In the Console:
```
[Idealy] 🚀 Starting batch analysis of 10 problems...
[Idealy] 📝 Processing 1/10 (hackernews)...
[Idealy] ✅ Problem extracted: API rate limiting issues
[Idealy] ✅ Solutions analyzed: PARTIALLY_SOLVED
[Idealy] 🎉 Analysis complete in 12.3s
[Idealy] 📊 Scores: opportunity=65, severity=75
```

### In Supabase:
- Go to: Table Editor → `problems` table
- See: All scraped problems with full analysis

## 🎨 Features to Try

### 1. Problem Discovery
- Browse problems by opportunity score
- Filter by category
- See existing solutions
- Read gap analysis

### 2. Blueprint Generation
- Click on a problem
- Click "Generate Blueprint"
- See AI-generated solution architecture

### 3. Code Generation
- After blueprint, click "Generate Code"
- See code scaffolding in Monaco editor
- Use AI to modify code

### 4. Multi-Source Scraping
- Hacker News (real API)
- GitHub Issues (real API)
- Product Hunt (mock)
- Indie Hackers (mock)

## 🔧 Configuration

### Current Setup:
```env
✅ AI Provider: Groq (fast, free)
✅ Model: llama-3.3-70b-versatile
✅ Database: Supabase PostgreSQL
✅ Connection: Pooling enabled
✅ API Key: Configured
```

### Add Backup Keys (Optional):
Edit `.env.local`:
```env
GROQ_API_KEY_BACKUP_1=your_backup_key_1
GROQ_API_KEY_BACKUP_2=your_backup_key_2
GROQ_API_KEY_BACKUP_3=your_backup_key_3
```

Get more keys: https://console.groq.com/keys

## 📈 Expected Results

### First Scrape:
- **Sources**: Hacker News + GitHub
- **Problems Found**: 10-15
- **AI Analysis**: 50-80% success rate
- **Time**: 2-3 minutes
- **Database**: Auto-saved

### Success Indicators:
- ✅ Console shows progress logs
- ✅ Problems appear in UI
- ✅ Data in Supabase table
- ✅ No error messages

## 🐛 Common Issues

### "No problems found"
- **Check**: Browser console (F12)
- **Verify**: GROQ_API_KEY is valid
- **Try**: Wait 1 minute (rate limits)

### "Database error"
- **Check**: Tables created in Step 1?
- **Verify**: DATABASE_URL in `.env.local`
- **Try**: Restart server

### "AI validation errors"
- **Normal**: 50-80% success is expected
- **Reason**: AI sometimes returns invalid JSON
- **Impact**: System handles gracefully

## 📚 Full Documentation

- **START_HERE.md** - Quick reference card
- **DO_THIS_NOW.md** - Detailed 5-min guide
- **SETUP_COMPLETE.md** - Configuration summary
- **QUICK_START.md** - Comprehensive guide
- **DATABASE_SETUP.md** - Database help
- **CURRENT_STATUS.md** - Project status

## 🎯 Next Steps

After setup works:

1. **Test all features**:
   - Problem discovery
   - Blueprint generation
   - Code generation
   - AI code writer

2. **Add more data**:
   - Scrape multiple times
   - Try different sources
   - Add user submissions

3. **Enhance**:
   - Add backup API keys
   - Implement real PH/IH scrapers
   - Add authentication
   - Add favorites/bookmarks

## 💡 Pro Tips

### For Best Results:
- Start with small scrapes (5-10 items)
- Monitor console logs
- Check Supabase Dashboard
- Add backup API keys

### For Development:
- Use hot reload (`npm run dev`)
- Check both terminal and browser console
- Use Prisma Studio: `npx prisma studio`
- Read the detailed logs

## 🚀 Ready to Launch?

1. ✅ Create database tables (Step 1)
2. ✅ Start server (Step 2)
3. ✅ Click "Scrape Now" (Step 3)
4. ✅ Watch it work! 🎉

---

**Need help?** Check the documentation files or console logs.

**Ready now?** Follow **START_HERE.md**! 🚀
