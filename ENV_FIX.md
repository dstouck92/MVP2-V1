# Fix "Supabase not configured" Error

## 🔍 The Problem

The error "Supabase not configured" means your `.env` file either:
1. Doesn't exist
2. Has wrong variable names (missing `VITE_` prefix)
3. Has placeholder values instead of real credentials
4. Dev server wasn't restarted after adding variables

## ✅ Step-by-Step Fix

### Step 1: Verify .env File Exists

Your `.env` file should be in:
```
/Users/davidstouck/HerdMVP2/.env
```

**Important:** 
- File name is `.env` (starts with a dot, no extension)
- NOT `env.example` (that's just a template)
- Must be in the root directory (same folder as `package.json`)

### Step 2: Check .env File Contents

Open your `.env` file and verify it has **real values** (not placeholders):

```env
# Spotify API Configuration
VITE_SPOTIFY_CLIENT_ID=9ec86b7567a34af28e84a6f72e7590a1
VITE_SPOTIFY_CLIENT_SECRET=9941a3e3f05d4124a7000d16d9520772
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# Supabase Configuration
VITE_SUPABASE_URL=https://xescsoynfxbqrsrmoyxq.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# App Configuration
VITE_APP_URL=http://localhost:3000
VITE_BACKEND_URL=http://localhost:3001
```

**Check:**
- ✅ All variables start with `VITE_`
- ✅ `VITE_SUPABASE_URL` has your actual Supabase URL (not "your_supabase_project_url_here")
- ✅ `VITE_SUPABASE_ANON_KEY` has your actual anon key (not "your_supabase_anon_key_here")

### Step 3: Get Your Supabase Anon Key

If you don't have the anon key:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** (gear icon) → **API**
4. Under **Project API keys**, find **anon public**
5. Click the eye icon to reveal it
6. Copy the entire key (it's very long, starts with `eyJ...`)
7. Paste it into your `.env` file

### Step 4: Restart Dev Server

**CRITICAL:** After changing `.env`, you MUST restart the dev server:

1. Stop the current dev server:
   - Go to terminal where `npm run dev` is running
   - Press `Ctrl+C` to stop it

2. Start it again:
   ```bash
   npm run dev
   ```

3. Refresh your browser (hard refresh: `Cmd+Shift+R`)

### Step 5: Verify in Browser Console

After restarting, check browser console (F12). You should see:

```
Supabase Config Check: {
  hasUrl: true,
  hasKey: true,
  urlPreview: "https://xescsoynfxbqrsrmoyxq...",
  keyPreview: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

If you see `hasUrl: false` or `hasKey: false`, the variables aren't being read.

## 🐛 Troubleshooting

### Still seeing "Supabase not configured"?

1. **Check file name:** Must be `.env` (with dot at start)
2. **Check location:** Must be in root directory (`/Users/davidstouck/HerdMVP2/.env`)
3. **Check format:** No spaces around `=`, no quotes needed
4. **Restart server:** Always restart after changing `.env`
5. **Check console:** Look for the "Supabase Config Check" message

### Variables have "your_xxx_here" placeholders?

Replace them with your actual values from Supabase Dashboard.

### File doesn't exist?

Create it:
1. In root directory, create new file named `.env`
2. Copy contents from `env.example`
3. Replace placeholder values with real ones
4. Save and restart dev server

## ✅ Success Indicators

After fixing, you should see:
- ✅ No "Supabase not configured" error
- ✅ Console shows "Supabase Config Check" with `hasUrl: true, hasKey: true`
- ✅ Signup/login works
- ✅ No red errors in console

---

**Next:** Update your `.env` file with real Supabase credentials, then restart the dev server!
