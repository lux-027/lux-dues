'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

/**
 * Lazily initializes Firebase, only in the browser and only when a sign-in
 * action actually needs it. This avoids running Firebase (and requiring its
 * env vars) during server-side rendering / static build, where the module
 * would otherwise throw `auth/invalid-api-key` if the NEXT_PUBLIC_FIREBASE_*
 * variables aren't set for that environment.
 */
function getFirebaseAuth(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used in the browser');
  }
  if (!firebaseConfig.apiKey) {
    throw new Error(
      'Firebase yapılandırması eksik. NEXT_PUBLIC_FIREBASE_* ortam değişkenlerini ayarlayın.'
    );
  }
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
}

/**
 * Opens the Google sign-in popup and returns the Firebase ID token for the
 * signed-in user. The ID token is then sent to our backend (/api/auth/google)
 * to be verified and exchanged for our own session cookie.
 */
export async function signInWithGoogle(): Promise<string> {
  const auth = getFirebaseAuth();
  const googleProvider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, googleProvider);
  return result.user.getIdToken();
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Creates (once) the invisible reCAPTCHA verifier required by Firebase phone
 * auth, attached to the given container element id.
 */
function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
      size: 'invisible',
    });
  }
  return recaptchaVerifier;
}

/**
 * Sends an SMS verification code to the given phone number (E.164 format,
 * e.g. "+905551234567"). Returns a ConfirmationResult used to confirm the
 * code the user receives.
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  recaptchaContainerId: string
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  const verifier = getRecaptchaVerifier(recaptchaContainerId);
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}

/**
 * Confirms the SMS code and returns the Firebase ID token for the now
 * signed-in user.
 */
export async function confirmPhoneOtp(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<string> {
  const result = await confirmationResult.confirm(code);
  return result.user.getIdToken();
}
