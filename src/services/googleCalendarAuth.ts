/**
 * Google Calendar Authentication via Firebase Auth & Direct Google Identity Services (GIS)
 * Supports client-side OAuth token retrieval with automatic fallback for unauthorized domains
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

export const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

let app: any = null;
let auth: any = null;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase Auth init notice (falling back to direct GIS):", e);
}

export { auth };

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: "consent",
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

/**
 * Load Google Identity Services (GIS) client script dynamically if not available
 */
export const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services script"));
    document.head.appendChild(script);
  });
};

/**
 * Sign in using Google Identity Services (GIS) Token Client directly
 * This bypasses Firebase Auth domain restrictions for Google Calendar API
 */
export const signInWithGsi = async (): Promise<{ user: User; accessToken: string }> => {
  await loadGsiScript();

  const clientId = firebaseConfig.oAuthClientId;
  if (!clientId) {
    throw new Error("Missing oAuthClientId in configuration");
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES.join(" "),
        callback: (response: any) => {
          if (response.error) {
            reject(
              new Error(
                response.error_description ||
                  response.error ||
                  "Google Calendar permission was not granted.",
              ),
            );
            return;
          }

          if (!response.access_token) {
            reject(new Error("No access token returned from Google"));
            return;
          }

          cachedAccessToken = response.access_token;

          // Create synthetic User object compatible with Firebase Auth User shape
          const syntheticUser = {
            uid: "gsi_google_user",
            displayName: "Google Account",
            email: "Google Calendar Connected",
            photoURL: "https://www.gstatic.com/images/branding/product/2x/calendar_2020q4_48dp.png",
          } as unknown as User;

          resolve({ user: syntheticUser, accessToken: response.access_token });
        },
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Initialize auth state listener. Call this on app load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void,
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google Popup and obtain access token
 * Automatically falls back to Direct GIS Token Client if domain is unauthorized in Firebase
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  isSigningIn = true;
  try {
    if (auth) {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
      }
    }
    return await signInWithGsi();
  } catch (error: any) {
    console.warn("Firebase Auth error, falling back to Direct Google GIS OAuth:", error?.message);

    try {
      return await signInWithGsi();
    } catch (gsiError: any) {
      console.error("Direct GIS OAuth Error:", gsiError);
      let userMsg = gsiError?.message || error?.message || "Google Calendar sign-in failed.";
      if (userMsg.includes("unauthorized-domain") || userMsg.includes("popup-closed")) {
        userMsg =
          "Google Calendar access was not completed. Please allow popup windows and grant permission.";
      }
      throw new Error(userMsg);
    }
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory cached access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Current authenticated Firebase user
 */
export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

import { clearCalendarCache } from "./googleCalendarService";

/**
 * Sign out and clear in-memory token and cached calendar ID
 */
export const logoutGoogleCalendar = async (): Promise<void> => {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch {
    // ignore
  }
  cachedAccessToken = null;
  clearCalendarCache();
};
