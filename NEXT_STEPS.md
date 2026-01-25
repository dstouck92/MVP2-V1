# 🎯 Next Steps: Connect Spotify

Great! You're logged in and seeing your profile page. Now let's connect Spotify to start tracking your listening data.

## ✅ Prerequisites Check

Before connecting Spotify, make sure:

1. **Frontend is running** ✅ (You're seeing the profile page)
2. **Backend server is running** ⚠️ (Need to check/start this)

## 🚀 Step 1: Start the Backend Server

The Spotify OAuth flow requires the backend server to be running.

**Open a NEW terminal window** and run:

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

## 🎵 Step 2: Update Spotify Redirect URI

**Important:** You need to add the backend callback URL to your Spotify app settings.

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app (the one with Client ID: `9ec86b7567a34af28e84a6f72e7590a1`)
3. Click **"Edit Settings"**
4. Under **"Redirect URIs"**, add:
   ```
   http://localhost:3001/api/auth/spotify/callback
   ```
5. Click **"Add"**
6. Click **"Save"**

**⚠️ Important:** The redirect URI points to your **backend server** (port 3001), NOT the frontend!

---

## 🔗 Step 3: Connect Spotify in the App

1. **On your profile page**, you should see a banner that says:
   > "Connect Spotify to see your listening stats"
   
   With a **"Connect"** button.

2. **Click the "Connect" button** (or navigate to the Spotify Connect screen)

3. **You'll be redirected to Spotify:**
   - Log in with your Spotify account
   - Review the permissions requested
   - Click **"Agree"** to authorize

4. **After authorization:**
   - Spotify redirects back to your app
   - Your tokens are saved securely
   - You'll see your profile with Spotify connected

---

## ✅ Step 4: Verify Connection

After connecting, you should see:

- ✅ The "Connect Spotify" banner disappears
- ✅ Your listening stats start to appear (may take a moment to sync)
- ✅ Top artists section populates with your data
- ✅ Stats cards show your total minutes and songs

---

## 🐛 Troubleshooting

### "Failed to connect" error?

1. **Check backend is running:**
   - Go to `http://localhost:3001` in your browser
   - Should see a response (even if it's an error page)

2. **Check Spotify redirect URI:**
   - Make sure `http://localhost:3001/api/auth/spotify/callback` is added in Spotify Dashboard
   - Must match exactly (including `http://` not `https://`)

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for error messages
   - Share any red errors you see

### Backend won't start?

1. **Check server/.env exists:**
   ```bash
   cd /Users/davidstouck/HerdMVP2/server
   ls -la .env
   ```

2. **Verify server/.env has all required variables:**
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL`

3. **Check for errors in terminal:**
   - Look for any error messages when starting the server

---

## 📋 Quick Checklist

- [ ] Backend server running on port 3001
- [ ] Spotify redirect URI added: `http://localhost:3001/api/auth/spotify/callback`
- [ ] Clicked "Connect" button on profile page
- [ ] Authorized app in Spotify
- [ ] See profile with Spotify connected

---

**Ready?** Start with Step 1 (starting the backend server) and work through each step!
