# OAuth Debugging Steps

## 🚨 CRITICAL: Push Code First

The code has been committed but needs to be pushed. Run this in your terminal:

```bash
cd /Users/davidstouck/HerdMVP2
git push
```

Then wait 2-3 minutes for Vercel to deploy.

---

## ✅ What You Should See After Deployment

### On Initial Page Load (any page):
1. **📄 HTML PAGE LOADED** - Yellow background
2. **🚀 MAIN.JSX SCRIPT STARTING** - Purple background  
3. **🚀 HERD APP SCRIPT LOADED** - Purple background
4. **🚀 HERD APP LOADING** - Blue background
5. **🔍 SPOTIFY OAUTH CALLBACK HANDLER RUNNING** - Green/yellow background
6. **Supabase Config Check** - (you're already seeing this)

### After Spotify OAuth Redirect:
When you click "Connect Spotify" → Authorize → Get redirected back, you should see:
1. All the above logs (page reload)
2. **✅ SPOTIFY TOKENS RECEIVED!** - Green background
3. **🔍 Checking localStorage for Supabase session...**
4. **📋 Session check attempt 1/8:** - Multiple attempts
5. Either success or failure messages

---

## 🔍 How to Test Properly

### Step 1: Open Browser Console
1. Open Chrome (not Cursor's browser)
2. Go to: `https://mvp-2-v1.vercel.app`
3. Press `F12` or `Cmd+Option+I` (Mac) to open DevTools
4. Click the **Console** tab
5. **Clear the console** (trash icon or `Cmd+K`)

### Step 2: Check Initial Load
- Refresh the page (`Cmd+R` or `F5`)
- You should see ALL the logs listed above
- If you only see "Supabase Config Check", the new code isn't deployed yet

### Step 3: Test OAuth Flow
1. **Keep the console open** (don't close it)
2. Log in to your app
3. Click "Connect Spotify"
4. **Watch the console** - you'll see logs as you're redirected
5. Authorize on Spotify
6. **When redirected back** - THIS IS THE CRITICAL MOMENT
   - The console should show the OAuth callback logs
   - Look for "✅ SPOTIFY TOKENS RECEIVED!"
   - Look for session check attempts

### Step 4: Check for Errors
- Look for any **red error messages** in the console
- If you see "❌ FATAL ERROR" or "❌ JAVASCRIPT ERROR", that's the problem
- Share those errors with me

---

## 🐛 If Logs Still Don't Appear

### Check 1: Is Code Deployed?
1. Go to Vercel dashboard
2. Check the latest deployment
3. Verify it shows commit `a6072e3` or later
4. If not, wait a few more minutes or trigger a redeploy

### Check 2: Hard Refresh
- Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
- This clears cache and forces a fresh load

### Check 3: Check Console Filters
- In Chrome DevTools Console, make sure:
  - "All levels" is selected (not just "Errors")
  - No text filters are active
  - "Preserve log" is checked (so logs don't clear on redirect)

### Check 4: Check Network Tab
- In DevTools, go to **Network** tab
- Look for failed requests (red)
- Look for `main.jsx` or `App.jsx` - are they loading?

---

## 📋 What to Share With Me

After testing, share:
1. **All console logs** from the OAuth redirect (copy/paste)
2. **Any red error messages**
3. **Screenshot of the console** (if possible)
4. **The exact URL** you're redirected to after Spotify (check the address bar)

---

## 🎯 Expected Behavior

After successful OAuth:
- You should be redirected to: `https://mvp-2-v1.vercel.app/auth/spotify/success?access_token=...&refresh_token=...`
- Console should show tokens received
- Console should show session found
- You should be redirected to the **profile screen** (not login screen)

If you're redirected to login screen instead, the session check is failing - that's what we're debugging!
