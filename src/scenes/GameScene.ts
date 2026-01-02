import Phaser from 'phaser';
import { Ball } from '../classes/Ball';
import { GameState, GAME_CONFIG } from '../types/game.types';
import type { ClickMetric } from '../types/game.types';
import { audioManager } from '../utils/audio';

/**
 * Main game scene - STATIC AIM TRAINER
 * Multiple stationary balls based on difficulty
 */
export class GameScene extends Phaser.Scene {
    private activeBalls: Ball[] = [];  // Array of balls for difficulty
    private gameState: GameState = GameState.IDLE;
    private elapsedTime: number = 0;
    private ballsClickedCount: number = 0;
    private lostBallsCount: number = 0;  // Track balls that expired
    private metricsArray: ClickMetric[] = [];
    private gameStartTime: number = 0;
    private customCursor?: Phaser.GameObjects.Graphics;
    private timerInterval?: number;
    private lastWarningBeepTime: number = 0;
    private difficulty: 'easy' | 'medium' | 'hard' = 'medium';

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Create simple solid tennis ball texture
        const graphics = this.add.graphics();

        // Draw solid yellow-green circle
        graphics.fillStyle(0xC8FF00, 1);
        graphics.fillCircle(16, 16, 15);

        // Add border
        graphics.lineStyle(1, 0x9BC000, 1);
        graphics.strokeCircle(16, 16, 15);

        // Generate texture
        graphics.generateTexture('tennis-ball', 32, 32);
        graphics.destroy();
    }

    create() {
        // Set dark background
        this.cameras.main.setBackgroundColor('#1a1a1a');

        // Create custom cursor
        this.createCustomCursor();

        // Hide default cursor
        this.input.setDefaultCursor('none');

        // Set up click handler
        this.input.on('pointerdown', this.handlePointerDown, this);
        this.input.on('pointermove', this.updateCursorPosition, this);

        // Emit ready event
        this.events.emit('gameReady');
    }

    /**
     * Create custom cyan cursor
     */
    private createCustomCursor() {
        this.customCursor = this.add.graphics();
        this.customCursor.setDepth(1000);
        // No animation - just follows mouse smoothly
    }

    /**
     * Update cursor position and rendering
     */
    private updateCursorPosition(pointer: Phaser.Input.Pointer) {
        if (!this.customCursor) return;

        this.customCursor.clear();

        // Neon cyan cursor
        this.customCursor.fillStyle(0x00FFFF, 0.9);
        this.customCursor.fillCircle(pointer.x, pointer.y, 6);

        // Outer ring
        this.customCursor.lineStyle(1.5, 0xFFFFFF, 0.6);
        this.customCursor.strokeCircle(pointer.x, pointer.y, 8);
    }

    /**
     * Start the game with difficulty setting
     */
    startGame(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
        this.difficulty = difficulty;
        this.gameState = GameState.ACTIVE;
        this.elapsedTime = 0;
        this.ballsClickedCount = 0;
        this.lostBallsCount = 0;  // Reset lost balls
        this.metricsArray = [];
        this.gameStartTime = Date.now();

        // Remove any existing balls
        this.activeBalls.forEach(ball => ball.destroy());
        this.activeBalls = [];

        // Spawn initial balls based on difficulty
        this.spawnBalls();

        // Emit state change
        this.events.emit('gameStateChanged', this.gameState);
        this.events.emit('scoreUpdated', this.ballsClickedCount);

        // Start timer
        this.timerInterval = window.setInterval(() => {
            this.updateTimer();
        }, 100);
    }

    /**
     * Update game timer
     */
    private updateTimer() {
        if (this.gameState !== GameState.ACTIVE) return;

        this.elapsedTime = Date.now() - this.gameStartTime;
        const remainingTime = GAME_CONFIG.gameDuration - this.elapsedTime;

        this.events.emit('timerUpdated', remainingTime);

        // Warning beeps in critical phase (<15s)
        if (remainingTime < 15000 && remainingTime > 0) {
            const now = Date.now();
            if (now - this.lastWarningBeepTime > 3000) {  // Every 3 seconds
                audioManager.playWarningBeep();
                this.lastWarningBeepTime = now;
            }
        }

        // Check game over
        if (this.elapsedTime >= GAME_CONFIG.gameDuration) {
            this.endGame();
        }
    }

    /**
     * Spawn balls based on difficulty level
     */
    private spawnBalls() {
        // Determine number of balls based on difficulty
        const ballCount = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;

        // Clear existing balls
        this.activeBalls.forEach(ball => ball.destroy());
        this.activeBalls = [];

        // Spawn new balls
        for (let i = 0; i < ballCount; i++) {
            this.spawnSingleBall();
        }

        // Play spawn sound
        audioManager.playSpawnSound();
    }

    /**
     * Spawn a single ball with expire callback
     */
    private spawnSingleBall() {
        const randomX = Phaser.Math.Between(100, GAME_CONFIG.canvasWidth - 100);
        const randomY = Phaser.Math.Between(120, GAME_CONFIG.canvasHeight - 120);

        const ball = new Ball(this, randomX, randomY, Date.now(), () => {
            // Ball expired (lost) - callback
            this.handleBallExpired(ball);
        });
        this.activeBalls.push(ball);
    }

    /**
     * Handle pointer down (click) events
     */
    private handlePointerDown(pointer: Phaser.Input.Pointer) {
        if (this.gameState !== GameState.ACTIVE) return;

        // Check if click hit any ball
        for (const ball of this.activeBalls) {
            if (ball.checkCollision(pointer.x, pointer.y)) {
                this.handleBallClick(ball, pointer.x, pointer.y);
                break;  // Only count one ball per click
            }
        }
    }

    /**
     * Handle successful ball click
     */
    private handleBallClick(ball: Ball, clickX: number, clickY: number) {
        const clickTime = Date.now();
        const reactionTime = clickTime - ball.spawnTime;

        // Calculate accuracy (distance from center)
        const distance = Phaser.Math.Distance.Between(
            clickX, clickY,
            ball.sprite.x, ball.sprite.y
        );

        // Record metric
        this.metricsArray.push({
            timestamp: this.elapsedTime,
            reactionTime,
            clickPosition: { x: clickX, y: clickY },
            ballPosition: ball.getPosition(),
            accuracy: distance
        });

        // Update score
        this.ballsClickedCount++;
        this.events.emit('scoreUpdated', this.ballsClickedCount);

        // Play sound
        audioManager.playClickSound();

        // Remove ball from active array
        const index = this.activeBalls.indexOf(ball);
        if (index > -1) {
            this.activeBalls.splice(index, 1);
        }
        ball.remove();

        // Spawn ONE new ball to replace the clicked one
        this.time.delayedCall(50, () => {
            this.spawnSingleBall();
        });
    }

    /**
     * Handle ball expired (lost)
     */
    private handleBallExpired(ball: Ball) {
        if (!ball.isActive || this.gameState !== GameState.ACTIVE) return;

        // Increment lost balls counter
        this.lostBallsCount++;
        console.log('Ball expired! Lost balls:', this.lostBallsCount);

        // Emit lost balls update event
        this.events.emit('lostBallsUpdated', this.lostBallsCount);

        // Remove ball from active array
        const index = this.activeBalls.indexOf(ball);
        if (index > -1) {
            this.activeBalls.splice(index, 1);
        }
        ball.remove();

        // Spawn ONE new ball to replace the expired one
        this.time.delayedCall(50, () => {
            this.spawnSingleBall();
        });
    }

    /**
     * End the game
     */
    private endGame() {
        this.gameState = GameState.GAME_OVER;

        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = undefined;
        }

        // Remove all active balls
        this.activeBalls.forEach(ball => ball.destroy());
        this.activeBalls = [];

        // Play game over sound
        audioManager.playGameOverSound();

        // Emit game over event with metrics
        this.events.emit('gameOver', this.metricsArray);
        this.events.emit('gameStateChanged', this.gameState);
    }

    /**
     * Restart the game
     */
    restartGame() {
        this.startGame(this.difficulty);
    }

    /**
     * Update loop - NO physics updates needed
     */
    update() {
        // Nothing to update - ball is static!
    }

    /**
     * Get current game state
     */
    getGameState(): GameState {
        return this.gameState;
    }

    /**
     * Get metrics
     */
    getMetrics(): ClickMetric[] {
        return this.metricsArray;
    }

    /**
     * Clean up
     */
    shutdown() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}
