import '../assets/styles/level-selector.css';

interface LevelSelectorProps {
    selectedLevel: 'easy' | 'medium' | 'hard';
    onLevelChange: (level: 'easy' | 'medium' | 'hard') => void;
}

const LevelSelector = ({ selectedLevel, onLevelChange }: LevelSelectorProps) => {
    return (
        <div className="level-selector">
            <div className="level-label">DIFFICULTY</div>
            <div className="level-buttons">
                <button
                    className={`level-btn ${selectedLevel === 'easy' ? 'active' : ''}`}
                    onClick={() => onLevelChange('easy')}
                >
                    <span className="level-icon">🟢</span>
                    <span className="level-name">EASY</span>
                </button>
                <button
                    className={`level-btn ${selectedLevel === 'medium' ? 'active' : ''}`}
                    onClick={() => onLevelChange('medium')}
                >
                    <span className="level-icon">🟡</span>
                    <span className="level-name">MEDIUM</span>
                </button>
                <button
                    className={`level-btn ${selectedLevel === 'hard' ? 'active' : ''}`}
                    onClick={() => onLevelChange('hard')}
                >
                    <span className="level-icon">🔴</span>
                    <span className="level-name">HARD</span>
                </button>
            </div>
        </div>
    );
};

export default LevelSelector;
