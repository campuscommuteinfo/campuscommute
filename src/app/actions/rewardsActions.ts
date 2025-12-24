'use server';

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface RedeemRewardResult {
    success: boolean;
    newPoints?: number;
    error?: string;
    voucherId?: string;
}

/**
 * Securely redeem a reward using server-side validation
 * This prevents client-side manipulation of points
 */
export async function redeemReward(
    userId: string,
    rewardTitle: string,
    pointsCost: number
): Promise<RedeemRewardResult> {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
        return { success: false, error: 'Invalid user ID' };
    }

    if (!rewardTitle || typeof rewardTitle !== 'string') {
        return { success: false, error: 'Invalid reward title' };
    }

    if (!pointsCost || pointsCost <= 0 || !Number.isInteger(pointsCost)) {
        return { success: false, error: 'Invalid points cost' };
    }

    // Valid reward options with their costs (server-side validation)
    const validRewards: Record<string, number> = {
        '₹50 Ride Voucher': 200,
        'Amazon Gift Card': 500,
        'Blinkit Voucher': 400,
        'Canteen Coupon': 300,
    };

    // Verify the reward exists and cost matches
    if (!validRewards[rewardTitle] || validRewards[rewardTitle] !== pointsCost) {
        return { success: false, error: 'Invalid reward or points mismatch' };
    }

    try {
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(userId);

        const result = await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const userData = userDoc.data();
            const currentPoints = userData?.points || 0;

            if (currentPoints < pointsCost) {
                throw new Error('Insufficient points');
            }

            // Deduct points atomically
            transaction.update(userRef, {
                points: FieldValue.increment(-pointsCost),
            });

            // Create voucher record
            const voucherRef = adminDb.collection('redeemed_vouchers').doc();
            transaction.set(voucherRef, {
                userId,
                title: rewardTitle,
                points: pointsCost,
                redeemedAt: FieldValue.serverTimestamp(),
                status: 'active',
            });

            return {
                newPoints: currentPoints - pointsCost,
                voucherId: voucherRef.id,
            };
        });

        return {
            success: true,
            newPoints: result.newPoints,
            voucherId: result.voucherId,
        };
    } catch (error) {
        console.error('Reward redemption error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Failed to redeem reward';

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Add points to user (for ride completions, etc.)
 * Server-side validated
 */
export async function addUserPoints(
    userId: string,
    amount: number,
    reason: string
): Promise<{ success: boolean; newPoints?: number; error?: string }> {
    if (!userId || typeof userId !== 'string') {
        return { success: false, error: 'Invalid user ID' };
    }

    if (!amount || amount <= 0 || amount > 1000) {
        return { success: false, error: 'Invalid points amount' };
    }

    // Valid reasons for earning points
    const validReasons = [
        'ride_completed',
        'ride_shared',
        'crowd_report',
        'first_ride',
        'referral_bonus',
    ];

    if (!validReasons.includes(reason)) {
        return { success: false, error: 'Invalid points reason' };
    }

    try {
        const adminDb = getAdminDb();
        const userRef = adminDb.collection('users').doc(userId);

        const result = await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const currentPoints = userDoc.data()?.points || 0;

            transaction.update(userRef, {
                points: FieldValue.increment(amount),
            });

            return { newPoints: currentPoints + amount };
        });

        return { success: true, newPoints: result.newPoints };
    } catch (error) {
        console.error('Add points error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to add points',
        };
    }
}
