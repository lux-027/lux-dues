'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
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

// Avoid re-initializing on every hot-reload / re-render.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();

/**
 * Opens the Google sign-in popup and returns the Firebase ID token for the
 * signed-in user. The ID token is then sent to our backend (/api/auth/google)
 * to be verified and exchanged for our own session cookie.
 */
export async function signInWithGoogle(): Promise<string> {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  return result.user.getIdToken();
}

let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Creates (once) the invisible reCAPTCHA verifier required by Firebase phone
 * auth, attached to the given container element id.
 */
function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, containerId, {
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
  const verifier = getRecaptchaVerifier(recaptchaContainerId);
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
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
