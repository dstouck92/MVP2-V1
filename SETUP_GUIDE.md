# Herd App - Complete Setup Guide

## ✅ What's Been Built

Your Herd app is now fully set up with:
- ✅ Modern React + Vite project structure
- ✅ All UI screens and components
- ✅ Responsive design (mobile + desktop)
- ✅ Spotify OAuth integration (ready for API keys)
- ✅ Supabase configuration files
- ✅ Vercel deployment configuration
- ✅ GitHub-ready structure
- ✅ Environment variable setup

## 🔑 Required API Keys & Services

### 1. Spotify API (Required for music data)

**What you need:**
- `VITE_SPOTIFY_CLIENT_ID` - Your Spotify app Client ID
- `VITE_SPOTIFY_CLIENT_SECRET` - Your Spotify app Client Secret (for backend)
- `VITE_SPOTIFY_REDIRECT_URI` - OAuth callback URL

**How to get them:**
1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in app details:
   - App name: "Herd"
   - App description: "Music fan community app"
   - Redirect URI: `http://localhost:3000/auth/spotify/callback` (for local dev)
5. After creation, you'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "Show Client Secret" and copy this
6. Add redirect URI in app settings:
   - For local: `http://localhost:3000/auth/spotify/callback`
   - For production: `https://your-app.vercel.app/auth/spotify/callback`

**Important Notes:**
- Client Secret should NEVER be exposed in frontend code
- Token exchange must happen on your backend server
- Redirect URIs must match exactly (including http vs https)

### 2. Supabase (Required for database & auth)

**What you need:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

**How to get them:**
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Name: "Herd"
   - Database Password: (choose a strong password)
   - Region: (choose closest to you)
5. Wait for project to be created (~2 minutes)
6. Go to Project Settings > API
7. Copy:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

**Database Setup:**
After getting your keys, you'll need to create the database tables. See the SQL in `README.md` under "Supabase Database Setup" section.

### 3. Vercel (For deployment - Optional but recommended)

**What you need:**
- GitHub account (to connect repository)
- Vercel account (free tier works)

**How to set up:**
1. Push your code to GitHub (see GitHub Setup below)
2. Go to https://vercel.com
3. Sign up with GitHub
4. Click "Add New Project"
5. Import your GitHub repository
6. Vercel will auto-detect Vite configuration
7. Add environment variables (see Deployment section in README)

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd HerdMVP2
npm install
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

### Step 3: Add Your API Keys

Edit `.env` file and add:

```env
# Spotify API Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_URL=http://localhost:3000
```

### Step 4: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Run the SQL commands from `README.md` (under "Supabase Database Setup")
4. This creates:
   - `users` table
   - `listening_data` table
   - `comments` table
   - Indexes for performance

### Step 5: Test Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 6: Deploy to Vercel (Optional)

1. Push to GitHub (see GitHub Setup below)
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🚀 GitHub Setup

### Initial Setup

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Herd app setup"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/herd-app.git
git branch -M main
git push -u origin main
```

### Ongoing Development

```bash
git add .
git commit -m "Your commit message"
git push
```

## 🔐 Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Client Secret** - Must stay on backend, never in frontend
3. **Supabase RLS** - Set up Row Level Security policies in Supabase
4. **Environment Variables** - Always use `VITE_` prefix for Vite to expose them

## 📝 What's Next?

Once you have the API keys:

1. **I'm ready for your API keys** - Just provide:
   - Spotify Client ID
   - Spotify Client Secret
   - Supabase URL
   - Supabase Anon Key

2. **Backend Development** - You'll need a backend server for:
   - Spotify token exchange (OAuth callback handler)
   - Secure storage of refresh tokens
   - Data syncing from Spotify API
   - Leaderboard calculations

3. **Testing** - Test the full flow:
   - User signup/login
   - Spotify connection
   - Data fetching
   - Leaderboard display

## ❓ Questions?

If anything is unclear:
- Check the main `README.md` for detailed documentation
- Review the code comments in `src/App.jsx`
- Check Supabase and Spotify API documentation

---

**Status:** ✅ Ready for API keys input!
