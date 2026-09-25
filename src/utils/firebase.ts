import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

// Firebase configuration loaded from project config
export const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId,
};

export const FIREBASE_PROJECT_ID = firebaseConfigData.projectId;
export const FIREBASE_AUTH_PROVIDERS_URL = `https://console.firebase.google.com/project/${firebaseConfigData.projectId}/authentication/providers`;

// Initialize App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with explicit database ID if present in config
export const db = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Test Firestore connectivity on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: client is offline or network error.');
      return false;
    }
    // Any other error means the server responded
    return true;
  }
}

// User Profile Type in Firestore
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

// Booking Record Type in Firestore
export interface BookingRecord {
  id?: string;
  userId: string;
  specialistId: string;
  specialistName: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  bookingStatus: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  clientName?: string;
  clientPhone?: string;
  notes?: string;
  bookingCode?: string;
}

// Authentication Service Functions
export async function registerWithEmail(
  name: string,
  email: string,
  pass: string,
  phone?: string
): Promise<FirebaseUser> {
  try {
    console.info(`[Firebase Auth] Registering user with email: ${email}`);
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = credential.user;

    // Set displayName on Firebase Auth user
    await updateProfile(user, { displayName: name });

    // Create user document in Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name,
        email,
        phone: phone || '',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Firebase Firestore] Error saving user profile to Firestore:', err);
    }

    return user;
  } catch (error: any) {
    console.error('[Firebase Auth Error] Registration failed:', {
      code: error?.code,
      message: error?.message,
      fullError: error,
    });
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    console.info(`[Firebase Auth] Logging in with email: ${email}`);
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return credential.user;
  } catch (error: any) {
    console.error('[Firebase Auth Error] Login failed:', {
      code: error?.code,
      message: error?.message,
      fullError: error,
    });
    throw error;
  }
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    console.info('[Firebase Auth] Logging in with Google Popup');
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;

    // Ensure user document exists in Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          id: user.uid,
          name: user.displayName || 'کاربر بوکتون',
          email: user.email || '',
          phone: user.phoneNumber || '',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('[Firebase Firestore] Error ensuring user doc for Google user:', err);
    }

    return user;
  } catch (error: any) {
    console.error('[Firebase Auth Error] Google login failed:', {
      code: error?.code,
      message: error?.message,
      fullError: error,
    });
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Booking Service Functions
export async function createFirestoreBooking(
  bookingData: Omit<BookingRecord, 'id' | 'createdAt' | 'bookingStatus'> & {
    bookingStatus?: 'confirmed' | 'completed' | 'cancelled';
  }
): Promise<string> {
  const payload: Omit<BookingRecord, 'id'> = {
    ...bookingData,
    bookingStatus: bookingData.bookingStatus || 'confirmed',
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(collection(db, 'bookings'), payload);
  return docRef.id;
}

// Real-time listener for user bookings
export function subscribeUserBookings(
  userId: string,
  onUpdate: (bookings: BookingRecord[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: BookingRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<BookingRecord, 'id'>),
        });
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => {
      console.error('Error fetching bookings:', err);
      if (onError) onError(err);
    }
  );
}
