# How to Check Browser Console (Not Cursor Console)

## ⚠️ Important: Use Browser Console, Not Cursor Console

The console in Cursor is different from your browser's console. You need to check the **browser console** (Chrome/Firefox DevTools) to see the OAuth callback logs.

## 📋 Step-by-Step Instructions

### 1. Open Your App in Browser
- Go to: `https://mvp-2-v1.vercel.app`
- Make sure you're logged in

### 2. Open Browser DevTools Console

**On Mac:**
- **Chrome/Edge:** Press `Cmd + Option + J` (or `Cmd + Shift + J`)
- **Firefox:** Press `Cmd + Option + K` (or `Cmd + Shift + K`)
- **Safari:** Press `Cmd + Option + C` (enable Developer menu first)

**On Windows:**
- **Chrome/Edge:** Press `F12` or `Ctrl + Shift + J`
- **Firefox:** Press `F12` or `Ctrl + Shift + K`

**Alternative Method:**
- Right-click anywhere on the page
- Select "Inspect" or "Inspect Element"
- Click the "Console" tab

### 3. What You Should See

When the page loads, you should see:
```
Supabase Config Check: {hasUrl: true, hasKey: true, ...}
🔍 SPOTIFY OAUTH CALLBACK HANDLER RUNNING
==========================================
```

### 4. Test Spotify Connection

1. Click "Connect Spotify"
2. Authorize on Spotify
3. **Watch the console** - you should see logs like:
   - `✅ SPOTIFY TOKENS RECEIVED!`
   - `📋 Session check attempt 1: User logged in (user-id)`
   - `💾 Saving Spotify tokens...`
   - `✅ Spotify tokens saved, redirecting to profile`

## 🔍 What to Look For

### If You See "SPOTIFY TOKENS RECEIVED!"
✅ The OAuth callback is working!

### If You See "No session found"
❌ The session isn't being restored. This is the issue we're fixing.

### If You Don't See Any Logs
❌ The code might not be deployed yet, or the useEffect isn't running.

## 🚀 Make Sure Code is Deployed

Before testing, make sure your latest changes are pushed:

```bash
cd /Users/davidstouck/HerdMVP2
git status
git push  # If there are uncommitted changes
```

Then wait 1-2 minutes for Vercel to redeploy.

## 📸 Share Console Logs

When testing, copy ALL console logs (especially after clicking "Connect Spotify") and share them. This will help identify exactly where the flow is breaking.

---

**Remember:** Always check the **browser console**, not Cursor's console!
