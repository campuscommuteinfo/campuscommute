'use server';

import { getAdminDb, verifyIdToken } from '@/lib/firebase-admin';
import { logAuthAudit } from '@/lib/monitor';
import { FieldValue } from 'firebase-admin/firestore';

export interface WalletTransaction {
    userId: string;
    type: 'recharge' | 'payment' | 'conversion';
    amount: number;
    description: string;
    timestamp: any;
    status: 'completed' | 'failed' | 'pending';
}

/**
 * Recharge a user's wallet balance
 */
export async function rechargeWallet(
    idToken: string,
    userId: string,
    amount: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    // Verify authentication
    try {
        const decodedToken = await verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
            await logAuthAudit(userId, 'WALLET_RECHARGE_UID_MISMATCH', { providedUserId: userId, tokenUserId: decodedToken.uid });
            return { success: false, error: 'Unauthorized: UID mismatch' };
        }
    } catch (error) {
        return { success: false, error: 'Authentication failed' };
    }

    if (amount <= 0 || amount > 5000) {
        return { success: false, error: 'Invalid recharge amount (Min: 1, Max: 5000)' };
    }

    try {
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(userId);
        const transactionRef = adminDb.collection('transactions').doc();

        const result = await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const currentBalance = userDoc.data()?.walletBalance || 0;
            const newBalance = currentBalance + amount;

            // Increment balance
            transaction.update(userRef, {
                walletBalance: FieldValue.increment(amount),
                lastRechargeAt: FieldValue.serverTimestamp()
            });

            // Log transaction
            transaction.set(transactionRef, {
                userId,
                type: 'recharge',
                amount,
                description: `Manual recharge via dashboard`,
                timestamp: FieldValue.serverTimestamp(),
                status: 'completed'
            });

            return { newBalance };
        });

        return { success: true, newBalance: result.newBalance };
    } catch (error) {
        console.error('Wallet recharge error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Recharge failed' };
    }
}

/**
 * Pay for a ride using wallet balance
 */
export async function payForRide(
    idToken: string,
    userId: string,
    amount: number,
    rideId: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
        const decodedToken = await verifyIdToken(idToken);
        if (decodedToken.uid !== userId) {
            return { success: false, error: 'Unauthorized' };
        }
    } catch (error) {
        return { success: false, error: 'Auth failed' };
    }

    try {
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(userId);
        const transactionRef = adminDb.collection('transactions').doc();

        const result = await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error('User not found');

            const currentBalance = userDoc.data()?.walletBalance || 0;
            if (currentBalance < amount) throw new Error('Insufficient balance');

            transaction.update(userRef, {
                walletBalance: FieldValue.increment(-amount)
            });

            transaction.set(transactionRef, {
                userId,
                type: 'payment',
                amount: -amount,
                description: `Payment for ride ${rideId}`,
                timestamp: FieldValue.serverTimestamp(),
                status: 'completed'
            });

            return { newBalance: currentBalance - amount };
        });

        return { success: true, newBalance: result.newBalance };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Payment failed' };
    }
}

/**
 * Convert Karma Points to Wallet Balance
 * Rate: 10 points = ₹1
 */
export async function convertPointsToWallet(
    idToken: string,
    userId: string,
    points: number
): Promise<{ success: boolean; newBalance?: number; newPoints?: number; error?: string }> {
    try {
        const decodedToken = await verifyIdToken(idToken);
        if (decodedToken.uid !== userId) return { success: false, error: 'Unauthorized' };
    } catch (error) {
        return { success: false, error: 'Auth failed' };
    }

    if (points < 100 || points % 10 !== 0) {
        return { success: false, error: 'Minimum conversion is 100 points, in multiples of 10' };
    }

    const conversionAmount = points / 10;

    try {
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(userId);
        const transactionRef = adminDb.collection('transactions').doc();

        const result = await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error('User not found');

            const currentPoints = userDoc.data()?.points || 0;
            const currentBalance = userDoc.data()?.walletBalance || 0;

            if (currentPoints < points) throw new Error('Not enough Travel Points');

            transaction.update(userRef, {
                points: FieldValue.increment(-points),
                walletBalance: FieldValue.increment(conversionAmount)
            });

            transaction.set(transactionRef, {
                userId,
                type: 'conversion',
                amount: conversionAmount,
                description: `Moved ${points} Travel Points to Wallet balance`,
                timestamp: FieldValue.serverTimestamp(),
                status: 'completed'
            });

            return {
                newBalance: currentBalance + conversionAmount,
                newPoints: currentPoints - points
            };
        });

        return { success: true, newBalance: result.newBalance, newPoints: result.newPoints };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Conversion failed' };
    }
}
