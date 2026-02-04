import React, { useState, useEffect } from 'react';
import { Search, Music, Users, Clock, Send, ChevronDown } from 'lucide-react';
import './App.css';
import { auth, users, listeningData, leaderboards, comments, analytics } from './lib/supabase';

// ==================== CONSTANTS ====================
const ANIMAL_AVATARS = ['🐐', '🐑', '🐴', '🦌', '🐮', '🐘', '🐕', '🐈'];

// ==================== MAIN APP ====================
export default function App() {
  // Log immediately when component loads
  console.log('%c🚀 HERD APP LOADING', 'background: #3b82f6; color: white; font-size: 14px; padding: 8px; font-weight: bold;');
  
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({ totalMinutes: 0, totalSongs: 0 });
  const [topArtists, setTopArtists] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('🦌');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [searchQuery, setSearchQuery] = useState('');
  const [commentSort, setCommentSort] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [commentText, setCommentText] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [commentsData, setCommentsData] = useState([]);
  const [artistSearchResults, setArtistSearchResults] = useState([]);
  const [showArtistSearchResults, setShowArtistSearchResults] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // ==================== HELPER FUNCTIONS (defined first) ====================
  const checkSession = async () => {
    try {
      const { data: session } = await auth.getSession();
      if (session?.user) {
        console.log('✅ Session found, user ID:', session.user.id);
        await loadUserData(session.user.id);
        return true;
      } else {
        console.log('⚠️ No active session');
        return false;
      }
    } catch (err) {
      console.error('Error checking session:', err);
      return false;
    }
  };

  const handleSaveSpotifyTokens = async (accessToken, refreshToken, spotifyUserId, providedUserId = null) => {
    // Get user ID from parameter, currentUser, or session
    let userId = providedUserId || currentUser?.id;
    if (!userId) {
      // Try to get from session if currentUser not set yet
      const { data: session } = await auth.getSession();
      userId = session?.user?.id;
    }
    
    // Last resort: check sessionStorage for stored user ID
    if (!userId) {
      const storedUserId = sessionStorage.getItem('spotify_connect_user_id');
      if (storedUserId) {
        console.log('💡 Using stored user ID from sessionStorage:', storedUserId);
        userId = storedUserId;
      }
    }

    if (!userId) {
      // If no user logged in, redirect to login
      setCurrentScreen('login');
      setError('Please log in to connect your Spotify account');
      return;
    }

    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      console.log('💾 Saving Spotify tokens for user:', userId);
      
      // Save tokens via backend API
      const response = await fetch(`${backendUrl}/api/auth/spotify/save-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          accessToken,
          refreshToken,
          spotifyUserId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save tokens');
      }

      // Update user profile in state
      setUserProfile(prev => prev ? {
        ...prev,
        spotify_access_token: accessToken,
        spotify_refresh_token: refreshToken,
        spotify_user_id: spotifyUserId
      } : null);

      // Reload user data to get updated profile (this will also set screen to profile)
      await loadUserData(userId);
      // Explicitly ensure we're on profile screen
      setCurrentScreen('profile');
      console.log('✅ Spotify connected successfully, showing profile screen');
      
      // Automatically sync Spotify data after connecting
      console.log('🔄 Starting automatic Spotify data sync...');
      try {
        const syncResponse = await fetch(`${backendUrl}/api/spotify/sync-listening-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            accessToken: accessToken
          })
        });
        
        const syncResult = await syncResponse.json();
        if (syncResponse.ok) {
          console.log('✅ Spotify data synced successfully:', syncResult);
          // If token was refreshed, reload user profile to get new token
          if (syncResult.tokenRefreshed) {
            console.log('🔄 Token was refreshed, reloading profile...');
            await loadUserData(userId);
          }
          // Reload stats and top artists after sync
          await loadUserStats();
          await loadTopArtists();
        } else {
          console.warn('⚠️ Sync completed but may have issues:', syncResult);
          if (syncResult.code === 'TOKEN_EXPIRED') {
            console.warn('⚠️ Token expired - user may need to reconnect Spotify');
          }
        }
      } catch (syncErr) {
        console.error('❌ Error syncing Spotify data:', syncErr);
        // Don't fail the whole flow if sync fails - user can sync manually later
      }
      
      // Clean up URL if we're on /auth/spotify/success
      if (window.location.pathname.includes('/auth/spotify/success')) {
        window.history.replaceState({}, document.title, '/');
      }
    } catch (err) {
      console.error('Error saving Spotify tokens:', err);
      setError(err.message || 'Failed to connect Spotify account');
    } finally {
      setLoading(false);
    }
  };

  // ==================== AUTH STATE MANAGEMENT ====================
  useEffect(() => {
    // VERY VISIBLE LOG - This should appear in browser console
    console.log('%c🔍 SPOTIFY OAUTH CALLBACK HANDLER RUNNING', 'background: #222; color: #bada55; font-size: 16px; padding: 10px;');
    console.log('==========================================');
    
    // Wrap async code in async function
    const handleOAuthCallback = async () => {
      // Handle Spotify OAuth callback first (before checking session)
      // Check both pathname and query params for OAuth callback
      const isOAuthCallback = window.location.pathname.includes('/auth/spotify/success') || 
                             window.location.pathname.includes('/auth/spotify/callback');
      
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const spotifyUserId = urlParams.get('spotify_user_id');
      const error = urlParams.get('error');

      console.log('🔍 Checking for Spotify OAuth callback...');
      console.log('📍 Full URL:', window.location.href);
      console.log('📍 Pathname:', window.location.pathname);
      console.log('📍 Is OAuth callback path:', isOAuthCallback);
      console.log('📍 Search params:', window.location.search);
      console.log('📍 Has access_token:', !!accessToken);
      console.log('📍 Has refresh_token:', !!refreshToken);
      console.log('📍 Access token value:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');

      if (error) {
        console.error('❌ Spotify OAuth error:', error);
        setError(`Spotify connection failed: ${error}`);
        setCurrentScreen('spotify-connect');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (accessToken && refreshToken) {
        console.log('%c✅ SPOTIFY TOKENS RECEIVED!', 'background: #10b981; color: white; font-size: 14px; padding: 8px; font-weight: bold;');
        console.log('✅ Spotify tokens received, processing...');
        
        // Check localStorage directly for Supabase session
        console.log('🔍 Checking localStorage for Supabase session...');
        const supabaseSessionKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
        console.log('📦 Supabase session key found:', !!supabaseSessionKey);
        if (supabaseSessionKey) {
          try {
            const sessionData = JSON.parse(localStorage.getItem(supabaseSessionKey));
            console.log('📦 Session data in localStorage:', sessionData ? 'Found' : 'Not found');
            if (sessionData?.currentSession?.user) {
              console.log('✅ Found user in localStorage:', sessionData.currentSession.user.id);
            }
          } catch (e) {
            console.error('❌ Error parsing localStorage session:', e);
          }
        }
        
        // We have tokens from OAuth callback
        // First check if user is logged in, if not, redirect to login
        // Try multiple times to get session (sometimes it takes a moment to restore)
        let sessionFound = false;
        let sessionUser = null;
        
        for (let attempt = 0; attempt < 8; attempt++) {
          const delay = attempt === 0 ? 100 : 300 * (attempt + 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          try {
            const { data: session, error } = await auth.getSession();
            console.log(`📋 Session check attempt ${attempt + 1}/${8}:`, session?.user ? `✅ User logged in (${session.user.id})` : '❌ No user');
            if (error) {
              console.error('❌ Session error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
            }
            
            if (session?.user) {
              sessionFound = true;
              sessionUser = session.user;
              console.log('👤 User ID confirmed:', session.user.id);
              console.log('📧 User email:', session.user.email);
              break; // Exit loop once we have a session
            }
          } catch (err) {
            console.error(`❌ Exception on attempt ${attempt + 1}:`, err);
          }
        }
        
        if (sessionFound && sessionUser) {
          console.log('✅ Session confirmed, loading user data...');
          // Ensure user data is loaded before saving tokens
          await loadUserData(sessionUser.id);
          // Wait a bit more for currentUser state to update
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('💾 Saving Spotify tokens...');
          await handleSaveSpotifyTokens(accessToken, refreshToken, spotifyUserId);
          console.log('✅ Spotify tokens saved, redirecting to profile');
          // Clean URL and ensure we're on profile screen
          window.history.replaceState({}, document.title, '/');
          setCurrentScreen('profile');
          return;
        }
        
      // No session found after multiple attempts - try using stored user ID
      console.error('❌❌❌ CRITICAL: No session found after 8 attempts!');
      console.error('This means the user session was lost during OAuth redirect.');
      console.error('Possible causes:');
      console.error('1. Session expired during redirect');
      console.error('2. Domain mismatch (localhost vs production)');
      console.error('3. Browser cleared localStorage');
      console.error('4. Supabase session not persisting across redirects');
      
      // Check if we have a stored user ID from before the redirect
      const storedUserId = sessionStorage.getItem('spotify_connect_user_id');
      if (storedUserId) {
        console.log('💡 Found stored user ID from before redirect:', storedUserId);
        console.log('💾 Attempting to save tokens with stored user ID...');
        
        try {
          // Try to save tokens directly using the stored user ID
          await handleSaveSpotifyTokens(accessToken, refreshToken, spotifyUserId, storedUserId);
          // Clear the stored user ID
          sessionStorage.removeItem('spotify_connect_user_id');
          console.log('✅ Tokens saved successfully using stored user ID');
          // Clean URL and redirect to profile
          window.history.replaceState({}, document.title, '/');
          setCurrentScreen('profile');
          return;
        } catch (err) {
          console.error('❌ Failed to save tokens with stored user ID:', err);
          // Fall through to login redirect
        }
      }
      
      // Check if we can find any user info in localStorage
      const allKeys = Object.keys(localStorage);
      const supabaseKeys = allKeys.filter(k => k.includes('supabase'));
      console.log('📦 All Supabase keys in localStorage:', supabaseKeys);
      
      console.log('⚠️ Storing tokens for later and redirecting to login');
      // Store tokens temporarily and redirect to login
      sessionStorage.setItem('spotify_tokens', JSON.stringify({
        accessToken,
        refreshToken,
        spotifyUserId
      }));
      setError('Your session expired. Please log in again to connect your Spotify account.');
      setCurrentScreen('login');
      // Clean URL
      window.history.replaceState({}, document.title, '/');
      return;
      }

      // Check for existing session on mount (only if no OAuth callback)
      if (!accessToken && !refreshToken && !error) {
        checkSession();
      }
    };

    // Call the async function
    handleOAuthCallback();
    
    // Listen for auth state changes
    try {
      if (auth.onAuthStateChange) {
        const result = auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            loadUserData(session.user.id).then(() => {
              // Check if we have stored Spotify tokens
              const storedTokens = sessionStorage.getItem('spotify_tokens');
              if (storedTokens) {
                try {
                  const tokens = JSON.parse(storedTokens);
                  handleSaveSpotifyTokens(tokens.accessToken, tokens.refreshToken, tokens.spotifyUserId);
                  sessionStorage.removeItem('spotify_tokens');
                } catch (err) {
                  console.error('Error parsing stored tokens:', err);
                }
              }
            });
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setUserProfile(null);
            setCurrentScreen('welcome');
          }
        });

        if (result && !result.error && result.data && result.data.subscription) {
          return () => {
            if (result.data.subscription) {
              result.data.subscription.unsubscribe();
            }
          };
        }
      }
    } catch (err) {
      console.error('Error setting up auth listener:', err);
      // Don't block app from loading if auth listener fails
    }
  }, []);

  // Load user data when time filter changes
  useEffect(() => {
    if (currentUser?.id && currentScreen === 'profile') {
      loadUserStats();
      loadTopArtists();
    }
  }, [timeFilter, currentUser, currentScreen]);

  // Track session end when page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser?.id && sessionStartTime) {
        // Use sendBeacon for reliable tracking on page unload
        const sessionEnd = new Date();
        const durationSeconds = Math.floor((sessionEnd - sessionStartTime) / 1000);
        const durationMinutes = Math.floor(durationSeconds / 60);
        
        // Store in sessionStorage to be sent on next page load if needed
        const sessionData = {
          userId: currentUser.id,
          duration_seconds: durationSeconds,
          duration_minutes: durationMinutes,
          duration_formatted: `${durationMinutes}m ${durationSeconds % 60}s`,
          timestamp: sessionEnd.toISOString()
        };
        sessionStorage.setItem('pending_session_end', JSON.stringify(sessionData));
        
        // Try to send via sendBeacon (if available)
        if (navigator.sendBeacon) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
          const data = JSON.stringify({
            userId: currentUser.id,
            eventType: 'session_end',
            eventData: sessionData
          });
          navigator.sendBeacon(`${backendUrl}/api/analytics/track`, data);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, sessionStartTime]);

  // ==================== HELPER FUNCTIONS ====================
  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      console.log('📥 Loading user data for:', userId);
      const { data: profile, error } = await users.getProfile(userId);
      if (error) throw error;
      
      if (profile) {
        console.log('✅ User profile loaded:', profile.username);
        setUserProfile(profile);
        setCurrentUser({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          memberSince: new Date(profile.member_since).toLocaleDateString()
        });
        setSelectedAvatar(profile.avatar || '🦌');
        // Only set screen to profile if we're not already on a specific screen
        // (don't override if we're on login/signup)
        if (currentScreen !== 'login' && currentScreen !== 'signup' && currentScreen !== 'welcome') {
          setCurrentScreen('profile');
        } else if (currentScreen === 'welcome') {
          setCurrentScreen('profile');
        }
        
        // Track app visit
        try {
          await analytics.trackEvent(userId, 'app_visit', {
            screen: currentScreen || 'profile'
          });
        } catch (analyticsError) {
          console.error('Error tracking app visit:', analyticsError);
          // Don't block app functionality if analytics fails
        }
        
        // Track session start
        const sessionStart = new Date();
        setSessionStartTime(sessionStart);
        try {
          await analytics.trackEvent(userId, 'session_start', {
            screen: currentScreen || 'profile',
            timestamp: sessionStart.toISOString()
          });
        } catch (analyticsError) {
          console.error('Error tracking session start:', analyticsError);
          // Don't block app functionality if analytics fails
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await listeningData.getUserStats(currentUser.id, timeFilter);
      if (error) throw error;
      if (data) {
        setUserStats({
          totalMinutes: data.totalMinutes || 0,
          totalSongs: data.totalSongs || 0
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadTopArtists = async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await listeningData.getTopArtists(currentUser.id, timeFilter, 10);
      if (error) throw error;
      setTopArtists(data || []);
    } catch (err) {
      console.error('Error loading top artists:', err);
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await auth.signIn(loginEmail, loginPassword);
      
      if (error) {
        // Provide more specific error messages
        if (error.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again or sign up for a new account.');
        } else if (error.message?.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before logging in.');
        } else {
          setError(error.message || 'Login failed. Please check your credentials.');
        }
        console.error('Login error:', error);
        return;
      }
      
      if (data?.user) {
        await loadUserData(data.user.id);
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    if (!signupData.email || !signupData.password || !signupData.username) {
      setError('Please fill in all required fields');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Attempting signup...');
      const { data, error } = await auth.signUp(
        signupData.email,
        signupData.password,
        {
          username: signupData.username,
          phone: signupData.phone,
          avatar: selectedAvatar
        }
      );
      
      console.log('Signup response:', { data, error });
      
      if (error) {
        // Provide more specific error messages
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          setError('This email is already registered. Please log in instead.');
        } else if (error.message?.includes('Password')) {
          setError('Password is too weak. Please use a stronger password.');
        } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
          setError('Database permission error. Please check Supabase RLS policies.');
          console.error('RLS Policy Error - Run fix-rls-policies.sql in Supabase');
        } else {
          setError(error.message || 'Signup failed. Please try again.');
        }
        console.error('Signup error details:', error);
        return;
      }
      
      if (data?.user) {
        console.log('User created:', data.user.id);
        // Check if email confirmation is required
        if (data.user && !data.session) {
          setError('Please check your email to confirm your account before logging in.');
          setCurrentScreen('login');
        } else {
          // Success! Redirect to Spotify connect
          console.log('Signup successful, redirecting...');
          setCurrentScreen('spotify-connect');
        }
      } else {
        setError('Signup completed but no user data returned. Please try logging in.');
        setCurrentScreen('login');
      }
    } catch (err) {
      console.error('Signup exception:', err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (newAvatar) => {
    if (!currentUser?.id) return;
    
    setSelectedAvatar(newAvatar);
    setShowAvatarPicker(false);
    
    try {
      await users.updateAvatar(currentUser.id, newAvatar);
      setUserProfile(prev => prev ? { ...prev, avatar: newAvatar } : null);
      setCurrentUser(prev => prev ? { ...prev, avatar: newAvatar } : null);
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };

  const trackSessionEnd = async (userId) => {
    if (!sessionStartTime || !userId) return;
    
    const sessionEnd = new Date();
    const durationSeconds = Math.floor((sessionEnd - sessionStartTime) / 1000);
    const durationMinutes = Math.floor(durationSeconds / 60);
    
    try {
      await analytics.trackEvent(userId, 'session_end', {
        duration_seconds: durationSeconds,
        duration_minutes: durationMinutes,
        duration_formatted: `${durationMinutes}m ${durationSeconds % 60}s`,
        timestamp: sessionEnd.toISOString()
      });
      setSessionStartTime(null);
    } catch (analyticsError) {
      console.error('Error tracking session end:', analyticsError);
      // Don't block app functionality if analytics fails
    }
  };

  const handleLogout = async () => {
    // Track session end before logging out
    if (currentUser?.id && sessionStartTime) {
      await trackSessionEnd(currentUser.id);
    }
    try {
      await auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
      setCurrentScreen('welcome');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !selectedArtist || !currentUser?.id) return;

    try {
      setLoading(true);
      const { error } = await comments.addComment(
        currentUser.id,
        selectedArtist.id,
        selectedArtist.name,
        commentText
      );
      if (error) throw error;
      
      setCommentText('');
      loadComments();
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (artistId, artistName = null) => {
    if (!artistId) return;
    try {
      setLoading(true);
      const { data, error } = await leaderboards.getArtistLeaderboard(artistId, timeFilter, 10);
      if (error) throw error;
      setLeaderboardData(data || []);
      // Update selected artist if name provided
      if (artistName) {
        setSelectedArtist({ id: artistId, name: artistName });
      }
      
      // Track leaderboard view
      if (currentUser?.id) {
        try {
          await analytics.trackEvent(currentUser.id, 'leaderboard_view', {
            artist_id: artistId,
            artist_name: artistName || selectedArtist?.name || 'Unknown',
            time_filter: timeFilter
          });
        } catch (analyticsError) {
          console.error('Error tracking leaderboard view:', analyticsError);
          // Don't block app functionality if analytics fails
        }
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const searchArtists = async (query) => {
    if (!query || query.trim().length < 2) {
      setArtistSearchResults([]);
      setShowArtistSearchResults(false);
      return;
    }
    
    try {
      const { data, error } = await leaderboards.searchArtists(query.trim(), 20);
      if (error) throw error;
      setArtistSearchResults(data || []);
      setShowArtistSearchResults(true);
      
      // Track artist search
      if (currentUser?.id) {
        try {
          await analytics.trackEvent(currentUser.id, 'artist_search', {
            search_query: query.trim(),
            results_count: data?.length || 0
          });
        } catch (analyticsError) {
          console.error('Error tracking artist search:', analyticsError);
          // Don't block app functionality if analytics fails
        }
      }
    } catch (err) {
      console.error('Error searching artists:', err);
      setArtistSearchResults([]);
    }
  };

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setSearchQuery(artist.name);
    setShowArtistSearchResults(false);
    loadLeaderboard(artist.id, artist.name);
  };

  const loadComments = async () => {
    if (!selectedArtist?.id) return;
    try {
      const { data, error } = await comments.getArtistComments(selectedArtist.id, commentSort);
      if (error) throw error;
      setCommentsData(data || []);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const loadAnalytics = async () => {
    if (!currentUser?.id) return;
    setAnalyticsLoading(true);
    try {
      // Get event counts
      const { data: eventCounts, error: countsError } = await analytics.getEventCounts(30);
      if (countsError) throw countsError;
      
      // Get unique users for each event type
      const uniqueUsers = {};
      const eventTypes = ['app_visit', 'leaderboard_view', 'artist_search', 'sync_data', 'session_start', 'session_end'];
      for (const eventType of eventTypes) {
        const { data: count } = await analytics.getUniqueUsersByEvent(eventType, 30);
        uniqueUsers[eventType] = count || 0;
      }
      
      // Get session duration statistics
      const { data: sessionStats, error: sessionError } = await analytics.getSessionStats(30);
      if (sessionError) {
        console.error('Error loading session stats:', sessionError);
      }
      
      setAnalyticsData({
        eventCounts: eventCounts || {},
        uniqueUsers,
        sessionStats: sessionStats || null
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  
  const renderWelcomeScreen = () => (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="logo-hero">
          <div className="logo-circle">
            <span className="logo-goat">🐐</span>
          </div>
        </div>
        
        <h1 className="welcome-title">Prove you're the Goat</h1>
        <p className="welcome-subtitle">Connect your favorite platforms to Get Herd</p>
        
        <button className="btn-primary" onClick={() => setCurrentScreen('login')}>
          <Music size={20} />
          Log in
        </button>
      </div>
    </div>
  );

  const renderLoginScreen = () => (
    <div className="auth-screen">
      <div className="auth-content">
        <div className="logo-small">
          <span className="logo-goat-small">🐐</span>
        </div>
        
        <div className="auth-toggle">
          <button 
            className={currentScreen === 'login' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('login');
              setError(null);
            }}
          >
            Log In
          </button>
          <button 
            className={currentScreen === 'signup' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('signup');
              setError(null);
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#FEE2E2', 
            color: '#DC2626', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderSignupScreen = () => (
    <div className="auth-screen">
      <div className="auth-content">
        <div className="logo-small">
          <span className="logo-goat-small">🐐</span>
        </div>
        
        <div className="auth-toggle">
          <button 
            className={currentScreen === 'login' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('login');
              setError(null);
            }}
          >
            Log In
          </button>
          <button 
            className={currentScreen === 'signup' ? 'active' : ''}
            onClick={() => {
              setCurrentScreen('signup');
              setError(null);
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{ 
            background: '#FEE2E2', 
            color: '#DC2626', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Choose a username"
              value={signupData.username}
              onChange={(e) => setSignupData({...signupData, username: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={signupData.email}
              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number (Optional)</label>
            <input 
              type="tel" 
              placeholder="Enter your phone number"
              value={signupData.phone}
              onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Create a password (min 6 characters)"
              value={signupData.password}
              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
              minLength={6}
              required
            />
            <span className="form-hint">You can set a password now or later</span>
          </div>

          <div className="form-group">
            <label>Choose Avatar</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {ANIMAL_AVATARS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  style={{
                    fontSize: '2rem',
                    background: selectedAvatar === emoji ? '#10B981' : '#F3F4F6',
                    border: selectedAvatar === emoji ? '2px solid #059669' : '2px solid transparent',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="btn-primary full-width"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );

  const renderSpotifyConnect = () => {
    const handleSpotifyConnect = async () => {
      // Check if user is logged in before connecting Spotify
      console.log('🔍 Checking user session before Spotify connect...');
      
      // Try multiple ways to get user ID
      let userId = null;
      
      // Method 1: Check currentUser state
      if (currentUser?.id) {
        userId = currentUser.id;
        console.log('✅ Found user ID from currentUser:', userId);
      }
      
      // Method 2: Check userProfile state
      if (!userId && userProfile?.id) {
        userId = userProfile.id;
        console.log('✅ Found user ID from userProfile:', userId);
      }
      
      // Method 3: Check Supabase session
      if (!userId) {
        const { data: session, error: sessionError } = await auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
        } else if (session?.user) {
          userId = session.user.id;
          console.log('✅ Found user ID from session:', userId);
        }
      }
      
      // If still no user ID, redirect to login
      if (!userId) {
        console.warn('⚠️ No user ID found from any source, redirecting to login');
        console.log('Current user state:', { currentUser, userProfile });
        setError('Please log in first to connect your Spotify account');
        setCurrentScreen('login');
        return;
      }
      
      console.log('✅ User ID confirmed, proceeding with Spotify OAuth');
      console.log('👤 User ID:', userId);
      
      // Store user ID in sessionStorage as backup
      sessionStorage.setItem('spotify_connect_user_id', userId);
      
      // Redirect to backend OAuth endpoint
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      window.location.href = `${backendUrl}/api/auth/spotify`;
    };

    return (
      <div className="spotify-connect-screen">
        <div className="spotify-content">
          <div className="logo-small">
            <span className="logo-goat-small">🐐</span>
          </div>
          
          <h2>Connect Your Spotify</h2>
          <p className="spotify-subtitle">Sync your listening data to compete on leaderboards and track your music journey</p>
          
          <button className="btn-spotify" onClick={handleSpotifyConnect}>
            <Music size={20} />
            Connect Spotify Account
          </button>
          
          <button className="btn-skip" onClick={() => setCurrentScreen('profile')}>
            Skip for now
          </button>
        </div>
      </div>
    );
  };

  const renderProfileScreen = () => (
    <div className="main-app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-header">
            <span className="logo-goat-tiny">🐐</span>
            <span className="logo-text">HERD</span>
          </div>
        </div>
        <div className="header-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              setCurrentScreen('analytics');
              loadAnalytics();
            }}
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1F2937'
            }}
          >
            📊 Analytics
          </button>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search fans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {currentUser && (
            <button 
              onClick={handleLogout}
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="app-body">
        <div className="profile-header">
          <div className="profile-card">
            <div className="profile-avatar-container">
              <div 
                className="profile-avatar clickable"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              >
                <span className="avatar-emoji">{selectedAvatar}</span>
              </div>
              <ChevronDown size={16} className="avatar-dropdown-icon" />
              
              {showAvatarPicker && (
                <div className="avatar-picker">
                  {ANIMAL_AVATARS.map(emoji => (
                    <div 
                      key={emoji}
                      className={`avatar-option ${selectedAvatar === emoji ? 'selected' : ''}`}
                      onClick={() => handleAvatarChange(emoji)}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h2 className="profile-name">{currentUser?.username || 'User'}</h2>
              <p className="profile-since">Member since {currentUser?.memberSince || 'Recently'}</p>
            </div>
          </div>
        </div>

        {!userProfile?.spotify_access_token && (
          <div className="spotify-banner">
            <Music size={20} />
            <span>Connect Spotify to see your listening stats</span>
            <button className="btn-connect-small" onClick={() => setCurrentScreen('spotify-connect')}>Connect</button>
          </div>
        )}

        {userProfile?.spotify_access_token && (
          <div className="spotify-banner" style={{ background: '#10B981', color: 'white' }}>
            <Music size={20} />
            <span>Spotify Connected</span>
            <button 
              className="btn-connect-small" 
              onClick={async () => {
                if (!currentUser?.id || !userProfile?.spotify_access_token) return;
                setLoading(true);
                try {
                  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
                  const syncResponse = await fetch(`${backendUrl}/api/spotify/sync-listening-data`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId: currentUser.id,
                      accessToken: userProfile.spotify_access_token
                    })
                  });
                  const syncResult = await syncResponse.json();
                  if (syncResponse.ok) {
                    console.log('✅ Data synced:', syncResult);
                    // If token was refreshed, reload user profile to get new token
                    if (syncResult.tokenRefreshed) {
                      console.log('🔄 Token was refreshed, reloading profile...');
                      await loadUserData(currentUser.id);
                    }
                    await loadUserStats();
                    await loadTopArtists();
                    setError(null);
                    
                    // Track sync data event
                    try {
                      await analytics.trackEvent(currentUser.id, 'sync_data', {
                        synced_count: syncResult.synced || 0,
                        token_refreshed: syncResult.tokenRefreshed || false
                      });
                    } catch (analyticsError) {
                      console.error('Error tracking sync data:', analyticsError);
                      // Don't block app functionality if analytics fails
                    }
                  } else {
                    // Handle specific error codes
                    if (syncResult.code === 'TOKEN_EXPIRED') {
                      setError('Spotify connection expired. Please reconnect your Spotify account.');
                      // Optionally redirect to reconnect
                      // setCurrentScreen('spotify-connect');
                    } else {
                      throw new Error(syncResult.error || 'Sync failed');
                    }
                  }
                } catch (err) {
                  console.error('Sync error:', err);
                  setError(err.message || 'Failed to sync data');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              style={{ background: 'white', color: '#10B981' }}
            >
              {loading ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        )}

        <div className="stats-section">
          <div className="time-filter">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="past-week">Past Week</option>
              <option value="this-month">This Month</option>
              <option value="all-time">All Time</option>
              <option value="superbowl-competition">Superbowl Competition</option>
            </select>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Minutes</div>
                <div className="stat-value">{userStats.totalMinutes.toLocaleString()}</div>
                <div className="stat-sub">≈ {Math.round(userStats.totalMinutes / 60)} hours</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Music size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Songs</div>
                <div className="stat-value">{userStats.totalSongs.toLocaleString()}</div>
                <div className="stat-sub">streams since joining</div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h3>🏆 Top Artists</h3>
          </div>
          {loading ? (
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          ) : topArtists.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {topArtists.map((artist, index) => (
                <div 
                  key={artist.artistId} 
                  onClick={() => {
                    setCurrentScreen('leaderboard');
                    handleArtistSelect({ id: artist.artistId, name: artist.artistName });
                  }}
                  style={{
                    padding: '1rem',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ':hover': {
                      background: '#F3F4F6',
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>#{index + 1} {artist.artistName}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      {artist.totalMinutes} minutes • {artist.totalSongs} songs
                    </div>
                  </div>
                  <div style={{ color: '#10B981', fontSize: '1.2rem' }}>→</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Music size={48} />
              <p>No listening data yet</p>
              <span>Connect Spotify to see your top artists</span>
            </div>
          )}
        </div>
      </div>

      <nav className="bottom-nav">
        <button 
          className={currentScreen === 'profile' ? 'active' : ''}
          onClick={() => setCurrentScreen('profile')}
        >
          <Users size={24} />
          <span>Fans</span>
        </button>
        <button 
          className={currentScreen === 'leaderboard' ? 'active' : ''}
          onClick={() => setCurrentScreen('leaderboard')}
        >
          <Music size={24} />
          <span>Artists</span>
        </button>
      </nav>
    </div>
  );

  const renderLeaderboardScreen = () => (
    <div className="main-app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo-header">
            <span className="logo-goat-tiny">🐐</span>
            <span className="logo-text">HERD</span>
          </div>
        </div>
        <div className="header-right">
          <div className="search-bar" style={{ position: 'relative', width: '100%' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchArtists(e.target.value);
              }}
              onFocus={() => {
                if (artistSearchResults.length > 0) {
                  setShowArtistSearchResults(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow click on results
                setTimeout(() => setShowArtistSearchResults(false), 200);
              }}
            />
            {showArtistSearchResults && artistSearchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                marginTop: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {artistSearchResults.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => handleArtistSelect(artist)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ fontWeight: 500, color: '#1F2937' }}>{artist.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="app-body">
        <div className="artist-header">
          <div className="artist-card">
            <div className="artist-image-placeholder">
              <Music size={48} />
            </div>
            <div className="artist-info">
              <h2 className="artist-name">{selectedArtist?.name || 'Select an Artist'}</h2>
              <p className="artist-label">Artist Leaderboard</p>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="time-filter">
            <select 
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value);
                if (selectedArtist) {
                  loadLeaderboard(selectedArtist.id, selectedArtist.name);
                }
              }}
            >
              <option value="all-time">All Time</option>
              <option value="this-month">Past Month</option>
              <option value="past-week">Past Week</option>
              <option value="superbowl-competition">Superbowl Competition</option>
            </select>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h3>👑 Top Listeners</h3>
          </div>
          {loading ? (
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          ) : leaderboardData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaderboardData.map((entry) => (
                <div key={entry.userId} style={{
                  padding: '1rem',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', minWidth: '3rem' }}>
                      #{entry.rank}
                    </div>
                    <div style={{ fontSize: '2rem' }}>{entry.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{entry.username}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {entry.totalMinutes} minutes • {entry.totalSongs} songs
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Users size={48} />
              <p>No data available</p>
              <span>Search for an artist to see their top listeners</span>
            </div>
          )}
        </div>

        <div className="comments-section">
          <h3 className="comments-title">Fan Comments</h3>
          
          <div className="comment-sort">
            <select 
              value={commentSort}
              onChange={(e) => {
                setCommentSort(e.target.value);
                loadComments();
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="liked">Most Liked</option>
            </select>
          </div>

          {selectedArtist && (
            <div className="comment-input">
              <div className="comment-avatar">
                <span>{selectedAvatar}</span>
              </div>
              <input 
                type="text" 
                placeholder="Share your thoughts..."
                maxLength={200}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button 
                className="btn-send"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim() || loading}
              >
                <Send size={20} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="empty-state small">
              <p>Loading comments...</p>
            </div>
          ) : commentsData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {commentsData.map((comment) => (
                <div key={comment.id} style={{
                  padding: '1rem',
                  background: '#F9FAFB',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>{comment.users?.avatar || '🦌'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {comment.users?.username || 'Anonymous'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginLeft: '2.5rem' }}>{comment.text}</div>
                  {comment.likes && comment.likes.length > 0 && (
                    <div style={{ marginLeft: '2.5rem', marginTop: '0.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                      {comment.likes.length} like{comment.likes.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>No comments yet</p>
              <span>Be the first to share your thoughts</span>
            </div>
          )}
        </div>
      </div>

      <nav className="bottom-nav">
        <button 
          className={currentScreen === 'profile' ? 'active' : ''}
          onClick={() => setCurrentScreen('profile')}
        >
          <Users size={24} />
          <span>Fans</span>
        </button>
        <button 
          className={currentScreen === 'leaderboard' ? 'active' : ''}
          onClick={() => setCurrentScreen('leaderboard')}
        >
          <Music size={24} />
          <span>Artists</span>
        </button>
      </nav>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <div className="herd-app">
      {error && currentScreen !== 'login' && currentScreen !== 'signup' && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          background: '#FEE2E2',
          color: '#DC2626',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          cursor: 'pointer'
        }} onClick={() => setError(null)}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Error</div>
          <div style={{ fontSize: '0.875rem' }}>{error}</div>
        </div>
      )}
      {currentScreen === 'welcome' && renderWelcomeScreen()}
      {currentScreen === 'login' && renderLoginScreen()}
      {currentScreen === 'signup' && renderSignupScreen()}
      {currentScreen === 'spotify-connect' && renderSpotifyConnect()}
      {currentScreen === 'profile' && renderProfileScreen()}
      {currentScreen === 'leaderboard' && renderLeaderboardScreen()}
      {currentScreen === 'analytics' && (
        <div className="main-app">
          <header className="app-header">
            <div className="header-left">
              <button 
                onClick={() => setCurrentScreen('profile')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
              >
                ← Back
              </button>
              <div className="logo-header">
                <span className="logo-goat-tiny">📊</span>
                <span className="logo-text">Analytics</span>
              </div>
            </div>
          </header>

          <div className="app-content" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <button 
                onClick={loadAnalytics}
                disabled={analyticsLoading}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {analyticsLoading ? 'Loading...' : 'Refresh Analytics'}
              </button>
            </div>

            {analyticsData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Session Duration Stats */}
                {analyticsData.sessionStats && (
                  <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>⏱️ Session Duration (Last 30 Days)</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 500 }}>Total Sessions</span>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>{analyticsData.sessionStats.totalSessions}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 500 }}>Average Session Duration</span>
                        <span style={{ color: '#3B82F6', fontWeight: 600 }}>{analyticsData.sessionStats.averageDurationFormatted || '0m 0s'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 500 }}>Total Time on Platform</span>
                        <span style={{ color: '#8B5CF6', fontWeight: 600 }}>{analyticsData.sessionStats.totalDurationFormatted || '0m'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 500 }}>Unique Users with Sessions</span>
                        <span style={{ color: '#F59E0B', fontWeight: 600 }}>{analyticsData.sessionStats.uniqueUsers || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Counts */}
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Event Counts (Last 30 Days)</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>App Visits</span>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>{analyticsData.eventCounts.app_visit || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Leaderboard Views</span>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>{analyticsData.eventCounts.leaderboard_view || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Artist Searches</span>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>{analyticsData.eventCounts.artist_search || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Sync Data Clicks</span>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>{analyticsData.eventCounts.sync_data || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Sessions Started</span>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>{analyticsData.eventCounts.session_start || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Sessions Ended</span>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>{analyticsData.eventCounts.session_end || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Unique Users */}
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Unique Users (Last 30 Days)</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Users Who Visited App</span>
                      <span style={{ color: '#3B82F6', fontWeight: 600 }}>{analyticsData.uniqueUsers.app_visit || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Users Who Viewed Leaderboards</span>
                      <span style={{ color: '#3B82F6', fontWeight: 600 }}>{analyticsData.uniqueUsers.leaderboard_view || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Users Who Searched Artists</span>
                      <span style={{ color: '#3B82F6', fontWeight: 600 }}>{analyticsData.uniqueUsers.artist_search || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Users Who Synced Data</span>
                      <span style={{ color: '#3B82F6', fontWeight: 600 }}>{analyticsData.uniqueUsers.sync_data || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>No analytics data loaded</p>
                <span>Click "Refresh Analytics" to load data</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
