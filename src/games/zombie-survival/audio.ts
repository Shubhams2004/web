/**
 * Retro Zombie Survival Web Audio API Synthesizer
 * 100% self-contained synthesized retro sound effects.
 * Works completely offline with zero external audio assets.
 */

class ZombieAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private groanCooldown: number = 0;

  constructor() {
    try {
      const saved = localStorage.getItem('zombie_survival_muted');
      this.muted = saved === 'true';
    } catch {
      this.muted = false;
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
        }
      } catch {
        this.ctx = null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public userInteracted() {
    this.initContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem('zombie_survival_muted', muted ? 'true' : 'false');
    } catch {}
  }

  public toggleMute(): boolean {
    const next = !this.muted;
    this.setMuted(next);
    return next;
  }

  /**
   * Helper to generate a white noise buffer
   */
  private createNoiseBuffer(duration: number): AudioBuffer | null {
    const ctx = this.initContext();
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Pistol shot: crisp retro square chirp + noise crack
   */
  public playPistol() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Pitch drop tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);

    // Noise burst
    const noise = this.createNoiseBuffer(0.06);
    if (noise) {
      const noiseSource = ctx.createBufferSource();
      const noiseFilter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();

      noiseSource.buffer = noise;
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1000, t);

      noiseGain.gain.setValueAtTime(0.3, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(t);
      noiseSource.stop(t + 0.06);
    }
  }

  /**
   * Shotgun blast: heavy boom + wider noise punch
   */
  public playShotgun() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Heavy low punch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.16);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);

    // Roaring noise
    const noise = this.createNoiseBuffer(0.14);
    if (noise) {
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const ngain = ctx.createGain();

      src.buffer = noise;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.14);

      ngain.gain.setValueAtTime(0.45, t);
      ngain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      src.connect(filter);
      filter.connect(ngain);
      ngain.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.14);
    }
  }

  /**
   * Machine gun: rapid snappy pop
   */
  public playMachineGun() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Zombie hit / hurt
   */
  public playZombieHurt() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.07);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * Zombie eliminated: crunchy squelch / pop
   */
  public playZombieDie() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Pitch drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);

    // Crunch noise
    const noise = this.createNoiseBuffer(0.1);
    if (noise) {
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const ngain = ctx.createGain();

      src.buffer = noise;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.1);

      ngain.gain.setValueAtTime(0.3, t);
      ngain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      src.connect(filter);
      filter.connect(ngain);
      ngain.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.1);
    }
  }

  /**
   * Zombie ambient groan (rate limited)
   */
  public playZombieGroan() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.groanCooldown < 2500) return;
    this.groanCooldown = now;

    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const baseFreq = 90 + Math.random() * 30;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq + 25, t + 0.25);
    osc.frequency.linearRampToValueAtTime(baseFreq - 15, t + 0.55);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  /**
   * Player takes damage: deep impact thud
   */
  public playPlayerHurt() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Power-up pickup: cheerful ascending arpeggio
   */
  public playPowerUp() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = t + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.1);
    });
  }

  /**
   * Nuke explosion: room-shaking rumble
   */
  public playNuke() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Sub-bass sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.8);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.8);

    // Filtered noise rumble
    const noise = this.createNoiseBuffer(0.7);
    if (noise) {
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const ngain = ctx.createGain();

      src.buffer = noise;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + 0.7);

      ngain.gain.setValueAtTime(0.5, t);
      ngain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      src.connect(filter);
      filter.connect(ngain);
      ngain.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.7);
    }
  }

  /**
   * Wave start fanfare / warning
   */
  public playWaveStart() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [293.66, 369.99, 440, 587.33]; // D4, F#4, A4, D5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = t + idx * 0.09;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.15);
    });
  }

  /**
   * Game Over descent
   */
  public playGameOver() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [330, 311.13, 293.66, 261.63]; // E4, Eb4, D4, C4

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = t + i * 0.18;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }
}

export const zombieAudio = new ZombieAudioEngine();
