# Firebase Setup Instructions

## ⚠️ IMPORTANT: Security Notice

**Never commit `.env.local` to git!** This file contains your Firebase API keys and credentials.

The `.env.local` file is automatically ignored by git, but always double-check before committing.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **The `.env.local.example` file already contains the Firebase credentials for this project.**

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Firebase Configuration

The Firebase credentials are stored in `.env.local` (which is gitignored) and referenced in `.env.local.example` (which is safe to commit as a template).

### Current Firebase Project:
- **Project ID**: `ai-galaxy-54fea`
- **Project Name**: AI Galaxy

### Environment Variables Required:

All Firebase credentials are already set in `.env.local.example`. Just copy it to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ai-galaxy-54fea.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ai-galaxy-54fea
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ai-galaxy-54fea.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **ai-galaxy-54fea**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable:
   - ✅ **Email/Password** - Click "Enable" and save
   - ✅ **Google** - Click "Enable", configure OAuth consent screen, and save

## Files in Git

### ✅ Safe to Commit (in Git):
- `src/config/firebase.ts` - Code file (no credentials)
- `.env.local.example` - Template with example values
- `README_FIREBASE.md` - This documentation

### ❌ Never Commit (Gitignored):
- `.env.local` - Contains actual credentials
- `.env` - Environment variables
- `*-firebase-adminsdk-*.json` - Firebase Admin SDK keys

## Verification

After setup, check your browser console. You should see:
```
Firebase initialized successfully
Firebase Analytics initialized
```

If you see warnings about missing API keys, make sure:
1. `.env.local` exists in the `aigalaxy-frontend` directory
2. You've restarted the dev server after creating `.env.local`
3. All environment variables are set correctly

## Troubleshooting

### Login/Signup Not Working?

1. **Check `.env.local` exists:**
   ```bash
   ls -la .env.local
   ```

2. **Verify environment variables are loaded:**
   - Restart the dev server: `npm run dev`
   - Check browser console for Firebase initialization messages

3. **Enable Authentication in Firebase Console:**
   - Make sure Email/Password and Google are enabled
   - Check Firebase Console → Authentication → Sign-in method

4. **Check browser console for errors:**
   - Open DevTools (F12) → Console tab
   - Look for Firebase-related errors

## Security Best Practices

1. ✅ **Always use `.env.local` for credentials** (gitignored)
2. ✅ **Never hardcode credentials in source code**
3. ✅ **Use `.env.local.example` as a template** (safe to commit)
4. ✅ **Rotate API keys if accidentally committed**
5. ✅ **Review `.gitignore` regularly**

## Need Help?

- Check `FIREBASE_SETUP.md` for detailed setup instructions
- Check `TROUBLESHOOTING_FIREBASE.md` for common issues
- Review Firebase Console for authentication settings

