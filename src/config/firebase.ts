import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Check if Firebase is properly configured
const hasValidConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) return false;
  if (apiKey === 'your-api-key' || apiKey === 'your-api-key-here') return false;
  if (apiKey.includes('your-') || apiKey.includes('-here')) return false;
  // Real Firebase API keys start with "AIza"
  return apiKey.startsWith('AIza');
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Only initialize Firebase if valid config exists
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (hasValidConfig()) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  auth.languageCode = 'he';
}

export { app, db, auth };
export default app;
