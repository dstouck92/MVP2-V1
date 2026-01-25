// Spotify API helper functions
// This file contains functions for interacting with Spotify API

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/auth/spotify/callback`;

export const spotifyAuth = {
  // Generate Spotify OAuth URL
  getAuthUrl: () => {
    if (!SPOTIFY_CLIENT_ID) {
      console.warn('Spotify Client ID not found. Please set VITE_SPOTIFY_CLIENT_ID in your .env file');
      return null;
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-recently-played',
      'user-top-read',
      'user-read-playback-state'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: scopes,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  },

  // Exchange authorization code for access token (this should be done on backend)
  // This is a placeholder - actual token exchange should happen server-side
  exchangeCodeForToken: async (code) => {
    // NOTE: This should be implemented on your backend for security
    // The client secret should NEVER be exposed in frontend code
    console.warn('Token exchange should be done on the backend');
    return null;
  }
};

export const spotifyAPI = {
  // Fetch user's top artists
  getTopArtists: async (accessToken, timeRange = 'medium_term', limit = 20) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching top artists:', error);
      return { error };
    }
  },

  // Fetch user's top tracks
  getTopTracks: async (accessToken, timeRange = 'medium_term', limit = 20) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return { error };
    }
  },

  // Fetch user's recently played tracks
  getRecentlyPlayed: async (accessToken, limit = 50) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching recently played:', error);
      return { error };
    }
  },

  // Search for artists
  searchArtists: async (accessToken, query, limit = 20) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error searching artists:', error);
      return { error };
    }
  }
};

export default { spotifyAuth, spotifyAPI };
