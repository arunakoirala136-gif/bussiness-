/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio Engine for Atmospheric 3D Horror
export class HorrorAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Ambient nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private windNode: AudioNode | null = null;
  private rainNode: AudioNode | null = null;
  private heartbeatTimer: number | null = null;
  private whisperTimer: number | null = null;
  private clockTimer: number | null = null;

  private isRunning: boolean = false;
  private heartbeatRate: number = 70; // BPM
  private sanityLevel: number = 100; // 0-100

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0.6;
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.masterGain);

      this.startAmbience();
      this.startHeartbeatLoop();
      this.startWhisperLoop();
      this.startClockLoop();
      this.isRunning = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, ambient: number) {
    if (!this.ctx) return;
    if (this.masterGain) this.masterGain.gain.setValueAtTime(master, this.ctx.currentTime);
    if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx, this.ctx.currentTime);
    if (this.ambientGain) this.ambientGain.gain.setValueAtTime(ambient, this.ctx.currentTime);
  }

  public setSanity(sanity: number) {
    this.sanityLevel = Math.max(0, Math.min(100, sanity));
    // Sanity affects heartbeat speed: 100 sanity = 60bpm, 0 sanity = 145bpm
    this.heartbeatRate = 60 + ((100 - this.sanityLevel) / 100) * 85;
  }

  private startAmbience() {
    if (!this.ctx || !this.ambientGain) return;

    // 1. Low Horror Drone (Sub-bass and minor dissonance)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const droneFilter = this.ctx.createBiquadFilter();
    const droneGain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(43.65, this.ctx.currentTime); // F1 note
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(46.25, this.ctx.currentTime); // Dissonant F#1 micro-detuned

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    droneGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    // Subtle LFO for breathing drone
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(30, this.ctx.currentTime);
    lfo.connect(droneFilter.frequency);
    lfo.start();

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.ambientGain);

    osc1.start();
    osc2.start();
    this.droneOsc1 = osc1;
    this.droneOsc2 = osc2;

    // 2. Storm Wind (Bandpass Pink/White Noise)
    this.createWindGenerator();

    // 3. Rain against the glass
    this.createRainGenerator();
  }

  private createWindGenerator() {
    if (!this.ctx || !this.ambientGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Wind gust LFO
    const gustLfo = this.ctx.createOscillator();
    const gustGain = this.ctx.createGain();
    gustLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
    gustGain.gain.setValueAtTime(200, this.ctx.currentTime);
    gustLfo.connect(filter.frequency);
    gustLfo.start();

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.ambientGain);
    whiteNoise.start();
    this.windNode = whiteNoise;
  }

  private createRainGenerator() {
    if (!this.ctx || !this.ambientGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    // Pink noise generation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    rainSource.connect(highpass);
    highpass.connect(rainGain);
    rainGain.connect(this.ambientGain);
    rainSource.start();
    this.rainNode = rainSource;
  }

  private startHeartbeatLoop() {
    const triggerBeat = () => {
      if (this.ctx && this.isRunning && this.sanityLevel < 85) {
        this.playHeartbeatSound();
      }
      const intervalMs = (60 / this.heartbeatRate) * 1000;
      this.heartbeatTimer = window.setTimeout(triggerBeat, intervalMs);
    };
    this.heartbeatTimer = window.setTimeout(triggerBeat, 1000);
  }

  private playHeartbeatSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const intensity = Math.max(0.2, (100 - this.sanityLevel) / 100);

    // Double pulse: lub-dub
    [0, 0.12].forEach((delay, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 55 : 45, now + delay);
      osc.frequency.exponentialRampToValueAtTime(30, now + delay + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, now + delay);

      const vol = (idx === 0 ? 0.6 : 0.4) * intensity;
      gain.gain.setValueAtTime(vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }

  private startWhisperLoop() {
    const triggerWhisper = () => {
      if (this.ctx && this.isRunning) {
        // More frequent whispers when low sanity or near ghost
        const chance = this.sanityLevel < 50 ? 0.7 : 0.3;
        if (Math.random() < chance) {
          this.playCreepyWhisper();
        }
      }
      const delay = Math.random() * 8000 + (this.sanityLevel / 100) * 10000 + 4000;
      this.whisperTimer = window.setTimeout(triggerWhisper, delay);
    };
    this.whisperTimer = window.setTimeout(triggerWhisper, 5000);
  }

  public playCreepyWhisper(panning?: number) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const duration = 1.8 + Math.random() * 1.5;

    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    // Formant filters for ghostly vocal murmurs (/u/, /o/, /a/)
    const formant1 = this.ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.setValueAtTime(450 + Math.random() * 300, now);
    formant1.Q.setValueAtTime(5, now);

    const formant2 = this.ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.setValueAtTime(1400 + Math.random() * 400, now);
    formant2.Q.setValueAtTime(6, now);

    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panVal = panning !== undefined ? panning : (Math.random() * 1.8 - 0.9);
    if (panner) panner.pan.setValueAtTime(panVal, now);

    const gain = this.ctx.createGain();
    const maxVol = 0.25 + ((100 - this.sanityLevel) / 100) * 0.25;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(maxVol, now + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(formant1);
    source.connect(formant2);
    formant1.connect(gain);
    formant2.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      gain.connect(this.sfxGain);
    }

    source.start(now);
    source.stop(now + duration + 0.1);
  }

  private startClockLoop() {
    const tick = () => {
      if (this.ctx && this.isRunning) {
        this.playClockTick();
      }
      this.clockTimer = window.setTimeout(tick, 1000);
    };
    this.clockTimer = window.setTimeout(tick, 1000);
  }

  public playClockTick() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playClockChime() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Deep Grandfather Bell Bong (Rich harmonics)
    const baseFreqs = [110, 220, 330, 440, 580];
    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const vol = (0.5 / (idx + 1));
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 4.6);
    });
  }

  public playThunder(isClose: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const duration = isClose ? 4.5 : 3.2;

    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isClose ? 400 : 180, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + duration);

    const gain = this.ctx.createGain();
    const maxVol = isClose ? 0.85 : 0.45;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(maxVol, now + (isClose ? 0.05 : 0.4));
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    source.start(now);
    source.stop(now + duration + 0.1);
  }

  public playFlashlightClick(turnOn: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(turnOn ? 1200 : 900, now);
    osc.frequency.exponentialRampToValueAtTime(turnOn ? 400 : 300, now + 0.03);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playFootstep(surface: 'wood' | 'stone' | 'carpet' = 'wood') {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (surface === 'wood') {
      // Squeak + thud
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 30, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
    }

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playDoorSqueak(opening: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(opening ? 320 : 480, now);
    osc.frequency.linearRampToValueAtTime(opening ? 460 : 260, now + 0.4);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playUnlock() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [0, 0.08].forEach((delay, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(i === 0 ? 1800 : 1200, now + delay);
      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.06);
    });
  }

  public playItemPickup() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playJumpscareStinger() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Screeching cluster chord
    const cluster = [180, 220, 233, 440, 466, 880, 932, 1200];
    cluster.forEach((f) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 0.9, now + 1.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.6);
    });
  }

  public playPuzzleSuccess() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major chord arpeggio
    notes.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.1);
      gain.gain.setValueAtTime(0.3, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.85);
    });
  }

  public destroy() {
    this.isRunning = false;
    if (this.heartbeatTimer) clearTimeout(this.heartbeatTimer);
    if (this.whisperTimer) clearTimeout(this.whisperTimer);
    if (this.clockTimer) clearTimeout(this.clockTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const globalAudio = new HorrorAudioEngine();
