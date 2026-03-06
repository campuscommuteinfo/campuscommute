import { describe, it, expect, vi, beforeEach } from 'vitest';
import { predictBusCrowdLevels } from '@/ai/flows/predict-bus-crowd-levels';

// Mock genkit/ai
vi.mock('@/ai/genkit', () => ({
    ai: {
        definePrompt: vi.fn(() => vi.fn(async () => ({ output: { crowdLevel: 'Green', confidence: 90, estimatedWaitTime: 5, explanation: 'Test', factors: [], recommendation: 'Test' } }))),
        defineFlow: vi.fn((config, cb) => cb),
    },
}));

describe('predictBusCrowdLevels', () => {
    it('should return predicted crowd level and confidence', async () => {
        const input = {
            routeId: '73A',
            time: '8:00 AM',
            dayOfWeek: 'Monday',
        };

        const result = await predictBusCrowdLevels(input);

        expect(result).toHaveProperty('crowdLevel');
        expect(result).toHaveProperty('confidence');
        expect(result.crowdLevel).toBeTypeOf('string');
        expect(result.confidence).toBeGreaterThan(0);
    });
});
