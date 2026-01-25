# Signup Debugging Guide

## 🔍 Step 1: Check Browser Console

**Most Important:** Open browser console to see what's happening:

1. Press `F12` (or `Cmd+Option+I` on Mac)
2. Click "Console" tab
3. Try signing up
4. Look for messages starting with:
   - "Attempting signup..."
   - "Signup response:"
   - "Error creating user profile:"
   - Any red error messages

**Share what you see in the console!**

## 🔍 Step 2: Check What Error Message Shows

When you click "Create Account", what error message appears on screen?

Common messages:
- "Please fill in all required fields"
- "Password must be at least 6 characters long"
- "This email is already registered"
- "Database permission error"
- "Signup failed. Please try again."

## 🔍 Step 3: Verify Supabase Setup

### Check Authentication Users

1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Try signing up
4. Check if a user appears in the list (even if signup "failed")

**If user appears:** Auth worked, but profile creation failed
**If no user appears:** Auth signup itself is failing

### Check Users Table

1. Go to **Table Editor** → **users** table
2. Try signing up
3. Check if a row appears in the table

**If row appears:** Signup actually worked!
**If no row:** Profile creation is failing

## 🐛 Common Issues

### Issue 1: "Username already exists"

**Cause:** Username must be unique

**Fix:** Try a different username

### Issue 2: "Email already registered"

**Cause:** Email already in use

**Fix:** 
- Use a different email
- Or log in with existing account
- Or delete the user from Supabase Authentication → Users

### Issue 3: Profile Creation Fails (User Created but No Profile)

**Symptoms:**
- User appears in Authentication → Users
- But no row in users table
- Console shows "Error creating user profile"

**Fix:** Check RLS policies are correct (should have INSERT policy)

### Issue 4: Nothing Happens When Clicking Button

**Possible causes:**
- Form validation failing silently
- JavaScript error blocking execution
- Button not connected to handler

**Fix:** Check browser console for errors

## 🧪 Test Steps

1. **Open Browser Console** (F12)
2. **Clear console** (right-click → Clear console)
3. **Fill in signup form:**
   - Username: `testuser123` (use unique username)
   - Email: `test123@example.com` (use unique email)
   - Password: `test123` (6+ characters)
   - Choose avatar
4. **Click "Create Account"**
5. **Watch console** for:
   - "Attempting signup..." message
   - "Signup response:" with data/error
   - Any error messages

## 📋 What to Share

To help debug, share:

1. **Browser console output** (copy/paste or screenshot)
2. **Error message** shown on screen
3. **Whether user appears** in Supabase Authentication → Users
4. **Whether row appears** in users table

## ✅ Expected Console Output (Success)

```
Attempting signup...
Signup response: { data: { user: {...} }, error: null }
User created: [user-id]
Signup successful, redirecting...
```

## ❌ Common Console Output (Failure)

```
Attempting signup...
Signup response: { data: null, error: { message: "..." } }
Signup error details: {...}
```

OR

```
Attempting signup...
Signup response: { data: { user: {...} }, error: null }
User created: [user-id]
Error creating user profile: { message: "..." }
```

---

**Next:** Check your browser console and share what you see!
