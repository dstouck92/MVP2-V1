# Spotify API Rate Limits & Data Collection

## 📊 Current Implementation

Your app currently:
- Fetches **50 songs** per sync (limit of `/me/player/recently-played` endpoint)
- Syncs **manually** when user clicks "Sync Data" button
- Syncs **automatically** once after connecting Spotify

## 🔍 Spotify API Rate Limits

Based on Spotify's official documentation:

### General Rate Limits
- **Rate Limit**: Not publicly documented with exact numbers
- **Typical Behavior**: Spotify uses a **sliding window** rate limiting system
- **Common Practice**: Most apps can make **hundreds of requests per hour** without issues
- **Best Practice**: Space out requests by at least **1-2 seconds** between calls

### Recently Played Endpoint Specifics
- **Endpoint**: `GET /v1/me/player/recently-played`
- **Limit Parameter**: Max 50 songs per request
- **Time Window**: Returns songs from the **last ~50 songs played** (not a time range)
- **No Official Rate Limit**: Spotify doesn't publish exact limits for this endpoint

### Important Notes
1. **50 Song Limit**: The endpoint only returns the last 50 songs, regardless of how long ago they were played
2. **No Pagination**: You cannot fetch older songs beyond the 50 most recent
3. **Real-time Data**: The endpoint reflects what's in the user's "Recently Played" queue

## 🧪 How to Test Rate Limits

### Test 1: Rapid Sync Test
1. Click "Sync Data" button
2. Wait 1 second
3. Click "Sync Data" again
4. Repeat 10-20 times quickly
5. **Watch for**: 429 (Too Many Requests) errors in console/network tab

### Test 2: Frequency Test
1. Set up automatic sync every 5 minutes
2. Monitor for 24 hours
3. **Watch for**: Any 429 errors or rate limit warnings

### Test 3: Multiple Users Test
1. Have multiple users sync simultaneously
2. **Watch for**: Rate limits affecting all users vs per-user limits

## 📈 Recommended Sync Strategy

### Option 1: Manual Sync Only (Current)
- ✅ User controls when to sync
- ✅ No rate limit concerns
- ❌ Requires user action

### Option 2: Scheduled Sync
- Sync every **15-30 minutes** automatically
- ✅ Keeps data fresh
- ✅ Unlikely to hit rate limits
- ⚠️ Requires backend cron job or scheduled function

### Option 3: Smart Sync
- Sync on app open (if last sync > 1 hour ago)
- Sync after user plays music (webhook - requires Spotify Premium API)
- ✅ Most efficient
- ⚠️ More complex implementation

## 🔬 Testing Your Current Setup

### Check Network Tab
1. Open Chrome DevTools → Network tab
2. Click "Sync Data"
3. Look for the request to `/api/spotify/sync-listening-data`
4. Check response headers for rate limit info:
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining`
   - `X-RateLimit-Reset`

### Check Backend Logs
1. Go to Railway dashboard
2. Check deployment logs
3. Look for any 429 errors or rate limit warnings

### Database Check
1. Go to Supabase → Table Editor → `listening_data`
2. Count total records
3. Check `created_at` timestamps
4. See if new records are added on each sync

## ⚠️ What Happens If You Hit Rate Limits?

If you exceed rate limits:
- **HTTP 429**: "Too Many Requests"
- **Response**: Usually includes `Retry-After` header (seconds to wait)
- **Solution**: Implement exponential backoff retry logic

## 💡 Recommendations

1. **Current Setup is Safe**: Manual sync is unlikely to hit rate limits
2. **If Adding Auto-Sync**: Use intervals of 15+ minutes
3. **Monitor First**: Test with your usage patterns before implementing auto-sync
4. **Add Rate Limit Handling**: Implement retry logic with exponential backoff

## 📝 Next Steps

1. **Test Current Limits**: Run the tests above to see actual behavior
2. **Monitor Usage**: Track how many syncs happen per day
3. **Implement Auto-Sync** (optional): If desired, add scheduled sync with 15-30 min intervals
4. **Add Rate Limit Handling**: Implement proper error handling for 429 responses
