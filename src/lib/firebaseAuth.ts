// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'TON_API_KEY',
  authDomain: 'TON_AUTH_DOMAIN',
  projectId: 'TON_PROJECT_ID',
  storageBucket: 'TON_STORAGE_BUCKET',
  messagingSenderId: 'TON_MESSAGING_SENDER_ID',
  appId: 'TON_APP_ID',
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Export des services
export const auth = getAuth(app);
export const db = getFirestore(app);
