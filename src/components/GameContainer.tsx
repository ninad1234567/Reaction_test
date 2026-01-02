import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { GameState, GAME_CONFIG } from '../types/game.types';
import type { ClickMetric } from '../types/game.types';
import HUD from './HUD.tsx';
import StartScreen from './StartScreen.tsx';
import GameOverScreen from './GameOverScreen.tsx';
import LevelSelector from './LevelSelector.tsx';
import '../assets/styles/main.css';

const GameContainer = () => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const sceneRef = useRef<GameScene | null>(null);
    const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
    const [score, setScore] = useState(0);
    const [missedTargets, setMissedTargets] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.gameDuration);
    const [metrics, setMetrics] = useState<ClickMetric[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<'easy' | 'medium' | 'hard'>('medium');

    useEffect(() => {
        // Phaser game configuration
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: GAME_CONFIG.canvasWidth,
            height: GAME_CONFIG.canvasHeight,
            parent: 'game-container',
            backgroundColor: '#1a1a1a',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: GAME_CONFIG.gravity, x: 0 },
                    debug: false
                }
            },
            scene: GameScene,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        // Create game instance
        gameRef.current = new Phaser.Game(config);

        // Get scene reference
        gameRef.current.events.once('ready', () => {
            sceneRef.current = gameRef.current?.scene.getScene('GameScene') as GameScene;

            if (sceneRef.current) {
                // Set up event listeners
                sceneRef.current.events.on('gameStateChanged', (state: GameState) => {
                    setGameState(state);
                });

                sceneRef.current.events.on('scoreUpdated', (newScore: number) => {
                    setScore(newScore);
                });

                sceneRef.current.events.on('timerUpdated', (remaining: number) => {
                    setTimeRemaining(Math.max(0, remaining));
                });

                sceneRef.current.events.on('lostBallsUpdated', (lostBalls: number) => {
                    setMissedTargets(lostBalls);
                });

                sceneRef.current.events.on('gameOver', (gameMetrics: ClickMetric[]) => {
                    setMetrics(gameMetrics);
                });
            }
        });

        // Cleanup on unmount
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
            }
        };
    }, []);

    const handleStartGame = () => {
        if (sceneRef.current) {
            sceneRef.current.startGame(selectedLevel);
            setScore(0);
            setMissedTargets(0);
            setTimeRemaining(GAME_CONFIG.gameDuration);
            setMetrics([]);
        }
    };

    const handleRestartGame = () => {
        if (sceneRef.current) {
            sceneRef.current.startGame(selectedLevel);
            setScore(0);
            setTimeRemaining(GAME_CONFIG.gameDuration);
            setMetrics([]);
        }
    };

    const handleHome = () => {
        if (sceneRef.current) {
            sceneRef.current.scene.restart();
            setGameState(GameState.IDLE);
            setScore(0);
            setTimeRemaining(GAME_CONFIG.gameDuration);
            setMetrics([]);
        }
    };

    return (
        <div className="game-wrapper">
            <div id="game-container" className="game-canvas-container">
                {/* Phaser canvas renders here */}
            </div>

            {/* Level Selector - only show on start screen */}
            {gameState === GameState.IDLE && (
                <LevelSelector selectedLevel={selectedLevel} onLevelChange={setSelectedLevel} />
            )}

            {/* UI Overlays */}
            {gameState === GameState.IDLE && (
                <StartScreen onStart={handleStartGame} />
            )}

            {gameState === GameState.ACTIVE && (
                <HUD
                    score={score}
                    timeRemaining={timeRemaining}
                    missedTargets={missedTargets}
                />
            )}

            {gameState === GameState.GAME_OVER && (
                <GameOverScreen
                    metrics={metrics}
                    missedTargets={missedTargets}
                    onRestart={handleRestartGame}
                    onHome={handleHome}
                />
            )}
        </div>
    );
};

export default GameContainer;
