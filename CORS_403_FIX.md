# 🔧 Fix: 403 CORS Error - Frontend URL Configuration

## ✅ The `https://` Prefix is CORRECT

**Your Railway `FRONTEND_URL` is correct:**
```
https://mvp-2-v1.vercel.app
```

The `https://` prefix is **required** and correct. The issue is likely something else.

---

## 🔍 The Real Issue

The 403 error is likely a **CORS (Cross-Origin Resource Sharing) issue**. I've updated the server code to:
1. Better handle CORS with improved logging
2. Allow requests from your Vercel domain
3. Log the exact origin being blocked (if any)

---

## ✅ Step-by-Step Fix

### Step 1: Deploy Updated Server Code

I've updated the server to have better CORS handling. Deploy it:

```bash
cd /Users/davidstouck/HerdMVP2
git add server/server.js
git commit -m "Improve CORS handling and add error logging"
git push
```

Wait for Railway to auto-redeploy (1-2 minutes).

### Step 2: Verify FRONTEND_URL in Railway

**In Railway → Your Service → Variables:**

Make sure `FRONTEND_URL` is exactly:
```
https://mvp-2-v1.vercel.app
```

**Check:**
- ✅ Has `https://` prefix (correct!)
- ✅ No trailing slash
- ✅ Matches your Vercel domain exactly

### Step 3: Check Railway Logs After Testing

After redeploying and testing again:

1. Go to Railway → Your Service → View Logs
2. Click "Connect Spotify" in your app
3. Watch the logs - you should see:
   - `💾 Save tokens request received`
   - `📡 Origin: https://mvp-2-v1.vercel.app`
   - `📡 FRONTEND_URL: https://mvp-2-v1.vercel.app`

**If you see:**
- `❌ CORS blocked origin: ...` - The origin doesn't match
- `❌ Missing required fields` - The request body is missing data

### Step 4: Test Again

After deploying the updated code:

1. Go to your Vercel app
2. Click "Connect Spotify"
3. Authorize on Spotify
4. Check Railway logs for the new debug messages
5. Should work now, or logs will show the exact issue

---

## 🔍 Alternative: Check Browser Console

If it still fails:

1. Open browser console (F12)
2. Go to "Network" tab
3. Click "Connect Spotify" and authorize
4. Look for the request to `/api/auth/spotify/save-tokens`
5. Check:
   - **Status code** (should be 200, not 403)
   - **Request headers** - check the `Origin` header
   - **Response** - see the error message

---

## 🎯 Most Likely Causes

1. **CORS origin mismatch** - The origin header doesn't match `FRONTEND_URL`
2. **Missing request data** - `userId`, `accessToken`, or `refreshToken` is missing
3. **Backend not receiving request** - Network issue

The updated code will log exactly what's happening, making it easier to debug.

---

## ✅ Summary

- ✅ `https://` prefix is **correct** (keep it!)
- ✅ Updated server code with better CORS handling
- ✅ Added logging to debug the issue
- 🔄 Deploy updated code and check logs

**Next:** Deploy the updated server code, then test and check Railway logs for the debug messages!
