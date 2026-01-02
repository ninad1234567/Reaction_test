/**
 * Audio Manager for game sound effects
 * Uses Web Audio API for low-latency sound generation
 */
class AudioManager {
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;
    private volume: number = 0.7;

    constructor() {
        // Check localStorage for saved preference
        const savedMute = localStorage.getItem('audioMuted');
        this.isMuted = savedMute === 'true';
    }

    /**
     * Initialize audio context (called on first user interaction)
     */
    private initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    /**
     * Play ball click sound (800-1200Hz sine wave, 150ms)
     */
    playClickSound() {
        if (this.isMuted) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 1000; // 1000Hz
        oscillator.type = 'sine';

        // ADSR envelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);   // Decay

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * Play ball spawn sound (400-600Hz sweep, 150ms)
     */
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

        // Frequency sweep
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.linearRampToValueAtTime(600, now + 0.15);

        gainNode.gain.setValueAtTime(0.3 * this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * Play timer warning beep (880Hz, 100ms)
     */
    playWarningBeep() {
        if (this.isMuted) return;
        this.initAudioContext();
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 880;
        oscillator.type = 'square';

        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.5 * this.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * Play game over sound (1200Hz, 400ms)
     */
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

    /**
     * Toggle mute state
     */
    toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        localStorage.setItem('audioMuted', this.isMuted.toString());
        return this.isMuted;
    }

    /**
     * Get current mute state
     */
    isMutedState(): boolean {
        return this.isMuted;
    }

    /**
     * Set volume (0-1)
     */
    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Export singleton instance
export const audioManager = new AudioManager();
