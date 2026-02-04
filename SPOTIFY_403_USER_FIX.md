# 🔧 Fix: Spotify 403 "User may not be registered" Error

## 🐛 The Problem

The token exchange **succeeds**, but then you get a 403 error when trying to get user info. The error message:
> "Check settings on developer.spotify.com/dashboard, the user may not be registered."

This means your Spotify app is in **"Development Mode"** and the user needs to be added to the app's user list.

---

## ✅ Step-by-Step Fix

### Option 1: Add User to Spotify App (Quick Fix)

If your app is in Development Mode:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app
3. Go to **"Users and Access"** or **"Edit Settings"**
4. Under **"Users"** section, click **"Add User"**
5. Enter your Spotify email address (the one you use to log into Spotify)
6. Click **"Add"**
7. **Save** the settings

Now try connecting Spotify again - it should work!

### Option 2: Switch to Extended Quota Mode (For Production)

If you want to allow any user to connect (not just added users):

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app
3. Click **"Edit Settings"**
4. Look for **"App Mode"** or **"Quota Mode"**
5. Switch from **"Development Mode"** to **"Extended Quota Mode"**
6. **Save** the settings

**Note:** Extended Quota Mode has higher rate limits and allows any user to connect.

---

## 🔍 What's Happening

Your logs show:
1. ✅ Token exchange successful (got access token)
2. ❌ Failed to get user info (403 error)
3. Error: "User may not be registered"

This happens because:
- Spotify apps in Development Mode can only be used by users you explicitly add
- The token exchange works (Spotify gives you tokens)
- But when you try to access user data, Spotify checks if the user is registered
- If not registered → 403 error

---

## ✅ I've Updated the Code

I've updated the server code to:
1. Handle the user info fetch error gracefully
2. Still proceed with saving tokens even if user info fails
3. Add better logging to see exactly where it fails

**Deploy the updated code:**
```bash
cd /Users/davidstouck/HerdMVP2
git add server/server.js
git commit -m "Handle Spotify user info fetch errors gracefully"
git push
```

---

## 🎯 Recommended Solution

**For now (quick fix):**
- Add your Spotify email to the app's user list (Option 1)

**For production (better):**
- Switch to Extended Quota Mode (Option 2)
- This allows any user to connect without being added manually

---

## 📋 Summary

- **Problem:** Spotify app in Development Mode, user not registered
- **Quick Fix:** Add your email to the app's user list
- **Better Fix:** Switch to Extended Quota Mode
- **Code Update:** Handles errors gracefully, still saves tokens

**Next:** Add your email to the Spotify app's user list, then test again!
