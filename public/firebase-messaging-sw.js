// Push Notification Service Worker for Firebase Cloud Messaging
// This file must be in the public folder at root level

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyBZqhsLk3hy7L948chFCKOw0EPqgdOp-vQ",
    authDomain: "campus-commute-27d3c.firebaseapp.com",
    projectId: "campus-commute-27d3c",
    storageBucket: "campus-commute-27d3c.firebasestorage.app",
    messagingSenderId: "189248647682",
    appId: "1:189248647682:web:ad14fea47ff6b70da2ed1b"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Commute Companion';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: payload.data?.tag || 'default',
        data: payload.data,
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'dismiss', title: 'Dismiss' }
        ],
        vibrate: [100, 50, 100],
        requireInteraction: true
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Navigate to the appropriate page based on notification data
    const urlToOpen = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open a new window if none found
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle push events directly (for older browsers)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        console.log('[firebase-messaging-sw.js] Push received:', data);
    }
});
