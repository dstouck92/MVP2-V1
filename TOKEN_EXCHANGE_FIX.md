# 🔧 Fix: "token_exchange_failed" Error

## 🐛 The Problem

"token_exchange_failed" means:
- ✅ OAuth redirect to Spotify works
- ✅ User authorizes successfully
- ✅ Spotify redirects back with authorization code
- ❌ **Token exchange fails** when backend tries to get access token

This is **almost always** a **redirect URI mismatch**.

---

## 🔍 Root Cause

The `redirect_uri` used in the **token exchange** must match **exactly**:
1. The `redirect_uri` used in the **authorization request**
2. The `redirect_uri` registered in **Spotify Dashboard**

If they don't match exactly, Spotify rejects the token exchange with an error.

---

## ✅ Step-by-Step Fix

### Step 1: Verify SPOTIFY_REDIRECT_URI in Railway

**In Railway → Your Service → Variables:**

Check `SPOTIFY_REDIRECT_URI` is set to:
```
https://mvp2-v1-production.up.railway.app/api/auth/spotify/callback
```

**Critical checks:**
- ✅ Must be the **backend URL** (Railway), not frontend
- ✅ Full path: `/api/auth/spotify/callback`
- ✅ No trailing slash
- ✅ `https://` not `http://`

### Step 2: Verify Spotify Dashboard Redirect URI

**In Spotify Developer Dashboard:**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app
3. Click **"Edit Settings"**
4. Under **"Redirect URIs"**, it must be **exactly**:
   ```
   https://mvp2-v1-production.up.railway.app/api/auth/spotify/callback
   ```

**Must match Railway `SPOTIFY_REDIRECT_URI` exactly!**

### Step 3: Deploy Updated Code with Better Logging

I've added detailed logging to help debug. Deploy it:

```bash
cd /Users/davidstouck/HerdMVP2
git add server/server.js
git commit -m "Add detailed logging for token exchange debugging"
git push
```

Wait for Railway to auto-redeploy (1-2 minutes).

### Step 4: Check Railway Logs

After redeploying and testing again:

1. Go to Railway → Your Service → View Logs
2. Click "Connect Spotify" in your app
3. Authorize on Spotify
4. **Watch the logs** - you should see:
   - `🔄 Exchanging authorization code for tokens...`
   - `📡 Redirect URI: https://mvp2-v1-production.up.railway.app/api/auth/spotify/callback`
   - `✅ Token exchange successful` (if it works)
   - OR `❌ Spotify OAuth token exchange failed` with error details

**The logs will show the exact error from Spotify!**

### Step 5: Fix Based on Logs

The logs will show:
- **What redirect_uri is being used**
- **The exact Spotify error** (e.g., "invalid_grant", "redirect_uri_mismatch")
- **Error description** from Spotify

Use this to fix the issue.

---

## 🎯 Most Common Issues

### Issue 1: Redirect URI Mismatch

**Symptom:** `redirect_uri_mismatch` error in logs  
**Fix:** Make sure all three match exactly:
- Railway `SPOTIFY_REDIRECT_URI`
- Spotify Dashboard redirect URI
- What's sent in the token exchange request

### Issue 2: Client Secret Wrong

**Symptom:** `invalid_client` error in logs  
**Fix:** 
- Get fresh client secret from Spotify Dashboard
- Update in Railway (make sure it's plain text, not `${{ secret(...) }}`)
- Redeploy

### Issue 3: Authorization Code Already Used

**Symptom:** `invalid_grant` error  
**Fix:** 
- Authorization codes can only be used once
- Try the OAuth flow again from the beginning

---

## ✅ Verification Checklist

Before testing again:

- [ ] Railway `SPOTIFY_REDIRECT_URI` = `https://mvp2-v1-production.up.railway.app/api/auth/spotify/callback`
- [ ] Spotify Dashboard redirect URI matches exactly
- [ ] No trailing slashes
- [ ] `https://` not `http://`
- [ ] Updated code deployed with better logging
- [ ] Ready to check Railway logs for specific error

---

## 📋 Summary

- **Problem:** Token exchange failing (redirect URI mismatch most likely)
- **Solution:** Ensure redirect URI matches in all three places
- **Next:** Deploy updated code, test, and check Railway logs for specific error

**The logs will now show the exact Spotify error, making it easy to fix!**

---

**Next:** Deploy the updated code, then test and check Railway logs for the specific error message from Spotify.
