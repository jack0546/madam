import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

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

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}