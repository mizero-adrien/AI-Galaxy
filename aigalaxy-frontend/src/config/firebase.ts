// Lazy load Firebase to prevent errors if not installed
let auth: any = null;
let googleProvider: any = null;
let app: any = null;
let analytics: any = null;

const initializeFirebase = async () => {
  if (typeof window === 'undefined') return; // Skip on server-side
  
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { GoogleAuthProvider } = await import('firebase/auth');
    const { getAnalytics } = await import('firebase/analytics');

    // Your web app's Firebase configuration
    // IMPORTANT: Set these values in .env.local file (see .env.local.example)
    // Credentials are NOT hardcoded here for security - use environment variables
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ai-galaxy-54fea.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ai-galaxy-54fea",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ai-galaxy-54fea.firebasestorage.app",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
    };

    // Validate required Firebase config
    if (!firebaseConfig.apiKey) {
      console.warn('⚠️ Firebase API key is missing!');
      console.warn('Please create .env.local file with your Firebase credentials.');
      console.warn('Copy .env.local.example to .env.local and fill in the values.');
      console.warn('See README_FIREBASE.md for setup instructions.');
      return;
    }

    // Initialize Firebase
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    // Initialize Firebase Auth
    auth = getAuth(app);

    // Initialize Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Initialize Analytics (only in browser)
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      } catch (analyticsError) {
        console.warn('Firebase Analytics initialization failed:', analyticsError);
      }
    }

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.warn('Firebase is not installed or configuration is invalid. Please run: npm install firebase');
    console.warn('Make sure you have set up your Firebase environment variables in .env.local');
  }
};

// Initialize on module load (client-side only)
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export const getAuthInstance = async () => {
  if (!auth) {
    await initializeFirebase();
  }
  return auth;
};

export const getGoogleProvider = async () => {
  if (!googleProvider) {
    await initializeFirebase();
  }
  return googleProvider;
};

export { auth, googleProvider, app, analytics };
export default app;
