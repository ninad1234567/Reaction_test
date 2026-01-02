import Phaser from 'phaser';

/**
 * Ball class - STATIC version (no physics)
 * With 3-second auto-disappear timer
 */
export class Ball {
    public sprite: Phaser.GameObjects.Sprite;  // NOT Physics.Sprite
    public spawnTime: number;
    public isActive: boolean;
    private scene: Phaser.Scene;
    private expireTimer?: Phaser.Time.TimerEvent;
    private onExpire?: () => void;

    constructor(scene: Phaser.Scene, x: number, y: number, spawnTime: number, onExpire?: () => void) {
        this.scene = scene;
        this.spawnTime = spawnTime;
        this.isActive = true;
        this.onExpire = onExpire;

        // Create simple sprite (NO PHYSICS)
        this.sprite = scene.add.sprite(x, y, 'tennis-ball');
        this.sprite.setDisplaySize(32, 32);  // 32px diameter ball (matches reference)
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setDepth(10);

        // Make interactive
        this.sprite.setInteractive();

        // Pop-in animation only
        this.sprite.setScale(0.4);
        scene.tweens.add({
            targets: this.sprite,
            scale: 1.0,
            duration: 150,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        // Hover effect
        this.sprite.on('pointerover', () => {
            if (this.isActive) {
                this.sprite.setTint(0xFFFFFF);
            }
        });

        this.sprite.on('pointerout', () => {
            if (this.isActive) {
                this.sprite.clearTint();
            }
        });

        // Set 2-second auto-disappear timer
        this.expireTimer = scene.time.delayedCall(2000, () => {
            if (this.isActive && this.onExpire) {
                this.onExpire();
            }
        });
    }

    /**
     * Check if a point collides with this ball
     */
    checkCollision(x: number, y: number): boolean {
        if (!this.isActive) return false;

        const distance = Phaser.Math.Distance.Between(
            x, y,
            this.sprite.x, this.sprite.y
        );

        // Click radius: 16px + 4px buffer = 20px
        return distance <= 20;
    }

    /**
     * Get ball position
     */
    getPosition(): { x: number; y: number } {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    /**
     * Remove ball with fade-out animation
     */
    remove(): Promise<void> {
        return new Promise((resolve) => {
            this.isActive = false;

            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0,
                duration: 100,  // Quick fade
                ease: Phaser.Math.Easing.Quadratic.In,
                onComplete: () => {
                    this.sprite.destroy();
                    resolve();
                }
            });
        });
    }

    /**
     * Destroy ball immediately
     */
    destroy() {
        this.isActive = false;
        if (this.expireTimer) {
            this.expireTimer.remove();
        }
        this.sprite.destroy();
    }
}
