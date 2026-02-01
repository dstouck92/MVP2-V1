# How to Check if Scheduled Sync is Working

## 🔍 Quick Check: Sync Status Endpoint

Visit this URL to see sync status:
```
https://mvp2-v1-production.up.railway.app/api/spotify/sync-status
```

This will show:
- ✅ When last sync ran
- ✅ How many users were processed
- ✅ How many tracks were synced
- ✅ Any errors
- ✅ When next sync will run

## 📋 What to Look For

### ✅ Healthy Sync Status
```json
{
  "scheduledSyncEnabled": true,
  "interval": "60 minutes",
  "lastSync": {
    "runTime": "2026-02-01T04:30:00.000Z",
    "timeAgo": "15 minutes ago",
    "success": true,
    "usersProcessed": 1,
    "tracksSynced": 12,
    "successCount": 1,
    "failCount": 0
  }
}
```

### ❌ Problem Indicators
- `lastSync.runTime` is null → Sync hasn't run yet
- `lastSync.success` is false → Last sync failed
- `lastSync.failCount` > 0 → Some users failed to sync
- `timeAgo` is > 70 minutes → Sync may not be running

## 🔬 Check Railway Logs

1. Go to Railway dashboard
2. Click on your service
3. Go to "Deployments" → Latest deployment → "Logs"
4. Look for these messages:

### ✅ Good Signs
- `⏰ Scheduled sync triggered at [timestamp]`
- `🔄 Starting scheduled sync for all users...`
- `📊 Found X users with Spotify connected`
- `✅ User [id]: Synced X tracks`
- `✅ Scheduled sync completed in Xs`

### ❌ Problem Signs
- `❌ Scheduled sync error:`
- `⚠️ User [id]: [error message]`
- No sync messages at all

## 🧪 Manual Test

Trigger a manual sync to test:
```bash
curl -X POST https://mvp2-v1-production.up.railway.app/api/spotify/sync-all-users
```

Then check:
1. Railway logs for sync activity
2. Sync status endpoint for results
3. Your database for new records

## 📊 Database Verification

### Check Recent Syncs
```sql
-- In Supabase SQL Editor
SELECT 
  user_id,
  COUNT(*) as total_tracks,
  MAX(created_at) as last_sync_time
FROM listening_data
GROUP BY user_id
ORDER BY last_sync_time DESC;
```

### Check for Missing Songs
```sql
-- See when songs were last added
SELECT 
  played_at,
  track_name,
  artist_name,
  created_at
FROM listening_data
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 50;
```

## ⚠️ Why Songs Might Be Missing

### 1. Spotify Recently Played Limit
- **Only returns last 50 songs** (not all-time history)
- If you played 100 songs, only the most recent 50 are available
- **Solution**: Sync more frequently (but we're already at 60 min)

### 2. Songs Played Before First Sync
- Songs played before you connected Spotify won't be in the database
- Spotify only tracks "recently played" going forward
- **This is expected behavior**

### 3. Sync Timing
- If you played a song 61 minutes ago, it might have been in the "recently played" queue
- But if you sync every 60 minutes, you might miss songs that drop out of the queue
- **Solution**: Sync more frequently (30 min) or manually sync after listening

### 4. Multiple Devices
- If you play on phone, then sync from web app, timing matters
- The "recently played" queue updates in real-time
- **Solution**: Sync more frequently

### 5. Database Issues
- Check if songs are actually being inserted
- Check for errors in Railway logs
- **Solution**: Check sync status endpoint

## 💡 Recommendations

### If Songs Are Missing:

1. **Check Sync Status**: Visit `/api/spotify/sync-status` endpoint
2. **Check Logs**: Look for errors in Railway logs
3. **Manual Sync**: Trigger manual sync and watch logs
4. **Database Check**: Verify records are being inserted
5. **Frequency**: Consider syncing every 30 minutes instead of 60

### To Increase Sync Frequency:

Edit `server/server.js`:
```javascript
const SYNC_INTERVAL_MS = 30 * 60 * 1000; // Change 60 to 30 for 30 minutes
```

## 🎯 Expected Behavior

- **Every 60 minutes**: Sync runs automatically
- **Fetches**: Up to 50 most recent songs per user
- **Inserts**: New songs only (duplicates prevented)
- **Updates**: User profiles and leaderboards automatically

If you're missing songs, it's likely because:
1. They were played more than 50 songs ago
2. They were played before first sync
3. Sync hasn't run yet (check status endpoint)
