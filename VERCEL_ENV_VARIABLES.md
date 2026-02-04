# 🔑 Vercel Environment Variables

Add these environment variables in Vercel: **Project Settings → Environment Variables**

## 📋 Complete List

### 1. Spotify Configuration

| Key | Value |
|-----|-------|
| `VITE_SPOTIFY_CLIENT_ID` | `9ec86b7567a34af28e84a6f72e7590a1` |
| `VITE_SPOTIFY_CLIENT_SECRET` | `9941a3e3f05d4124a7000d16d9520772` |
| `VITE_SPOTIFY_REDIRECT_URI` | `https://YOUR-VERCEL-URL.vercel.app/auth/spotify/callback` |

**⚠️ Replace `YOUR-VERCEL-URL` with your actual Vercel URL** (e.g., `mvp2-v1.vercel.app`)

---

### 2. Supabase Configuration

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://YOUR-SUPABASE-PROJECT-ID.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `YOUR-SUPABASE-ANON-KEY` |

**📝 How to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

---

### 3. App Configuration

| Key | Value |
|-----|-------|
| `VITE_APP_URL` | `https://YOUR-VERCEL-URL.vercel.app` |
| `VITE_BACKEND_URL` | `https://YOUR-BACKEND-URL.railway.app` |

**⚠️ Notes:**
- `VITE_APP_URL`: Replace with your actual Vercel URL
- `VITE_BACKEND_URL`: Replace with your Railway/Render URL (you'll get this after deploying backend)

---

## 🎯 Step-by-Step in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** (gear icon)
3. Click **Environment Variables** in the left sidebar
4. Click **Add New**
5. For each variable:
   - Enter the **Key** (exactly as shown above)
   - Enter the **Value** (replace placeholders with your actual values)
   - Select **Production**, **Preview**, and **Development** (or just **Production** for now)
   - Click **Save**

---

## 📝 Example (After You Have All URLs)

Once you have your Vercel URL (e.g., `mvp2-v1.vercel.app`) and backend URL (e.g., `herd-backend.railway.app`), your variables will look like:

| Key | Value |
|-----|-------|
| `VITE_SPOTIFY_CLIENT_ID` | `9ec86b7567a34af28e84a6f72e7590a1` |
| `VITE_SPOTIFY_CLIENT_SECRET` | `9941a3e3f05d4124a7000d16d9520772` |
| `VITE_SPOTIFY_REDIRECT_URI` | `https://mvp2-v1.vercel.app/auth/spotify/callback` |
| `VITE_SUPABASE_URL` | `https://xescsoynfxbqrsrmoyxq.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_APP_URL` | `https://mvp2-v1.vercel.app` |
| `VITE_BACKEND_URL` | `https://herd-backend.railway.app` |

---

## ⚠️ Important Notes

1. **VITE_SPOTIFY_REDIRECT_URI**: Must match your Vercel URL exactly (use `https://`, not `http://`)
2. **VITE_BACKEND_URL**: You can add a placeholder now, then update it after deploying the backend
3. **All variables must start with `VITE_`** - this is required for Vite to expose them to the frontend
4. **After adding variables**: Go to **Deployments** tab and click **Redeploy** on the latest deployment

---

## ✅ Quick Copy-Paste Format

For easy copy-pasting into Vercel:

```
VITE_SPOTIFY_CLIENT_ID=9ec86b7567a34af28e84a6f72e7590a1
VITE_SPOTIFY_CLIENT_SECRET=9941a3e3f05d4124a7000d16d9520772
VITE_SPOTIFY_REDIRECT_URI=https://YOUR-VERCEL-URL.vercel.app/auth/spotify/callback
VITE_SUPABASE_URL=https://YOUR-SUPABASE-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-SUPABASE-ANON-KEY
VITE_APP_URL=https://YOUR-VERCEL-URL.vercel.app
VITE_BACKEND_URL=https://YOUR-BACKEND-URL.railway.app
```

**Remember to replace the placeholders with your actual values!**
