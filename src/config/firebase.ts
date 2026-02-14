import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Required Firebase environment variables
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

// Check if Firebase is properly configured
const hasValidConfig = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

  // Check if API key exists and is not a placeholder
  if (!apiKey) return false;

  // Block common placeholder patterns
  const placeholderPatterns = [
    'your-api-key',
    'your-api',
    '-here',
    'placeholder',
    'example',
    'test',
    'demo'
  ];

  if (placeholderPatterns.some(pattern => apiKey.toLowerCase().includes(pattern))) {
    console.warn('Firebase: API key appears to be a placeholder. Running in demo mode.');
    return false;
  }

  // Real Firebase API keys start with "AIza"
  if (!apiKey.startsWith('AIza')) {
    console.warn('Firebase: Invalid API key format. Running in demo mode.');
    return false;
  }

  // Check all required env vars are present
  const missingVars = REQUIRED_ENV_VARS.filter(varName => {
    const value = import.meta.env[varName];
    return !value || value === '' || value.includes('your-');
  });

  if (missingVars.length > 0) {
    console.warn(`Firebase: Missing or invalid environment variables: ${missingVars.join(', ')}. Running in demo mode.`);
    return false;
  }

  return true;
};

// Firebase configuration - no fallback placeholders
const getFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

// Initialize Firebase only if valid config exists
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (hasValidConfig()) {
  try {
    app = initializeApp(getFirebaseConfig());
    db = getFirestore(app);
    auth = getAuth(app);
    auth.languageCode = 'he';
    console.log('Firebase: Initialized successfully');
  } catch (error) {
    console.error('Firebase: Initialization failed', error);
  }
} else {
  console.log('Firebase: Running in demo mode (no valid configuration)');
}

export { app, db, auth };
export default app;
