-- ============================================
-- FIX: Add unique constraint to listening_data table
-- ============================================
-- This fixes the "ON CONFLICT" error when syncing Spotify data
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add unique constraint to prevent duplicate listening events
-- This allows upsert to work properly when syncing data
ALTER TABLE listening_data
ADD CONSTRAINT listening_data_unique_event 
UNIQUE (user_id, artist_id, track_id, played_at);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, try syncing your Spotify data again
-- The error should be gone and data should sync successfully
-- ============================================
