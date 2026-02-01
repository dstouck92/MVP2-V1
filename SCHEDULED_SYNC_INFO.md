# Scheduled Sync Implementation

## ✅ Confirmation of Requirements

### 1. No Duplicate Songs ✅
**CONFIRMED**: The unique constraint on `listening_data` table prevents duplicates:
- Constraint: `(user_id, artist_id, track_id, played_at)`
- The `upsert` operation with `onConflict` handles this automatically
- If the same song is synced again, it will update the existing record (no duplicate)

### 2. No Negative Impact ✅
**CONFIRMED**: 60-minute intervals are safe:
- **Rate Limits**: 24 syncs per user per day = well within Spotify's limits
- **Server Load**: 2-second delay between users prevents overload
- **Error Handling**: One user's failure doesn't affect others
- **Token Refresh**: Automatic token refresh prevents 401 errors
- **Database**: Upsert prevents duplicates, no data corruption risk

## 🔧 Implementation Details

### How It Works
1. **Runs every 60 minutes** automatically in the background
2. **Fetches all users** with Spotify tokens from database
3. **Syncs each user** with 2-second delay between users (rate limit protection)
4. **Handles errors gracefully** - one user's failure doesn't stop others
5. **Refreshes tokens automatically** if expired
6. **Prevents duplicates** using unique constraint

### Safety Features
- ✅ 2-second delay between users (prevents rate limits)
- ✅ Individual error handling (one failure doesn't break others)
- ✅ Automatic token refresh
- ✅ Duplicate prevention via database constraint
- ✅ Comprehensive logging

### Logging
You'll see in Railway logs:
- `🔄 Starting scheduled sync for all users...`
- `📊 Found X users with Spotify connected`
- `✅ User [id]: Synced X tracks`
- `⚠️ User [id]: [error message]` (if sync fails)
- `✅ Scheduled sync completed in Xs`

## 🧪 Testing

### Test 1: Manual Trigger
You can manually trigger a sync for testing:
```bash
curl -X POST https://mvp2-v1-production.up.railway.app/api/spotify/sync-all-users
```

### Test 2: Check Logs
1. Go to Railway dashboard
2. Check deployment logs
3. Wait for scheduled sync (or trigger manually)
4. Verify logs show successful syncs

### Test 3: Verify No Duplicates
1. Run sync twice manually
2. Check Supabase `listening_data` table
3. Count records - should not have duplicates
4. Query: `SELECT user_id, artist_id, track_id, played_at, COUNT(*) FROM listening_data GROUP BY user_id, artist_id, track_id, played_at HAVING COUNT(*) > 1;`
5. Should return 0 rows (no duplicates)

## ⚙️ Configuration

### Change Sync Interval
Edit `server/server.js`:
```javascript
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // Change 60 to desired minutes
```

### Disable Scheduled Sync
Comment out the `setInterval` line in `server/server.js`

### Run Sync on Server Start
Uncomment the line: `// syncAllUsers();` in `server/server.js`

## 📊 Expected Behavior

### With 1 User
- Sync runs every 60 minutes
- Fetches up to 50 new songs
- Updates database (no duplicates)
- Takes ~2-5 seconds

### With 10 Users
- Sync runs every 60 minutes
- Processes all 10 users sequentially
- 2-second delay between each = ~20 seconds total
- Each user gets up to 50 songs
- All handled independently

### With 100 Users
- Sync runs every 60 minutes
- Processes all 100 users sequentially
- 2-second delay between each = ~200 seconds (~3.3 minutes)
- Still well within rate limits
- All handled independently

## ⚠️ Important Notes

1. **First Sync**: Runs 60 minutes after server starts (or immediately if uncommented)
2. **Timezone**: Uses server timezone (UTC on Railway)
3. **Server Restart**: Sync schedule resets on server restart
4. **Manual Sync**: Users can still manually sync via "Sync Data" button
5. **No Conflicts**: Manual and scheduled syncs don't conflict (upsert handles it)

## 🎯 Summary

✅ **Duplicates Prevented**: Unique constraint ensures no duplicate songs
✅ **Safe Frequency**: 60 minutes is well within rate limits
✅ **Error Resilient**: One user's failure doesn't affect others
✅ **Automatic**: Runs in background, no user action needed
✅ **Scalable**: Handles any number of users efficiently
