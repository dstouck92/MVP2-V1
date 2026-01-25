# Troubleshooting Blank Screen

## 🔍 Step 1: Check Browser Console

**Most Important:** Open your browser's Developer Console to see errors:

1. **Chrome/Edge:** Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. **Firefox:** Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
3. **Safari:** Enable Developer menu first, then `Cmd+Option+C`

Look for **red error messages** in the Console tab. Common errors:

- `Cannot read property 'X' of null` - Missing environment variable
- `Failed to fetch` - Backend not running or CORS issue
- `Module not found` - Missing dependency
- `Uncaught Error` - JavaScript error

## 🔧 Step 2: Check Environment Variables

Make sure your `.env` file exists in the root directory and has:

```env
VITE_SUPABASE_URL=https://xescsoynfxbqrsrmoyxq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_BACKEND_URL=http://localhost:3001
```

**Important:** 
- File must be named `.env` (not `env.example`)
- Must be in root directory (`/Users/davidstouck/HerdMVP2/.env`)
- Restart dev server after changing `.env`

## 🚀 Step 3: Verify Dev Server is Running

Check your terminal where you ran `npm run dev`. You should see:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

If you see errors, fix them first.

## 🐛 Common Issues & Fixes

### Issue 1: "Supabase not configured" warning
**Fix:** Add Supabase credentials to `.env` file

### Issue 2: Blank screen with no console errors
**Fix:** 
1. Hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Try incognito/private window

### Issue 3: "Cannot connect to backend"
**Fix:** 
1. Make sure backend is running: `cd server && npm run dev`
2. Check `VITE_BACKEND_URL` in `.env`

### Issue 4: React errors in console
**Fix:**
1. Check if all dependencies installed: `npm install`
2. Delete `node_modules` and reinstall: 
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Issue 5: Port 3000 already in use
**Fix:**
1. Find process using port: `lsof -ti:3000`
2. Kill it: `kill -9 $(lsof -ti:3000)`
3. Or change port in `vite.config.js`

## ✅ Quick Diagnostic Commands

Run these to check your setup:

```bash
# Check if .env exists
ls -la .env

# Check if dependencies installed
ls node_modules

# Check if dev server process is running
lsof -ti:3000

# Check Node version (should be 18+)
node --version
```

## 📋 What to Share for Help

If still having issues, share:

1. **Browser console errors** (screenshot or copy/paste)
2. **Terminal output** from `npm run dev`
3. **Environment check:**
   ```bash
   echo "Node: $(node --version)"
   echo "NPM: $(npm --version)"
   ls -la .env
   ```

## 🎯 Expected Behavior

When working correctly:
- Browser shows Herd welcome screen with goat emoji
- No errors in browser console
- Terminal shows "VITE ready" message
- Can navigate between screens

---

**Next:** Check your browser console first - that will tell us exactly what's wrong!
