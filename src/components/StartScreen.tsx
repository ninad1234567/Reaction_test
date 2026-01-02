import '../assets/styles/start-screen.css';

interface StartScreenProps {
    onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            onStart();
        }
    };

    return (
        <div className="start-screen-overlay" onClick={onStart}>
            <div className="start-screen-content">
                <div className="title-container">
                    <h1 className="game-title">REACTION TEST</h1>
                    <div className="title-glow"></div>
                </div>
                <h2 className="game-subtitle">NEURAL SPEED CHALLENGE</h2>
                <p className="game-instructions">
                    Click targets as fast as possible in 30 seconds
                </p>
                <p className="game-instructions-sub">
                    Test your reflexes • Track your performance • Beat your record
                </p>
                <button
                    className="start-button"
                    onClick={onStart}
                    onKeyDown={handleKeyPress}
                    autoFocus
                >
                    <span className="button-text">START TEST</span>
                    <span className="button-glow"></span>
                </button>
                <p className="game-hint">Press SPACE or click anywhere to begin</p>
            </div>
        </div>
    );
};

export default StartScreen;
