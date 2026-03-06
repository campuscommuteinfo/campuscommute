import { getAdminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Log a security event or authentication failure for auditing
 */
export async function logAuthAudit(userId: string, event: string, details: any) {
    try {
        const db = getAdminDb();
        await db.collection('auth_audit_logs').add({
            userId,
            event,
            details,
            severity: 'HIGH',
            timestamp: FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Failed to log auth audit:', error);
    }
}
