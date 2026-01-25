# Testing Checklist - Herd App

## ✅ Pre-Testing Checklist

- [x] `.env` file exists with `VITE_` prefix on all variables
- [x] Supabase credentials added
- [x] Dev server restarted after .env changes
- [ ] Browser console shows no errors
- [ ] App loads at `http://localhost:3000`

## 🧪 Test 1: App Loads

**Expected:** You should see the Herd welcome screen with:
- 🐐 Goat emoji in a circle
- "Prove you're the Goat" title
- "Log in" button

**If blank screen:**
- Check browser console (F12) for errors
- Verify dev server is running
- Hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

## 🧪 Test 2: User Signup

1. Click "Log in" button
2. Click "Sign Up" tab
3. Fill in:
   - Username
   - Email
   - Password (min 6 characters)
   - Choose an avatar
4. Click "Create Account"

**Expected:** 
- Account created
- Redirected to Spotify Connect screen
- No error messages

**If error:**
- Check browser console
- Verify Supabase credentials are correct
- Check Supabase dashboard - user should appear in `users` table

## 🧪 Test 3: User Login

1. Go back to "Log In" tab
2. Enter email and password
3. Click "Log In"

**Expected:**
- Successfully logged in
- Redirected to Profile screen
- See your username and avatar

## 🧪 Test 4: Profile Screen

**Expected to see:**
- Your profile card with avatar and username
- "Member since" date
- Stats cards (Total Minutes, Total Songs) - will be 0 initially
- "Connect Spotify" banner (if not connected)
- Top Artists section (empty state)
- Bottom navigation (Fans/Artists tabs)

**Test avatar change:**
- Click on your avatar
- Select a different animal emoji
- Avatar should update

## 🧪 Test 5: Spotify Connection (Backend Required)

**Prerequisites:**
- Backend server running on port 3001
- Spotify redirect URI configured

1. Click "Connect Spotify" button
2. Should redirect to Spotify authorization
3. Log in and authorize
4. Should redirect back to app
5. Tokens should be saved

**Expected:**
- No "Connect Spotify" banner
- Can sync listening data (next step)

## 🧪 Test 6: Navigation

- Click "Artists" tab in bottom nav
- Should switch to Leaderboard screen
- Click "Fans" tab
- Should switch back to Profile screen

## 🐛 Common Issues

### "Supabase credentials not found"
- Check `.env` file has `VITE_` prefix
- Restart dev server

### "Cannot connect to backend"
- Start backend: `cd server && npm run dev`
- Check `VITE_BACKEND_URL` in `.env`

### "Login/Signup failed"
- Check Supabase dashboard
- Verify database tables exist
- Check browser console for specific error

### "Blank screen"
- Check browser console (F12)
- Verify all environment variables set
- Hard refresh browser

## ✅ Success Criteria

App is working if:
- ✅ Welcome screen loads
- ✅ Can sign up new user
- ✅ Can log in
- ✅ Profile screen displays
- ✅ Can navigate between screens
- ✅ No errors in browser console

## 🚀 Next Steps After Testing

Once basic functionality works:
1. Test Spotify OAuth flow (requires backend)
2. Sync listening data
3. Test leaderboards
4. Deploy to Vercel

---

**Status:** Ready to test! Start with Test 1 and work through the checklist.
