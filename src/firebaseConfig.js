// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

console.log("firebaseConfig.js loaded");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required Firebase config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  // Convert camelCase to SCREAMING_SNAKE_CASE for env var names
  const toEnvVarName = (key) => {
    return 'VITE_FIREBASE_' + key
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
  };
  
  console.error(
    '❌ Firebase not initialized — missing environment variables:\n' +
    missingKeys.map(key => `   - ${toEnvVarName(key)}`).join('\n') +
    '\n\n💡 To fix this:\n' +
    '   1. Create a .env file in the project root\n' +
    '   2. Add the following variables:\n' +
    '      VITE_FIREBASE_API_KEY=your-api-key\n' +
    '      VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain\n' +
    '      VITE_FIREBASE_PROJECT_ID=your-project-id\n' +
    '      VITE_FIREBASE_APP_ID=your-app-id\n' +
    '   3. Restart the dev server\n'
  );
  throw new Error('Firebase configuration incomplete. Check console for details.');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
