-- Fix Row Level Security Policies for listening_data table
-- This allows all users to view all listening data (needed for artist search and leaderboards)
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX LISTENING_DATA TABLE RLS POLICIES
-- ============================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own listening data" ON listening_data;

-- New policy: Users can view ALL listening data (needed for artist search and leaderboards)
-- This allows users to:
-- 1. Search for artists that other users have listened to
-- 2. View leaderboards for any artist
-- 3. See community-wide listening data
CREATE POLICY "Users can view all listening data" ON listening_data
  FOR SELECT USING (true);

-- Keep the INSERT policy (users can only insert their own data)
-- This policy should already exist, but verify it:
-- Policy: Users can insert their own listening data
-- CREATE POLICY "Users can insert own listening data" ON listening_data
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- After running, check policies in Supabase:
-- Table Editor → listening_data table → View Policies
-- 
-- You should see:
-- 1. "Users can view all listening data" - SELECT - true (allows all)
-- 2. "Users can insert own listening data" - INSERT - auth.uid() = user_id
