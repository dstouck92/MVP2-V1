// Supabase client configuration
// This file contains all Supabase database operations for the Herd app

// THIS LOG RUNS WHEN MODULE IS IMPORTED
console.log('%c📦 SUPABASE.JS MODULE LOADING', 'background: #10b981; color: white; font-size: 14px; padding: 8px; font-weight: bold;');
console.log('Commit: a6072e3');

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log what we're getting (remove in production)
console.log('Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
  keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials not found!');
  console.error('Missing:', {
    url: !supabaseUrl ? 'VITE_SUPABASE_URL' : '',
    key: !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''
  });
  console.error('Please check your .env file in the root directory');
  console.error('File should be named: .env (not env.example)');
  console.error('Variables must start with VITE_ prefix');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==================== AUTHENTICATION ====================
export const auth = {
  signUp: async (email, password, userData) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    // Create user profile in users table after signup
    if (data?.user && !error) {
      try {
        const profileResult = await users.createProfile(data.user.id, {
          email,
          username: userData?.username || email.split('@')[0],
          phone: userData?.phone || null,
          avatar: userData?.avatar || '🦌'
        });
        
        // If profile creation fails, log it but don't fail signup
        if (profileResult.error) {
          console.error('Error creating user profile:', profileResult.error);
          // Still return success for auth, profile can be created later
        }
      } catch (profileError) {
        console.error('Exception creating user profile:', profileError);
      }
    }
    
    return { data, error };
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: 'Supabase not configured' };
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  signOut: async () => {
    if (!supabase) return { error: 'Supabase not configured' };
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    if (!supabase) return { error: 'Supabase not configured' };
    return await supabase.auth.getSession();
  },

  getUser: async () => {
    if (!supabase) return { error: 'Supabase not configured' };
    return await supabase.auth.getUser();
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    if (!supabase) return { error: 'Supabase not configured' };
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ==================== USER PROFILES ====================
export const users = {
  // Create user profile after signup
  createProfile: async (userId, profileData) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    console.log('Creating user profile:', { userId, profileData });
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: profileData.email,
          username: profileData.username,
          phone: profileData.phone,
          avatar: profileData.avatar || '🦌'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Profile creation error:', error);
        return { data: null, error };
      }
      
      console.log('Profile created successfully:', data);
      return { data, error: null };
    } catch (err) {
      console.error('Profile creation exception:', err);
      return { data: null, error: err };
    }
  },

  // Get user profile
  getProfile: async (userId) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Update avatar
  updateAvatar: async (userId, avatar) => {
    if (!supabase) return { error: 'Supabase not configured' };
    return await users.updateProfile(userId, { avatar });
  },

  // Update Spotify tokens
  updateSpotifyTokens: async (userId, accessToken, refreshToken, spotifyUserId) => {
    if (!supabase) return { error: 'Supabase not configured' };
    return await users.updateProfile(userId, {
      spotify_access_token: accessToken,
      spotify_refresh_token: refreshToken,
      spotify_user_id: spotifyUserId
    });
  },

  // Search users by username
  searchUsers: async (query, limit = 20) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('users')
      .select('id, username, avatar, member_since')
      .ilike('username', `%${query}%`)
      .limit(limit);
    return { data, error };
  }
};

// ==================== LISTENING DATA ====================
export const listeningData = {
  // Add a single listening event
  addListeningEvent: async (userId, event) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('listening_data')
      .insert({
        user_id: userId,
        artist_id: event.artistId,
        artist_name: event.artistName,
        track_id: event.trackId,
        track_name: event.trackName,
        played_at: event.playedAt,
        duration_ms: event.durationMs
      })
      .select()
      .single();
    return { data, error };
  },

  // Bulk insert listening events
  bulkInsert: async (userId, events) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const formattedEvents = events.map(event => ({
      user_id: userId,
      artist_id: event.artistId,
      artist_name: event.artistName,
      track_id: event.trackId,
      track_name: event.trackName,
      played_at: event.playedAt,
      duration_ms: event.durationMs
    }));

    const { data, error } = await supabase
      .from('listening_data')
      .insert(formattedEvents)
      .select();
    return { data, error };
  },

  // Get user's listening stats
  getUserStats: async (userId, timeRange = 'all-time') => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    let query = supabase
      .from('listening_data')
      .select('*')
      .eq('user_id', userId);

    // Apply time filter
    if (timeRange === 'past-week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('played_at', weekAgo.toISOString());
    } else if (timeRange === 'this-month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('played_at', monthAgo.toISOString());
    } else if (timeRange === 'superbowl-competition') {
      // Superbowl Competition: Sunday, February 5, 2026 12:00pm CT to Wednesday, February 8, 2026 12:00pm CT
      // CT is UTC-6 (CST in February), so 12:00pm CT = 6:00pm UTC
      const startDate = new Date('2026-02-05T18:00:00Z'); // Sunday, Feb 5, 2026 12:00pm CT (6:00pm UTC)
      const endDate = new Date('2026-02-08T18:00:00Z'); // Wednesday, Feb 8, 2026 12:00pm CT (6:00pm UTC)
      query = query.gte('played_at', startDate.toISOString()).lte('played_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) return { data: null, error };

    // Calculate stats
    const totalSongs = data.length;
    const totalMinutes = Math.round(
      data.reduce((sum, event) => sum + (event.duration_ms || 0), 0) / 60000
    );

    return { 
      data: { totalSongs, totalMinutes, events: data }, 
      error: null 
    };
  },

  // Get user's top artists
  getTopArtists: async (userId, timeRange = 'all-time', limit = 10) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    let query = supabase
      .from('listening_data')
      .select('artist_id, artist_name, duration_ms')
      .eq('user_id', userId);

    // Apply time filter
    if (timeRange === 'past-week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('played_at', weekAgo.toISOString());
    } else if (timeRange === 'this-month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('played_at', monthAgo.toISOString());
    } else if (timeRange === 'superbowl-competition') {
      // Superbowl Competition: Sunday, February 5, 2026 12:00pm CT to Wednesday, February 8, 2026 12:00pm CT
      // CT is UTC-6 (CST in February), so 12:00pm CT = 6:00pm UTC
      const startDate = new Date('2026-02-05T18:00:00Z'); // Sunday, Feb 5, 2026 12:00pm CT (6:00pm UTC)
      const endDate = new Date('2026-02-08T18:00:00Z'); // Wednesday, Feb 8, 2026 12:00pm CT (6:00pm UTC)
      query = query.gte('played_at', startDate.toISOString()).lte('played_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) return { data: null, error };

    // Group by artist and calculate totals
    const artistMap = {};
    data.forEach(event => {
      if (!artistMap[event.artist_id]) {
        artistMap[event.artist_id] = {
          artistId: event.artist_id,
          artistName: event.artist_name,
          totalMinutes: 0,
          totalSongs: 0
        };
      }
      artistMap[event.artist_id].totalMinutes += (event.duration_ms || 0) / 60000;
      artistMap[event.artist_id].totalSongs += 1;
    });

    const topArtists = Object.values(artistMap)
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, limit)
      .map(artist => ({
        ...artist,
        totalMinutes: Math.round(artist.totalMinutes)
      }));

    return { data: topArtists, error: null };
  }
};

// ==================== LEADERBOARDS ====================
export const leaderboards = {
  // Search for artists by name
  searchArtists: async (query, limit = 20) => {
    if (!supabase) return { error: 'Supabase not configured' };
    if (!query || query.trim().length === 0) return { data: [], error: null };
    
    const { data, error } = await supabase
      .from('listening_data')
      .select('artist_id, artist_name')
      .ilike('artist_name', `%${query.trim()}%`)
      .order('artist_name', { ascending: true })
      .limit(limit);
    
    if (error) return { data: null, error };
    
    // Get unique artists
    const artistMap = {};
    data.forEach(event => {
      if (!artistMap[event.artist_id]) {
        artistMap[event.artist_id] = {
          id: event.artist_id,
          name: event.artist_name
        };
      }
    });
    
    return { data: Object.values(artistMap), error: null };
  },

  // Get top listeners for an artist
  getArtistLeaderboard: async (artistId, timeRange = 'all-time', limit = 10) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    let query = supabase
      .from('listening_data')
      .select('user_id, duration_ms, users!inner(username, avatar)')
      .eq('artist_id', artistId);

    // Apply time filter
    if (timeRange === 'past-week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('played_at', weekAgo.toISOString());
    } else if (timeRange === 'this-month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('played_at', monthAgo.toISOString());
    } else if (timeRange === 'superbowl-competition') {
      // Superbowl Competition: Sunday, February 5, 2026 12:00pm CT to Wednesday, February 8, 2026 12:00pm CT
      // CT is UTC-6 (CST in February), so 12:00pm CT = 6:00pm UTC
      const startDate = new Date('2026-02-05T18:00:00Z'); // Sunday, Feb 5, 2026 12:00pm CT (6:00pm UTC)
      const endDate = new Date('2026-02-08T18:00:00Z'); // Wednesday, Feb 8, 2026 12:00pm CT (6:00pm UTC)
      query = query.gte('played_at', startDate.toISOString()).lte('played_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) return { data: null, error };

    // Group by user and calculate totals
    const userMap = {};
    data.forEach(event => {
      const userId = event.user_id;
      if (!userMap[userId]) {
        userMap[userId] = {
          userId,
          username: event.users.username,
          avatar: event.users.avatar,
          totalMinutes: 0,
          totalSongs: 0
        };
      }
      userMap[userId].totalMinutes += (event.duration_ms || 0) / 60000;
      userMap[userId].totalSongs += 1;
    });

    const leaderboard = Object.values(userMap)
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        totalMinutes: Math.round(user.totalMinutes)
      }));

    return { data: leaderboard, error: null };
  }
};

// ==================== COMMENTS ====================
export const comments = {
  // Add a comment
  addComment: async (userId, artistId, artistName, text) => {
    if (!supabase) return { error: 'Supabase not configured' };
    if (text.length > 200) return { error: 'Comment too long (max 200 characters)' };
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        artist_id: artistId,
        artist_name: artistName,
        text
      })
      .select(`
        *,
        users!inner(id, username, avatar)
      `)
      .single();
    return { data, error };
  },

  // Get comments for an artist
  getArtistComments: async (artistId, sortBy = 'recent', limit = 50) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    let query = supabase
      .from('comments')
      .select(`
        *,
        users!inner(id, username, avatar)
      `)
      .eq('artist_id', artistId);

    // Apply sorting
    if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'liked') {
      query = query.order('likes', { ascending: false, nullsFirst: false });
    }

    const { data, error } = await query.limit(limit);
    return { data, error };
  },

  // Like/unlike a comment
  toggleLike: async (commentId, userId) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    // Get current comment
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', commentId)
      .single();

    if (fetchError) return { data: null, error: fetchError };

    const likes = comment.likes || [];
    const isLiked = likes.includes(userId);
    
    const newLikes = isLiked
      ? likes.filter(id => id !== userId)
      : [...likes, userId];

    const { data, error } = await supabase
      .from('comments')
      .update({ likes: newLikes })
      .eq('id', commentId)
      .select()
      .single();

    return { data, error };
  },

  // Delete a comment
  deleteComment: async (commentId, userId) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    return { data, error };
  }
};

// ==================== ANALYTICS ====================
export const analytics = {
  // Track an analytics event
  trackEvent: async (userId, eventType, eventData = {}) => {
    if (!supabase) return { error: 'Supabase not configured' };
    if (!userId) return { error: 'User ID required' };
    
    const { data, error } = await supabase
      .from('analytics')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Get analytics for a specific user
  getUserAnalytics: async (userId, eventType = null, limit = 100) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    let query = supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  // Get analytics summary (for admin dashboard)
  getAnalyticsSummary: async (eventType = null, days = 30) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let query = supabase
      .from('analytics')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  // Get event counts by type
  getEventCounts: async (days = 30) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('analytics')
      .select('event_type, created_at')
      .gte('created_at', startDate.toISOString());
    
    if (error) return { data: null, error };
    
    // Count events by type
    const counts = {};
    data.forEach(event => {
      counts[event.event_type] = (counts[event.event_type] || 0) + 1;
    });
    
    return { data: counts, error: null };
  },

  // Get unique users by event type
  getUniqueUsersByEvent: async (eventType, days = 30) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('analytics')
      .select('user_id')
      .eq('event_type', eventType)
      .gte('created_at', startDate.toISOString());
    
    if (error) return { data: null, error };
    
    // Get unique user IDs
    const uniqueUsers = new Set(data.map(event => event.user_id));
    
    return { data: uniqueUsers.size, error: null };
  },

  // Get session duration statistics
  getSessionStats: async (days = 30) => {
    if (!supabase) return { error: 'Supabase not configured' };
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('analytics')
      .select('event_data, user_id')
      .eq('event_type', 'session_end')
      .gte('created_at', startDate.toISOString());
    
    if (error) return { data: null, error };
    
    if (!data || data.length === 0) {
      return { 
        data: {
          totalSessions: 0,
          averageDurationSeconds: 0,
          averageDurationMinutes: 0,
          totalDurationSeconds: 0,
          totalDurationMinutes: 0
        }, 
        error: null 
      };
    }
    
    // Calculate statistics
    const durations = data
      .map(event => event.event_data?.duration_seconds || 0)
      .filter(d => d > 0);
    
    const totalSessions = durations.length;
    const totalDurationSeconds = durations.reduce((sum, d) => sum + d, 0);
    const averageDurationSeconds = totalSessions > 0 ? Math.floor(totalDurationSeconds / totalSessions) : 0;
    const averageDurationMinutes = Math.floor(averageDurationSeconds / 60);
    const totalDurationMinutes = Math.floor(totalDurationSeconds / 60);
    
    // Get unique users who had sessions
    const uniqueUsers = new Set(data.map(event => event.user_id));
    
    return { 
      data: {
        totalSessions,
        averageDurationSeconds,
        averageDurationMinutes,
        averageDurationFormatted: `${averageDurationMinutes}m ${averageDurationSeconds % 60}s`,
        totalDurationSeconds,
        totalDurationMinutes,
        totalDurationFormatted: `${totalDurationMinutes}m`,
        uniqueUsers: uniqueUsers.size
      }, 
      error: null 
    };
  }
};

export default supabase;
