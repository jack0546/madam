import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updateEmail } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc } from "firebase/firestore";

export const ADMIN_EMAIL = "narhsnazzisco@gmail.com";

const firebaseConfig = {
  apiKey: "AIzaSyC8BoL8yfKIQ2o-tVmbrVfx0TXcUvudzyY",
  authDomain: "project-3cccff25-b1fb-4aa9-978.firebaseapp.com",
  projectId: "project-3cccff25-b1fb-4aa9-978",
  storageBucket: "project-3cccff25-b1fb-4aa9-978.firebasestorage.app",
  messagingSenderId: "1009826575246",
  appId: "1:1009826575246:web:595912191007526e5deadf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function registerUser(email: string, password: string, name: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", userCredential.user.uid), {
    name,
    email,
    phone: '',
    address: '',
    role: isAdminEmail(email) ? 'admin' : 'user',
    createdAt: serverTimestamp()
  });
  return userCredential;
}

export async function logoutUser() {
  return signOut(auth);
}

export function onAuthStateChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserRole(uid: string): Promise<string> {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data()?.role || 'user' : 'user';
}

export async function getUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUserProfile(uid: string, data: any) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function updateUserEmail(user: any, newEmail: string) {
  try {
    await updateEmail(user, newEmail);
    await updateDoc(doc(db, "users", user.uid), { email: newEmail });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function ensureUserProfile(user: any): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email,
      phone: '',
      address: '',
      role: isAdminEmail(user.email || '') ? 'admin' : 'user',
      createdAt: serverTimestamp(),
      provider: user.providerData[0]?.providerId || 'email',
    });
  } else {
    const data = userDoc.data();
    const updates: any = {};
    if (!data.email && user.email) updates.email = user.email;
    if (!data.name && user.displayName) updates.name = user.displayName;
    if (!data.provider) updates.provider = user.providerData[0]?.providerId || 'email';
    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates);
    }
  }
}

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function submitFormToUrl(url: string, formData: Record<string, any>): Promise<{ success: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return {
      success: response.ok,
      message: response.ok ? 'Form submitted successfully' : `Form submission failed with status ${response.status}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.name === 'AbortError' ? 'Form submission timed out' : 'Failed to submit form. Please check the URL.',
    };
  }
}