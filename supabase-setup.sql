-- ============================================
-- HERD APP - SUPABASE DATABASE SETUP
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Copy and paste each section, or run all at once
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores user profile information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT DEFAULT '🦌',
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_user_id TEXT,
  member_since TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. LISTENING DATA TABLE
-- ============================================
-- Stores individual track plays from Spotify
CREATE TABLE IF NOT EXISTS listening_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  played_at TIMESTAMP NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraint to prevent duplicate listening events
-- This allows upsert to work properly when syncing data
ALTER TABLE listening_data
ADD CONSTRAINT IF NOT EXISTS listening_data_unique_event 
UNIQUE (user_id, artist_id, track_id, played_at);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listening_data_user_id ON listening_data(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_data_artist_id ON listening_data(artist_id);
CREATE INDEX IF NOT EXISTS idx_listening_data_played_at ON listening_data(played_at);
CREATE INDEX IF NOT EXISTS idx_listening_data_user_artist ON listening_data(user_id, artist_id);

-- Enable Row Level Security
ALTER TABLE listening_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own listening data
CREATE POLICY "Users can view own listening data" ON listening_data
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own listening data
CREATE POLICY "Users can insert own listening data" ON listening_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. COMMENTS TABLE
-- ============================================
-- Stores fan comments on artist leaderboards
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) <= 200),
  likes UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_artist_id ON comments(artist_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view comments
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- Policy: Users can insert their own comments
CREATE POLICY "Users can insert own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. LEADERBOARD VIEW (Optional - for performance)
-- ============================================
-- Pre-calculated leaderboard data
CREATE OR REPLACE VIEW artist_leaderboard AS
SELECT 
  artist_id,
  artist_name,
  user_id,
  COUNT(*) as total_streams,
  SUM(duration_ms) / 60000 as total_minutes
FROM listening_data
GROUP BY artist_id, artist_name, user_id;

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for comments table
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready for the Herd app.
-- Next steps:
-- 1. Get your Supabase URL and anon key from Project Settings > API
-- 2. Add them to your .env file
-- 3. Restart your dev server
-- ============================================
