import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== "your_api_key_here"
);

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured) return null;
  try {
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (err) {
    console.warn("Failed to get Firebase App:", err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}

export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export async function signInGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not initialized");
  return signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not initialized");
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(email: string, pass: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not initialized");
  return createUserWithEmailAndPassword(auth, email, pass);
}

export async function sendPasswordReset(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase Auth not initialized");
  return sendPasswordResetEmail(auth, email);
}

export async function updateUserProfile(displayName: string, photoURL?: string) {
  const auth = getFirebaseAuth();
  if (!auth || !auth.currentUser) return;
  return updateProfile(auth.currentUser, {
    displayName,
    ...(photoURL ? { photoURL } : {}),
  });
}

export async function logoutUser() {
  const auth = getFirebaseAuth();
  if (auth) return signOut(auth);
}

// Cloud Firestore Sync Helpers
export async function saveDocToFirestore(collName: string, id: string, data: any) {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const docRef = doc(db, collName, id);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn(`Firestore save to ${collName}/${id} error:`, err);
  }
}

export async function deleteDocFromFirestore(collName: string, id: string) {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const docRef = doc(db, collName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Firestore delete ${collName}/${id} error:`, err);
  }
}

export async function fetchUserDocsFromFirestore<T>(collName: string, userId: string): Promise<T[]> {
  const db = getFirebaseDb();
  if (!db || !userId) return [];
  try {
    const collRef = collection(db, collName);
    const q = query(collRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const results: T[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as T);
    });
    return results;
  } catch (err) {
    console.warn(`Firestore fetch from ${collName} error:`, err);
    return [];
  }
}

// Storage Helper
export async function uploadFileToFirebase(
  file: File,
  folder: string = "uploads",
  onProgress?: (percent: number) => void
): Promise<{ url: string; name: string; size: number; type: string }> {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error("Firebase Storage is not initialized.");
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url,
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    );
  });
}
