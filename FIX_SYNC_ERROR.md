# Fix: "No unique constraint matching ON CONFLICT" Error

## 🚨 Problem

When clicking "Sync Data", you get this error:
```
there is no unique or exclusion constraint matching the ON CONFLICT specification
```

## ✅ Solution

The `listening_data` table is missing a unique constraint. Add it by running this SQL in Supabase:

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase project: https://supabase.com/dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run This SQL

Copy and paste this into the SQL editor:

```sql
-- Add unique constraint to prevent duplicate listening events
ALTER TABLE listening_data
ADD CONSTRAINT listening_data_unique_event 
UNIQUE (user_id, artist_id, track_id, played_at);
```

### Step 3: Execute

1. Click **Run** (or press `Cmd+Enter` / `Ctrl+Enter`)
2. You should see: "Success. No rows returned"

### Step 4: Test

1. Go back to your app
2. Click **"Sync Data"** button
3. The error should be gone and data should sync! ✅

## 🎯 What This Does

This adds a unique constraint that prevents the same song from being recorded twice for the same user at the same time. This allows the sync function to:
- Skip duplicates automatically
- Update existing records if needed
- Work without errors

## 📋 Alternative: If Constraint Already Exists

If you get an error saying the constraint already exists, that's fine - it means it's already set up. Just try syncing again.

## ✅ Verification

After running the SQL:
- The sync should work without errors
- Your listening stats should populate
- Top artists should appear
- You can sync multiple times without duplicates
