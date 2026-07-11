import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, deleteDoc, onSnapshot, orderBy, limit, startAfter, endBefore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAIL = "narhsnazzisco@gmail.com";

export function isAdminEmail(email) {
    return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export async function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(result.user);
    return result;
}

export async function registerUser(email, password, name, phone = '') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        phone,
        address: '',
        photo: '',
        role: isAdminEmail(email) ? 'admin' : 'user',
        createdAt: serverTimestamp(),
        provider: 'password'
    });
    return userCredential;
}

export async function logoutUser() {
    return signOut(auth);
}

export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function getUserRole(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data()?.role || 'user' : 'user';
}

export async function getUserProfile(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
}

export async function updateUserProfile(uid, data) {
    await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function updateUserPassword(user, newPassword) {
    return updatePassword(user, newPassword);
}

export async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

export async function ensureUserProfile(user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: '',
            address: '',
            photo: user.photoURL || '',
            role: isAdminEmail(user.email || '') ? 'admin' : 'user',
            createdAt: serverTimestamp(),
            provider: user.providerData[0]?.providerId || 'password'
        });
    } else {
        const data = userDoc.data();
        const updates = {};
        if (!data.photo && user.photoURL) updates.photo = user.photoURL;
        if (!data.name && user.displayName) updates.name = user.displayName;
        if (Object.keys(updates).length > 0) {
            await updateDoc(userRef, updates);
        }
    }
}

export async function uploadProductImage(file) {
    const imageRef = storageRef(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
}

export async function getAllProducts() {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getProductById(productId) {
    const productDoc = await getDoc(doc(db, "products", productId));
    return productDoc.exists() ? { id: productDoc.id, ...productDoc.data() } : null;
}

export async function createProduct(productData) {
    return await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: serverTimestamp()
    });
}

export async function updateProduct(productId, productData) {
    return await updateDoc(doc(db, "products", productId), productData);
}

export async function deleteProduct(productId) {
    return await deleteDoc(doc(db, "products", productId));
}

export async function createOrder(orderData) {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const orderRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        orderNumber,
        paymentStatus: 'success',
        orderStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    
    if (orderData.userId) {
        await setDoc(doc(db, "users", orderData.userId, "orders", orderRef.id), {
            ...orderData,
            orderNumber,
            id: orderRef.id
        });
    }
    
    return orderRef;
}

export async function getUserOrders(userId) {
    const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllOrders() {
    const snapshot = await getDocs(collection(db, "orders"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAllUsers() {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateOrderStatus(orderId, status) {
    return await updateDoc(doc(db, "orders", orderId), {
        orderStatus: status,
        updatedAt: serverTimestamp()
    });
}

export { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, deleteDoc, onSnapshot, orderBy, limit, startAfter, endBefore };