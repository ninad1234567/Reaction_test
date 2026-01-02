// Core game state management
export const enum GameState {
  IDLE = 'IDLE',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  RESULTS = 'RESULTS'
}

// Performance tier classification
export type PerformanceTier = 'S' | 'A' | 'B' | 'C' | 'D';

// Individual click metric
export interface ClickMetric {
  timestamp: number;           // ms since game start
  reactionTime: number;         // ms from spawn to click
  clickPosition: { x: number; y: number };
  ballPosition: { x: number; y: number };
  accuracy: number;             // distance in pixels
}

// Aggregate game metrics
export interface GameMetrics {
  totalClicks: number;
  averageReactionTime: number;
  medianReactionTime: number;
  minReactionTime: number;
  maxReactionTime: number;
  standardDeviation: number;
  clicksPerSecond: number;
  accuracyPercentage: number;
  consistencyScore: number;
  performanceTier: PerformanceTier;
}

// Ball data structure
export interface BallData {
  id: string;
  spawnTime: number;
  isActive: boolean;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
}

// Phaser game configuration
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  ballRadius: number;
  minBallDistance: number;
  gameDuration: number;
  gravity: number;
  bounceCoefficient: number;
  friction: number;
}

// Constants
export const GAME_CONFIG: GameConfig = {
  canvasWidth: 1280,
  canvasHeight: 720,
  ballRadius: 18,           // Changed from 48 to 18 (36px diameter)
  minBallDistance: 0,        // Not needed for single ball
  gameDuration: 30000,       // 30 seconds
  gravity: 0,                // No gravity - static ball
  bounceCoefficient: 0,      // No bounce
  friction: 0                // No friction
};
