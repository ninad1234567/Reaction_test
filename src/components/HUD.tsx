import { useEffect, useState } from 'react';
import '../assets/styles/hud.css';

interface HUDProps {
    score: number;
    timeRemaining: number;
    missedTargets: number;
}

const HUD = ({ score, timeRemaining, missedTargets }: HUDProps) => {
    const [displayScore, setDisplayScore] = useState(score);

    // Animate score changes
    useEffect(() => {
        if (score !== displayScore) {
            setDisplayScore(score);
        }
    }, [score]);

    // Format time as MM:SS
    const formatTime = (ms: number): string => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Determine timer color based on remaining time
    const getTimerClass = (): string => {
        const seconds = timeRemaining / 1000;
        if (seconds > 45) return 'timer-normal';
        if (seconds > 14) return 'timer-warning';
        return 'timer-critical';
    };

    return (
        <div className="hud-container">
            <div className="hud-left">
                <span className="hud-label">TARGETS HIT:</span>
                <span className={`hud-score ${score > displayScore - 1 ? 'score-pulse' : ''}`}>
                    {displayScore}
                </span>
            </div>

            <div className="hud-center">
                <div className={`hud-timer ${getTimerClass()}`}>
                    {formatTime(timeRemaining)}
                </div>
            </div>

            <div className="hud-right">
                <span className="hud-label">MISSED:</span>
                <span className="hud-missed">
                    {missedTargets}
                </span>
            </div>
        </div>
    );
};

export default HUD;
