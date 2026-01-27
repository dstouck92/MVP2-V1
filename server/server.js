// Herd App Backend Server
// Handles Spotify OAuth callback and token exchange
// NEVER expose this server code or .env file publicly

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - allow requests from frontend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // Remove trailing slash if present
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      console.error('❌ CORS blocked origin:', origin);
      console.error('✅ Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for backend operations
);

// ==================== SPOTIFY OAUTH ====================

// Step 1: Redirect to Spotify authorization
app.get('/api/auth/spotify', (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/spotify/callback`;
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `show_dialog=true`;

  res.redirect(authUrl);
});

// Step 2: Handle OAuth callback and exchange code for tokens
app.get('/api/auth/spotify/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/spotify-connect?error=${error}`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/spotify-connect?error=no_code`);
  }

  try {
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/spotify/callback`;
    
    console.log('🔄 Exchanging authorization code for tokens...');
    console.log('📡 Redirect URI:', redirectUri);
    console.log('🎵 Client ID:', process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('🔐 Client Secret:', process.env.SPOTIFY_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ Token exchange successful');
    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get Spotify user info
    console.log('👤 Fetching Spotify user info...');
    let spotifyUserId = 'unknown'; // Initialize with default value
    try {
      const userResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      spotifyUserId = userResponse.data.id;
      console.log('✅ User info retrieved, Spotify User ID:', spotifyUserId);
    } catch (userInfoError) {
      console.error('❌ Failed to get Spotify user info');
      console.error('Error:', userInfoError.response?.data || userInfoError.message);
      console.error('Status:', userInfoError.response?.status);
      // If we can't get user info (e.g., user not registered in Development Mode),
      // we can still proceed with tokens - the user ID can be set later
      console.log('⚠️ Proceeding without user ID - user may need to be added to Spotify app');
      spotifyUserId = 'unknown';
    }

    // Store tokens in session or pass to frontend
    // For now, we'll redirect with tokens in query (not secure for production!)
    // In production, store tokens server-side and use session cookies
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/spotify/success?` +
      `access_token=${access_token}&` +
      `refresh_token=${refresh_token}&` +
      `spotify_user_id=${spotifyUserId}`;

    console.log('✅ Redirecting to frontend with tokens');
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('❌ Spotify OAuth token exchange failed');
    console.error('Error details:', err.response?.data || err.message);
    console.error('Status code:', err.response?.status);
    console.error('Request redirect_uri:', process.env.SPOTIFY_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/spotify/callback`);
    
    // Get more specific error message
    const errorMessage = err.response?.data?.error || err.message || 'token_exchange_failed';
    const errorDescription = err.response?.data?.error_description || '';
    
    console.error('Spotify error:', errorMessage);
    console.error('Error description:', errorDescription);
    
    res.redirect(`${process.env.FRONTEND_URL}/spotify-connect?error=${encodeURIComponent(errorMessage)}`);
  }
});

// Step 3: Save tokens to Supabase (called from frontend after OAuth success)
app.post('/api/auth/spotify/save-tokens', async (req, res) => {
  try {
    console.log('💾 Save tokens request received');
    console.log('📡 Origin:', req.headers.origin);
    console.log('📡 FRONTEND_URL:', process.env.FRONTEND_URL);
    
    const { userId, accessToken, refreshToken, spotifyUserId } = req.body;

    if (!userId || !accessToken || !refreshToken) {
      console.error('❌ Missing required fields:', { userId: !!userId, accessToken: !!accessToken, refreshToken: !!refreshToken });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update user profile with Spotify tokens
    const { data, error } = await supabase
      .from('users')
      .update({
        spotify_access_token: accessToken,
        spotify_refresh_token: refreshToken,
        spotify_user_id: spotifyUserId
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error saving tokens:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SPOTIFY API PROXY ====================

// Refresh access token
app.post('/api/spotify/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json({
      access_token: tokenResponse.data.access_token,
      expires_in: tokenResponse.data.expires_in
    });
  } catch (err) {
    console.error('Token refresh error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Sync listening data from Spotify
app.post('/api/spotify/sync-listening-data', async (req, res) => {
  try {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'User ID and access token required' });
    }

    // Fetch recently played tracks
    const recentlyPlayedResponse = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const tracks = recentlyPlayedResponse.data.items;
    const listeningEvents = tracks.map(track => ({
      user_id: userId,
      artist_id: track.track.artists[0]?.id || 'unknown',
      artist_name: track.track.artists[0]?.name || 'Unknown Artist',
      track_id: track.track.id,
      track_name: track.track.name,
      played_at: track.played_at,
      duration_ms: track.track.duration_ms
    }));

    // Insert into Supabase (check for duplicates)
    const { data, error } = await supabase
      .from('listening_data')
      .upsert(listeningEvents, {
        onConflict: 'user_id,artist_id,track_id,played_at',
        ignoreDuplicates: false
      })
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      synced: data.length,
      message: `Synced ${data.length} listening events`
    });
  } catch (err) {
    console.error('Sync error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message || 'Failed to sync listening data' });
  }
});

// Get top artists from Spotify
app.get('/api/spotify/top-artists', async (req, res) => {
  try {
    const { accessToken, timeRange = 'medium_term', limit = 20 } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const response = await axios.get(
      `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Top artists error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Herd backend server running on http://localhost:${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🎵 Spotify Client ID: ${process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`🗄️  Supabase URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
});
