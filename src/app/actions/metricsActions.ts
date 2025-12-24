'use server';
/**
 * @fileOverview AI Metrics Tracking for Research Paper Validation
 * 
 * Research Paper Claims to Validate:
 * - 90.2% arrival time prediction accuracy
 * - 48.6% waiting time reduction
 * - 85.4% user satisfaction
 * - 94% fare prediction accuracy
 * 
 * This service collects anonymous metrics to validate these claims.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, DocumentData } from 'firebase-admin/firestore';

// Metric types for research validation
export interface PredictionMetric {
    type: 'crowd_prediction' | 'fare_prediction' | 'wait_time' | 'arrival_time';
    predicted: number | string;
    actual?: number | string;
    accurate?: boolean;
    timestamp: Date;
    routeId?: string;
    userId?: string; // Anonymized
}

export interface UserFeedbackMetric {
    type: 'satisfaction' | 'accuracy_feedback';
    rating: number; // 1-5
    featureUsed: string;
    timestamp: Date;
}

interface StoredMetric extends DocumentData {
    type: string;
    predicted: number | string;
    actual?: number | string;
    accurate?: boolean;
    validated?: boolean;
}

interface StoredFeedback extends DocumentData {
    type: string;
    rating: number;
    featureUsed: string;
}

/**
 * Record a prediction for later accuracy validation
 */
export async function recordPrediction(metric: Omit<PredictionMetric, 'timestamp'>): Promise<string | null> {
    try {
        const db = getAdminDb();
        const metricsRef = db.collection('ai_metrics').doc();
        await metricsRef.set({
            ...metric,
            timestamp: FieldValue.serverTimestamp(),
            validated: false,
        });
        return metricsRef.id;
    } catch (error) {
        console.error('Failed to record prediction metric:', error);
        return null;
    }
}

/**
 * Validate a previous prediction with actual outcome
 */
export async function validatePrediction(
    metricId: string,
    actual: number | string,
    accurate: boolean
): Promise<boolean> {
    try {
        const db = getAdminDb();
        const metricRef = db.collection('ai_metrics').doc(metricId);
        await metricRef.update({
            actual,
            accurate,
            validated: true,
            validatedAt: FieldValue.serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Failed to validate prediction:', error);
        return false;
    }
}

/**
 * Record user satisfaction feedback
 */
export async function recordUserFeedback(feedback: Omit<UserFeedbackMetric, 'timestamp'>): Promise<boolean> {
    try {
        const db = getAdminDb();
        await db.collection('user_feedback').add({
            ...feedback,
            timestamp: FieldValue.serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error('Failed to record user feedback:', error);
        return false;
    }
}

/**
 * Calculate accuracy metrics for the research paper
 */
export async function calculateAccuracyMetrics(): Promise<{
    crowdPredictionAccuracy: number;
    farePredictionAccuracy: number;
    waitTimeReduction: number;
    userSatisfaction: number;
    sampleSize: number;
} | null> {
    try {
        const db = getAdminDb();

        // Get validated predictions
        const metricsSnapshot = await db
            .collection('ai_metrics')
            .where('validated', '==', true)
            .get();

        if (metricsSnapshot.empty) {
            return null;
        }

        const metrics = metricsSnapshot.docs.map(doc => doc.data() as StoredMetric);

        // Calculate crowd prediction accuracy
        const crowdPredictions = metrics.filter((m: StoredMetric) => m.type === 'crowd_prediction');
        const crowdAccurate = crowdPredictions.filter((m: StoredMetric) => m.accurate).length;
        const crowdPredictionAccuracy = crowdPredictions.length > 0
            ? (crowdAccurate / crowdPredictions.length) * 100
            : 0;

        // Calculate fare prediction accuracy
        const farePredictions = metrics.filter((m: StoredMetric) => m.type === 'fare_prediction');
        const fareAccurate = farePredictions.filter((m: StoredMetric) => m.accurate).length;
        const farePredictionAccuracy = farePredictions.length > 0
            ? (fareAccurate / farePredictions.length) * 100
            : 0;

        // Calculate wait time metrics
        const waitTimeMetrics = metrics.filter((m: StoredMetric) => m.type === 'wait_time');
        const avgWaitReduction = waitTimeMetrics.length > 0
            ? waitTimeMetrics.reduce((sum: number, m: StoredMetric) => {
                const predicted = Number(m.predicted) || 0;
                const actual = Number(m.actual) || 0;
                return sum + ((predicted - actual) / predicted * 100);
            }, 0) / waitTimeMetrics.length
            : 0;

        // Get user satisfaction
        const feedbackSnapshot = await db
            .collection('user_feedback')
            .where('type', '==', 'satisfaction')
            .get();

        const feedbacks = feedbackSnapshot.docs.map(doc => doc.data() as StoredFeedback);
        const avgSatisfaction = feedbacks.length > 0
            ? (feedbacks.reduce((sum: number, f: StoredFeedback) => sum + (f.rating || 0), 0) / feedbacks.length) / 5 * 100
            : 0;

        return {
            crowdPredictionAccuracy: Math.round(crowdPredictionAccuracy * 10) / 10,
            farePredictionAccuracy: Math.round(farePredictionAccuracy * 10) / 10,
            waitTimeReduction: Math.round(avgWaitReduction * 10) / 10,
            userSatisfaction: Math.round(avgSatisfaction * 10) / 10,
            sampleSize: metrics.length,
        };
    } catch (error) {
        console.error('Failed to calculate accuracy metrics:', error);
        return null;
    }
}

/**
 * Get metrics summary for dashboard display
 */
export async function getMetricsSummary(): Promise<{
    totalPredictions: number;
    accuratePredictions: number;
    totalFeedback: number;
    avgRating: number;
} | null> {
    try {
        const db = getAdminDb();

        const [metricsSnapshot, feedbackSnapshot] = await Promise.all([
            db.collection('ai_metrics').get(),
            db.collection('user_feedback').get(),
        ]);

        const metrics = metricsSnapshot.docs.map(doc => doc.data() as StoredMetric);
        const feedbacks = feedbackSnapshot.docs.map(doc => doc.data() as StoredFeedback);

        const validatedMetrics = metrics.filter((m: StoredMetric) => m.validated);
        const accurateMetrics = validatedMetrics.filter((m: StoredMetric) => m.accurate);

        const avgRating = feedbacks.length > 0
            ? feedbacks.reduce((sum: number, f: StoredFeedback) => sum + (f.rating || 0), 0) / feedbacks.length
            : 0;

        return {
            totalPredictions: metrics.length,
            accuratePredictions: accurateMetrics.length,
            totalFeedback: feedbacks.length,
            avgRating: Math.round(avgRating * 10) / 10,
        };
    } catch (error) {
        console.error('Failed to get metrics summary:', error);
        return null;
    }
}
