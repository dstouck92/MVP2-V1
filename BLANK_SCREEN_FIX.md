# Fixing Blank Screen Issue

## 🔍 Immediate Steps

### 1. Open Browser Developer Console

**This is the most important step!**

- **Chrome/Edge:** Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox:** Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)  
- **Safari:** Enable Developer menu, then `Cmd+Option+C`

Look at the **Console** tab for red error messages.

### 2. Common Errors & Fixes

#### Error: "Supabase credentials not found"
**Fix:** Add to your `.env` file:
```env
VITE_SUPABASE_URL=https://xescsoynfxbqrsrmoyxq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Error: "Cannot read property of null/undefined"
**Fix:** Usually means missing environment variable. Check `.env` file exists and has all required variables.

#### Error: "Failed to fetch" or CORS error
**Fix:** 
- Make sure backend is running: `cd server && npm run dev`
- Check `VITE_BACKEND_URL=http://localhost:3001` in `.env`

#### Error: "Module not found"
**Fix:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 3. Check Your .env File

Make sure you have a `.env` file (not just `env.example`) in the root directory with:

```env
VITE_SPOTIFY_CLIENT_ID=9ec86b7567a34af28e84a6f72e7590a1
VITE_SPOTIFY_CLIENT_SECRET=9941a3e3f05d4124a7000d16d9520772
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

VITE_SUPABASE_URL=https://xescsoynfxbqrsrmoyxq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

VITE_APP_URL=http://localhost:3000
VITE_BACKEND_URL=http://localhost:3001
```

**Important:** After changing `.env`, restart your dev server!

### 4. Verify Dev Server is Running

In your terminal, you should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

If not, run:
```bash
npm run dev
```

### 5. Hard Refresh Browser

Sometimes cached files cause issues:
- **Mac:** `Cmd + Shift + R`
- **Windows/Linux:** `Ctrl + Shift + R`

Or try opening in an **incognito/private window**.

## 🛠️ Quick Fixes

### Fix 1: Reinstall Dependencies
```bash
cd /Users/davidstouck/HerdMVP2
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Fix 2: Check File Structure
Make sure these files exist:
- `src/main.jsx` ✅
- `src/App.jsx` ✅
- `src/index.css` ✅
- `index.html` ✅

### Fix 3: Minimal Test
If still blank, try this minimal test. Create `src/Test.jsx`:

```jsx
export default function Test() {
  return <div>Test Works!</div>;
}
```

Then in `src/main.jsx`, change:
```jsx
import Test from './Test.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(<Test />);
```

If this shows "Test Works!", the issue is in `App.jsx`.

## 📋 What to Check

1. ✅ Browser console errors (most important!)
2. ✅ `.env` file exists and has all variables
3. ✅ Dev server is running (`npm run dev`)
4. ✅ No errors in terminal
5. ✅ Dependencies installed (`node_modules` exists)
6. ✅ Using `http://localhost:3000` (not `file://`)

## 🆘 Still Not Working?

Share with me:
1. **Browser console errors** (copy/paste or screenshot)
2. **Terminal output** from `npm run dev`
3. **What you see** (completely blank? error message? loading spinner?)

---

**Most likely cause:** Missing Supabase credentials in `.env` file. Check the browser console first!
