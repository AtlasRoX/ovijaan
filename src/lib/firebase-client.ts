/**
 * OBHIJAAN Firebase Client SDK (Minimal — Google Sign-In only)
 *
 * This module initializes the Firebase client SDK solely to run the
 * Google Sign-In popup. The resulting ID token is sent to our server
 * which verifies it via Firebase REST before minting the session cookie.
 *
 * No session state, user data, or Firestore access happens through this
 * client SDK — all of that stays server-side.
 *
 * The Firebase Web API key is safe to expose in client bundles. It
 * identifies your Firebase project; it does not authenticate anyone.
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
};

// Avoid re-initializing on hot reloads in dev
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
