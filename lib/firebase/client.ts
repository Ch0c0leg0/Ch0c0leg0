import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Config lue depuis l'environnement : voir .env.example (NEXT_PUBLIC_FIREBASE_*).
// Les valeurs restent hors du dépôt (.env* est gitignoré).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Retourne l'app Firebase, ou null si la config est incomplète. */
export function getFirebaseApp(): FirebaseApp | null {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    return null;
  }
  const existing = getApps()[0];
  return existing ?? initializeApp(firebaseConfig);
}

let analyticsPromise: Promise<Analytics | null> | null = null;

/** Auth (à utiliser côté client ; le produit doit être activé dans la console). */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

/** Firestore (à utiliser côté client ; règles à définir dans la console). */
export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

/** Cloud Storage (à utiliser côté client ; règles à définir dans la console). */
export function getFirebaseStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}

/**
 * Analytics dispo uniquement côté navigateur (et si measurementId configuré).
 * À appeler depuis un composant client, ex. : `void getFirebaseAnalytics();`
 */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  analyticsPromise ??= (async () => {
    const app = getFirebaseApp();
    if (!app || !firebaseConfig.measurementId) return null;
    if (!(await isAnalyticsSupported().catch(() => false))) return null;
    return getAnalytics(app);
  })();
  return analyticsPromise;
}
