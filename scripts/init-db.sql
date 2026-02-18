-- Idealy Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems table (from discovery)
CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  source VARCHAR(50) DEFAULT 'reddit', -- reddit, direct_input
  category VARCHAR(100),
  votes INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blueprints table (generated product blueprints)
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  tagline TEXT,
  features TEXT[],
  tech_stack TEXT[],
  business_model TEXT,
  target_market TEXT,
  estimated_tam VARCHAR(255),
  mvp_timeline VARCHAR(100),
  competitive_advantage TEXT,
  funding_needs VARCHAR(255),
  market_insights JSONB,
  next_steps TEXT[],
  status VARCHAR(50) DEFAULT 'draft', -- draft, shared, published
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Code scaffolds table (generated project code)
CREATE TABLE IF NOT EXISTS code_scaffolds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  structure JSONB,
  dependencies JSONB,
  database_schema TEXT,
  code_snippets JSONB,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved blueprints table (for favorites/bookmarks)
CREATE TABLE IF NOT EXISTS saved_blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, blueprint_id)
);

-- Community feedback on blueprints
CREATE TABLE IF NOT EXISTS blueprint_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_problems_user_id ON problems(user_id);
CREATE INDEX idx_problems_category ON problems(category);
CREATE INDEX idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX idx_blueprints_problem_id ON blueprints(problem_id);
CREATE INDEX idx_blueprints_status ON blueprints(status);
CREATE INDEX idx_code_scaffolds_blueprint_id ON code_scaffolds(blueprint_id);
CREATE INDEX idx_code_scaffolds_user_id ON code_scaffolds(user_id);
CREATE INDEX idx_saved_blueprints_user_id ON saved_blueprints(user_id);
CREATE INDEX idx_blueprint_feedback_blueprint_id ON blueprint_feedback(blueprint_id);
CREATE INDEX idx_users_email ON users(email);

-- Row Level Security (if using Supabase)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_scaffolds ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprint_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for problems table
CREATE POLICY "Problems are readable by everyone"
  ON problems FOR SELECT
  USING (true);

CREATE POLICY "Users can create problems"
  ON problems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own problems"
  ON problems FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for blueprints table
CREATE POLICY "Blueprints are readable by everyone"
  ON blueprints FOR SELECT
  USING (true);

CREATE POLICY "Users can create blueprints"
  ON blueprints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blueprints"
  ON blueprints FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for code_scaffolds table
CREATE POLICY "Code scaffolds are readable by everyone"
  ON code_scaffolds FOR SELECT
  USING (true);

CREATE POLICY "Users can create code scaffolds"
  ON code_scaffolds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for saved_blueprints table
CREATE POLICY "Users can manage their saved blueprints"
  ON saved_blueprints FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for blueprint_feedback table
CREATE POLICY "Feedback is readable by everyone"
  ON blueprint_feedback FOR SELECT
  USING (true);

CREATE POLICY "Users can create feedback"
  ON blueprint_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
