# ⚡ Quick Fix: Start Backend Locally

If you want to test Spotify connection locally first (before deploying), here's how to start the backend:

## 🚀 Start Backend Server

**Open a NEW terminal window** and run:

```bash
cd /Users/davidstouck/HerdMVP2/server
npm run dev
```

**Expected output:**
```
🚀 Herd backend server running on http://localhost:3001
📡 Frontend URL: http://localhost:3000
🎵 Spotify Client ID: ✅ Set
🗄️  Supabase URL: ✅ Set
```

## ✅ Verify Backend is Running

1. Open browser
2. Go to: `http://localhost:3001`
3. You should see a response (even if it's an error page)

## 🎵 Then Connect Spotify

Once backend is running:
1. Go to your app: `http://localhost:3000`
2. Click "Connect Spotify" on your profile
3. Should work now!

## 🐛 If Backend Won't Start

### Check server/.env exists:
```bash
cd /Users/davidstouck/HerdMVP2/server
ls -la .env
```

### Check for errors:
Look at the terminal output when running `npm run dev`. Common issues:
- Missing environment variables
- Port 3001 already in use
- Node modules not installed

### Install dependencies (if needed):
```bash
cd /Users/davidstouck/HerdMVP2/server
npm install
```

---

**Note:** You can skip local testing and go straight to deployment if you prefer! The deployment guide will set everything up for production.
