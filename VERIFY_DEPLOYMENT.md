# How to Verify Code is Deployed

## 🚨 Problem: Only seeing "Supabase Config Check" log

If you're only seeing the Supabase log and nothing else, the new code likely isn't deployed yet.

## ✅ Step 1: Check Vercel Deployment

1. Go to: https://vercel.com/dashboard
2. Find your project: `MVP2-V1` or `mvp-2-v1`
3. Click on it
4. Look at the **latest deployment**
5. Check the **commit hash** - it should show `a6072e3` or later
6. Check the **status** - should be "Ready" (green)

### If deployment shows older commit:
- Wait 2-3 more minutes
- Or trigger a redeploy: Click "..." → "Redeploy"

### If deployment failed:
- Click on the failed deployment
- Check the build logs
- Look for errors

## ✅ Step 2: Hard Refresh Browser

The browser might be caching the old version:

1. **Chrome/Edge (Mac):** `Cmd + Shift + R`
2. **Chrome/Edge (Windows):** `Ctrl + Shift + F5`
3. **Or:** Open DevTools → Right-click refresh button → "Empty Cache and Hard Reload"

## ✅ Step 3: Check Console for Errors

1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. Look for **red error messages**
4. If you see errors, that's why the code isn't running!

## ✅ Step 4: Verify New Code is Live

After hard refresh, you should see (in order):

1. **🔥🔥🔥 HTML HEAD SCRIPT RUNNING 🔥🔥🔥** - Red background, very visible
2. **📄 HTML PAGE LOADED** - Orange background
3. **🚀 MAIN.JSX SCRIPT STARTING** - Purple background
4. **📦 SUPABASE.JS MODULE LOADING** - Green background
5. **Supabase Config Check** - (you're already seeing this)
6. **🚀 HERD APP SCRIPT LOADED** - Purple background
7. **🚀 HERD APP LOADING** - Blue background
8. **🔍 SPOTIFY OAUTH CALLBACK HANDLER RUNNING** - Green/yellow background

### If you only see #5 (Supabase Config Check):
- The new code isn't deployed yet
- OR there's a JavaScript error preventing React from loading
- Check the Console for red errors

## ✅ Step 5: Check Network Tab

1. Open DevTools → **Network** tab
2. Refresh the page
3. Look for `main.jsx` or `App.jsx`
4. Check if they loaded successfully (status 200)
5. If they failed (status 404/500), that's the problem

## ✅ Step 6: Verify Git Push

Run in terminal:
```bash
cd /Users/davidstouck/HerdMVP2
git log --oneline -1
```

Should show: `a6072e3 Add comprehensive logging...`

If not, the code wasn't pushed. Push it:
```bash
git push
```

## 🎯 Expected Behavior

After deployment and hard refresh:
- You should see ALL the logs listed above
- The first log should be the big red "🔥🔥🔥 HTML HEAD SCRIPT RUNNING 🔥🔥🔥"
- If you don't see that, the new code isn't live yet
