-- Fix Row Level Security Policies for Signup
-- Run this in Supabase SQL Editor if signup is failing

-- ============================================
-- FIX USERS TABLE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Policy: Users can insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- After running, check policies in Supabase:
-- Table Editor → users table → View Policies
