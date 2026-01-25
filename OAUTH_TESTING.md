# Spotify OAuth Flow Testing Guide

## ✅ Setup Complete

Your backend is configured and ready to test!

## 🧪 Testing Steps

### Step 1: Start Both Servers

**Terminal 1 - Backend Server:**
```bash
cd server
npm install  # If not done yet
npm run dev
```

You should see:
```
🚀 Herd backend server running on http://localhost:3001
📡 Frontend URL: http://localhost:3000
🎵 Spotify Client ID: ✅ Set
🗄️  Supabase URL: ✅ Set
```

**Terminal 2 - Frontend:**
```bash
# In root directory
npm run dev
```

Frontend should run on `http://localhost:3000`

### Step 2: Update Spotify Redirect URI

**Important:** Update your Spotify app's redirect URI:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Click "Edit Settings"
4. Under "Redirect URIs", add:
   ```
   http://localhost:3001/api/auth/spotify/callback
   ```
5. Click "Add"
6. Click "Save"

**Note:** The redirect URI points to your **backend server** (port 3001), not the frontend!

### Step 3: Add Backend URL to Frontend .env

Add this to your root `.env` file:
```env
VITE_BACKEND_URL=http://localhost:3001
```

Then restart your frontend dev server.

### Step 4: Test the OAuth Flow

1. **Open the app:** `http://localhost:3000`

2. **Sign up or log in:**
   - Create an account or log in with existing credentials
   - You'll be taken to the profile screen

3. **Connect Spotify:**
   - Click "Connect Spotify" button (or go to Spotify Connect screen)
   - You'll be redirected to Spotify authorization page
   - Log in with your Spotify account
   - Click "Agree" to authorize the app

4. **OAuth Callback:**
   - Spotify redirects back to your backend
   - Backend exchanges code for tokens
   - Backend redirects to frontend with tokens
   - Frontend saves tokens to Supabase
   - You should see your profile with Spotify connected

## 🔍 Expected Flow

```
User clicks "Connect Spotify"
  ↓
Frontend → Backend: GET /api/auth/spotify
  ↓
Backend → Spotify: Redirect to authorization
  ↓
User authorizes on Spotify
  ↓
Spotify → Backend: GET /api/auth/spotify/callback?code=...
  ↓
Backend exchanges code for tokens
  ↓
Backend → Frontend: Redirect with tokens
  ↓
Frontend saves tokens to Supabase
  ↓
Profile shows Spotify connected ✅
```

## 🐛 Troubleshooting

### "Invalid redirect URI"
- **Fix:** Make sure redirect URI in Spotify Dashboard is exactly:
  `http://localhost:3001/api/auth/spotify/callback`
- Check for typos, trailing slashes, http vs https

### "CORS error"
- **Fix:** Check `FRONTEND_URL` in `server/.env` matches your frontend URL
- Should be: `FRONTEND_URL=http://localhost:3000`

### "Cannot connect to backend"
- **Fix:** Make sure backend server is running on port 3001
- Check `VITE_BACKEND_URL` in frontend `.env` file

### "Tokens not saving"
- **Fix:** Check browser console for errors
- Verify Supabase service role key is correct
- Check backend logs for errors

### "User not logged in" error
- **Fix:** Make sure you're logged into the app before connecting Spotify
- The OAuth flow requires an authenticated user

## ✅ Success Indicators

When OAuth works correctly, you should see:

1. ✅ Redirect to Spotify authorization page
2. ✅ After authorization, redirect back to app
3. ✅ No error messages
4. ✅ Profile shows "Spotify connected" (no banner)
5. ✅ Tokens saved in Supabase `users` table
6. ✅ Can sync listening data (next step)

## 📝 Next Steps After OAuth Works

Once OAuth is working:

1. **Sync Listening Data:**
   - Add button to sync recent listening history
   - Backend endpoint: `POST /api/spotify/sync-listening-data`

2. **Display Real Stats:**
   - Stats will populate from synced data
   - Top artists will show real data

3. **Test Leaderboards:**
   - Search for artists
   - View top listeners

---

**Ready to test?** Start both servers and follow the steps above!
