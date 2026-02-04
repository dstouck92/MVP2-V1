# Analytics Tracking Setup Guide

## ✅ What Was Implemented

Analytics tracking has been added to your Herd app to track user engagement with the following events:

1. **App Visits** - When users load/visit the app
2. **Leaderboard Views** - When users view an artist leaderboard
3. **Artist Searches** - When users search for artists
4. **Sync Data Clicks** - When users click the "Sync Data" button

## 📋 Setup Steps

### Step 1: Create the Analytics Table in Supabase

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `create-analytics-table.sql`
4. Click **"Run"**

This will create:
- `analytics` table to store all tracking events
- Indexes for performance
- Row Level Security policies (users can track their own events, all users can view analytics)

### Step 2: Deploy the Code

The code has already been committed. You need to:

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Wait for Vercel to deploy** (automatic after push)

3. **Verify deployment** - Check that the new code is live

## 📊 How to View Analytics

### Access the Analytics Dashboard

1. **Log into your app**
2. **Go to your Profile screen**
3. **Click the "📊 Analytics" button** in the header
4. **Click "Refresh Analytics"** to load the latest data

### What You'll See

The analytics dashboard shows:

**Event Counts (Last 30 Days):**
- Total App Visits
- Total Leaderboard Views
- Total Artist Searches
- Total Sync Data Clicks

**Unique Users (Last 30 Days):**
- How many unique users visited the app
- How many unique users viewed leaderboards
- How many unique users searched for artists
- How many unique users synced data

## 🔍 How It Works

### Automatic Tracking

The app automatically tracks events in the background:

- **App Visit**: Tracked when a user's profile loads (in `loadUserData`)
- **Leaderboard View**: Tracked when a leaderboard is loaded (in `loadLeaderboard`)
- **Artist Search**: Tracked when a user searches for an artist (in `searchArtists`)
- **Sync Data**: Tracked when the "Sync Data" button is clicked

### Event Data Stored

Each event includes:
- `user_id`: Which user performed the action
- `event_type`: Type of event (app_visit, leaderboard_view, artist_search, sync_data)
- `event_data`: Additional context (JSON):
  - **leaderboard_view**: `artist_id`, `artist_name`, `time_filter`
  - **artist_search**: `search_query`, `results_count`
  - **sync_data**: `synced_count`, `token_refreshed`
  - **app_visit**: `screen`
- `created_at`: Timestamp of the event

## 📈 Advanced Analytics (Optional)

You can query the analytics table directly in Supabase for more detailed insights:

### Example Queries

**Most viewed leaderboards:**
```sql
SELECT 
  event_data->>'artist_name' as artist_name,
  COUNT(*) as view_count
FROM analytics
WHERE event_type = 'leaderboard_view'
GROUP BY event_data->>'artist_name'
ORDER BY view_count DESC
LIMIT 10;
```

**User activity timeline:**
```sql
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as count
FROM analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_type;
```

**Most active users:**
```sql
SELECT 
  user_id,
  COUNT(*) as total_events
FROM analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_events DESC
LIMIT 10;
```

## 🔒 Privacy & Security

- Users can only **insert** their own analytics events
- All users can **view** all analytics (for the dashboard)
- No sensitive data is tracked (only user actions)
- All tracking happens client-side (no server-side tracking)

## 🐛 Troubleshooting

### Analytics not showing up?

1. **Check if the table exists:**
   - Go to Supabase → Table Editor
   - Look for `analytics` table

2. **Check RLS policies:**
   - Go to Supabase → Table Editor → `analytics` → View Policies
   - Should see: "Users can insert own analytics" and "Users can view all analytics"

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for any analytics-related errors

4. **Verify tracking is working:**
   - Perform an action (search, view leaderboard, etc.)
   - Check Supabase → Table Editor → `analytics` table
   - You should see new rows appearing

### Dashboard not loading?

1. **Make sure you're logged in**
2. **Click "Refresh Analytics" button**
3. **Check browser console for errors**
4. **Verify you have data in the analytics table**

## 📝 Next Steps

After setup, you can:

1. **Monitor user engagement** - See which features are most used
2. **Track growth** - Monitor unique users over time
3. **Identify popular artists** - See which leaderboards are viewed most
4. **Optimize features** - Focus on features users engage with most

## 🎯 Future Enhancements (Optional)

You could extend this to track:
- Time spent on each screen
- Most searched artists
- Leaderboard views by time period
- User retention metrics
- Feature adoption rates

---

**Need help?** Check the Supabase logs or browser console for any errors.
