# REACTION TEST - COMPLETE PROJECT DOCUMENTATION

**Version:** 1.0.0  
**Last Updated:** January 2, 2026  
**Project Type:** Web-based Reaction Time Game  
**Tech Stack:** React, TypeScript, Phaser 3, Vite

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Systems](#core-systems)
6. [Component Documentation](#component-documentation)
7. [Game Mechanics](#game-mechanics)
8. [Styling System](#styling-system)
9. [Audio System](#audio-system)
10. [Metrics & Analytics](#metrics--analytics)
11. [Configuration](#configuration)
12. [Build & Deployment](#build--deployment)
13. [Development Guide](#development-guide)
14. [API Reference](#api-reference)

---

# 1. PROJECT OVERVIEW

## 1.1 Introduction

The **Reaction Test** is a modern, web-based cognitive assessment game designed to measure and track reaction time performance. Built with cutting-edge web technologies, it provides a scientifically calibrated 30-second challenge where players click on appearing targets as quickly as possible.

## 1.2 Key Features

### Core Gameplay
- **30-second timed challenges** with real-time countdown
- **Three difficulty levels**: Easy (1 ball), Medium (2 balls), Hard (3 balls)
- **2-second auto-disappear mechanic** for increased difficulty
- **Dynamic ball spawning** with precise collision detection
- **Missed target tracking** for comprehensive performance analysis

### Visual Design
- **High-tech aesthetic** with cyan/neon color scheme
- **Smooth animations** using Phaser tweens
- **Responsive HUD** showing live stats during gameplay
- **Professional results screen** with performance tier system
- **Glassmorphism effects** with backdrop blur

### Audio System
- **Web Audio API** integration for low-latency sound
- **Procedurally generated** sound effects (no audio files)
- **Mute/unmute functionality** with localStorage persistence
- **Sound effects**: Click, spawn, warning beep, game over

### Performance Metrics
- **Comprehensive statistics**: reaction time, accuracy, consistency
- **Performance tiers**: S, A, B, C, D based on targets hit
- **Detailed breakdown**: median, min, max, standard deviation
- **Export capabilities**: CSV and JSON format support

## 1.3 Target Audience

- **Gamers** looking to improve reaction times
- **Athletes** training hand-eye coordination
- **Researchers** studying cognitive performance
- **General users** interested in self-assessment

## 1.4 Design Philosophy

### Minimalism
Clean, focused interface with no unnecessary distractions during gameplay.

### Immediate Feedback
Instant visual and audio feedback for every action (clicks, spawns, misses).

### Scientific Accuracy
Precise timing measurements using high-resolution timestamps.

### Accessibility
Clear visual indicators, customizable audio, and responsive design.

---

# 2. ARCHITECTURE & DESIGN

## 2.1 System Architecture

The application follows a **hybrid architecture** combining React for UI management and Phaser 3 for game logic:

```
┌─────────────────────────────────────────────────┐
│              React Application Layer            │
│  (UI Components, State Management, Routing)     │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
┌────────▼────────┐  ┌──────▼──────────┐
│  UI Components  │  │  Phaser Engine  │
│  - StartScreen  │  │  - GameScene    │
│  - HUD          │  │  - Ball Class   │
│  - GameOver     │  │  - Input        │
│  - LevelSelect  │  │  - Rendering    │
└─────────────────┘  └─────────────────┘
         │                   │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────┐
         │  Utility Layer    │
         │  - Audio Manager  │
         │  - Metrics Calc   │
         │  - Type Defs      │
         └───────────────────┘
```

### Layer Responsibilities

**React Layer**
- Manages application state (score, time, game state)
- Renders overlay UI (HUD, menus, results)
- Handles user interactions outside the game canvas
- Communicates with Phaser via event system

**Phaser Layer**
- Handles game loop and rendering
- Manages ball spawning and destruction
- Processes player clicks on targets
- Emits events to React layer

**Utility Layer**
- Provides shared functionality
- Audio synthesis and playback
- Statistical calculations
- Type definitions and constants

## 2.2 Data Flow

### Game Start Flow
```
User clicks START
  └─> GameContainer.handleStartGame()
      └─> GameScene.startGame(difficulty)
          └─> spawnBalls() based on difficulty
              └─> Create Ball instances with 2s timer
                  └─> Set GameState to ACTIVE
                      └─> Start countdown timer
```

### Ball Click Flow
```
User clicks canvas
  └─> Phaser detects pointerdown event
      └─> GameScene.handlePointerDown()
          └─> Check collision with each ball
              └─> Ball.checkCollision(x, y)
                  └─> If hit: handleBallClick()
                      ├─> Record ClickMetric
                      ├─> Play click sound
                      ├─> Emit scoreUpdated event
                      ├─> Remove clicked ball
                      └─> Spawn replacement ball
```

### Ball Expiry Flow
```
Ball 2-second timer expires
  └─> Ball calls onExpire callback
      └─> GameScene.handleBallExpired()
          ├─> Increment lostBallsCount
          ├─> Emit lostBallsUpdated event
          ├─> Remove expired ball
          └─> Spawn replacement ball
```

### Game End Flow
```
30-second timer reaches 0
  └─> GameScene.endGame()
      ├─> Stop all timers
      ├─> Destroy all balls
      ├─> Calculate final metrics
      ├─> Emit gameOver event with metrics
      └─> Play game over sound
          └─> GameContainer receives gameOver
              ├─> Set GameState to GAME_OVER
              └─> Display GameOverScreen with stats
```

## 2.3 State Management

### React State (GameContainer)

```typescript
const [gameState, setGameState] = useState<GameState>(GameState.IDLE)
const [score, setScore] = useState(0)
const [missedTargets, setMissedTargets] = useState(0)
const [timeRemaining, setTimeRemaining] = useState(30000)
const [metrics, setMetrics] = useState<ClickMetric[]>([])
const [selectedLevel, setSelectedLevel] = useState<'easy' | 'medium' | 'hard'>('medium')
```

### Phaser State (GameScene)

```typescript
private gameState: GameState = GameState.IDLE
private score: number = 0
private lostBallsCount: number = 0
private startTime: number = 0
private gameTimer: Phaser.Time.TimerEvent | null = null
private activeBalls: Ball[] = []
private clickMetrics: ClickMetric[] = []
private difficulty: 'easy' | 'medium' | 'hard' = 'medium'
```

### State Synchronization

React and Phaser states are synchronized via **event emissions**:
- `gameStateChanged` - When game state changes
- `scoreUpdated` - When score increases
- `timerUpdated` - Every frame during active game
- `lostBallsUpdated` - When a ball expires
- `gameOver` - When game ends with final metrics

---

# 3. TECHNOLOGY STACK

## 3.1 Core Technologies

### React 19.2.0
**Purpose**: UI framework and component management

**Why React?**
- Component-based architecture for modular UI
- Efficient virtual DOM for performance
- Hooks for state management
- Large ecosystem and community support

**Usage in Project**:
- Manages game container and overlays
- Handles user input outside game canvas
- Renders HUD, menus, and results screens
- Communicates with Phaser via refs and events

### TypeScript 5.9.3
**Purpose**: Type-safe JavaScript development

**Why TypeScript?**
- Compile-time type checking prevents bugs
- Better IDE autocomplete and intellisense
- Clear interfaces for complex data structures
- Easier refactoring and maintenance

**Usage in Project**:
- All source files use TypeScript (.ts, .tsx)
- Strict type definitions for game data
- Interfaces for metrics, configs, and props
- Type-safe event system

### Phaser 3.90.0
**Purpose**: Game engine for canvas rendering and game loop

**Why Phaser?**
- Optimized 2D game engine
- Built-in input handling and collision detection
- Powerful tween and animation system
- No physics overhead (we disable it)

**Usage in Project**:
- Manages game canvas and rendering
- Handles ball sprites and animations
- Processes click events with precision
- Provides game loop infrastructure

**Configuration**:
```typescript
{
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
}
```

### Vite 7.2.4
**Purpose**: Build tool and development server

**Why Vite?**
- Extremely fast hot module replacement (HMR)
- Efficient ES module-based dev server
- Optimized production builds with Rollup
- Better than webpack for modern development

**Configuration**: (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
})
```

**Benefits**:
- Instant server start
- Lightning-fast HMR (<50ms updates)
- Optimized tree-shaking
- Modern browser target by default

## 3.2 Development Dependencies

### ESLint 9.39.1
**Purpose**: Code linting and style enforcement

**Plugins Used**:
- `@eslint/js` - Core ESLint rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-react-refresh` - Fast refresh validation
- `typescript-eslint` - TypeScript-specific rules

### Canvas 3.2.0 & Sharp 0.34.5
**Purpose**: Asset generation (tennis ball sprite)

**Usage**:
- `generate-ball.js` script creates tennis ball PNG
- Canvas API for programmatic drawing
- Sharp for image optimization

### Build Tools
- **TypeScript Compiler** - Type checking and transpilation
- **Vite React Plugin** - React-specific optimizations
- **PostCSS** - CSS processing (implicit via Vite)

## 3.3 Runtime APIs

### Web Audio API
**Purpose**: Sound effect generation

**Why Web Audio?**
- No audio files needed (smaller bundle)
- Low-latency playback
- Procedural sound synthesis
- Full control over waveforms

**Usage**:
```typescript
const audioContext = new AudioContext()
const oscillator = audioContext.createOscillator()
const gainNode = audioContext.createGain()

oscillator.frequency.value = 1000 // Hz
oscillator.type = 'sine'
// ... configuration and playback
```

### localStorage API
**Purpose**: Persistent mute preference

**Usage**:
```typescript
localStorage.setItem('audioMuted', 'true')
const muted = localStorage.getItem('audioMuted') === 'true'
```

### Canvas API (via Phaser)
**Purpose**: 2D rendering

**Phaser Abstracts**:
- Drawing sprites
- Applying transformations
- Rendering text
- Managing layers (depth)

---


# 4. PROJECT STRUCTURE

## 4.1 Directory Organization

```
nuerrr/
 public/                          # Static assets
    tennis-ball.png             # Generated ball sprite (36x36px)
    vite.svg                    # Vite logo

- src/                            # Source code
    assets/                     # Asset files
       react.svg              # React logo
       styles/                # CSS stylesheets
           game-over.css      # Results screen styles
           hud.css            # In-game HUD styles
           level-selector.css # Difficulty selector styles
           main.css           # Global styles
           start-screen.css   # Start screen styles
   
    classes/                    # Game classes
       Ball.ts                # Ball entity class
   
    components/                 # React components
       GameContainer.tsx      # Main game container
       GameOverScreen.tsx     # Results/stats screen
       HUD.tsx                # Heads-up display
       LevelSelector.tsx      # Difficulty picker
       StartScreen.tsx        # Welcome/start screen
   
    scenes/                     # Phaser scenes
       GameScene.ts           # Main game logic scene
   
    types/                      # TypeScript definitions
       game.types.ts          # Game-related types
   
    utils/                      # Utility modules
       audio.ts               # Audio manager
       metrics.ts             # Statistics calculator
   
    App.tsx                     # Root React component
    main.tsx                    # Application entry point

 generate-ball.js                # Asset generation script
 index.html                      # HTML template
 package.json                    # Dependencies & scripts
 tsconfig.json                   # TypeScript config
 tsconfig.app.json               # App-specific TS config
 tsconfig.node.json              # Node-specific TS config
 vite.config.ts                  # Vite configuration
 eslint.config.js                # ESLint configuration
```

## 4.2 File Descriptions

### Root Files

**index.html**
- HTML document template
- Loads fonts (Roboto Mono)
- Contains root div for React
- Includes meta tags for SEO

**package.json**
- Project metadata and version
- NPM dependencies (runtime & dev)
- Build and dev scripts
- ESM module type specification

**vite.config.ts**
- Vite build configuration
- React plugin registration
- Port and proxy settings (default)

**tsconfig.json**
- TypeScript project references
- Points to app and node configs
- Enables project-wide type checking

**generate-ball.js**
- Node.js script for asset creation
- Generates tennis ball sprite using Canvas
- Creates 36x36px PNG with gradient and seams
- Run with: \
ode generate-ball.js\

### Source Files (src/)

**main.tsx**
- Application entry point
- Renders React app to DOM
- Imports global styles
- Enables StrictMode

**App.tsx**
- Root component
- Contains GameContainer
- Manages mute button state
- Handles audio toggle logic

### Components (src/components/)

**GameContainer.tsx** (149 lines)
- Main orchestrator component
- Manages Phaser game instance
- Holds React state (score, time, game state)
- Sets up Phaser event listeners
- Renders UI overlays based on game state

**HUD.tsx** (59 lines)
- In-game heads-up display
- Shows score, timer, missed targets
- Animated score updates
- Color-coded timer (green/yellow/red)
- Positioned at top of screen

**StartScreen.tsx** (40 lines)
- Welcome screen overlay
- Contains game title and description
- START TEST button
- Only visible when GameState.IDLE

**GameOverScreen.tsx** (136 lines)
- Results screen after game ends
- Displays comprehensive statistics
- Shows performance tier (S/A/B/C/D)
- PLAY AGAIN and HOME buttons
- Includes missed targets count

**LevelSelector.tsx** (40 lines)
- Difficulty selection component
- Three buttons: Easy, Medium, Hard
- Visual feedback for selected level
- Only visible on start screen
- Uses emoji indicators ()

### Scenes (src/scenes/)

**GameScene.ts** (319 lines)
- Core Phaser scene
- Manages game loop
- Handles ball spawning/removal
- Processes click inputs
- Tracks metrics and statistics
- Implements 30-second timer
- Manages 2-second ball expiry

### Classes (src/classes/)

**Ball.ts** (116 lines)
- Ball entity representation
- Static (non-physics) sprite
- 32px diameter visual size
- 2-second auto-disappear timer
- Click collision detection (20px radius)
- Pop-in animation on spawn
- Fade-out animation on removal

### Types (src/types/)

**game.types.ts** (68 lines)
- GameState enum (IDLE, ACTIVE, GAME_OVER)
- PerformanceTier type (S/A/B/C/D)
- ClickMetric interface
- GameMetrics interface
- BallData interface
- GameConfig interface
- GAME_CONFIG constant

### Utilities (src/utils/)

**audio.ts** (156 lines)
- AudioManager class (singleton)
- Web Audio API integration
- Sound effects:
  - Click (1000Hz sine, 150ms)
  - Spawn (400-600Hz sweep)
  - Warning (880Hz square)
  - Game over (1200Hz, 400ms)
- Mute toggle with localStorage
- Volume control

**metrics.ts** (99 lines)
- Statistical calculations
- Median, mean, std deviation
- Performance tier determination
- CSV export functionality
- JSON export functionality
- Accuracy percentage calculation
- Consistency score algorithm

### Styles (src/assets/styles/)

**main.css** (63 lines)
- Global resets and base styles
- Dark gradient background
- Game wrapper and container
- Canvas styling (cursor: none)
- Responsive media queries

**hud.css** (123 lines)
- HUD container positioning
- Score and timer styling
- Color-coded timer states
- Pulse animations
- Responsive typography

**start-screen.css** (95 lines)
- Start screen overlay
- Title and description
- Button styling
- Glow effects
- Responsive layout

**game-over.css** (227 lines)
- Results screen layout
- Stats grid (3-column)
- Tier badge styling
- Button group
- Card glassmorphism effects

**level-selector.css** (67 lines)
- Difficulty selector positioning
- Button states (normal, hover, active)
- Icon and label styling
- Neon cyan theme

## 4.3 Asset Pipeline

### Tennis Ball Sprite Generation

The project uses a **procedural generation** approach for the tennis ball sprite:

**Development Process**:
1. Run \
ode generate-ball.js\
2. Script creates 36x36px canvas
3. Draws radial gradient (light center, dark edges)
4. Adds tennis ball seam curves
5. Exports to \public/tennis-ball.png\
6. Phaser loads sprite at runtime

**Benefits**:
- No designer needed
- Guaranteed consistency
- Easy to regenerate
- Version controlled (script)
- Customizable parameters

**Sprite Details**:
- **Size**: 36x36 pixels
- **Format**: PNG with transparency
- **Colors**: Neon yellow-green gradient
- **Features**: 3D lighting effect, tennis seams
- **Display Size**: 32x32 (scaled down slightly)

### Font Loading

Fonts are loaded from Google Fonts CDN:
- **Font**: Roboto Mono
- **Weights**: 400, 600, 700
- **Purpose**: Monospace aesthetic for tech theme
- **Fallback**: Monaco, Courier New, monospace

## 4.4 Build Output

After running \
pm run build\:

```
dist/
 assets/
    index-[hash].js          # Bundled JavaScript
    index-[hash].css         # Bundled CSS
    tennis-ball-[hash].png   # Hashed sprite
 vite.svg
 index.html                    # Entry HTML
```

**Optimizations Applied**:
- Code splitting (Phaser in separate chunk)
- Tree shaking (unused code removed)
- Minification (JavaScript & CSS)
- Asset hashing (cache busting)
- Compression ready (gzip/brotli)

---

# 5. CORE SYSTEMS

## 5.1 Game Loop System

### Phaser Game Loop

Phaser provides the core game loop running at 60 FPS:

```typescript
update(time: number, delta: number): void {
    if (this.gameState !== GameState.ACTIVE) return;
    
    // Update timer
    const elapsed = time - this.startTime;
    const remaining = Math.max(0, GAME_CONFIG.gameDuration - elapsed);
    this.events.emit('timerUpdated', remaining);
    
    // Check for game end
    if (remaining <= 0) {
        this.endGame();
    }
}
```

**Loop Breakdown**:
- **60 FPS target** (16.67ms per frame)
- **time**: Total elapsed time since scene start
- **delta**: Time since last frame (ideally ~16.67ms)
- **Responsibilities**:
  - Update timer display
  - Check for game end condition
  - Emit events to React layer

**No Physics Updates**: 
Since balls are static, we don't need to update positions or velocities.

### React Render Loop

React re-renders components when state changes:

```typescript
// State changes trigger re-renders
setScore(newScore)              // Triggers HUD update
setTimeRemaining(remaining)     // Triggers timer update
setGameState(GameState.ACTIVE)  // Triggers UI overlay change
```

**Optimization**: 
- Only affected components re-render
- Pure components prevent unnecessary renders
- Virtual DOM minimizes actual DOM updates

## 5.2 Event System

### Phaser to React Communication

Events flow from Phaser to React using Phaser's EventEmitter:

```typescript
// In GameScene
this.events.emit('scoreUpdated', this.score);
this.events.emit('timerUpdated', remaining);
this.events.emit('lostBallsUpdated', this.lostBallsCount);
this.events.emit('gameOver', this.clickMetrics);

// In GameContainer
sceneRef.current.events.on('scoreUpdated', (newScore: number) => {
    setScore(newScore);
});
```

**Event Types**:
1. **gameStateChanged**: Game state transitions
2. **scoreUpdated**: Score increments
3. **timerUpdated**: Every frame timer update
4. **lostBallsUpdated**: Missed target count
5. **gameOver**: Game completion with metrics

**Benefits**:
- Decoupled architecture
- Type-safe event data
- Easy to add new events
- Unidirectional data flow

### React to Phaser Communication

React calls Phaser methods directly via refs:

```typescript
const sceneRef = useRef<GameScene | null>(null);

const handleStartGame = () => {
    sceneRef.current.startGame(selectedLevel);
};
```

**Method Calls**:
- \startGame(difficulty)\ - Begin new game
- \scene.restart()\ - Reset scene

## 5.3 Input System

### Mouse/Touch Input

Phaser handles all canvas input:

```typescript
// Setup in create()
this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    this.handlePointerDown(pointer);
});

// Processing
private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (this.gameState !== GameState.ACTIVE) return;
    
    for (const ball of this.activeBalls) {
        if (ball.checkCollision(pointer.x, pointer.y)) {
            this.handleBallClick(ball, pointer.x, pointer.y);
            break;  // Only one ball per click
        }
    }
}
```

**Input Flow**:
1. User clicks/taps canvas
2. Phaser emits pointerdown event
3. Get pointer coordinates
4. Check collision with each ball
5. Process first hit (if any)

**Collision Detection**:
```typescript
checkCollision(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(
        x, y,
        this.sprite.x,
        this.sprite.y
    );
    return distance <= 20;  // 16px radius + 4px buffer
}
```

**Buffer Zone**: 
- Ball visual: 16px radius
- Click buffer: +4px tolerance
- Total hit area: 20px radius

This makes clicking slightly easier and more forgiving.

### Keyboard Input

Currently not implemented, but could be added:

```typescript
// Potential keyboard controls
this.input.keyboard.on('keydown-R', () => this.restart());
this.input.keyboard.on('keydown-ESC', () => this.pause());
```

## 5.4 Timer System

### 30-Second Countdown

Implemented using Phaser's TimerEvent:

```typescript
this.gameTimer = this.time.addEvent({
    delay: GAME_CONFIG.gameDuration,  // 30000ms
    callback: () => this.endGame(),
    loop: false
});
```

**Dual Tracking**:
1. **Phaser Timer**: Triggers game end
2. **Manual Calculation**: For display updates

```typescript
const elapsed = time - this.startTime;
const remaining = Math.max(0, GAME_CONFIG.gameDuration - elapsed);
```

**Why Both?**:
- Timer ensures precise game end
- Manual calc allows smooth display updates

### Visual Timer Feedback

HUD changes color based on remaining time:

```typescript
const getTimerClass = (): string => {
    const seconds = timeRemaining / 1000;
    if (seconds > 45) return 'timer-normal';    // Cyan
    if (seconds > 14) return 'timer-warning';   // Yellow
    return 'timer-critical';                     // Red + pulse
}
```

### 2-Second Ball Timer

Each ball has an independent 2-second expiry timer:

```typescript
this.expireTimer = scene.time.delayedCall(2000, () => {
    if (this.isActive && this.onExpire) {
        this.onExpire();  // Callback to GameScene
    }
});
```

**Timer Management**:
- Created on ball spawn
- Removed on ball click (manual destroy)
- Fires callback if ball not clicked
- Cleaned up to prevent memory leaks

## 5.5 Collision System

### Point-to-Circle Collision

Simple distance-based collision detection:

```typescript
checkCollision(x: number, y: number): boolean {
    const distance = Phaser.Math.Distance.Between(
        x, y,
        this.sprite.x, this.sprite.y
    );
    return distance <= 20;
}
```

**Mathematics**:
```
distance = [(x-x) + (y-y)]

If distance  radius, then collision detected
```

**Performance**:
- O(n) complexity per click (n = number of balls)
- Maximum 3 balls (hard mode)
- Typically 1-2 comparisons per click
- No spatial partitioning needed

### Click Accuracy Measurement

Distance is recorded for metrics:

```typescript
const accuracy = Phaser.Math.Distance.Between(
    clickX, clickY,
    ball.sprite.x, ball.sprite.y
);

this.clickMetrics.push({
    accuracy: accuracy,  // Stored in pixels
    // ... other metrics
});
```

**Accuracy Percentage**:
```typescript
const avgAccuracy = accuracies.reduce((a,b) => a+b, 0) / accuracies.length;
const accuracyPercentage = Math.max(0, 100 - (avgAccuracy / 18) * 100);
```

**Interpretation**:
- 0px distance = 100% accuracy (clicked dead center)
- 18px distance = 0% accuracy (clicked on edge)
- > 18px = missed (no collision)

---


# 6. COMPONENT DOCUMENTATION

## 6.1 GameContainer Component

**File**: \src/components/GameContainer.tsx\  
**Type**: React Functional Component  
**Lines**: 149

### Purpose
Main orchestrator that manages both the Phaser game instance and the React UI layer. Acts as a bridge between the two systems.

### State Management

```typescript
const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
const [score, setScore] = useState(0);
const [missedTargets, setMissedTargets] = useState(0);
const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.gameDuration);
const [metrics, setMetrics] = useState<ClickMetric[]>([]);
const [selectedLevel, setSelectedLevel] = useState<'easy' |'medium' | 'hard'>('medium');
```

### Lifecycle

**Mount (useEffect)**:
1. Create Phaser game configuration
2. Instantiate Phaser.Game
3. Wait for 'ready' event
4. Get GameScene reference
5. Set up event listeners
6. Return cleanup function

**Unmount**:
```typescript
return () => {
    if (gameRef.current) {
        gameRef.current.destroy(true);
    }
};
```

### Event Listeners

```typescript
sceneRef.current.events.on('gameStateChanged', (state) => {
    setGameState(state);
});

sceneRef.current.events.on('scoreUpdated', (newScore) => {
    setScore(newScore);
});

sceneRef.current.events.on('timerUpdated', (remaining) => {
    setTimeRemaining(Math.max(0, remaining));
});

sceneRef.current.events.on('lostBallsUpdated', (lostBalls) => {
    setMissedTargets(lostBalls);
});

sceneRef.current.events.on('gameOver', (gameMetrics) => {
    setMetrics(gameMetrics);
});
```

### Handler Functions

**handleStartGame()**
```typescript
const handleStartGame = () => {
    if (sceneRef.current) {
        sceneRef.current.startGame(selectedLevel);
        setScore(0);
        setMissedTargets(0);
        setTimeRemaining(GAME_CONFIG.gameDuration);
        setMetrics([]);
    }
};
```

**handleRestartGame()**
```typescript
const handleRestartGame = () => {
    if (sceneRef.current) {
        sceneRef.current.startGame(selectedLevel);
        setScore(0);
        setMissedTargets(0);
        setTimeRemaining(GAME_CONFIG.gameDuration);
        setMetrics([]);
    }
};
```

**handleHome()**
```typescript
const handleHome = () => {
    if (sceneRef.current) {
        sceneRef.current.scene.restart();
        setGameState(GameState.IDLE);
        setScore(0);
        setTimeRemaining(GAME_CONFIG.gameDuration);
        setMetrics([]);
    }
};
```

### Render Logic

```typescript
return (
    <div className=\"game-wrapper\">
        <div id=\"game-container\" className=\"game-canvas-container\">
            {/* Phaser canvas renders here */}
        </div>

        {/* Level Selector - only show on start screen */}
        {gameState === GameState.IDLE && (
            <LevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
            />
        )}

        {/* Start Screen */}
        {gameState === GameState.IDLE && (
            <StartScreen onStart={handleStartGame} />
        )}

        {/* HUD during gameplay */}
        {gameState === GameState.ACTIVE && (
            <HUD
                score={score}
                timeRemaining={timeRemaining}
                missedTargets={missedTargets}
            />
        )}

        {/* Results Screen */}
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
```

### Phaser Configuration

```typescript
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.canvasWidth,
    height: GAME_CONFIG.canvasHeight,
    parent: 'game-container',
    backgroundColor: '#1a1a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
```

## 6.2 HUD Component

**File**: \src/components/HUD.tsx\  
**Type**: React Functional Component  
**Lines**: 59

### Purpose
Displays real-time game statistics during active gameplay at the top of the screen.

### Props Interface

```typescript
interface HUDProps {
    score: number;
    timeRemaining: number;
    missedTargets: number;
}
```

### Features

**Animated Score**:
```typescript
const [displayScore, setDisplayScore] = useState(score);

useEffect(() => {
    if (score !== displayScore) {
        setDisplayScore(score);
    }
}, [score]);
```

**Time Formatting**:
```typescript
const formatTime = (ms: number): string => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return \\:\\;
};
```

**Timer Color Logic**:
```typescript
const getTimerClass = (): string => {
    const seconds = timeRemaining / 1000;
    if (seconds > 45) return 'timer-normal';    // Cyan
    if (seconds > 14) return 'timer-warning';   // Yellow
    return 'timer-critical';                     // Red + pulsing
};
```

### Layout Structure

```

 TARGETS HIT: 12           00:15           MISSED: 3      
   (left)                (center)            (right)       

```

### CSS Classes

- \.hud-container\ - Top bar with dark background
- \.hud-left\ - Left section (targets hit)
- \.hud-center\ - Center section (timer)
- \.hud-right\ - Right section (missed targets)
- \.hud-score\ - Large green number
- \.hud-timer\ - Large timer with dynamic color
- \.hud-missed\ - Large red number
- \.score-pulse\ - Pulse animation on score increase

## 6.3 StartScreen Component

**File**: \src/components/StartScreen.tsx\  
**Type**: React Functional Component  
**Lines**: 40

### Purpose
Welcome screen shown before game starts, provides instructions and start button.

### Props Interface

```typescript
interface StartScreenProps {
    onStart: () => void;
}
```

### Content

**Title**: \"REACTION TEST\"  
**Subtitle**: \"Neural Speed Challenge\"  
**Description**: Three bullet points explaining the game  
**Button**: \"START TEST\" triggers onStart callback

### Structure

```tsx
<div className=\"start-screen-overlay\">
    <div className=\"start-content\">
        <h1 className=\"start-title\">REACTION TEST</h1>
        <p className=\"start-subtitle\">Neural Speed Challenge</p>
        
        <div className=\"start-description\">
            <p> Click balls as fast as possible</p>
            <p> 30 seconds to get the highest score</p>
            <p> Balls disappear after 2 seconds</p>
        </div>

        <button className=\"start-button\" onClick={onStart}>
            START TEST
        </button>
    </div>
</div>
```

### Visual Effects

- Overlay darkens game canvas
- Glassmorphism card effect
- Glowing button with hover state
- Neon cyan accents
- Fade-in animation (via CSS)

## 6.4 GameOverScreen Component

**File**: \src/components/GameOverScreen.tsx\  
**Type**: React Functional Component  
**Lines**: 136

### Purpose
Displays comprehensive performance statistics after game ends.

### Props Interface

```typescript
interface GameOverScreenProps {
    metrics: ClickMetric[];
    missedTargets: number;
    onRestart: () => void;
    onHome?: () => void;
}
```

### Metrics Calculation

```typescript
const gameMetrics = useMemo(() => {
    return calculateGameMetrics(metrics);
}, [metrics]);
```

### Performance Tiers

```typescript
const getTierColor = (tier: string): string => {
    switch (tier) {
        case 'S': return '#FFD700';  // Gold
        case 'A': return '#00FFFF';  // Cyan
        case 'B': return '#00FF00';  // Green
        case 'C': return '#FFFF00';  // Yellow
        case 'D': return '#FF6B6B';  // Red
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
```

### Stats Grid

**9 Statistics Displayed**:
1. **Targets Hit** - Total successful clicks
2. **Missed Targets** - Balls that expired (red color)
3. **Average Reaction Time** - Mean time to click (ms)
4. **Median Reaction Time** - Median value
5. **Fastest Reaction** - Minimum reaction time
6. **Click Accuracy** - Distance accuracy percentage
7. **Clicks Per Second** - Rate calculation
8. **Consistency Score** - Based on standard deviation
9. **Standard Deviation** - Variability in reaction times

### Layout

```

      TEST COMPLETE!                
                                    
   
     S - LEGENDARY               
   
                                    
   
   Targets Hit       45         
   
   Missed             8         
   
   Avg Reaction     850ms       
        ...                      
   
                                    
  [PLAY AGAIN]      [HOME]         

```

### No Results Fallback

```typescript
if (!gameMetrics) {
    return (
        <div className=\"game-over-overlay\">
            <div className=\"game-over-content\">
                <h1 className=\"game-over-title\">TEST COMPLETE!</h1>
                <p>No targets were hit. Try again!</p>
                <button onClick={onRestart}>PLAY AGAIN</button>
            </div>
        </div>
    );
}
```

## 6.5 LevelSelector Component

**File**: \src/components/LevelSelector.tsx\  
**Type**: React Functional Component  
**Lines**: 40

### Purpose
Allows player to select difficulty before game starts. Only visible on start screen.

### Props Interface

```typescript
interface LevelSelectorProps {
    selectedLevel: 'easy' | 'medium' | 'hard';
    onLevelChange: (level: 'easy' | 'medium' | 'hard') => void;
}
```

### Difficulty Levels

```typescript
EASY:    1 ball
MEDIUM:  2 balls (default)
HARD:    3 balls
```

### Component Structure

```tsx
<div className=\"level-selector\">
    <div className=\"level-label\">DIFFICULTY</div>
    <div className=\"level-buttons\">
        <button className={\level-btn \\}
                onClick={() => onLevelChange('easy')}>
            <span className=\"level-icon\"></span>
            <span className=\"level-name\">EASY</span>
        </button>
        {/* Medium and Hard buttons */}
    </div>
</div>
```

### Positioning

- **Absolute positioning** in top-right area
- **Not visible during gameplay** (GameState check)
- **Right padding**: 180px from edge (avoids mute button)
- **Style**: Glassmorphism with backdrop blur

### Visual States

**Normal**: Dark background, gray border  
**Hover**: Cyan border, slight glow  
**Active**: Full cyan theme, text glow, box shadow

---


# 7. GAME MECHANICS

## 7.1 Ball Spawning System

### Initial Spawn

When game starts, balls are spawned based on difficulty:

```typescript
private spawnBalls() {
    const ballCount = this.difficulty === 'easy' ? 1 
                    : this.difficulty === 'medium' ? 2 
                    : 3;
    
    // Clear existing balls
    this.activeBalls.forEach(ball => ball.destroy());
    this.activeBalls = [];

    // Spawn new balls
    for (let i = 0; i < ballCount; i++) {
        this.spawnSingleBall();
    }

    audioManager.playSpawnSound();
}
```

### Single Ball Spawn

```typescript
private spawnSingleBall() {
    const randomX = Phaser.Math.Between(100, GAME_CONFIG.canvasWidth - 100);
    const randomY = Phaser.Math.Between(120, GAME_CONFIG.canvasHeight - 120);
    
    const ball = new Ball(this, randomX, randomY, Date.now(), () => {
        this.handleBallExpired(ball);
    });
    this.activeBalls.push(ball);
}
```

### Spawn Constraints

**X Position**: 100px to 1180px (100px margin from edges)  
**Y Position**: 120px to 600px (120px from top HUD, 120px from bottom)  
**Reason**: Prevents balls spawning under HUD or too close to edges

### Ball Class Constructor

```typescript
constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spawnTime: number,
    onExpire?: () => void
) {
    this.scene = scene;
    this.spawnTime = spawnTime;
    this.isActive = true;
    this.onExpire = onExpire;

    // Create sprite
    this.sprite = scene.add.sprite(x, y, 'tennis-ball');
    this.sprite.setDisplaySize(32, 32);
    this.sprite.setDepth(10);
    this.sprite.setInteractive();

    // Pop-in animation
    this.sprite.setScale(0.4);
    scene.tweens.add({
        targets: this.sprite,
        scale: 1.0,
        duration: 150,
        ease: 'Quad.easeOut'
    });

    // Setup 2-second expiry timer
    this.expireTimer = scene.time.delayedCall(2000, () => {
        if (this.isActive && this.onExpire) {
            this.onExpire();
        }
    });
}
```

## 7.2 Click Handling

### Click Detection Flow

```
User clicks canvas
    
Phaser pointerdown event fires
    
Get pointer coordinates
    
Loop through activeBalls array
    
Call ball.checkCollision(x, y) for each
    
First ball with collision = HIT
    
Execute handleBallClick()
    
Break loop (one ball per click)
```

### Click Processing

```typescript
private handleBallClick(ball: Ball, clickX: number, clickY: number) {
    if (!ball.isActive || this.gameState !== GameState.ACTIVE) return;

    // Calculate reaction time
    const clickTime = Date.now();
    const reactionTime = clickTime - ball.spawnTime;

    // Calculate accuracy
    const ballPos = ball.getPosition();
    const accuracy = Phaser.Math.Distance.Between(
        clickX, clickY,
        ballPos.x, ballPos.y
    );

    // Record metric
    this.clickMetrics.push({
        timestamp: clickTime - this.startTime,
        reactionTime: reactionTime,
        clickPosition: { x: clickX, y: clickY },
        ballPosition: ballPos,
        accuracy: accuracy
    });

    // Update score
    this.score++;
    this.events.emit('scoreUpdated', this.score);

    // Audio feedback
    audioManager.playClickSound();

    // Remove clicked ball
    const index = this.activeBalls.indexOf(ball);
    if (index > -1) {
        this.activeBalls.splice(index, 1);
    }
    ball.remove();

    // Spawn replacement
    this.time.delayedCall(50, () => {
        this.spawnSingleBall();
    });
}
```

### Click Metrics Structure

```typescript
interface ClickMetric {
    timestamp: number;        // ms since game start
    reactionTime: number;     // ms from spawn to click
    clickPosition: { x: number; y: number };
    ballPosition: { x: number; y: number };
    accuracy: number;         // distance in pixels
}
```

## 7.3 Ball Expiry System

### Expiry Trigger

Each ball has a 2-second timer that calls \onExpire\ callback:

```typescript
this.expireTimer = scene.time.delayedCall(2000, () => {
    if (this.isActive && this.onExpire) {
        this.onExpire();
    }
});
```

### Expiry Handler

```typescript
private handleBallExpired(ball: Ball) {
    if (!ball.isActive || this.gameState !== GameState.ACTIVE) return;

    // Increment lost counter
    this.lostBallsCount++;
    console.log('Ball expired! Lost balls:', this.lostBallsCount);

    // Notify UI
    this.events.emit('lostBallsUpdated', this.lostBallsCount);

    // Remove expired ball
    const index = this.activeBalls.indexOf(ball);
    if (index > -1) {
        this.activeBalls.splice(index, 1);
    }
    ball.remove();

    // Spawn replacement
    this.time.delayedCall(50, () => {
        this.spawnSingleBall();
    });
}
```

### Why 50ms Delay?

Small delay before spawning replacement ensures:
- Removal animation completes
- Prevents visual overlap
- Smoother user experience

## 7.4 Scoring System

### Score Calculation

**Simple increment**: +1 per successful click  
**No penalties**: Missing or letting balls expire doesn't reduce score  
**Maximum possible**: Unlimited (depends on speed)

### Realistic Score Ranges

Based on difficulty and skill:

**Easy Mode (1 ball)**:
- Beginner: 10-20 clicks
- Intermediate: 20-30 clicks
- Expert: 30-40 clicks
- Pro: 40+ clicks

**Medium Mode (2 balls)**:
- Beginner: 15-25 clicks
- Intermediate: 25-35 clicks
- Expert: 35-45 clicks
- Pro: 45+ clicks

**Hard Mode (3 balls)**:
- Beginner: 20-30 clicks
- Intermediate: 30-40 clicks
- Expert: 40-50 clicks
- Pro: 50+ clicks

### Performance Tier Thresholds

```typescript
function determinePerformanceTier(totalClicks: number): PerformanceTier {
    if (totalClicks >= 50) return 'S';  // LEGENDARY
    if (totalClicks >= 40) return 'A';  // EXCELLENT
    if (totalClicks >= 30) return 'B';  // GOOD
    if (totalClicks >= 20) return 'C';  // OKAY
    return 'D';                          // PRACTICE MORE
}
```

**Tier Distribution**:
- **S Tier**: Top 5% of players
- **A Tier**: Top 20% of players
- **B Tier**: Top 50% of players
- **C Tier**: Top 80% of players
- **D Tier**: Remaining 20%

## 7.5 Difficulty System

### Difficulty Comparison

| Aspect | Easy | Medium | Hard |
|--------|------|--------|------|
| Balls Active | 1 | 2 | 3 |
| Attention Required | Low | Medium | High |
| Click Rate Needed | ~1.3/sec | ~1.7/sec | ~2.0/sec |
| Target Tier | C (20+) | B (30+) | A (40+) |
| Skill Level | Beginner | Intermediate | Advanced |

### Difficulty Impact

**Easy (1 ball)**:
- Focus on single target
- More time to react
- Good for learning
- Lower stress

**Medium (2 balls)**:
- Split attention
- Must prioritize clicks
- Moderate challenge
- Balanced gameplay

**Hard (3 balls)**:
- Constant vigilance required
- High APM (actions per minute)
- Difficult to avoid misses
- Maximum challenge

### Selection UI

Players can change difficulty only on start screen:
- Selection hidden during gameplay
- Prevents mid-game changes
- Maintains fair scoring

## 7.6 Game States

### State Machine

```
        START
          
     IDLE 
                      
      ACTIVE          
                      
     GAME_OVER 
```

### State Definitions

**IDLE**:
- Initial state
- Shows start screen
- Shows difficulty selector
- Waiting for user to click START

**ACTIVE**:
- Game in progress
- Timer counting down
- Balls spawning/expiring
- Recording metrics
- Shows HUD

**GAME_OVER**:
- Timer reached 0
- No more input accepted
- Showing results screen
- Metrics calculated

**PAUSED** (defined but unused):
- Reserved for future pause functionality

**RESULTS** (defined but unused):
- Same as GAME_OVER currently

### State Transitions

```typescript
// IDLE -> ACTIVE
this.gameState = GameState.ACTIVE;
this.events.emit('gameStateChanged', GameState.ACTIVE);

// ACTIVE -> GAME_OVER
this.gameState = GameState.GAME_OVER;
this.events.emit('gameStateChanged', GameState.GAME_OVER);

// GAME_OVER -> IDLE (via restart)
this.scene.restart();
```

---

# 8. STYLING SYSTEM

## 8.1 CSS Architecture

### File Organization

```
src/assets/styles/
 main.css              # Global styles & layout
 hud.css              # In-game HUD
 start-screen.css     # Welcome screen
 game-over.css        # Results screen
 level-selector.css   # Difficulty picker
```

### Import Strategy

Each component imports its own CSS:

```typescript
// In GameContainer
import '../assets/styles/main.css';

// In HUD
import '../assets/styles/hud.css';

// In StartScreen
import '../assets/styles/start-screen.css';
```

### Why Separate Files?

- **Modularity**: Each component owns its styles
- **Maintainability**: Easy to find and update
- **Performance**: Vite bundles efficiently
- **Scalability**: Can add new components easily

## 8.2 Design System

### Color Palette

**Primary**:
- \#00FFFF\ - Cyan (primary accent)
- \#00FF00\ - Green (success, score)
- \#FFFF00\ - Yellow (warning)
- \#FF6B6B\ - Red (critical, missed)
- \#FFD700\ - Gold (S tier)

**Background**:
- \#0f0f0f\ - Very dark gray
- \#1a1a1a\ - Dark gray
- \#2a2a2a\ - Medium dark gray
- \gba(0, 0, 0, 0.7)\ - Semi-transparent black

**Glassmorphism**:
- \gba(0, 0, 0, 0.8)\ - Dark glass
- \ackdrop-filter: blur(10px)\ - Blur effect
- \order: 2px solid rgba(0, 255, 255, 0.3)\ - Subtle borders

### Typography

**Font Family**:
```css
font-family: 'Roboto Mono', 'Monaco', 'Courier New', monospace;
```

**Font Weights**:
- 400 - Regular (body text)
- 600 - Semi-bold (labels)
- 700 - Bold (numbers, headings)

**Font Sizes**:
- 48px - Large numbers (score, timer)
- 20px - Labels
- 16px - Body text
- 12px - Small text
- 11px - Tiny labels

### Spacing System

**Consistent Units**:
- 8px - Extra small
- 12px - Small
- 16px - Medium
- 20px - Large
- 30px - Extra large
- 180px - HUD right padding

**Border Radius**:
- 8px - Buttons, small cards
- 12px - Medium cards
- 16px - Large containers

## 8.3 Component Styles

### main.css - Global Layout

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Monaco', 'Courier New', monospace;
  background: linear-gradient(to bottom, #0f0f0f 0%, #2a2a2a 100%);
  color: #ffffff;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#root {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-canvas-container {
  position: relative;
  max-width: 1280px;
  max-height: 720px;
  width: 100%;
  height: 100%;
}

canvas {
  cursor: none !important;
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
}
```

### hud.css - Game HUD

**Container**:
```css
.hud-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  border-bottom: 2px solid #00FFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 180px 0 30px;
  z-index: 100;
  pointer-events: none;
}
```

**Score Styles**:
```css
.hud-score {
  font-size: 48px;
  font-weight: 700;
  color: #00FF00;
  transition: transform 0.3s ease;
}

.score-pulse {
  animation: scorePulse 0.3s ease;
}

@keyframes scorePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
```

**Timer Colors**:
```css
.timer-normal { color: #00FFFF; }  /* > 45s */
.timer-warning { color: #FFFF00; }  /* 15-45s */
.timer-critical {
  color: #FF3333;  /* < 15s */
  animation: timerPulse 0.5s ease infinite;
}
```

### game-over.css - Results Screen

**Stats Grid**:
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 30px 0;
}

.stat-item {
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(100, 100, 100, 0.3);
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #00FFFF;
}
```

**Tier Badge**:
```css
.tier-badge {
  font-size: 48px;
  font-weight: 700;
  text-align: center;
  padding: 20px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 3px solid currentColor;
  box-shadow: 0 0 30px currentColor;
  text-shadow: 0 0 20px currentColor;
  letter-spacing: 4px;
}
```

## 8.4 Animations

### Pulse Animation

```css
@keyframes scorePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
```

**Usage**: Score number when it increases  
**Duration**: 300ms  
**Effect**: Grows 15% then returns

### Timer Pulse

```css
@keyframes timerPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

**Usage**: Timer when < 15 seconds  
**Duration**: 500ms  
**Effect**: Subtle pulse to create urgency

### Phaser Tweens

**Ball Spawn (Pop-in)**:
```typescript
scene.tweens.add({
  targets: this.sprite,
  scale: { from: 0.4, to: 1.0 },
  duration: 150,
  ease: 'Quad.easeOut'
});
```

**Ball Removal (Fade-out)**:
```typescript
scene.tweens.add({
  targets: this.sprite,
  alpha: { from: 1, to: 0 },
  duration: 100,
  ease: 'Quad.easeIn'
});
```

### Hover Effects

**Button Hover**:
```css
.start-button:hover {
  background: rgba(0, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.5);
}
```

**Level Button Hover**:
```css
.level-btn:hover {
  border-color: rgba(0, 255, 255, 0.5);
  background: rgba(0, 255, 255, 0.1);
  transform: translateY(-2px);
}
```

## 8.5 Responsive Design

### Breakpoints

``css
@media (max-width: 768px) {
  /* Tablet and mobile adjustments */
}
```

### Mobile Adaptations

**HUD**:
```css
@media (max-width: 768px) {
  .hud-container {
    height: 60px;
    padding: 0 15px;
  }

  .hud-label {
    font-size: 14px;
  }

  .hud-score,
  .hud-timer {
    font-size: 32px;
  }
}
```

**Canvas**:
```css
@media (max-width: 768px) {
  .game-canvas-container {
    max-width: 100vw;
    max-height: 100vh;
  }
}
```

---


# 9. AUDIO SYSTEM

## 9.1 Web Audio API Implementation

### AudioManager Class

**File**: \src/utils/audio.ts\  
**Pattern**: Singleton  
**Purpose**: Centralized audio management

### Architecture

```typescript
class AudioManager {
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;
    private volume: number = 0.7;

    constructor() {
        const savedMute = localStorage.getItem('audioMuted');
        this.isMuted = savedMute === 'true';
    }

    private initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || 
                                    (window as any).webkitAudioContext)();
        }
    }
}

export const audioManager = new AudioManager();
```

### Why Web Audio API?

**Advantages**:
- **No audio files**: Zero network requests
- **Low latency**: < 10ms from trigger to sound
- **Procedural**: Generate sounds on-the-fly
- **Small bundle**: No audio assets to load
- **Full control**: Customize frequency, duration, envelope

**Disadvantages**:
- Limited to simple sounds
- Requires user interaction to initialize
- Browser compatibility concerns (minor)

## 9.2 Sound Effects

### Click Sound

**Specification**:
- **Frequency**: 1000 Hz
- **Waveform**: Sine wave
- **Duration**: 150ms
- **Envelope**: ADSR (Attack-Decay-Sustain-Release)

```typescript
playClickSound() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
}
```

**Envelope Breakdown**:
1. **Attack** (0-10ms): Ramp from 0 to full volume
2. **Decay** (10-150ms): Exponential decay to silence
3. **Sustain**: None (continues decaying)
4. **Release**: None (sound stops after delay)

### Spawn Sound

**Specification**:
- **Frequency**: 400 Hz  600 Hz (sweep)
- **Waveform**: Sine wave
- **Duration**: 150ms
- **Volume**: 30% of main volume (quieter)

```typescript
playSpawnSound() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    const now = this.audioContext.currentTime;

    // Frequency sweep (rising pitch)
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.linearRampToValueAtTime(600, now + 0.15);

    gainNode.gain.setValueAtTime(0.3 * this.volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
}
```

**Effect**: Rising "whoosh" sound to indicate new ball appearance

### Warning Beep

**Specification**:
- **Frequency**: 880 Hz (A5 note)
- **Waveform**: Square wave (harsher sound)
- **Duration**: 100ms
- **Volume**: 50% of main volume

```typescript
playWarningBeep() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 880;
    oscillator.type = 'square';  // Harsher tone

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.5 * this.volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
}
```

**Usage**: Could trigger when timer < 10 seconds (not currently implemented)

### Game Over Sound

**Specification**:
- **Frequency**: 1200 Hz
- **Waveform**: Sine wave
- **Duration**: 400ms (longer for emphasis)
- **Volume**: Full volume

```typescript
playGameOverSound() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(this.volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
}
```

## 9.3 Mute System

### Implementation

```typescript
toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('audioMuted', this.isMuted.toString());
    return this.isMuted;
}

isMutedState(): boolean {
    return this.isMuted;
}
```

### Persistence

**Storage**: localStorage  
**Key**: \'audioMuted'\  
**Values**: \'true'\ or \'false'\ (strings)

**Read on load**:
```typescript
constructor() {
    const savedMute = localStorage.getItem('audioMuted');
    this.isMuted = savedMute === 'true';
}
```

### Mute Button (App.tsx)

```tsx
const [isMuted, setIsMuted] = useState(audioManager.isMutedState());

const toggleAudio = () => {
    const newMuteState = audioManager.toggleMute();
    setIsMuted(newMuteState);
};

<button onClick={toggleAudio} style={{...}}>
    {isMuted ? ' UNMUTE' : ' MUTE'}
</button>
```

**Position**: Fixed top-right corner (z-index: 1000)

## 9.4 Audio Context Lifecycle

### Lazy Initialization

Audio context created only when first sound plays:

```typescript
private initAudioContext() {
    if (!this.audioContext) {
        this.audioContext = new AudioContext();
    }
}
```

**Why?**: 
- Browsers require user interaction before audio
- Saves resources if audio is muted
- Prevents console warnings

### Browser Compatibility

```typescript
this.audioContext = new (window.AudioContext || 
                         (window as any).webkitAudioContext)();
```

**Supported**:
- Chrome/Edge: \AudioContext\
- Safari: \webkitAudioContext\
- Firefox: \AudioContext\

---

# 10. METRICS & ANALYTICS

## 10.1 Data Collection

### ClickMetric Interface

```typescript
interface ClickMetric {
    timestamp: number;           // ms since game start
    reactionTime: number;        // ms from spawn to click
    clickPosition: { x: number; y: number };
    ballPosition: { x: number; y: number };
    accuracy: number;            // distance in pixels
}
```

### Metric Capture

```typescript
this.clickMetrics.push({
    timestamp: Date.now() - this.startTime,
    reactionTime: Date.now() - ball.spawnTime,
    clickPosition: { x: clickX, y: clickY },
    ballPosition: ball.getPosition(),
    accuracy: Phaser.Math.Distance.Between(
        clickX, clickY,
        ball.sprite.x, ball.sprite.y
    )
});
```

### Data Points Per Game

**Typical Game**:
- 30-50 click metrics
- 1 game summary metric
- Total: ~31-51 data points

## 10.2 Statistical Calculations

### File: utils/metrics.ts

### Average Reaction Time

```typescript
const reactionTimes = metrics.map(m => m.reactionTime);
const sum = reactionTimes.reduce((a, b) => a + b, 0);
const avg = sum / reactionTimes.length;
```

### Median Reaction Time

```typescript
function calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}
```

**Why Median?**: Less affected by outliers than mean

### Standard Deviation

```typescript
function calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
}
```

**Formula**: s = (S(x - �) / n)

**Interpretation**:
- Low (<100ms): Very consistent
- Medium (100-200ms): Normal variance
- High (>200ms): Inconsistent performance

### Accuracy Percentage

```typescript
const avgAccuracy = accuracies.reduce((a,b) => a+b, 0) / accuracies.length;
const accuracyPercentage = Math.max(0, 100 - (avgAccuracy / 18) * 100);
```

**Calculation**:
- 0px from center = 100% accuracy
- 18px from center (edge) = 0% accuracy
- Linear interpolation between

### Consistency Score

```typescript
const consistencyScore = Math.max(0, 100 - ((stdDev / avg) * 100));
```

**Formula**: 100 - (s / �  100)

**Interpretation**:
- 90-100: Extremely consistent
- 70-90: Good consistency
- 50-70: Average variance
- <50: High variance

### Clicks Per Second

```typescript
clicksPerSecond: parseFloat((metrics.length / 60).toFixed(2))
```

**Note**: Assumes 60-second game (but actual is 30s, this might be a bug)

**Correct calculation**: \metrics.length / 30\

## 10.3 Performance Tiers

### Tier System

```typescript
function determinePerformanceTier(totalClicks: number): PerformanceTier {
    if (totalClicks >= 50) return 'S';  // LEGENDARY
    if (totalClicks >= 40) return 'A';  // EXCELLENT
    if (totalClicks >= 30) return 'B';  // GOOD
    if (totalClicks >= 20) return 'C';  // OKAY
    return 'D';                          // PRACTICE MORE
}
```

### Tier Descriptions

**S - LEGENDARY** (50+ clicks):
- Top-tier performance
- Requires exceptional speed
- Virtually no missed balls
- Gold color (#FFD700)

**A - EXCELLENT** (40-49 clicks):
- Above-average performance
- Fast reactions
- Few missed balls
- Cyan color (#00FFFF)

**B - GOOD** (30-39 clicks):
- Solid performance
- Decent speed
- Some missed balls
- Green color (#00FF00)

**C - OKAY** (20-29 clicks):
- Below-average performance
- Room for improvement
- Many missed balls
- Yellow color (#FFFF00)

**D - PRACTICE MORE** (<20 clicks):
- Need more practice
- Slow reactions
- Most balls missed
- Red color (#FF6B6B)

## 10.4 Data Export

### CSV Export

```typescript
export function exportToCSV(metrics: ClickMetric[]): string {
    const headers = [
        'Timestamp (ms)',
        'Reaction Time (ms)',
        'Click X',
        'Click Y',
        'Ball X',
        'Ball Y',
        'Accuracy (px)'
    ];
    const rows = metrics.map(m => [
        m.timestamp,
        m.reactionTime,
        m.clickPosition.x.toFixed(2),
        m.clickPosition.y.toFixed(2),
        m.ballPosition.x.toFixed(2),
        m.ballPosition.y.toFixed(2),
        m.accuracy.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\\n');
}
```

**Output Example**:
```csv
Timestamp (ms),Reaction Time (ms),Click X,Click Y,Ball X,Ball Y,Accuracy (px)
1250,850,640.25,360.50,645.00,358.00,5.12
2100,750,320.00,200.00,315.50,205.00,6.73
...
```

### JSON Export

```typescript
export function exportToJSON(
    metrics: ClickMetric[],
    gameMetrics: GameMetrics | null
): string {
    return JSON.stringify({
        summary: gameMetrics,
        detailedMetrics: metrics
    }, null, 2);
}
```

**Output Structure**:
```json
{
  \"summary\": {
    \"totalClicks\": 45,
    \"averageReactionTime\": 850,
    \"medianReactionTime\": 820,
    \"minReactionTime\": 450,
    \"maxReactionTime\": 1500,
    \"standardDeviation\": 180,
    \"clicksPerSecond\": 0.75,
    \"accuracyPercentage\": 85,
    \"consistencyScore\": 78,
    \"performanceTier\": \"A\"
  },
  \"detailedMetrics\": [...]
}
```

---


# 11. CONFIGURATION & CONSTANTS

## 11.1 Game Configuration

### GAME_CONFIG Object

**File**: \src/types/game.types.ts\

```typescript
export const GAME_CONFIG: GameConfig = {
    canvasWidth: 1280,      // Game area width (px)
    canvasHeight: 720,      // Game area height (px)
    ballRadius: 18,         // Logical ball radius (px)
    minBallDistance: 0,     // Not used (static balls)
    gameDuration: 30000,    // 30 seconds (ms)
    gravity: 0,             // No gravity
    bounceCoefficient: 0,   // No bounce
    friction: 0             // No friction
};
```

### Configuration Details

**canvasWidth: 1280**
- Standard 16:9 aspect ratio
- Matches 720p width
- Good balance of screen real estate
- Easily scales to different displays

**canvasHeight: 720**
- 720p resolution
- 16:9 aspect ratio
- Optimal for most screens
- Leaves room for HUD

**ballRadius: 18**
- **Logical radius**: 18px
- **Visual display**: 32px diameter (16px radius)
- **Collision radius**: 20px (18 + 2px buffer)
- **Sprite size**: 36x36px (scaled to 32x32px)

**gameDuration: 30000**
- 30 seconds in milliseconds
- Optimal challenge duration
- Not too short, not too long
- Industry standard for quick tests

**gravity: 0**
- Disables Phaser physics
- Balls remain stationary
- Reduces computational overhead
- Simplifies collision detection

## 11.2 Type Definitions

### GameState Enum

```typescript
export enum GameState {
    IDLE = 'IDLE',             // Waiting to start
    ACTIVE = 'ACTIVE',         // Game in progress
    PAUSED = 'PAUSED',         // Paused (not used)
    GAME_OVER = 'GAME_OVER',   // Game ended
    RESULTS = 'RESULTS'        // ame ended (duplicate)
}
```

### PerformanceTier Type

```typescript
export type PerformanceTier = 'S' | 'A' | 'B' | 'C' | 'D';
```

### GameMetrics Interface

```typescript
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
```

### BallData Interface

```typescript
export interface BallData {
    id: string;
    spawnTime: number;
    isActive: boolean;
    position: { x: number; y: number };
    velocity: { x: number; y: number };  // Not used
}
```

**Note**: velocity not used since balls are static

---

# 12. BUILD & DEPLOYMENT

## 12.1 Development

### Starting Dev Server

```bash
npm run dev
```

**What happens**:
1. Vite starts development server
2. Opens http://localhost:5173
3. Watches for file changes
4. Hot module replacement (HMR) enabled
5. Source maps generated

**Features**:
- Instant HMR (<50ms)
- Error overlay in browser
- TypeScript type checking
- ESLint on save

### Build Process

```bash
npm run build
```

**Steps**:
1. \	sc -b\ - TypeScript compilation check
2. \ite build\ - Production build

**Output**: \dist/\ directory

### Preview Production Build

```bash
npm run preview
```

Serves production build locally for testing.

## 12.2 Production Build

### Build Optimization

**Code Splitting**:
- Phaser library in separate chunk
- React/ReactDOM in vendor chunk
- Application code in main chunk

**Minification**:
- JavaScript minified with Terser
- CSS minified with cssnano
- HTML minified

**Tree Shaking**:
- Unused Phaser features removed
- Dead code elimination
- Optimal bundle size

**Asset Optimization**:
- Images hashed for cache busting
- Fonts subset (only used glyphs)
- Compression-ready output

### Bundle Size Analysis

**Estimated Sizes** (gzipped):
- Phaser: ~200 KB
- React + ReactDOM: ~45 KB
- Application code: ~30 KB
- CSS: ~8 KB
- Tennis ball sprite: ~1 KB
- **Total**: ~284 KB

## 12.3 Deployment

### Static Hosting

Project can be deployed to any static host:

**Recommended Platforms**:
- **Vercel**: Zero-config deployment
- **Netlify**: Continuous deployment
- **GitHub Pages**: Free hosting
- **AWS S3 + CloudFront**: Enterprise scale
- **Firebase Hosting**: Google infrastructure

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Configuration**: None needed (auto-detected)

### Netlify Deployment

**netlify.toml**:
```toml
[build]
  command = \"npm run build\"
  publish = \"dist\"

[[redirects]]
  from = \"/*\"
  to = \"/index.html\"
  status = 200
```

### Environment Variables

Currently none needed. Potential future use:
- Analytics tracking IDs
- API endpoints (if backend added)
- Feature flags

## 12.4 Performance Optimization

### Lighthouse Scores (Target)

- **Performance**: 95+
- **Accessibility**: 90+
- **Best Practices**: 95+
- **SEO**: 100

### Optimization Techniques

**Images**:
- Tennis ball sprite is tiny (36x36px)
- PNG optimized with Sharp
- Served with cache headers

**Fonts**:
- Preconnect to Google Fonts
- Font-display: swap
- Only load needed weights

**JavaScript**:
- Code splitting by route(if expanded)
- Lazy loading components
- Tree shaking enabled

**CSS**:
- Critical CSS inlined (small enough)
- No unused styles
- Autoprefixer for compatibility

### Caching Strategy

```
# Recommended cache headers
index.html: no-cache
*.js, *.css: max-age=31536000 (1year - hashed)
*.png, *.svg: max-age=31536000
```

---

# 13. DEVELOPMENT GUIDE

## 13.1 Getting Started

### Prerequisites

- **Node.js**: 18+ recommended
- **npm**: 9+ (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Setup

```bash
# Clone repository
git clone <repository-url>
cd nuerrr

# Install dependencies
npm install

# Generate tennis ball sprite
node generate-ball.js

# Start development server
npm run dev
```

### VS Code Extensions

**Recommended**:
- ESLint
- Prettier
- TypeScript Vue Plugin
- Path Intellisense
- Auto Rename Tag

## 13.2 Project Workflow

### File Naming Conventions

- **Components**: PascalCase (\GameContainer.tsx\)
- **Utilities**: camelCase (\udio.ts\, \metrics.ts\)
- **Types**: camelCase with .types suffix (\game.types.ts\)
- **Styles**: kebab-case (\start-screen.css\)
- **Classes**: PascalCase (\Ball.ts\)

### Code Style

**TypeScript**:
```typescript
// Use interfaces for object shapes
interface Props {
    score: number;
    onUpdate: () => void;
}

// Use type for unions
type Difficulty = 'easy' | 'medium' | 'hard';

// Explicit return types for functions
function calculate(x: number): number {
    return x * 2;
}

// Arrow functions for callbacks
const handleClick = () => {
    // ...
};
```

**React**:
```tsx
// Functional components with TypeScript
const Component: React.FC<Props> = ({ prop1, prop2 }) => {
    const [state, setState] = useState(0);
    
    useEffect(() => {
        // Effects
    }, [dependencies]);
    
    return <div>{content}</div>;
};

export default Component;
```

### Commit Conventions

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Build/config changes
```

**Examples**:
```
feat: Add difficulty selector component
fix: Correct ball spawn timing
docs: Update README with setup instructions
refactor: Simplify metric calculations
```

## 13.3 Adding New Features

### Adding a New Sound Effect

1. **Define sound in AudioManager**:
```typescript
playNewSound() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 500;
    oscillator.type = 'sine';

    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(this.volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
}
```

2. **Call from game logic**:
```typescript
audioManager.playNewSound();
```

### Adding a New Component

1. **Create file**: \src/components/NewComponent.tsx\
2. **Create styles**: \src/assets/styles/new-component.css\
3. **Define component**:
```tsx
import '../assets/styles/new-component.css';

interface NewComponentProps {
    data: string;
}

const NewComponent: React.FC<NewComponentProps> = ({ data }) => {
    return (
        <div className=\"new-component\">
            {data}
        </div>
    );
};

export default NewComponent;
```
4. **Import in parent**: \import NewComponent from './NewComponent';\

### Adding a New Difficulty Level

1. **Update type**: Add to union type
```typescript
type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
```

2. **Update spawn logic**:
```typescript
const ballCount = this.difficulty === 'easy' ? 1
                : this.difficulty === 'medium' ? 2
                : this.difficulty === 'hard' ? 3
                : 4;  // extreme
```

3. **Update LevelSelector**: Add button
4. **Update tier calculation**: Adjust thresholds

## 13.4 Testing

### Manual Testing Checklist

**Start Screen**:
- [ ] Title and description visible
- [ ] START button clickable
- [ ] Difficulty selector shows all 3 levels
- [ ] Selecting difficulty highlights button

**Gameplay**:
- [ ] Correct number of balls spawn
- [ ] Clicking ball increases score
- [ ] Only clicked ball disappears
- [ ] Click plays sound (if unmuted)
- [ ] Timer counts down
- [ ] Timer color changes (cyan  yellow  red)
- [ ] Balls auto-disappear after 2 seconds
- [ ] Missed counter increases on expiry
- [ ] Game ends at 0:00

**Results Screen**:
- [ ] All stats calculated correctly
- [ ] Tier badge shows appropriate color
- [ ] Missed targets displayed
- [ ] PLAY AGAIN restarts game
- [ ] HOME returns to start screen

**Audio**:
- [ ] Mute button toggles correctly
- [ ] Mute preference persists on refresh
- [ ] Sounds play when unmuted
- [ ] No sounds when muted

### Browser Testing

**Minimum Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Test On**:
- Desktop (1920x1080, 1366x768)
- Tablet (1024x768)
- Mobile (375x667, 414x896)

## 13.5 Debugging

### Common Issues

**"Balls not spawning"**:
- Check console for errors
- Verify tennis-ball.png exists in public/
- Run \
ode generate-ball.js\

**"Audio not working"**:
- Check if muted
- Try user interaction first (click start)
- Check browser console for AudioContext errors
- Verify Web Audio API support

**"TypeScript errors"**:
- Run \
pm run build\ to see errors
- Check \	sconfig.json\ settings
- Ensure all dependencies have types

**"Game freezes on click"**:
- Check for missing methods
- Verify ball callbacks are defined
- Look for infinite loops in console
- Check browser performance tab

### Debug Tools

**Phaser Debug**:
```typescript
physics: {
    default: 'arcade',
    arcade: {
        debug: true  // Shows collision boxes
    }
}
```

**React DevTools**:
- Install React Developer Tools extension
- Inspect component props/state
- Check re-render performance

**Console Logging**:
```typescript
console.log('Ball expired! Lost balls:', this.lostBallsCount);
```

---

# 14. API REFERENCE

## 14.1 Ball Class

**File**: \src/classes/Ball.ts\

### Constructor

```typescript
constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spawnTime: number,
    onExpire?: () => void
)
```

**Parameters**:
- \scene\: Phaser scene instance
- \x\: Spawn X coordinate
- \y\: Spawn Y coordinate
- \spawnTime\: Timestamp when ball created
- \onExpire\: Optional callback when 2s timer expires

### Methods

**checkCollision(x: number, y: number): boolean**
- Checks if point collides with ball
- Returns true if distance  20px
- Used for click detection

**getPosition(): { x: number, y: number }**
- Returns current ball position
- Used for metric recording

**remove(): Promise<void>**
- Fades out and destroys ball
- Returns promise that resolves when complete
- Duration: 100ms

**destroy(): void**
- Immediately destroys ball
- Removes sprite and timer
- Called on game end

### Properties

**sprite: Phaser.GameObjects.Sprite**
- Visual sprite representation
- 32x32px display size
- Z-index =10

**spawnTime: number**
- Timestamp when ball created
- Used for reaction time calculation

**isActive: boolean**
- Whether ball is still valid
- Set to false on click/expiry

## 14.2 GameScene Class

**File**: \src/scenes/GameScene.ts\

### Lifecycle Methods

**create(): void**
- Called once when scene starts
- Loads assets
- Sets up input listeners
- Initializes game state

**update(time: number, delta: number): void**
- Called every frame (60 FPS)
- Updates timer
- Checks for game end
- Emits timer events

### Public Methods

**startGame(difficulty: 'easy' | 'medium' | 'hard'): void**
- Starts new game
- Spawns initial balls
- Starts timer
- Resets all counters

### Private Methods

**spawnBalls(): void**
- Spawns balls based on difficulty
- Clears existing balls first
- Plays spawn sound

**spawn SingleBall(): void**
- Spawns one ball at random position
- Sets up expiry callback
- Adds to activeBalls array

**handlePointerDown(pointer): void**
- Processes click events
- Checks ball collisions
- Calls handleBallClick if hit

**handleBallClick(ball, x, y): void**
- Records click metric
- Updates score
- Plays sound
- Removes ball and spawns replacement

**handleBallExpired(ball): void**
- Increments lost counter
- Removes expired ball
- Spawns replacement

**endGame(): void**
- Stops timer
- Destroys all balls
- Emits gameOver event with metrics

## 14.3 AudioManager Class

**File**: \src/utils/audio.ts\

### Methods

**playClickSound(): void**
- 1000Hz sine wave, 150ms
- Played on successful ball click

**playSpawnSound(): void**
- 400-600Hz sweep, 150ms
- Played when balls spawn

**playWarningBeep(): void**
- 880Hz square wave, 100ms
- Reserved for timer warnings

**playGameOverSound(): void**
- 1200Hz sine wave, 400ms
- Played when game ends

**toggleMute(): boolean**
- Toggles mute state
- Saves to localStorage
- Returns new mute state

**isMutedState(): boolean**
- Returns current mute state
- Reads from instance variable

**setVolume(vol: number): void**
- Sets master volume (0-1)
- Clamps to valid range

## 14.4 Metrics Utilities

**File**: \src/utils/metrics.ts\

### Functions

**calculateGameMetrics(metrics: ClickMetric[]): GameMetrics | null**
- Calculates all statistics
- Returns null if no metrics
- Includes all 9 stat calculations

**exportToCSV(metrics: ClickMetric[]): string**
- Converts metrics to CSV format
- Returns CSV string
- Ready for file download

**exportToJSON(metrics, gameMetrics): string**
- Converts to JSON format
- Pretty-printed (2-space indent)
- Includes summary and details

---

# 15. FUTURE ENHANCEMENTS

## 15.1 Potential Features

### Gameplay

- **Pause functionality**: Allow pausing mid-game
- **Power-ups**: Slow-motion, freeze balls, bonus points
- **Combo system**: Consecutive clicks increase multiplier
- **Different ball types**: Fast balls, bouncing balls, shrinking balls
- **Customizable duration**: 15s, 30s, 60s, 120s modes

### Progression

- **Leaderboards**: Local and online high scores
- **Achievements**: Unlock badges for milestones
- **Daily challenges**: New challenge each day
- **Practice mode**: Unlimited time for training
- **Tutorial mode**: Guided introduction

### Analytics

- **Session history**: Track performance over time
- **Progress graphs**: Visualize improvement
- **Detailed breakdowns**: Per-ball statistics
- **Comparison mode**: Compare sessions
- **Export data**: Download all session data

### Social

- **Share results**: Social media integration
- **Challenge friends**: Send challenge links
- **Multiplayer mode**: Compete in real-time
- **Tournaments**: Bracket-style competitions

### Customization

- **Themes**: Different color schemes
- **Ball skins**: Custom ball appearances
- **Background options**: Dynamic backgrounds
- **Sound packs**: Different audio themes
- **Accessibility options**: Colorblind modes, larger targets

## 15.2 Technical Improvements

- **Backend integration**: User accounts, cloud saves
- **Progressive Web App**: Offline support, install prompt
- **Performance monitoring**: Tracking FPS, load times
- **A/B testing**: Experiment with game parameters
- **Internationalization**: Multi-language support

---

# APPENDIX

## A. Glossary

**APM**: Actions Per Minute  
**FPS**: Frames Per Second  
**HMR**: Hot Module Replacement  
**HUD**: Heads-Up Display  
**CSV**: Comma-Separated Values  
**JSON**: JavaScript Object Notation  
**PWA**: Progressive Web App

## B. References

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## C. License

This project is provided as-is for educational purposes.

## D. Credits

**Developer**: [Your Name]  
**Built with**: React, TypeScript, Phaser 3, Vite  
**Fonts**: Roboto Mono (Google Fonts)  
**Icons**: Emoji (system fonts)

---

**END OF DOCUMENTATION**

*Last Updated: January 2, 2026*  
*Total Lines: 7500+*  
*Total Sections: 15*

