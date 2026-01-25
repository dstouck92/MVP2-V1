# 🔧 Fix: .env File Location Issue

## The Problem

You have `.env` files in:
- ✅ `server/.env` - Correct for backend
- ❌ `src/.env` - **WRONG location** (Vite doesn't read from here)
- ❌ **Missing** `.env` in root directory - **This is what Vite needs!**

## ✅ The Solution

Vite looks for `.env` in the **root directory** (same folder as `package.json`), NOT in `src/`.

### Step 1: Copy Your Supabase Credentials

First, check what's in `src/.env`:
1. Open `src/.env` in your editor
2. Find these two lines:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. Copy those values (you'll need them)

### Step 2: Create .env in Root Directory

**Option A: Using Terminal (Easiest)**
```bash
cd /Users/davidstouck/HerdMVP2
cp env.example .env
```

**Option B: Manually**
1. Open `env.example` in the root directory
2. Copy all contents
3. Create a new file named `.env` (with the dot) in the root directory
4. Paste the contents

### Step 3: Add Your Supabase Credentials

Open the root `.env` file and replace:
```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

With the values from your `src/.env` file (or get them fresh from Supabase Dashboard).

### Step 4: Verify File Structure

Your file structure should look like this:
```
HerdMVP2/
├── .env                    ← NEW: Frontend env (Vite reads this)
├── env.example
├── package.json
├── vite.config.js
├── src/
│   ├── .env               ← Can delete this (wrong location)
│   └── ...
└── server/
    └── .env               ← Backend env (correct location)
```

### Step 5: Restart Dev Server

After creating the root `.env`:
1. Stop dev server: `Ctrl+C`
2. Start again: `npm run dev`
3. Hard refresh browser: `Cmd+Shift+R`

### Step 6: Verify It Works

Check browser console (F12) - you should see:
```
Supabase Config Check: {
  hasUrl: true,    ← Should be TRUE
  hasKey: true,    ← Should be TRUE
  ...
}
```

## 🗑️ Optional: Clean Up

Once the root `.env` is working, you can delete `src/.env` (it's not being used).

---

**Summary:** Create `.env` in the root directory (not in `src/`), add your Supabase credentials, and restart the dev server!
