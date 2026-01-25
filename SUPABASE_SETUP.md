# Supabase Setup Guide for Herd App

## Step-by-Step Instructions

### Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email
4. Click **"New Project"**
5. Fill in the project details:
   - **Name**: `herd-app` (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select the region closest to you
   - **Pricing Plan**: Free tier is fine for development
6. Click **"Create new project"**
7. Wait 2-3 minutes for the project to be created

### Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in left sidebar)
2. Click on **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL** - Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key - Copy this (long string starting with `eyJ...`)

### Step 3: Add Credentials to .env File

Open your `.env` file and update these lines with your actual Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Set Up Database Tables

1. In your Supabase project dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-setup.sql` in this project
4. Copy **ALL** the SQL code from that file
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" messages

### Step 5: Verify Tables Were Created

1. Click on **"Table Editor"** in the left sidebar
2. You should see three tables:
   - `users`
   - `listening_data`
   - `comments`

### Step 6: Restart Your Dev Server

1. Stop your current dev server (Ctrl+C)
2. Restart it:
   ```bash
   npm run dev
   ```

## What Each Table Does

### `users` Table
- Stores user account information
- Includes Spotify tokens (encrypted)
- User profile data (username, avatar, etc.)

### `listening_data` Table
- Stores every track play from Spotify
- Used to calculate listening stats
- Powers the leaderboards

### `comments` Table
- Stores fan comments on artist pages
- Includes likes functionality
- 200 character limit per comment

## Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- Users can only see/modify their own data
- Comments are public (anyone can view)
- The `anon` key is safe to use in frontend code
- Never expose the `service_role` key (backend only)

## Troubleshooting

### "Supabase credentials not found" warning
- Check that `.env` file exists and has correct variable names
- Make sure variable names start with `VITE_`
- Restart your dev server after changing `.env`

### SQL errors when running setup
- Make sure you're copying the entire SQL file
- Run it section by section if needed
- Check Supabase project is fully created (wait a few minutes)

### Can't see tables in Table Editor
- Refresh the page
- Check SQL Editor for any error messages
- Verify the SQL ran successfully

## Next Steps

Once Supabase is set up:
1. ✅ Database tables created
2. ✅ Credentials in `.env` file
3. ✅ Dev server restarted

You can now:
- Test user signup/login
- Connect Spotify accounts
- Store listening data
- Display leaderboards
- Add comments

---

**Need help?** Check the main `README.md` for more details.
