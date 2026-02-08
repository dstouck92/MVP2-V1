// Herd App Backend Server
// Handles Spotify OAuth callback and token exchange
// NEVER expose this server code or .env file publicly

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import cron from 'node-cron';
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

// Helper function to refresh Spotify token
const refreshSpotifyToken = async (refreshToken) => {
  try {
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
    return tokenResponse.data.access_token;
  } catch (err) {
    console.error('Token refresh error:', err.response?.data || err.message);
    throw err;
  }
};

// Reusable function to sync a single user's Spotify data
// Returns: { success: boolean, synced: number, error: string|null }
const syncUserSpotifyData = async (userId, accessToken, refreshToken) => {
  try {
    let tokenToUse = accessToken;
    let tokenRefreshed = false;

    // Try to fetch recently played tracks
    let recentlyPlayedResponse;
    try {
      recentlyPlayedResponse = await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=50',
        {
          headers: {
            'Authorization': `Bearer ${tokenToUse}`
          }
        }
      );
    } catch (err) {
      // If 401, token expired - refresh it
      if (err.response?.status === 401) {
        try {
          tokenToUse = await refreshSpotifyToken(refreshToken);
          tokenRefreshed = true;
          
          // Update token in database
          await supabase
            .from('users')
            .update({ spotify_access_token: tokenToUse })
            .eq('id', userId);
          
          // Retry the request with new token
          recentlyPlayedResponse = await axios.get(
            'https://api.spotify.com/v1/me/player/recently-played?limit=50',
            {
              headers: {
                'Authorization': `Bearer ${tokenToUse}`
              }
            }
          );
        } catch (refreshErr) {
          console.error(`❌ User ${userId}: Failed to refresh token:`, refreshErr.response?.data || refreshErr.message);
          return { success: false, synced: 0, error: 'Token refresh failed' };
        }
      } else if (err.response?.status === 429) {
        // Rate limit error - log and return graceful error
        const retryAfter = err.response.headers['retry-after'] || 60;
        console.error(`⚠️ User ${userId}: Rate limit hit. Retry after ${retryAfter} seconds`);
        return { 
          success: false, 
          synced: 0, 
          error: `Rate limit exceeded. Please try again in ${retryAfter} seconds.` 
        };
      } else {
        // Other errors (403 forbidden, etc.)
        throw err;
      }
    }

    const tracks = recentlyPlayedResponse.data.items;
    
    if (!tracks || tracks.length === 0) {
      console.log(`ℹ️  User ${userId}: No recent tracks found (user may not have played music recently)`);
      return { success: true, synced: 0, error: null };
    }
    
    console.log(`📊 User ${userId}: Found ${tracks.length} recent tracks from Spotify`);

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
    // The unique constraint on (user_id, artist_id, track_id, played_at) prevents duplicates
    const { data, error } = await supabase
      .from('listening_data')
      .upsert(listeningEvents, {
        onConflict: 'user_id,artist_id,track_id,played_at',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error(`❌ User ${userId}: Database error:`, error);
      return { success: false, synced: 0, error: error.message };
    }

    return { 
      success: true, 
      synced: data.length, 
      error: null,
      tokenRefreshed 
    };
  } catch (err) {
    console.error(`❌ User ${userId}: Sync error:`, err.response?.data || err.message);
    return { 
      success: false, 
      synced: 0, 
      error: err.response?.data?.error?.message || err.message 
    };
  }
};

// Sync listening data from Spotify (API endpoint)
app.post('/api/spotify/sync-listening-data', async (req, res) => {
  try {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'User ID and access token required' });
    }

    // Get refresh token from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('spotify_refresh_token')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile?.spotify_refresh_token) {
      return res.status(400).json({ error: 'User Spotify tokens not found' });
    }

    // Use the reusable sync function
    const result = await syncUserSpotifyData(userId, accessToken, userProfile.spotify_refresh_token);

    if (!result.success) {
      // Provide more specific error messages
      if (result.error?.includes('Token refresh failed') || result.error?.includes('401')) {
        return res.status(401).json({ 
          error: 'Spotify token expired. Please reconnect your Spotify account.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (result.error?.includes('403') || result.error?.includes('access denied')) {
        return res.status(403).json({ 
          error: 'Spotify access denied. Please check your Spotify app settings.',
          code: 'ACCESS_DENIED'
        });
      } else {
        return res.status(500).json({ 
          error: result.error || 'Failed to sync listening data',
          code: 'SYNC_FAILED'
        });
      }
    }

    res.json({ 
      success: true, 
      synced: result.synced,
      message: result.synced > 0 ? `Synced ${result.synced} listening events` : 'No new tracks to sync',
      tokenRefreshed: result.tokenRefreshed || false
    });
  } catch (err) {
    console.error('Sync endpoint error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: err.message || 'Failed to sync listening data',
      code: 'SYNC_FAILED'
    });
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

// ==================== SCHEDULED SYNC ====================
// Track sync status
let lastSyncStatus = {
  lastRun: null,
  success: false,
  usersProcessed: 0,
  tracksSynced: 0,
  errors: []
};

// Sync all users' Spotify data every 60 minutes
const syncAllUsers = async () => {
  const syncStartTime = new Date();
  console.log('🔄 Starting scheduled sync for all users...');
  console.log('📅 Sync start time:', syncStartTime.toISOString());
  const startTime = Date.now();
  
  // Reset status
  lastSyncStatus = {
    lastRun: syncStartTime.toISOString(),
    success: false,
    usersProcessed: 0,
    tracksSynced: 0,
    errors: []
  };
  
  try {
    // Get all users with Spotify tokens
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, spotify_access_token, spotify_refresh_token')
      .not('spotify_access_token', 'is', null)
      .not('spotify_refresh_token', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users with Spotify connected');
      return;
    }

    console.log(`📊 Found ${users.length} users with Spotify connected`);

    let successCount = 0;
    let failCount = 0;
    let totalSynced = 0;

    // Sync each user (with delay to avoid rate limits)
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Add 3 second delay between users to avoid rate limits
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      try {
        const result = await syncUserSpotifyData(
          user.id,
          user.spotify_access_token,
          user.spotify_refresh_token
        );

        if (result.success) {
          successCount++;
          totalSynced += result.synced;
          if (result.synced > 0) {
            console.log(`✅ User ${user.id}: Synced ${result.synced} tracks`);
          }
        } else {
          failCount++;
          console.log(`⚠️  User ${user.id}: ${result.error || 'Sync failed'}`);
        }
      } catch (err) {
        failCount++;
        console.error(`❌ User ${user.id}: Exception during sync:`, err.message);
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Scheduled sync completed in ${duration}s`);
    console.log(`   Success: ${successCount}, Failed: ${failCount}, Total tracks synced: ${totalSynced}`);
    
    // Update status
    lastSyncStatus.success = true;
    lastSyncStatus.usersProcessed = users.length;
    lastSyncStatus.tracksSynced = totalSynced;
    lastSyncStatus.successCount = successCount;
    lastSyncStatus.failCount = failCount;
    lastSyncStatus.duration = `${duration}s`;
  } catch (err) {
    console.error('❌ Scheduled sync error:', err);
    lastSyncStatus.errors.push(err.message);
  }
};

// Schedule sync to run every 60 minutes
// Using setInterval for true 60-minute intervals (not aligned to hour)
// Alternative: Use cron '0 0 * * * *' for every hour (aligned to :00)
const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes in milliseconds

// Run sync immediately on server start (optional - can be commented out)
// syncAllUsers();

// Schedule recurring sync every 60 minutes
setInterval(async () => {
  console.log('⏰ Scheduled sync triggered at', new Date().toISOString());
  await syncAllUsers();
}, SYNC_INTERVAL_MS);

console.log('✅ Scheduled sync configured: Every 60 minutes');

// Also run sync immediately on server start (optional - comment out if not desired)
// syncAllUsers();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sync status endpoint - check if scheduled sync is working
app.get('/api/spotify/sync-status', (req, res) => {
  const now = new Date();
  const lastRun = lastSyncStatus.lastRun ? new Date(lastSyncStatus.lastRun) : null;
  
  let timeSinceLastSync = null;
  if (lastRun) {
    const diffMs = now - lastRun;
    const diffMinutes = Math.floor(diffMs / 60000);
    timeSinceLastSync = `${diffMinutes} minutes ago`;
  }
  
  res.json({
    scheduledSyncEnabled: true,
    interval: '60 minutes',
    lastSync: {
      runTime: lastSyncStatus.lastRun,
      timeAgo: timeSinceLastSync,
      success: lastSyncStatus.success,
      usersProcessed: lastSyncStatus.usersProcessed,
      tracksSynced: lastSyncStatus.tracksSynced,
      successCount: lastSyncStatus.successCount || 0,
      failCount: lastSyncStatus.failCount || 0,
      duration: lastSyncStatus.duration,
      errors: lastSyncStatus.errors
    },
    nextSync: lastRun ? new Date(lastRun.getTime() + 60 * 60 * 1000).toISOString() : 'Not yet run',
    serverTime: now.toISOString()
  });
});

// Manual trigger endpoint for testing (optional - can be removed in production)
app.post('/api/spotify/sync-all-users', async (req, res) => {
  console.log('🔧 Manual sync-all triggered');
  syncAllUsers().then(() => {
    res.json({ success: true, message: 'Sync job started' });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Herd backend server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🎵 Spotify Client ID: ${process.env.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`🗄️  Supabase URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`⏰ Scheduled sync: Every 60 minutes (starting on next hour)`);
});
