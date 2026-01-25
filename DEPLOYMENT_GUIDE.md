# 🚀 Deployment Guide: Herd App to Vercel + Backend Hosting

This guide will help you deploy your Herd app to production. You can deploy first, then add the production redirect URL to Spotify.

## 📋 Overview

- **Frontend:** Deploy to Vercel (free, easy)
- **Backend:** Deploy to Railway or Render (free tier available)
- **Database:** Already on Supabase (no deployment needed)

---

## 🎯 Step 1: Push Code to GitHub

First, let's get your code on GitHub:

### A. Initialize Git (if not already done)

```bash
cd /Users/davidstouck/HerdMVP2

# Check if git is initialized
git status

# If not initialized, run:
git init
```

### B. Create .gitignore (if needed)

Make sure `.gitignore` includes:
```
node_modules/
.env
.env.local
dist/
.DS_Store
```

### C. Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **"New repository"**
3. Name it: `herd-app` (or any name you prefer)
4. **Don't** check "Initialize with README" (you already have files)
5. Click **"Create repository"**

### D. Push Your Code

```bash
cd /Users/davidstouck/HerdMVP2

# Add all files
git add .

# Commit
git commit -m "Initial commit: Herd MVP app"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/herd-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**✅ Success:** Your code is now on GitHub!

---

## 🌐 Step 2: Deploy Frontend to Vercel

### A. Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with **GitHub** (recommended)
3. Click **"Add New Project"**
4. Import your `herd-app` repository
5. Vercel will auto-detect it's a Vite project
6. Click **"Deploy"** (don't change settings yet)

### B. Add Environment Variables

After first deployment, go to **Project Settings → Environment Variables** and add:

```
VITE_SPOTIFY_CLIENT_ID=9ec86b7567a34af28e84a6f72e7590a1
VITE_SPOTIFY_CLIENT_SECRET=9941a3e3f05d4124a7000d16d9520772
VITE_SPOTIFY_REDIRECT_URI=https://your-app.vercel.app/auth/spotify/callback
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_APP_URL=https://your-app.vercel.app
VITE_BACKEND_URL=https://your-backend-url.railway.app
```

**⚠️ Important:** Replace `your-app.vercel.app` with your actual Vercel URL (you'll get this after first deploy).

### C. Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

**✅ Success:** Frontend is live! Note your Vercel URL (e.g., `herd-app.vercel.app`)

---

## 🔧 Step 3: Deploy Backend to Railway (Recommended)

Railway is the easiest option for Node.js backends.

### A. Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with **GitHub** (recommended)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `herd-app` repository

### B. Configure Backend Deployment

1. Railway will detect your repo
2. Click **"Add Service"** → **"GitHub Repo"**
3. Select your repository
4. In **Settings**, set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node server.js`)

### C. Add Environment Variables

Go to **Variables** tab and add all from `server/.env`:

```
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
SPOTIFY_CLIENT_ID=9ec86b7567a34af28e84a6f72e7590a1
SPOTIFY_CLIENT_SECRET=9941a3e3f05d4124a7000d16d9520772
SPOTIFY_REDIRECT_URI=https://your-backend-url.railway.app/api/auth/spotify/callback
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Important:** 
- Replace `your-app.vercel.app` with your actual Vercel URL
- Replace `your-backend-url.railway.app` with Railway's generated URL (you'll get this after deploy)
- Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Project Settings → API

### D. Deploy

1. Railway will automatically deploy
2. Wait for deployment to complete
3. Note your Railway URL (e.g., `herd-backend.railway.app`)

**✅ Success:** Backend is live! Note your Railway URL.

---

## 🔄 Step 4: Update All URLs

### A. Update Vercel Environment Variables

Go back to Vercel → Project Settings → Environment Variables:

1. Update `VITE_BACKEND_URL` to your Railway URL:
   ```
   VITE_BACKEND_URL=https://your-backend-url.railway.app
   ```

2. Update `VITE_SPOTIFY_REDIRECT_URI`:
   ```
   VITE_SPOTIFY_REDIRECT_URI=https://your-app.vercel.app/auth/spotify/callback
   ```

3. Redeploy frontend

### B. Update Railway Environment Variables

Go back to Railway → Variables:

1. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

2. Update `SPOTIFY_REDIRECT_URI` to your Railway callback:
   ```
   SPOTIFY_REDIRECT_URI=https://your-backend-url.railway.app/api/auth/spotify/callback
   ```

3. Railway will auto-redeploy

---

## 🎵 Step 5: Update Spotify Redirect URI

Now you can add the production redirect URI to Spotify:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app
3. Click **"Edit Settings"**
4. Under **"Redirect URIs"**, add:
   ```
   https://your-backend-url.railway.app/api/auth/spotify/callback
   ```
5. Click **"Add"** then **"Save"**

**✅ Success:** Spotify is configured for production!

---

## ✅ Step 6: Test Production

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Sign up/Log in
3. Click "Connect Spotify"
4. Authorize the app
5. You should be redirected back and see your profile!

---

## 🐛 Troubleshooting

### Backend not responding?

1. **Check Railway logs:**
   - Go to Railway → Your service → Logs
   - Look for errors

2. **Check environment variables:**
   - Make sure all variables are set correctly
   - No typos in URLs

3. **Check CORS:**
   - Backend `FRONTEND_URL` must match your Vercel URL exactly

### Frontend can't connect to backend?

1. **Check `VITE_BACKEND_URL`:**
   - Must be your Railway URL (not localhost)
   - Must start with `https://`

2. **Check backend is running:**
   - Visit `https://your-backend-url.railway.app` in browser
   - Should see some response (even if it's an error)

### Spotify OAuth not working?

1. **Check redirect URI:**
   - Must match exactly: `https://your-backend-url.railway.app/api/auth/spotify/callback`
   - No trailing slashes
   - Must be `https://` not `http://`

2. **Check backend logs:**
   - Railway → Logs
   - Look for OAuth errors

---

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Railway
- [ ] Spotify redirect URI updated
- [ ] Test signup/login in production
- [ ] Test Spotify connection in production

---

## 🎉 You're Done!

Your app is now live in production! Users can:
- Sign up and log in
- Connect their Spotify accounts
- See their listening stats
- Compete on leaderboards

**Next Steps:**
- Share your app URL with friends!
- Monitor usage in Vercel and Railway dashboards
- Set up custom domain (optional)

---

## 🔄 Alternative: Render (Instead of Railway)

If you prefer Render:

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. New → Web Service
4. Connect your GitHub repo
5. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables (same as Railway)
7. Deploy!

Render gives you a free tier with automatic HTTPS.
