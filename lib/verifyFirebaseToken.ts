import { createRemoteJWKSet, jwtVerify } from 'jose';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Firebase ID tokens are standard signed JWTs. We verify them directly
// against Google's public keys — no Firebase Admin service account needed.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export interface FirebaseTokenPayload {
  uid: string;
  email?: string;
  phone_number?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

/**
 * Verifies a Firebase Authentication ID token (as returned by
 * `firebase/auth`'s `getIdToken()`) and returns the decoded user info.
 * Works for any sign-in provider (Google, Phone, etc.) since Firebase issues
 * the same signed JWT format regardless of provider.
 * Throws if the token is invalid, expired, or issued for a different project.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseTokenPayload> {
  if (!PROJECT_ID) {
    throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured');
  }

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  if (!payload.sub || (!payload.email && !payload.phone_number)) {
    throw new Error('Firebase token is missing required claims');
  }

  return {
    uid: payload.sub,
    email: payload.email as string | undefined,
    phone_number: payload.phone_number as string | undefined,
    name: payload.name as string | undefined,
    picture: payload.picture as string | undefined,
    email_verified: payload.email_verified as boolean | undefined,
  };
}
