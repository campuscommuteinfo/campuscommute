import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redeemReward } from '@/app/actions/rewardsActions';
import * as firebaseAdmin from '@/lib/firebase-admin';

// Mock firebase-admin
vi.mock('@/lib/firebase-admin', () => ({
    getAdminDb: vi.fn(),
    verifyIdToken: vi.fn(),
}));

describe('rewardsActions', () => {
    const mockTransaction = {
        get: vi.fn(),
        update: vi.fn(),
        set: vi.fn(),
    };

    const mockDb = {
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({
                id: 'mock-id',
            })),
        })),
        runTransaction: vi.fn((cb) => cb(mockTransaction)),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (firebaseAdmin.getAdminDb as any).mockReturnValue(mockDb);
        (firebaseAdmin.verifyIdToken as any).mockResolvedValue({ uid: 'user123' });
    });

    describe('redeemReward', () => {
        it('should return error for invalid inputs', async () => {
            const result = await redeemReward('mock-token', '', '', 0);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized: UID mismatch');
        });

        it('should return error if reward does not exist or points mismatch', async () => {
            const result = await redeemReward('mock-token', 'user123', 'Invalid Reward', 200);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid reward or points mismatch');
        });

        it('should fail if user has insufficient points', async () => {
            mockTransaction.get.mockResolvedValue({
                exists: true,
                data: () => ({ points: 100 }),
            });

            const result = await redeemReward('mock-token', 'user123', '₹50 Ride Voucher', 200);
            expect(result.success).toBe(false);
            expect(result.error).toBe('Insufficient points');
        });

        it('should successfully redeem reward if points are sufficient', async () => {
            mockTransaction.get.mockResolvedValue({
                exists: true,
                data: () => ({ points: 500 }),
            });

            const result = await redeemReward('mock-token', 'user123', '₹50 Ride Voucher', 200);

            expect(result.success).toBe(true);
            expect(result.newPoints).toBe(300);
            expect(mockTransaction.update).toHaveBeenCalled();
            expect(mockTransaction.set).toHaveBeenCalled();
        });
    });
});
