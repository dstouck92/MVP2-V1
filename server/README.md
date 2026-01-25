# Herd Backend Server

Backend server for handling Spotify OAuth and API proxy requests.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` and add:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Spotify (same as frontend)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# Supabase (use SERVICE ROLE KEY, not anon key!)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** Use the **Service Role Key** from Supabase (not the anon key). This allows the backend to bypass Row Level Security.

### 4. Get Supabase Service Role Key

1. Go to your Supabase project dashboard
2. Project Settings → API
3. Copy the **service_role** key (keep this secret!)

### 5. Update Spotify Redirect URI

The redirect URI should point to your **backend server**, not the frontend:

```
http://localhost:3001/api/auth/spotify/callback
```

Update this in:
- Spotify Developer Dashboard
- Your `.env` file

### 6. Run the Server

```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### OAuth Flow

1. **GET `/api/auth/spotify`** - Redirects to Spotify authorization
2. **GET `/api/auth/spotify/callback`** - Handles OAuth callback
3. **POST `/api/auth/spotify/save-tokens`** - Saves tokens to Supabase

### Spotify API Proxy

- **POST `/api/spotify/refresh-token`** - Refresh access token
- **POST `/api/spotify/sync-listening-data`** - Sync listening history
- **GET `/api/spotify/top-artists`** - Get user's top artists

### Health Check

- **GET `/api/health`** - Server health check

## Security Notes

⚠️ **Never commit `.env` file to git!**

- Service Role Key has full database access
- Client Secret must stay on server
- Use environment variables in production
- Enable HTTPS in production

## Production Deployment

For production (e.g., Vercel, Railway, Render):

1. Set environment variables in your hosting platform
2. Update `FRONTEND_URL` to your production URL
3. Update `SPOTIFY_REDIRECT_URI` to your production callback URL
4. Deploy the server

## Troubleshooting

### "CORS error"
- Check `FRONTEND_URL` matches your frontend URL exactly

### "Invalid redirect URI"
- Ensure redirect URI in Spotify Dashboard matches exactly
- Check for trailing slashes

### "Service role key error"
- Make sure you're using service_role key, not anon key
- Key should start with `eyJ...`
