import { Track, EqualizerConfig } from '../types';

class HighFidelityAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private preampGain: GainNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private spatialPanner: StereoPannerNode | null = null;
  private spatialConvolver: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private playbackStartTime: number = 0;
  private pauseOffset: number = 0;
  private animationFrameId: number | null = null;
  private schedulerIntervalId: number | null = null;

  // Active synthesizers / nodes for current track
  private activeOscillators: OscillatorNode[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private elementSource: MediaElementAudioSourceNode | null = null;

  // Callbacks
  public onTimeUpdate: ((time: number, duration: number) => void) | null = null;
  public onTrackEnd: (() => void) | null = null;
  public onPlayStateChange: ((playing: boolean) => void) | null = null;

  public setOnTimeUpdate(cb: (time: number, duration: number) => void) {
    this.onTimeUpdate = cb;
  }

  public setOnTrackEnd(cb: () => void) {
    this.onTrackEnd = cb;
  }

  constructor() {
    // Lazy initialize on first user interaction to satisfy browser autoplay policy
  }

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtxClass();

    // Create Preamp Gain
    this.preampGain = this.ctx.createGain();
    this.preampGain.gain.value = 1.0;

    // Create 10-Band EQ Filters
    const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    let prevNode: AudioNode = this.preampGain;

    this.eqFilters = frequencies.map((freq, index) => {
      const filter = this.ctx!.createBiquadFilter();
      if (index === 0) {
        filter.type = 'lowshelf';
      } else if (index === frequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.value = 1.4;
      }
      filter.frequency.value = freq;
      filter.gain.value = 0;
      prevNode.connect(filter);
      prevNode = filter;
      return filter;
    });

    // Bass Boost Filter
    this.bassBoostFilter = this.ctx.createBiquadFilter();
    this.bassBoostFilter.type = 'lowshelf';
    this.bassBoostFilter.frequency.value = 60;
    this.bassBoostFilter.gain.value = 0;
    prevNode.connect(this.bassBoostFilter);
    prevNode = this.bassBoostFilter;

    // Spatial Audio Network
    this.spatialPanner = this.ctx.createStereoPanner();
    this.spatialPanner.pan.value = 0;

    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();
    this.dryGain.gain.value = 1.0;
    this.wetGain.gain.value = 0.2;

    // Synthetic impulse response for 3D room acoustics
    this.spatialConvolver = this.createSyntheticImpulse(2.0, 2.5);

    prevNode.connect(this.spatialPanner);
    this.spatialPanner.connect(this.dryGain);
    this.spatialPanner.connect(this.spatialConvolver);
    this.spatialConvolver.connect(this.wetGain);

    // Analyser Node
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.82;

    this.dryGain.connect(this.analyser);
    this.wetGain.connect(this.analyser);

    // Master Output Gain & Limiter
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -0.5;
    limiter.knee.value = 0.0;
    limiter.ratio.value = 20.0;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.1;

    this.analyser.connect(this.masterGain);
    this.masterGain.connect(limiter);
    limiter.connect(this.ctx.destination);
  }

  private createSyntheticImpulse(duration: number, decay: number): ConvolverNode {
    if (!this.ctx) throw new Error('AudioContext not ready');
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  public async playTrack(track: Track, startTime: number = 0) {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.stopAudioNodes();
    this.currentTrack = track;
    this.currentTime = startTime;
    this.pauseOffset = startTime;
    this.isPlaying = true;
    this.playbackStartTime = this.ctx!.currentTime - startTime;

    if (track.audioUrl) {
      try {
        if (!this.customAudioElement) {
          this.customAudioElement = new Audio();
          this.customAudioElement.crossOrigin = 'anonymous';
          try {
            this.elementSource = this.ctx!.createMediaElementSource(this.customAudioElement);
            this.elementSource.connect(this.preampGain!);
          } catch (srcErr) {
            console.warn('MediaElementSource initialization notice:', srcErr);
          }

          this.customAudioElement.addEventListener('ended', () => {
            if (this.onTrackEnd) this.onTrackEnd();
          });
        }

        const streamUrl = track.audioUrl.startsWith('http')
          ? `/api/music-api/stream?url=${encodeURIComponent(track.audioUrl)}`
          : track.audioUrl;

        this.customAudioElement.src = streamUrl;
        this.customAudioElement.currentTime = startTime;

        const playPromise = this.customAudioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Direct stream playback error, falling back to synthesizer:', err);
            this.startMusicSynthesis(track, startTime);
          });
        }
      } catch (err) {
        console.warn('Audio stream error, falling back to synthesizer:', err);
        this.startMusicSynthesis(track, startTime);
      }
    } else {
      this.startMusicSynthesis(track, startTime);
    }

    this.startTimerLoop();

    if (this.onPlayStateChange) this.onPlayStateChange(true);
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.ctx) {
      this.pauseOffset = this.ctx.currentTime - this.playbackStartTime;
    }
    if (this.customAudioElement && !this.customAudioElement.paused) {
      this.customAudioElement.pause();
    }
    this.stopAudioNodes();
    if (this.schedulerIntervalId) {
      window.clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  public resume() {
    if (!this.currentTrack || this.isPlaying) return;
    this.playTrack(this.currentTrack, this.pauseOffset);
  }

  public seek(seconds: number) {
    if (!this.currentTrack) return;
    const clamped = Math.max(0, Math.min(seconds, this.currentTrack.duration));
    this.pauseOffset = clamped;
    this.currentTime = clamped;
    if (this.customAudioElement && this.currentTrack.audioUrl) {
      this.customAudioElement.currentTime = clamped;
    }
    if (this.isPlaying) {
      if (!this.customAudioElement || !this.currentTrack.audioUrl) {
        this.playTrack(this.currentTrack, clamped);
      }
    } else {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(clamped, this.currentTrack.duration);
      }
    }
  }

  public setVolume(volume: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.03);
    }
  }

  public applyEqualizer(config: EqualizerConfig) {
    this.init();
    if (!this.ctx) return;

    // Preamp
    if (this.preampGain) {
      const gainMultiplier = Math.pow(10, (config.preamp || 0) / 20);
      this.preampGain.gain.setTargetAtTime(config.enabled ? gainMultiplier : 1.0, this.ctx.currentTime, 0.05);
    }

    // 10-Band Gains
    if (this.eqFilters.length > 0) {
      config.bands.forEach((band, idx) => {
        if (this.eqFilters[idx]) {
          const gainVal = config.enabled ? band.gain : 0;
          this.eqFilters[idx].gain.setTargetAtTime(gainVal, this.ctx!.currentTime, 0.05);
        }
      });
    }

    // Bass Boost
    if (this.bassBoostFilter) {
      const boostDb = config.enabled ? (config.bassBoost / 100) * 12 : 0;
      this.bassBoostFilter.gain.setTargetAtTime(boostDb, this.ctx.currentTime, 0.05);
    }

    // Spatial 3D Audio & Reverb Spread
    if (this.wetGain && this.dryGain) {
      if (config.enabled && config.spatialAudio) {
        const spreadNorm = (config.spatialSpread || 50) / 100;
        this.wetGain.gain.setTargetAtTime(0.15 + spreadNorm * 0.45, this.ctx.currentTime, 0.05);
        this.dryGain.gain.setTargetAtTime(0.95 - spreadNorm * 0.15, this.ctx.currentTime, 0.05);
      } else {
        this.wetGain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 0.05);
        this.dryGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.05);
      }
    }
  }

  private stopAudioNodes() {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Node already stopped
      }
    });
    this.activeOscillators = [];

    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      } catch {
        // Ignored
      }
      this.noiseNode = null;
    }
  }

  /**
   * Generates musical multi-layered WebAudio synthesis
   * Creates lush chords, basslines, arpeggios, drums, and spatial pads
   */
  private startMusicSynthesis(track: Track, startOffset: number) {
    if (!this.ctx || !this.preampGain) return;

    // Harmonic scale setup based on track theme
    const themeScale = this.getScaleFrequencies(track.audioTheme, track.key);
    const bpm = track.tempo || 120;
    const beatSec = 60 / bpm;

    // 1. Continuous Lush Ambient Pad (Chord bed)
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.18;
    padGain.connect(this.preampGain);

    const padChord = [themeScale[0], themeScale[2], themeScale[4], themeScale[7]];
    padChord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.value = freq * 0.5; // octave down
      
      // Detuning for lush chorus effect
      osc.detune.value = (i - 1.5) * 8;

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450 + track.energy * 900;
      filter.Q.value = 2.0;

      osc.connect(oscGain);
      oscGain.connect(filter);
      filter.connect(padGain);

      osc.start();
      this.activeOscillators.push(osc);
    });

    // 2. Vinyl Crackle / Rain Texture (if Lo-fi or Ambient)
    if (track.audioTheme === 'lofi' || track.audioTheme === 'ambient') {
      this.startVinylNoise();
    }

    // 3. Dynamic Melody, Bass & Rhythm Generator loop
    let currentStep = Math.floor((startOffset / beatSec) * 4); // 16th notes
    const stepDuration = beatSec / 4;

    this.schedulerIntervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Bass note on quarter notes
      if (currentStep % 4 === 0) {
        const rootFreq = themeScale[(Math.floor(currentStep / 16)) % themeScale.length] * 0.25;
        this.playBassNote(rootFreq, now, beatSec * 0.8, track.audioTheme);
      }

      // Drum kick on beats 1 and 3, Snare on beats 2 and 4 (if rhythmic)
      if (track.energy > 0.4) {
        if (currentStep % 16 === 0 || currentStep % 16 === 8) {
          this.playKick(now);
        }
        if (currentStep % 16 === 4 || currentStep % 16 === 12) {
          this.playSnare(now);
        }
        if (currentStep % 2 === 0) {
          this.playHiHat(now, currentStep % 4 === 2);
        }
      }

      // Arpeggiated melody line
      if (currentStep % 2 === 0 && track.energy > 0.3) {
        const noteIndex = (currentStep * 3) % themeScale.length;
        const noteFreq = themeScale[noteIndex];
        this.playMelodyPluck(noteFreq, now, stepDuration * 1.5, track.audioTheme);
      }

      currentStep++;
    }, stepDuration * 1000);
  }

  private playBassNote(freq: number, time: number, duration: number, theme: string) {
    if (!this.ctx || !this.preampGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = theme === 'synthwave' || theme === 'electronic' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, time);
    filter.frequency.exponentialRampToValueAtTime(80, time + duration);

    gain.gain.setValueAtTime(0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.preampGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playMelodyPluck(freq: number, time: number, duration: number, theme: string) {
    if (!this.ctx || !this.preampGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = theme === 'classical' || theme === 'acoustic' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.preampGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playKick(time: number) {
    if (!this.ctx || !this.preampGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.35);

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.preampGain);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.preampGain) return;
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.preampGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.15);
  }

  private playHiHat(time: number, isAccent: boolean) {
    if (!this.ctx || !this.preampGain) return;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isAccent ? 0.12 : 0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.preampGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  private startVinylNoise() {
    if (!this.ctx || !this.preampGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.012;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.04;

    this.noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.preampGain);

    this.noiseNode.start();
  }

  private getScaleFrequencies(theme: string, key: string): number[] {
    // Standard frequencies for chromatic scale around octave 4
    const noteMap: Record<string, number> = {
      C: 261.63,
      'C#': 277.18,
      Db: 277.18,
      D: 293.66,
      'D#': 311.13,
      Eb: 311.13,
      E: 329.63,
      F: 349.23,
      'F#': 369.99,
      Gb: 369.99,
      G: 392.0,
      'G#': 415.3,
      Ab: 415.3,
      A: 440.0,
      'A#': 466.16,
      Bb: 466.16,
      B: 493.88,
    };

    const rootName = key.split(' ')[0] || 'C';
    const root = noteMap[rootName] || 440;

    // Minor pentatonic / Dorian scale ratios
    const ratios = [1, 1.122, 1.189, 1.335, 1.498, 1.682, 1.782, 2.0, 2.245, 2.378, 2.67, 2.996];
    return ratios.map((r) => root * r);
  }

  private startTimerLoop() {
    const update = () => {
      if (!this.isPlaying || !this.ctx || !this.currentTrack) return;

      const elapsed = this.ctx.currentTime - this.playbackStartTime;
      this.currentTime = elapsed;

      if (this.onTimeUpdate) {
        this.onTimeUpdate(elapsed, this.currentTrack.duration);
      }

      // Check for track completion
      if (elapsed >= this.currentTrack.duration) {
        this.pause();
        if (this.onTrackEnd) {
          this.onTrackEnd();
        }
        return;
      }

      this.animationFrameId = window.requestAnimationFrame(update);
    };

    this.animationFrameId = window.requestAnimationFrame(update);
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(32);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(32);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }
}

export const audioEngine = new HighFidelityAudioEngine();
