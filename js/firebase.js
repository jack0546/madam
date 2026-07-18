import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initializeFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, deleteDoc, onSnapshot, orderBy, limit, startAfter, endBefore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";

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

// Firebase App Check helps protect backend resources from unauthorized use.
// Replace 'YOUR_RECAPTCHA_KEY' with your actual reCAPTCHA v3 site key from
// https://www.google.com/recaptcha/admin
// For local development, you can temporarily use the debug token:
// import { initializeAppCheck, ReCaptchaV3Provider, getToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";
// initializeAppCheck(app, { provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_KEY'), isTokenAutoRefreshEnabled: true });
// getToken(appCheck, true).then((result) => console.log('App Check token:', result.token));
try {
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_KEY'),
        isTokenAutoRefreshEnabled: true
    });
} catch (e) {
    console.warn('App Check initialization failed:', e);
}

// Use auto long-polling detection so real-time listeners keep working when the
// Firestore streaming WebChannel is blocked/mangled by extensions, proxies,
// antivirus, or QUIC (which surfaces as: Listen channel 400 / "transport errored").
export const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
});
export const googleProvider = new GoogleAuthProvider();

// Cloud Functions (callable) — used by the AI assistant. The browser only ever
// calls these; the AI provider API key stays on the server.
export const functions = getFunctions(app);
export { httpsCallable };

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
    const allowedFields = ['name', 'phone', 'address', 'photo'];
    const cleanData = {};
    
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            cleanData[key] = data[key];
        }
    }
    
    if (Object.keys(cleanData).length === 0) {
        throw new Error('No valid fields to update');
    }
    
    await setDoc(doc(db, "users", uid), cleanData, { merge: true });
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

// Recursively remove undefined values. Firestore rejects documents that
// contain `undefined` (e.g. a product option the user never selected), so we
// strip them before writing to avoid "Unsupported field value: undefined".
function sanitizeData(value) {
    if (Array.isArray(value)) {
        return value.map(sanitizeData);
    }
    if (value && typeof value === 'object') {
        const clean = {};
        for (const key of Object.keys(value)) {
            const v = value[key];
            if (v !== undefined) {
                clean[key] = sanitizeData(v);
            }
        }
        return clean;
    }
    return value;
}

function validateOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    for (const item of items) {
        if (!item.productId || typeof item.productId !== 'string') {
            throw new Error('Invalid product ID');
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new Error('Invalid quantity');
        }
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error('Invalid price');
        }
        if (item.quantity > 99) {
            throw new Error('Quantity exceeds maximum');
        }
    }
}

export async function createPendingOrder(orderData) {
    const cleanData = sanitizeData(orderData);
    
    if (cleanData.items) {
        validateOrderItems(cleanData.items);
    }

    const items = cleanData.items || [];
    const recalculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const recalculatedTotal = recalculatedSubtotal;

    const orderRef = await addDoc(collection(db, "orders"), {
        ...cleanData,
        subtotal: recalculatedSubtotal,
        total: recalculatedTotal,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    if (cleanData.userId) {
        try {
            await setDoc(doc(db, "users", cleanData.userId, "orders", orderRef.id), {
                ...cleanData,
                userId: cleanData.userId,
                id: orderRef.id
            });
        } catch (err) {
            console.error(
                'Pending order saved to main `orders` collection, but mirror to ' +
                `users/${cleanData.userId}/orders/${orderRef.id} failed. ` +
                err
            );
        }
    }

    return orderRef.id;
}

export async function updateOrderPayment(orderId, paymentReference, orderNumber) {
    return await updateDoc(doc(db, "orders", orderId), {
        orderNumber,
        paymentStatus: 'success',
        transactionReference: paymentReference,
        updatedAt: serverTimestamp()
    });
}

export async function createOrder(orderData) {
    const cleanData = sanitizeData(orderData);
    
    if (cleanData.items) {
        validateOrderItems(cleanData.items);
    }

    const items = cleanData.items || [];
    const recalculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const recalculatedTotal = recalculatedSubtotal;

    const orderNumber = cleanData.orderNumber || `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const orderRef = await addDoc(collection(db, "orders"), {
        ...cleanData,
        subtotal: recalculatedSubtotal,
        total: recalculatedTotal,
        orderNumber,
        paymentStatus: 'success',
        orderStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    
    if (cleanData.userId) {
        // Mirror the order into the user's own subcollection
        // (`users/{userId}/orders/{orderId}`) so it is recorded "under the
        // user". A rules denial here must not discard the order already saved
        // to the main `orders` collection, but we surface the error clearly
        // instead of swallowing it silently.
        try {
            await setDoc(doc(db, "users", cleanData.userId, "orders", orderRef.id), {
                ...cleanData,
                userId: cleanData.userId,
                orderNumber,
                id: orderRef.id
            });
        } catch (err) {
            console.error(
                'Order saved to main `orders` collection, but the mirror to ' +
                `users/${cleanData.userId}/orders/${orderRef.id} failed. ` +
                'Check the Firestore rules for the users/{userId}/orders create rule.',
                err
            );
        }
    }
    
    return orderRef.id;
}

export async function getUserOrders(userId) {
    // Read from the top-level `orders` collection (the single source of truth
    // the admin updates), not the write-once `users/{uid}/orders` mirror, so
    // status/payment changes made by the admin are reflected for the user.
    const userSnap = await getDocs(query(collection(db, "orders"), where("userId", "==", userId)));
    const orders = userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return orders;
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

export async function createNotification(notificationData) {
    const cleanData = sanitizeData(notificationData);
    return await addDoc(collection(db, "notifications"), {
        ...cleanData,
        read: false,
        createdAt: serverTimestamp()
    });
}

// Reads notification docs with estimated server timestamps so freshly created
// notifications (whose serverTimestamp() has not resolved yet) still expose a
// valid `createdAt` instead of null. Without this they get sorted to the bottom
// or dropped by orderBy and appear to "disappear".
function mapNotificationDoc(doc) {
    return { id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) };
}

function createdAtSeconds(value) {
    if (!value) return 0;
    if (typeof value.seconds === 'number') return value.seconds;
    if (typeof value.toDate === 'function') return value.toDate().getTime() / 1000;
    const t = new Date(value).getTime();
    return isNaN(t) ? 0 : t / 1000;
}

export async function getUserNotifications(userId) {
    const [personalSnap, broadcastSnap] = await Promise.all([
        getDocs(query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "notifications"), where("userId", "==", "all"), orderBy("createdAt", "desc")))
    ]);

    const personal = personalSnap.docs.map(mapNotificationDoc);
    const broadcasts = broadcastSnap.docs.map(mapNotificationDoc);

    const merged = [...personal, ...broadcasts];
    merged.sort((a, b) => createdAtSeconds(b.createdAt) - createdAtSeconds(a.createdAt));
    return merged;
}

export async function markNotificationRead(notificationId) {
    return await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: serverTimestamp()
    });
}

export async function deleteNotification(notificationId) {
    return await deleteDoc(doc(db, "notifications", notificationId));
}

export async function markAllNotificationsRead(userId) {
    const [personalSnap, broadcastSnap] = await Promise.all([
        getDocs(query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false))),
        getDocs(query(collection(db, "notifications"), where("userId", "==", "all"), where("read", "==", false)))
    ]);
    const updates = [...personalSnap.docs, ...broadcastSnap.docs].map(d => updateDoc(d.ref, { read: true, readAt: serverTimestamp() }));
    await Promise.all(updates);
}

export async function getUnreadNotificationCount(userId) {
    const [personalSnap, broadcastSnap] = await Promise.all([
        getDocs(query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false))),
        getDocs(query(collection(db, "notifications"), where("userId", "==", "all"), where("read", "==", false)))
    ]);
    return personalSnap.size + broadcastSnap.size;
}

export async function subscribeToUserNotifications(userId, callback) {
    const personalQuery = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const broadcastQuery = query(collection(db, "notifications"), where("userId", "==", "all"), orderBy("createdAt", "desc"));

    const unsubPersonal = onSnapshot(personalQuery, (snap) => {
        // Ignore an empty snapshot that only came from the local cache before the
        // server sync completes; otherwise it wipes already-rendered notifications.
        if (snap.empty && snap.metadata.fromCache) return;
        const personal = snap.docs.map(mapNotificationDoc);
        mergeNotifications(userId, personal, null, callback);
    }, (error) => {
        console.error('Personal notifications listener error:', error);
    });

    const unsubBroadcast = onSnapshot(broadcastQuery, (snap) => {
        if (snap.empty && snap.metadata.fromCache) return;
        const broadcasts = snap.docs.map(mapNotificationDoc);
        mergeNotifications(userId, null, broadcasts, callback);
    }, (error) => {
        console.error('Broadcast notifications listener error:', error);
    });

    return () => {
        unsubPersonal();
        unsubBroadcast();
    };
}

const notificationState = new Map();

function mergeNotifications(userId, personal, broadcasts, callback) {
    if (!notificationState.has(userId)) {
        notificationState.set(userId, { personal: [], broadcasts: [] });
    }
    const state = notificationState.get(userId);
    if (personal) state.personal = personal;
    if (broadcasts) state.broadcasts = broadcasts;

    const merged = [...state.personal, ...state.broadcasts];
    merged.sort((a, b) => createdAtSeconds(b.createdAt) - createdAtSeconds(a.createdAt));
    callback(merged);
}

export { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, updateDoc, deleteDoc, onSnapshot, orderBy, limit, startAfter, endBefore };