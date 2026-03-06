'use server';

import { getAdminDb, verifyIdToken } from '@/lib/firebase-admin';
import { logAuthAudit } from '@/lib/monitor';
import { FieldValue } from 'firebase-admin/firestore';

export interface SOSAlert {
    userId: string;
    userName: string;
    location: {
        latitude: number;
        longitude: number;
    };
    timestamp: any;
    status: 'active' | 'resolved' | 'cancelled';
}

/**
 * Broadcast an SOS alert to the system
 */
export async function broadcastSOS(
    idToken: string,
    userId: string,
    userName: string,
    latitude: number,
    longitude: number
): Promise<{ success: boolean; alertId?: string; error?: string }> {
    // Verify authentication
    try {
        const decodedToken = await verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
            await logAuthAudit(userId, 'SOS_BROADCAST_UID_MISMATCH', {
                providedUserId: userId,
                tokenUserId: decodedToken.uid
            });
            return { success: false, error: 'Unauthorized: UID mismatch' };
        }
    } catch (error) {
        await logAuthAudit(userId, 'SOS_BROADCAST_AUTH_FAILURE', {
            providedUserId: userId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return { success: false, error: 'Authentication failed' };
    }

    if (!userId || !userName) {
        return { success: false, error: 'User information missing' };
    }

    try {
        const adminDb = getAdminDb();
        const alertRef = adminDb.collection('sos_alerts').doc();

        const alertData: SOSAlert = {
            userId,
            userName,
            location: {
                latitude,
                longitude
            },
            timestamp: FieldValue.serverTimestamp(),
            status: 'active'
        };

        await alertRef.set(alertData);

        // In a real app, this would also trigger push notifications/SMS
        console.log(`SOS Alert Broadcasted for ${userName} (${userId}) at ${latitude}, ${longitude}`);

        return { success: true, alertId: alertRef.id };
    } catch (error) {
        console.error('SOS Broadcast error:', error);
        return { success: false, error: 'Failed to broadcast SOS alert' };
    }
}

/**
 * Cancel an active SOS alert
 */
export async function cancelSOS(
    idToken: string,
    alertId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    // Verify authentication
    try {
        const decodedToken = await verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
            await logAuthAudit(userId, 'SOS_CANCEL_UID_MISMATCH', {
                providedUserId: userId,
                tokenUserId: decodedToken.uid,
                alertId
            });
            return { success: false, error: 'Unauthorized: UID mismatch' };
        }
    } catch (error) {
        await logAuthAudit(userId, 'SOS_CANCEL_AUTH_FAILURE', {
            providedUserId: userId,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return { success: false, error: 'Authentication failed' };
    }

    if (!alertId) {
        return { success: false, error: 'Alert ID missing' };
    }

    try {
        const adminDb = getAdminDb();
        await adminDb.collection('sos_alerts').doc(alertId).update({
            status: 'cancelled',
            resolvedAt: FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('SOS Cancellation error:', error);
        return { success: false, error: 'Failed to cancel SOS alert' };
    }
}
