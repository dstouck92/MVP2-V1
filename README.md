# Herd - Music Fan Community App

**Tagline:** Prove you're the Goat

A responsive React web application for music super-fans to track their Spotify listening data, compete on artist leaderboards, and connect with other fans.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Spotify Developer Account (for API keys)
- Supabase Account (for database and authentication)

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd HerdMVP2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API keys (see Configuration section below).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🔑 Configuration

### Required API Keys

You'll need to set up the following in your `.env` file:

#### 1. Spotify API Keys

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add a redirect URI: `http://localhost:3000/auth/spotify/callback` (for local development)
4. Copy your **Client ID** and **Client Secret**
5. Add them to `.env`:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback
   ```

**Note:** For production, update the redirect URI in both Spotify Dashboard and your `.env` file to match your deployed URL.

#### 2. Supabase Configuration

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to Project Settings > API
3. Copy your **Project URL** and **anon/public key**
4. Add them to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Supabase Database Setup

You'll need to create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT DEFAULT '🦌',
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  spotify_user_id TEXT,
  member_since TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Listening Data Table
```sql
CREATE TABLE listening_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  played_at TIMESTAMP NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listening_data_user_id ON listening_data(user_id);
CREATE INDEX idx_listening_data_artist_id ON listening_data(artist_id);
CREATE INDEX idx_listening_data_played_at ON listening_data(played_at);
```

#### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) <= 200),
  likes UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_artist_id ON comments(artist_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

#### Leaderboard View (Optional - for performance)
```sql
CREATE VIEW artist_leaderboard AS
SELECT 
  artist_id,
  artist_name,
  user_id,
  COUNT(*) as total_streams,
  SUM(duration_ms) / 60000 as total_minutes
FROM listening_data
GROUP BY artist_id, artist_name, user_id;
```

## 🚢 Deployment

### Vercel Deployment

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Add Environment Variables:**
   - In Vercel project settings, go to Environment Variables
   - Add all variables from your `.env` file:
     - `VITE_SPOTIFY_CLIENT_ID`
     - `VITE_SPOTIFY_CLIENT_SECRET`
     - `VITE_SPOTIFY_REDIRECT_URI` (use your Vercel deployment URL)
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_APP_URL` (your Vercel deployment URL)

4. **Update Spotify Redirect URI:**
   - Go back to Spotify Developer Dashboard
   - Add your Vercel URL: `https://your-app.vercel.app/auth/spotify/callback`

5. **Deploy:**
   - Vercel will automatically deploy on every push to main
   - Or trigger a manual deployment from the dashboard

### GitHub Setup

1. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a new repository on GitHub:**
   - Go to GitHub and create a new repository
   - Don't initialize with README (you already have one)

3. **Connect and push:**
   ```bash
   git remote add origin https://github.com/yourusername/herd-app.git
   git branch -M main
   git push -u origin main
   ```

## 📁 Project Structure

```
HerdMVP2/
├── src/
│   ├── App.jsx          # Main app component
│   ├── App.css          # App styles
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles
│   └── lib/
│       ├── supabase.js  # Supabase client configuration
│       └── spotify.js   # Spotify API helpers
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── vercel.json          # Vercel deployment config
├── .env.example         # Environment variables template
└── README.md            # This file
```

## 🎨 Features

- ✅ Responsive design (desktop + mobile)
- ✅ User authentication (ready for Supabase integration)
- ✅ Spotify OAuth connection (UI ready)
- ✅ Profile with listening stats
- ✅ Artist leaderboards
- ✅ Fan comments system
- ✅ Avatar selection
- ✅ Time period filtering
- ✅ Search functionality (UI ready)

## 🔧 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Lucide React** - Icons
- **Supabase** - Database and authentication
- **Spotify Web API** - Music data
- **Vercel** - Hosting and deployment

## 📝 Next Steps

1. **Backend API** - Set up server-side endpoints for:
   - Spotify token exchange (never expose client secret in frontend)
   - User authentication
   - Data syncing from Spotify
   - Leaderboard calculations

2. **Real-time Features** - Implement:
   - Live leaderboard updates
   - Real-time comments
   - User presence

3. **Enhanced Features**:
   - User profiles viewing
   - Follow/unfollow users
   - Notifications
   - Social sharing

## 🐛 Troubleshooting

### Spotify OAuth not working
- Check that redirect URI matches exactly in Spotify Dashboard
- Ensure `VITE_SPOTIFY_CLIENT_ID` is set correctly
- Token exchange must happen on backend (client secret should never be in frontend)

### Supabase connection issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Ensure RLS (Row Level Security) policies are set up correctly

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `node_modules` and reinstall if needed

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using React, Vite, Supabase, and Spotify API
