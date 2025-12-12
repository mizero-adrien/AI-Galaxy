// Client-side only imports - Firebase should not be imported on server
// Using dynamic imports to prevent SSR issues with undici
type User = any;
type UserCredential = any;

/**
 * Ensure Firebase is initialized before use (client-side only)
 */
const ensureAuth = async () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side.');
  }
  const { getAuthInstance } = await import('../config/firebase');
  const authInstance = await getAuthInstance();
  if (!authInstance) {
    throw new Error('Firebase is not initialized. Please check your Firebase configuration.');
  }
  return authInstance;
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side.');
  }
  try {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const authInstance = await ensureAuth();
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Sign up error:', error);
    // Handle Firebase specific error codes
    if (error.code) {
      throw new Error(error.message || `Firebase error: ${error.code}`);
    }
    throw new Error(error.message || 'Failed to create account');
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side.');
  }
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const authInstance = await ensureAuth();
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Sign in error:', error);
    // Preserve the original Firebase error with code for better handling
    // Firebase errors have a 'code' property (e.g., 'auth/invalid-credential')
    if (error.code) {
      // Create a new error that preserves the code
      const firebaseError = new Error(error.message || `Firebase error: ${error.code}`);
      (firebaseError as any).code = error.code;
      throw firebaseError;
    }
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side.');
  }
  try {
    const { signInWithPopup } = await import('firebase/auth');
    const authInstance = await ensureAuth();
    const { getGoogleProvider } = await import('../config/firebase');
    const googleProviderInstance = await getGoogleProvider();
    if (!googleProviderInstance) {
      throw new Error('Google provider is not initialized');
    }
    const userCredential = await signInWithPopup(authInstance, googleProviderInstance);
    return userCredential;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    // Handle Firebase specific error codes
    if (error.code) {
      throw new Error(error.message || `Firebase error: ${error.code}`);
    }
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return; // Silently return on server side
  }
  try {
    const { signOut } = await import('firebase/auth');
    const authInstance = await ensureAuth();
    await signOut(authInstance);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const authInstance = await ensureAuth();
    return authInstance.currentUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Convert Firebase User to app user format
 */
export const formatFirebaseUser = (user: User) => {
  return {
    id: user.uid,
    email: user.email || '',
    username: user.displayName || user.email?.split('@')[0] || '',
    email_verified: user.emailVerified,
    photo_url: user.photoURL || null,
  };
};



