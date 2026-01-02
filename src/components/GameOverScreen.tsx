import { useMemo } from 'react';
import type { ClickMetric } from '../types/game.types';
import { calculateGameMetrics } from '../utils/metrics';
import '../assets/styles/game-over.css';

interface GameOverScreenProps {
    metrics: ClickMetric[];
    missedTargets: number;
    onRestart: () => void;
    onHome?: () => void;
}

const GameOverScreen = ({ metrics, missedTargets, onRestart, onHome }: GameOverScreenProps) => {
    const gameMetrics = useMemo(() => {
        return calculateGameMetrics(metrics);
    }, [metrics]);

    const getTierColor = (tier: string): string => {
        switch (tier) {
            case 'S': return '#FFD700'; // Gold
            case 'A': return '#00FFFF'; // Cyan
            case 'B': return '#00FF00'; // Green
            case 'C': return '#FFFF00'; // Yellow
            case 'D': return '#FF6B6B'; // Red
            default: return '#FFFFFF';
        }
    };

    const getTierLabel = (tier: string): string => {
        switch (tier) {
            case 'S': return 'S - LEGENDARY';
            case 'A': return 'A - EXCELLENT';
            case 'B': return 'B - GOOD';
            case 'C': return 'C - OKAY';
            case 'D': return 'D - PRACTICE MORE';
            default: return 'N/A';
        }
    };

    if (!gameMetrics) {
        return (
            <div className="game-over-overlay">
                <div className="game-over-content">
                    <h1 className="game-over-title">TEST COMPLETE!</h1>
                    <p>No targets were hit. Try again!</p>
                    <div className="button-group">
                        <button className="restart-button" onClick={onRestart}>
                            PLAY AGAIN
                        </button>
                        {onHome && (
                            <button className="home-button" onClick={onHome}>
                                HOME
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-over-overlay">
            <div className="game-over-content">
                <h1 className="game-over-title">TEST COMPLETE!</h1>

                <div className="score-card">
                    <div className="tier-badge" style={{ color: getTierColor(gameMetrics.performanceTier) }}>
                        {getTierLabel(gameMetrics.performanceTier)}
                    </div>

                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-label">Targets Hit</div>
                            <div className="stat-value">{gameMetrics.totalClicks}</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Missed Targets</div>
                            <div className="stat-value" style={{ color: '#FF6B6B' }}>{missedTargets}</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Average Reaction Time</div>
                            <div className="stat-value">{gameMetrics.averageReactionTime}ms</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Median Reaction Time</div>
                            <div className="stat-value">{gameMetrics.medianReactionTime}ms</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Fastest Reaction</div>
                            <div className="stat-value">{gameMetrics.minReactionTime}ms</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Click Accuracy</div>
                            <div className="stat-value">{gameMetrics.accuracyPercentage}%</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Clicks Per Second</div>
                            <div className="stat-value">{gameMetrics.clicksPerSecond}</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Consistency Score</div>
                            <div className="stat-value">{gameMetrics.consistencyScore}</div>
                        </div>

                        <div className="stat-item">
                            <div className="stat-label">Standard Deviation</div>
                            <div className="stat-value">{gameMetrics.standardDeviation}ms</div>
                        </div>
                    </div>
                </div>

                <div className="button-group">
                    <button className="restart-button" onClick={onRestart}>
                        PLAY AGAIN
                    </button>
                    {onHome && (
                        <button className="home-button" onClick={onHome}>
                            HOME
                        </button>
                    )}
                </div>

                <p className="game-hint">Press R to restart</p>
            </div>
        </div>
    );
};

export default GameOverScreen;
