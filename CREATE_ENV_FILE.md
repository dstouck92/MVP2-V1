# ⚠️ CRITICAL: Create Your .env File

## The Problem

You've been editing `env.example`, but Vite needs a file named **`.env`** (with a dot at the start).

The `.env` file has been created for you, but you need to add your **real Supabase credentials**.

## ✅ Step-by-Step Fix

### Step 1: Open the .env File

The `.env` file is now in your project root:
```
/Users/davidstouck/HerdMVP2/.env
```

**Important:** This file might be hidden in some file explorers. If you can't see it:
- In VS Code/Cursor: Use `Cmd+Shift+P` → "Open File" → type `.env`
- In Finder: Press `Cmd+Shift+.` to show hidden files

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon) → **API**
4. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Update .env File

Replace these two lines in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

With your actual values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.your-actual-key-here
```

**Example:**
```env
VITE_SUPABASE_URL=https://xescsoynfxbqrsrmoyxq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhlc2Nzb3luZnhicXJzcm1veXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MjAyNTU3NTk5OX0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Save the File

Make sure to save the `.env` file after updating.

### Step 5: Restart Dev Server

**CRITICAL:** After creating/updating `.env`, you MUST restart:

1. Stop the dev server:
   - Go to terminal where `npm run dev` is running
   - Press `Ctrl+C`

2. Start it again:
   ```bash
   npm run dev
   ```

3. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Step 6: Verify It Works

Open browser console (F12) and look for:

```
Supabase Config Check: {
  hasUrl: true,    ← Should be true
  hasKey: true,    ← Should be true
  ...
}
```

If you see `hasUrl: true` and `hasKey: true`, you're good to go! 🎉

## 🔍 Troubleshooting

### Still seeing "hasUrl: false"?

1. **Check file name:** Must be `.env` (not `env.example`)
2. **Check location:** Must be in `/Users/davidstouck/HerdMVP2/.env`
3. **Check values:** Make sure you replaced the placeholders with real values
4. **Restart server:** Always restart after changing `.env`
5. **No quotes:** Don't put quotes around the values

### File is hidden?

- **VS Code/Cursor:** File should appear in the file explorer
- **Terminal:** Use `ls -la` to see hidden files
- **Finder (Mac):** Press `Cmd+Shift+.` to show hidden files

---

**Next:** Update `.env` with your real Supabase credentials, then restart the dev server!
