import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let adminDb: Firestore | undefined;

function getAdminApp(): App {
    if (app) return app;

    const apps = getApps();
    if (apps.length > 0) {
        app = apps[0];
        return app;
    }

    // Check for required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId) {
        throw new Error('Missing FIREBASE_PROJECT_ID environment variable');
    }

    // If we have service account credentials, use them
    if (clientEmail && privateKey) {
        app = initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    } else {
        // Fall back to application default credentials (for local dev with gcloud)
        app = initializeApp({
            projectId,
        });
    }

    return app;
}

export function getAdminDb(): Firestore {
    if (adminDb) return adminDb;

    getAdminApp();
    adminDb = getFirestore();
    return adminDb;
}

export { getAdminApp };
