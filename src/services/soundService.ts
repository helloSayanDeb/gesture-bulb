// Web Audio API based sound synthesizer for tactile relay switch clicks and electrical hum
class SoundService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Realistic heavy mechanical relay click when bulb turns ON
  public playRelayClick(turnOn: boolean) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Contact snap (high frequency burst)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      const snapFilter = ctx.createBiquadFilter();

      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(turnOn ? 3200 : 2400, now);
      snapFilter.Q.setValueAtTime(3, now);

      snapOsc.type = 'sawtooth';
      snapOsc.frequency.setValueAtTime(turnOn ? 1800 : 1200, now);
      snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      snapGain.gain.setValueAtTime(this.volume * 0.45, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      snapOsc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(ctx.destination);

      snapOsc.start(now);
      snapOsc.stop(now + 0.05);

      // Low frequency coil magnetic thump
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();

      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(turnOn ? 160 : 120, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(30, now + 0.07);

      thumpGain.gain.setValueAtTime(this.volume * 0.35, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(ctx.destination);

      thumpOsc.start(now);
      thumpOsc.stop(now + 0.08);

      // Tiny metallic spring resonance when turned on
      if (turnOn) {
        const pingOsc = ctx.createOscillator();
        const pingGain = ctx.createGain();

        pingOsc.type = 'triangle';
        pingOsc.frequency.setValueAtTime(4500, now + 0.01);
        pingGain.gain.setValueAtTime(this.volume * 0.1, now + 0.01);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        pingOsc.connect(pingGain);
        pingGain.connect(ctx.destination);

        pingOsc.start(now + 0.01);
        pingOsc.stop(now + 0.13);
      }
    } catch {
      // AudioContext could fail on un-interacted page before user gesture; gracefully silent
    }
  }

  // Soft subtle beep for UI buttons
  public playUiTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore
    }
  }
}

export const soundService = new SoundService();
