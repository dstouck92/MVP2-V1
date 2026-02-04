-- ============================================
-- ANALYTICS TABLE SETUP
-- ============================================
-- Run this SQL in Supabase SQL Editor to create the analytics tracking table
-- This table tracks user interactions with the app

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON analytics(user_id, event_type);

-- Enable Row Level Security
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own analytics events
CREATE POLICY "Users can insert own analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admin can view all analytics (for dashboard)
-- Note: This allows all authenticated users to view all analytics
-- If you want to restrict this to admins only, you'll need to add an admin role
CREATE POLICY "Users can view all analytics" ON analytics
  FOR SELECT USING (true);

-- ============================================
-- EVENT TYPES
-- ============================================
-- The event_type field will contain one of:
-- - 'app_visit': User visited/loaded the app
-- - 'leaderboard_view': User viewed an artist leaderboard
-- - 'artist_search': User searched for an artist
-- - 'sync_data': User clicked "Sync Data" button
--
-- The event_data JSONB field will contain additional context:
-- - For 'leaderboard_view': { artist_id, artist_name }
-- - For 'artist_search': { search_query, results_count }
-- - For 'sync_data': { synced_count (if available) }
-- - For 'app_visit': { screen (welcome/profile/etc) }
