-- Fix Row Level Security Policies for users table
-- This allows all users to view all user profiles (needed for leaderboards and social features)
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX USERS TABLE RLS POLICIES
-- ============================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- New policy: Users can view ALL user profiles (needed for leaderboards)
-- This allows users to:
-- 1. See other users' usernames and avatars in leaderboards
-- 2. View public profile information for social features
-- 3. Access user data needed for community features
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

-- Keep the INSERT and UPDATE policies (users can only modify their own data)
-- These policies should already exist, but verify them:
-- Policy: Users can insert their own profile
-- CREATE POLICY "Users can insert own profile" ON users
--   FOR INSERT WITH CHECK (auth.uid() = id);
--
-- Policy: Users can update their own profile
-- CREATE POLICY "Users can update own profile" ON users
--   FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- After running, check policies in Supabase:
-- Table Editor → users table → View Policies
-- 
-- You should see:
-- 1. "Users can view all profiles" - SELECT - true (allows all)
-- 2. "Users can insert own profile" - INSERT - auth.uid() = id
-- 3. "Users can update own profile" - UPDATE - auth.uid() = id
