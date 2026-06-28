import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  projectId: "project-3cccff25-b1fb-4aa9-978",
};

let app;
if (getApps().length === 0) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      app = initializeApp({
        projectId: firebaseAdminConfig.projectId,
        credential: cert(serviceAccount),
      });
    } catch (e) {
      app = initializeApp({
        projectId: firebaseAdminConfig.projectId,
      });
    }
  } else {
    app = initializeApp({
      projectId: firebaseAdminConfig.projectId,
    });
  }
} else {
  app = getApps()[0];
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, uid: decodedToken.uid, email: decodedToken.email };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}