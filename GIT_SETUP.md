# 🔧 Git Setup: Push HerdMVP2 to GitHub

You're in the wrong directory! You initialized git in `myapp`, but your Herd app is in `HerdMVP2`.

## ✅ Step-by-Step Fix

### Step 1: Navigate to HerdMVP2 Directory

Open Terminal on your Mac and run:

```bash
cd /Users/davidstouck/HerdMVP2
```

### Step 2: Initialize Git (if not already done)

```bash
git init
```

### Step 3: Add All Files

```bash
git add .
```

This will add all files in HerdMVP2 to git (except those in `.gitignore` like `.env` files).

### Step 4: Make Your First Commit

```bash
git commit -m "Initial commit: Herd MVP app"
```

### Step 5: Connect to Your GitHub Repository

You created a repo called `MVP2-V1`. Connect it:

```bash
git remote add origin https://github.com/dstouck92/MVP2-V1.git
```

**If you get "remote origin already exists" error:**
```bash
git remote remove origin
git remote add origin https://github.com/dstouck92/MVP2-V1.git
```

### Step 6: Set Main Branch and Push

```bash
git branch -M main
git push -u origin main
```

## ✅ Success!

You should see:
```
Enumerating objects: ...
Writing objects: 100% (...), done.
To https://github.com/dstouck92/MVP2-V1.git
 * [new branch]      main -> main
```

## 🔍 Verify

1. Go to your GitHub repo: https://github.com/dstouck92/MVP2-V1
2. You should see all your HerdMVP2 files there!

## 📋 Complete Command Sequence

Copy and paste this entire block into your terminal:

```bash
cd /Users/davidstouck/HerdMVP2
git init
git add .
git commit -m "Initial commit: Herd MVP app"
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/dstouck92/MVP2-V1.git
git push -u origin main
```

## ⚠️ Important Notes

- The `.env` files will **NOT** be pushed (they're in `.gitignore` - this is good for security!)
- Only the code and configuration files will be pushed
- You'll add environment variables directly in Vercel and Railway later

## 🐛 Troubleshooting

### "fatal: not a git repository"
- Make sure you're in `/Users/davidstouck/HerdMVP2` directory
- Run `git init` first

### "remote origin already exists"
- Run: `git remote remove origin`
- Then: `git remote add origin https://github.com/dstouck92/MVP2-V1.git`

### "Permission denied" or authentication errors
- GitHub may ask for your username/password
- Or set up SSH keys for easier authentication
- Or use GitHub CLI: `gh auth login`

---

**Next:** Once code is on GitHub, proceed to Step 2 in `DEPLOYMENT_GUIDE.md` (Deploy to Vercel)!
