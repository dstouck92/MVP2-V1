# 🔧 Fix: Spotify 403 Forbidden Error

## 🐛 The Problem

"Request failed with status code 403" typically means:
1. **CORS issue** - Frontend URL doesn't match Railway's `FRONTEND_URL`
2. **Missing/incorrect FRONTEND_URL** in Railway environment variables
3. **Backend rejecting the request** due to CORS policy

---

## ✅ Step-by-Step Fix

### Step 1: Verify FRONTEND_URL in Railway

**In Railway → Your Service → Variables:**

Check `FRONTEND_URL` is set to your **exact Vercel URL**:

```
https://mvp-2-v1.vercel.app
```

**Critical checks:**
- ✅ Must match your Vercel URL **exactly** (character for character)
- ✅ No trailing slash
- ✅ `https://` not `http://`
- ✅ Check for typos (especially hyphens vs underscores)

**Common mistakes:**
- ❌ `https://mvp-2-v1.vercel.app/` (trailing slash)
- ❌ `http://mvp-2-v1.vercel.app` (http instead of https)
- ❌ `https://mvp_2_v1.vercel.app` (underscores instead of hyphens)

### Step 2: Get Your Exact Vercel URL

1. Go to Vercel Dashboard → Your Project
2. Check the **"Domains"** section
3. Copy the **exact** production domain
4. It should be something like: `mvp-2-v1.vercel.app` or `mvp2-v1.vercel.app`

**Make sure Railway `FRONTEND_URL` matches this exactly!**

### Step 3: Update CORS to Allow Your Vercel URL

The backend CORS is configured to only allow requests from `FRONTEND_URL`. If it doesn't match exactly, you'll get 403.

**In Railway Variables:**
- Set `FRONTEND_URL` to your exact Vercel URL
- Double-check for any typos

### Step 4: Redeploy Railway

After updating `FRONTEND_URL`:

1. Go to Railway → Your Service
2. Click **"Deployments"**
3. Click **"Redeploy"** on latest deployment
4. Wait for deployment to complete

### Step 5: Test Again

1. Go to your Vercel app
2. Click "Connect Spotify"
3. Authorize on Spotify
4. Should redirect back and save tokens successfully

---

## 🔍 Alternative: Check Railway Logs

After clicking "Connect Spotify" and getting the 403:

1. Go to Railway → Your Service → View Logs
2. Look for CORS errors or 403 responses
3. Check what `FRONTEND_URL` the server is using

You should see logs showing the CORS origin being checked.

---

## 🎯 Most Likely Cause

**99% of the time, it's `FRONTEND_URL` mismatch.**

The backend CORS only allows requests from the exact `FRONTEND_URL`. If your Vercel URL is `https://mvp-2-v1.vercel.app` but Railway has `https://mvp2-v1.vercel.app` (missing hyphen), you'll get 403.

---

## ✅ Verification Checklist

Before testing again:

- [ ] Get your exact Vercel URL from Vercel Dashboard
- [ ] Railway `FRONTEND_URL` matches Vercel URL exactly (no trailing slash, correct protocol)
- [ ] Railway redeployed after updating `FRONTEND_URL`
- [ ] No typos in the URL (check hyphens, underscores, etc.)

---

**Next:** Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly, then test again!
