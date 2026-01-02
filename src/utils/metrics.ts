import type { ClickMetric, GameMetrics, PerformanceTier } from '../types/game.types';

/**
 * Calculate median from array of numbers
 */
function calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
}

/**
 * Determine performance tier for aim trainer
 * S (50+), A (40-49), B (30-39), C (20-29), D (<20)
 */
function determinePerformanceTier(totalClicks: number): PerformanceTier {
    if (totalClicks >= 50) return 'S';  // LEGENDARY
    if (totalClicks >= 40) return 'A';  // EXCELLENT
    if (totalClicks >= 30) return 'B';  // GOOD
    if (totalClicks >= 20) return 'C';  // OKAY
    return 'D';                          // PRACTICE MORE
}

/**
 * Calculate all game metrics from click data
 */
export function calculateGameMetrics(metrics: ClickMetric[]): GameMetrics | null {
    if (metrics.length === 0) {
        return null;
    }

    const reactionTimes = metrics.map(m => m.reactionTime);
    const accuracies = metrics.map(m => m.accuracy);

    const sum = reactionTimes.reduce((a, b) => a + b, 0);
    const avg = sum / reactionTimes.length;
    const stdDev = calculateStandardDeviation(reactionTimes, avg);
    const median = calculateMedian(reactionTimes);

    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const accuracyPercentage = Math.max(0, 100 - (avgAccuracy / 18) * 100); // 18 = ball radius

    const consistencyScore = Math.max(0, 100 - ((stdDev / avg) * 100));

    return {
        totalClicks: metrics.length,
        averageReactionTime: Math.round(avg),
        medianReactionTime: Math.round(median),
        minReactionTime: Math.min(...reactionTimes),
        maxReactionTime: Math.max(...reactionTimes),
        standardDeviation: Math.round(stdDev),
        clicksPerSecond: parseFloat((metrics.length / 60).toFixed(2)),
        accuracyPercentage: Math.round(accuracyPercentage),
        consistencyScore: Math.round(consistencyScore),
        performanceTier: determinePerformanceTier(metrics.length)
    };
}

/**
 * Export metrics to CSV format
 */
export function exportToCSV(metrics: ClickMetric[]): string {
    const headers = ['Timestamp (ms)', 'Reaction Time (ms)', 'Click X', 'Click Y', 'Ball X', 'Ball Y', 'Accuracy (px)'];
    const rows = metrics.map(m => [
        m.timestamp,
        m.reactionTime,
        m.clickPosition.x.toFixed(2),
        m.clickPosition.y.toFixed(2),
        m.ballPosition.x.toFixed(2),
        m.ballPosition.y.toFixed(2),
        m.accuracy.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Export metrics to JSON format
 */
export function exportToJSON(metrics: ClickMetric[], gameMetrics: GameMetrics | null): string {
    return JSON.stringify({
        summary: gameMetrics,
        detailedMetrics: metrics
    }, null, 2);
}
