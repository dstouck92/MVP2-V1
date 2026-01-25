# Quick Start Guide - Get Herd Running

## 🚀 Step 1: Start the Frontend (Terminal 1)

Open a terminal and run:

```bash
cd /Users/davidstouck/HerdMVP2
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**✅ Success:** You should see the Herd app at `http://localhost:3000` (not the README)

---

## 🔧 Step 2: Start the Backend (Terminal 2)

Open a **second terminal window** and run:

```bash
cd /Users/davidstouck/HerdMVP2/server
npm run dev
```

**Expected output:**
```
🚀 Herd backend server running on http://localhost:3001
📡 Frontend URL: http://localhost:3000
🎵 Spotify Client ID: ✅ Set
🗄️  Supabase URL: ✅ Set
```

**✅ Success:** Backend is running on port 3001

---

## 🎯 Step 3: Test Locally First

### A. Update Frontend .env

Make sure your root `.env` file has:
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xescsoynfxbqrsrmoyxq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### B. Update Spotify Redirect URI (for local testing)

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app
3. Click "Edit Settings"
4. Under "Redirect URIs", add:
   ```
   http://localhost:3001/api/auth/spotify/callback
   ```
5. Click "Add" then "Save"

### C. Test the App

1. Open `http://localhost:3000` in your browser
2. You should see the Herd welcome screen (not README!)
3. Sign up or log in
4. Try connecting Spotify

---

## 🌐 Step 4: Deploy to Vercel (After Local Testing Works)

Once everything works locally, deploy:

### A. Push to GitHub

```bash
cd /Users/davidstouck/HerdMVP2
git init
git add .
git commit -m "Initial commit: Herd app"
git remote add origin your-github-repo-url
git push -u origin main
```

### B. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your GitHub repo
5. Vercel auto-detects Vite - click "Deploy"
6. Add environment variables in Vercel:
   - `VITE_SPOTIFY_CLIENT_ID`
   - `VITE_SPOTIFY_CLIENT_SECRET`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BACKEND_URL` (your backend URL - see below)

### C. Deploy Backend (Railway/Render/Vercel Functions)

**Option 1: Railway (Easiest)**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Set root directory to `/server`
5. Add environment variables from `server/.env`
6. Deploy!

**Option 2: Render**
1. Go to [render.com](https://render.com)
2. New Web Service
3. Connect GitHub repo
4. Set root directory to `server`
5. Add environment variables
6. Deploy!

### D. Update Spotify Redirect URI for Production

After backend is deployed, update Spotify:
```
https://your-backend-url.railway.app/api/auth/spotify/callback
```

### E. Update Frontend Environment Variables

In Vercel, update:
- `VITE_BACKEND_URL` = your deployed backend URL

---

## ✅ Checklist

### Local Development
- [ ] Frontend runs on `http://localhost:3000`
- [ ] Backend runs on `http://localhost:3001`
- [ ] Can sign up/login
- [ ] Can connect Spotify
- [ ] Data saves to Supabase

### Production Deployment
- [ ] Code pushed to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Render)
- [ ] Environment variables set
- [ ] Spotify redirect URI updated
- [ ] Test production OAuth flow

---

## 🐛 Troubleshooting

### "Seeing README instead of app"
- **Fix:** Make sure `npm run dev` is running
- Check terminal for errors
- Try `http://localhost:3000` (not file://)

### "Cannot connect to backend"
- **Fix:** Make sure backend is running on port 3001
- Check `VITE_BACKEND_URL` in `.env`

### "OAuth redirect error"
- **Fix:** Check redirect URI matches exactly in Spotify Dashboard
- Must be: `http://localhost:3001/api/auth/spotify/callback` (for local)

---

**Next:** Start with Step 1 - get the frontend running locally first!
