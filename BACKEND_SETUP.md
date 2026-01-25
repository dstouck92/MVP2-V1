# Backend Setup Guide - Spotify OAuth

## ✅ Step 1: Database Setup Complete

Your Supabase database tables are created! ✅

## 🚀 Step 2: Backend Server Setup

### Quick Start

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Get Supabase Service Role Key:**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the **service_role** key (NOT the anon key!)
   - This key has full database access - keep it secret!

5. **Configure `.env` file:**
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   
   SPOTIFY_CLIENT_ID=9ec86b7567a34af28e84a6f72e7590a1
   SPOTIFY_CLIENT_SECRET=9941a3e3f05d4124a7000d16d9520772
   SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback
   
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

6. **Update Spotify Redirect URI:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Edit your app
   - Add redirect URI: `http://localhost:3001/api/auth/spotify/callback`
   - Save changes

7. **Start the server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   🚀 Herd backend server running on http://localhost:3001
   📡 Frontend URL: http://localhost:3000
   🎵 Spotify Client ID: ✅ Set
   🗄️  Supabase URL: ✅ Set
   ```

## 📋 What the Backend Does

1. **OAuth Flow:**
   - Handles Spotify authorization redirect
   - Exchanges authorization code for access/refresh tokens
   - Stores tokens securely in Supabase

2. **Token Management:**
   - Refreshes expired access tokens
   - Securely stores tokens (never exposed to frontend)

3. **Data Syncing:**
   - Syncs listening history from Spotify
   - Stores in Supabase `listening_data` table

4. **API Proxy:**
   - Proxies Spotify API requests (keeps tokens server-side)
   - Prevents exposing tokens in frontend

## 🔄 OAuth Flow

```
1. User clicks "Connect Spotify" in frontend
   ↓
2. Frontend redirects to: http://localhost:3001/api/auth/spotify
   ↓
3. Backend redirects to Spotify authorization
   ↓
4. User authorizes on Spotify
   ↓
5. Spotify redirects to: http://localhost:3001/api/auth/spotify/callback?code=...
   ↓
6. Backend exchanges code for tokens
   ↓
7. Backend redirects to frontend with tokens
   ↓
8. Frontend saves tokens to Supabase via API
```

## ⚠️ Important Notes

1. **Service Role Key:**
   - Use the **service_role** key (not anon key)
   - This bypasses Row Level Security
   - Keep it secret - never commit to git!

2. **Redirect URI:**
   - Must match exactly in Spotify Dashboard
   - Use `http://localhost:3001/api/auth/spotify/callback` for local dev
   - Update for production deployment

3. **CORS:**
   - Backend allows requests from `FRONTEND_URL`
   - Update this for production

## 🧪 Testing

1. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test OAuth flow:**
   - Start both frontend (`npm run dev` in root) and backend (`npm run dev` in server)
   - Click "Connect Spotify" in the app
   - Should redirect through OAuth flow

## 🐛 Troubleshooting

### "Cannot find module"
- Run `npm install` in the server directory

### "CORS error"
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Ensure backend is running on port 3001

### "Invalid redirect URI"
- Check redirect URI in Spotify Dashboard matches exactly
- Should be: `http://localhost:3001/api/auth/spotify/callback`

### "Service role key error"
- Make sure you copied the **service_role** key (not anon key)
- Key should be very long and start with `eyJ...`

## ✅ Next Steps

Once backend is running:
1. ✅ Backend server running on port 3001
2. ✅ Spotify OAuth configured
3. ✅ Supabase service role key set
4. ⏭️ Update frontend to use backend endpoints
5. ⏭️ Test full OAuth flow

---

**Ready to proceed?** Let me know when the backend server is running and I'll help integrate it with the frontend!
