import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { app, db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

let messaging: ReturnType<typeof getMessaging> | null = null;

// VAPID Key for FCM (you'll need to generate this in Firebase Console)
// Get it from: Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration -> Key pair
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

/**
 * Check if push notifications can be enabled
 */
export function canEnablePushNotifications(): { canEnable: boolean; reason?: string } {
    if (typeof window === 'undefined') {
        return { canEnable: false, reason: 'Server-side rendering' };
    }

    if (!('Notification' in window)) {
        return { canEnable: false, reason: 'Browser does not support notifications' };
    }

    if (!('serviceWorker' in navigator)) {
        return { canEnable: false, reason: 'Service workers not supported' };
    }

    if (!VAPID_KEY) {
        return { canEnable: false, reason: 'Push notifications not configured (missing VAPID key)' };
    }

    return { canEnable: true };
}

/**
 * Initialize Firebase Messaging
 * Only works in browser environment
 */
export function initializeMessaging() {
    if (typeof window === 'undefined') return null;

    // Don't initialize if VAPID key is missing
    if (!VAPID_KEY) {
        console.warn('Firebase Messaging: VAPID key not configured');
        return null;
    }

    try {
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error('Failed to initialize messaging:', error);
        return null;
    }
}

/**
 * Request permission and get FCM token
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    // Check if push notifications can be enabled
    const { canEnable, reason } = canEnablePushNotifications();
    if (!canEnable) {
        console.warn('Cannot enable push notifications:', reason);
        throw new Error(reason || 'Push notifications not available');
    }

    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        // Initialize messaging if not already done
        if (!messaging) {
            messaging = initializeMessaging();
        }

        if (!messaging) {
            console.error('Messaging not initialized');
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Get FCM token
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (token) {
            // Save token to Firestore for this user
            await saveTokenToFirestore(userId, token);
            console.log('FCM Token obtained successfully');
            return token;
        }

        console.warn('No FCM token available');
        return null;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        throw error; // Re-throw to let the UI handle it
    }
}

/**
 * Save FCM token to Firestore
 */
async function saveTokenToFirestore(userId: string, token: string) {
    try {
        const tokenRef = doc(db, 'fcm_tokens', userId);
        await setDoc(tokenRef, {
            token,
            userId,
            updatedAt: serverTimestamp(),
            platform: 'web',
            userAgent: navigator.userAgent,
        }, { merge: true });
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: MessagePayload) => void): (() => void) | null {
    if (!messaging) {
        messaging = initializeMessaging();
    }

    if (!messaging) {
        return null;
    }

    return onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        callback(payload);
    });
}

/**
 * Check if notifications are supported and enabled
 */
export function checkNotificationSupport(): {
    supported: boolean;
    permission: NotificationPermission | 'unsupported';
} {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return { supported: false, permission: 'unsupported' };
    }

    return {
        supported: true,
        permission: Notification.permission,
    };
}

/**
 * Show a local notification (for testing or immediate feedback)
 */
export async function showLocalNotification(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined') return;

    if (Notification.permission !== 'granted') {
        console.warn('Notifications not permitted');
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    // Type assertion needed for vibrate which is supported but not in base types
    const notificationOptions = {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
    } as NotificationOptions;

    await registration.showNotification(title, notificationOptions);
}
