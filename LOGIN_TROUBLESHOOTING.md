# Login Troubleshooting Guide

## 🔍 Common Login Issues

### Issue 1: "Login failed" - No Account Exists

**Solution:** You need to **sign up first** before you can log in!

1. Click "Sign Up" tab
2. Fill in:
   - Username
   - Email
   - Password (min 6 characters)
   - Choose an avatar
3. Click "Create Account"
4. Then you can log in with those credentials

### Issue 2: "Invalid email or password"

**Possible causes:**
- Wrong email or password
- Account doesn't exist (sign up first)
- Typo in email/password

**Solution:**
- Double-check your email and password
- Try signing up again if you're not sure
- Use the "Sign Up" tab to create a new account

### Issue 3: "Email not confirmed"

**Cause:** Supabase requires email confirmation by default

**Solution Options:**

**Option A: Disable Email Confirmation (for development)**
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Under "Email Auth", disable "Enable email confirmations"
4. Save changes
5. Try signing up again

**Option B: Check Your Email**
1. Check your email inbox (and spam folder)
2. Click the confirmation link
3. Then try logging in

### Issue 4: "Supabase not configured"

**Cause:** Missing or incorrect Supabase credentials

**Solution:**
1. Check `.env` file has:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
2. Restart dev server after changing `.env`

## 🧪 Testing Steps

### Step 1: Sign Up First

1. Go to Sign Up tab
2. Enter:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123` (or any 6+ characters)
   - Choose an avatar
3. Click "Create Account"

**Expected:**
- Account created successfully
- Redirected to Spotify Connect screen
- OR see message about email confirmation

### Step 2: Log In

1. Go to Log In tab
2. Enter the same email and password you used to sign up
3. Click "Log In"

**Expected:**
- Successfully logged in
- Redirected to Profile screen
- See your username and avatar

## 🔧 Supabase Email Confirmation Settings

### For Development (Disable Confirmation)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Settings**
4. Scroll to **Email Auth**
5. **Disable** "Enable email confirmations"
6. Click **Save**

This allows immediate login after signup (good for testing).

### For Production (Keep Enabled)

Keep email confirmation enabled for security. Users will need to:
1. Sign up
2. Check email
3. Click confirmation link
4. Then log in

## 📋 Quick Checklist

- [ ] Signed up first (can't log in without an account)
- [ ] Using correct email and password
- [ ] Password is 6+ characters
- [ ] Supabase credentials in `.env` file
- [ ] Email confirmation disabled (for dev) or email confirmed
- [ ] Check browser console for specific errors

## 🐛 Debug Steps

1. **Check Browser Console (F12)**
   - Look for specific error messages
   - Share any red errors you see

2. **Check Supabase Dashboard**
   - Go to Authentication → Users
   - See if your user was created
   - Check user status

3. **Try Sign Up First**
   - Always sign up before trying to log in
   - Use a simple password for testing

4. **Check Error Message**
   - The app now shows more specific errors
   - Read the error message carefully

## ✅ Expected Flow

1. **Sign Up** → Account created → Redirect to Spotify Connect
2. **Log In** → Authenticated → Redirect to Profile

---

**Most Common Issue:** Trying to log in without signing up first. Always sign up first!
