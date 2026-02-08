# Pre-Onboarding Checklist for 20 New Users

## ⚠️ Critical Issues to Address

### 1. **Spotify App User Limit (HIGH PRIORITY)**
**Issue**: Spotify apps in Development Mode are limited to 25 users.
- **Current Status**: You mentioned you can't add more than 25 users
- **Action Required**: 
  - **Option A**: Switch to "Extended Quota Mode" in Spotify Developer Dashboard
    - Go to: Spotify Developer Dashboard → Your App → Settings
    - Click "Request Extended Quota Mode"
    - This removes the 25-user limit
  - **Option B**: Add all 20 users manually to the "Users" list in Development Mode
    - Go to: Spotify Developer Dashboard → Your App → Users
    - Add each user's Spotify email/username
- **Risk**: Users beyond the limit will get 403 errors when trying to connect

### 2. **Rate Limit Handling (MEDIUM PRIORITY)**
**Issue**: No graceful handling for Spotify API rate limits (429 errors)
- **Current Status**: 429 errors are thrown but not handled with retry logic
- **Impact**: If 20 users sync simultaneously, you might hit rate limits
- **Action Required**: 
  - Add retry logic with exponential backoff for 429 errors
  - Monitor Railway logs for rate limit errors
  - Consider increasing delay between scheduled syncs if issues occur
- **Current Protection**: 
  - ✅ 2-second delay between users in scheduled sync
  - ✅ 60-minute sync interval (safe frequency)

### 3. **Manual Sync Rate Limits (LOW-MEDIUM PRIORITY)**
**Issue**: If multiple users click "Sync Data" at the same time, no rate limiting
- **Current Status**: Each manual sync is independent
- **Impact**: 20 users syncing simultaneously could hit rate limits
- **Action Required**: 
  - Monitor for 429 errors in first few days
  - Consider adding a queue system if issues occur
  - Educate users to space out manual syncs

### 4. **Error Messages for Users (LOW PRIORITY)**
**Issue**: Some errors may not be user-friendly
- **Current Status**: Basic error handling exists
- **Action Required**: 
  - Test error scenarios (expired tokens, rate limits, network issues)
  - Ensure error messages are clear and actionable

## ✅ What's Already Working Well

### 1. **Database Constraints**
- ✅ Unique constraint on `listening_data` prevents duplicates
- ✅ Upsert operations work correctly
- ✅ No risk of duplicate songs

### 2. **Scheduled Sync**
- ✅ Runs every 60 minutes automatically
- ✅ 2-second delay between users (rate limit protection)
- ✅ Handles token refresh automatically
- ✅ Logs success/failure for monitoring

### 3. **RLS Policies**
- ✅ Users can view all listening data (for leaderboards)
- ✅ Users can view all profiles (for leaderboards)
- ✅ Users can only insert their own data

### 4. **Token Management**
- ✅ Automatic token refresh on 401 errors
- ✅ Tokens stored securely in database
- ✅ Handles expired tokens gracefully

## 📋 Pre-Onboarding Actions

### Before Adding Users:

1. **Verify Spotify App Settings**
   - [ ] Check if app is in Development Mode or Extended Quota Mode
   - [ ] If Development Mode: Add all 20 users to the "Users" list
   - [ ] Verify redirect URI matches production URL exactly

2. **Test Scheduled Sync**
   - [ ] Check Railway logs to confirm scheduled sync is running
   - [ ] Visit: `https://mvp2-v1-production.up.railway.app/api/spotify/sync-status`
   - [ ] Verify last sync time is recent

3. **Database Verification**
   - [ ] Run `create-analytics-table.sql` in Supabase (if not done)
   - [ ] Verify unique constraint exists on `listening_data` table
   - [ ] Check RLS policies are correct

4. **Environment Variables**
   - [ ] Verify all Railway environment variables are set correctly
   - [ ] Verify all Vercel environment variables are set correctly
   - [ ] Test OAuth flow end-to-end

5. **Monitor Setup**
   - [ ] Set up Railway log monitoring
   - [ ] Check Vercel deployment is up to date
   - [ ] Verify backend health endpoint works

## 🚨 Potential Issues During Onboarding

### Issue 1: Users Can't Connect Spotify
**Symptoms**: 403 errors, "user may not be registered"
**Solution**: Add user to Spotify app's "Users" list or switch to Extended Quota Mode

### Issue 2: Rate Limit Errors
**Symptoms**: 429 errors in logs, sync failures
**Solution**: 
- Increase delay between scheduled syncs
- Add retry logic with exponential backoff
- Educate users to avoid simultaneous manual syncs

### Issue 3: No Data Appearing
**Symptoms**: Users connect but see no listening data
**Solution**:
- Check if scheduled sync is running
- Verify user has played music recently (last 50 songs)
- Check Railway logs for sync errors

### Issue 4: Duplicate Data
**Symptoms**: Same songs appearing multiple times
**Solution**: Verify unique constraint exists (should already be fixed)

## 📊 Monitoring Checklist

### First 24 Hours:
- [ ] Monitor Railway logs for errors
- [ ] Check sync status endpoint every few hours
- [ ] Verify data is populating in Supabase
- [ ] Check for any 429 rate limit errors
- [ ] Monitor user-reported issues

### First Week:
- [ ] Review analytics dashboard for user engagement
- [ ] Check leaderboard data is accurate
- [ ] Verify scheduled sync is working for all users
- [ ] Monitor for any performance issues

## 🔧 Quick Fixes if Issues Arise

### If Rate Limits Hit:
1. Increase delay in scheduled sync from 2s to 5s
2. Add retry logic with exponential backoff
3. Consider reducing sync frequency to every 90 minutes

### If Users Can't Connect:
1. Check Spotify app user list
2. Verify redirect URI matches exactly
3. Check Railway logs for specific error messages

### If Data Not Syncing:
1. Check scheduled sync status endpoint
2. Review Railway logs for sync errors
3. Verify tokens are valid (not expired)
4. Check if users have recent listening history

## ✅ Recommended Actions Before Onboarding

1. **Switch to Extended Quota Mode** (if possible) - removes user limit
2. **Add retry logic for 429 errors** - improves resilience
3. **Test with 2-3 users first** - validate before full rollout
4. **Set up monitoring alerts** - catch issues early
5. **Prepare user onboarding guide** - help users connect Spotify

---

**Status**: Most critical systems are in place. Main concern is Spotify app user limits and rate limit handling.
