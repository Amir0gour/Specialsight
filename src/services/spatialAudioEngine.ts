/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CueCategory, SpatialAudioMode, UrgencyLevel, SoundTheme } from '../types/spatial';

class SpatialAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.85;
  private spatialMode: SpatialAudioMode = 'hrtf';
  private soundTheme: SoundTheme = 'gentle_acoustic';
  private speechLabelsEnabled: boolean = false;
  private lastPlayedTimestamps: Map<string, number> = new Map();
  private lastSpeechTimestamp: number = 0;

  constructor() {
    // Lazily initialized on first user interaction to comply with browser autoplay policies
  }

  public ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => {
        console.warn('AudioContext resume was prevented:', err);
      });
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setSpatialMode(mode: SpatialAudioMode) {
    this.spatialMode = mode;
  }

  public setSoundTheme(theme: SoundTheme) {
    this.soundTheme = theme;
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechLabelsEnabled = enabled;
  }

  /**
   * Translates azimuth (-1.0 to +1.0) and proximity (0.0 to 1.0) into spatial audio nodes.
   * Azimuth: -1.0 = 90 deg left, 0.0 = directly ahead, +1.0 = 90 deg right.
   */
  private createSpatialPanner(
    ctx: AudioContext,
    azimuth: number,
    proximity: number
  ): { input: AudioNode; output: AudioNode } {
    const clampedAzimuth = Math.max(-1, Math.min(1, azimuth));
    const clampedProximity = Math.max(0.1, Math.min(1, proximity));

    if (this.spatialMode === 'hrtf' && typeof ctx.createPanner === 'function') {
      const panner = ctx.createPanner();
      panner.panningModel = 'HRTF';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1.2;
      panner.coneInnerAngle = 360;

      // 3D coordinates:
      // X: left (-1.5) to right (+1.5)
      // Y: elevation (0)
      // Z: distance ahead (close = 0.5, far = 3.0)
      const x = clampedAzimuth * 1.8;
      const y = 0;
      // Closer objects are closer in Z
      const z = Math.max(0.3, 3.0 - (clampedProximity * 2.5));

      if (panner.positionX) {
        panner.positionX.setValueAtTime(x, ctx.currentTime);
        panner.positionY.setValueAtTime(y, ctx.currentTime);
        panner.positionZ.setValueAtTime(z, ctx.currentTime);
      } else {
        // Fallback for older spec
        panner.setPosition(x, y, z);
      }

      return { input: panner, output: panner };
    } else {
      // High-compatibility StereoPannerNode
      if (typeof ctx.createStereoPanner === 'function') {
        const stereoPanner = ctx.createStereoPanner();
        stereoPanner.pan.setValueAtTime(clampedAzimuth, ctx.currentTime);
        return { input: stereoPanner, output: stereoPanner };
      } else {
        // Fallback channel splitter/merger if stereo panner not supported
        const gainNode = ctx.createGain();
        return { input: gainNode, output: gainNode };
      }
    }
  }

  /**
   * Plays a synthesized earcon positioned spatially in the stereo/3D soundstage.
   */
  public playSpatialCue(
    category: CueCategory,
    azimuth: number, // -1.0 to 1.0
    proximity: number = 0.5, // 0.0 to 1.0
    urgency: UrgencyLevel = 'informational',
    label?: string
  ): void {
    if (this.isMuted || this.masterVolume <= 0.01) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      // Create spatial route
      const { input: spatialInput, output: spatialOutput } = this.createSpatialPanner(ctx, azimuth, proximity);

      // Master output gain
      const masterGain = ctx.createGain();
      // Distance affects volume: closer objects are louder
      const proximityVolumeBoost = 0.7 + (proximity * 0.5);
      const targetGain = this.masterVolume * proximityVolumeBoost;
      masterGain.gain.setValueAtTime(targetGain, now);

      spatialOutput.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Synthesize specific earcon based on category
      switch (category) {
        case 'doorway':
          this.synthesizeDoorwayChime(ctx, spatialInput, now);
          break;
        case 'person':
          this.synthesizePersonPing(ctx, spatialInput, now, urgency);
          break;
        case 'furniture':
        case 'obstacle':
          this.synthesizeFurnitureClick(ctx, spatialInput, now, urgency);
          break;
        case 'vehicle':
        case 'hazard':
          this.synthesizeHazardAlert(ctx, spatialInput, now);
          break;
        case 'uncertain':
        default:
          this.synthesizeUncertaintyTone(ctx, spatialInput, now);
          break;
      }

      // Optional Speech narration
      if (this.speechLabelsEnabled && label) {
        this.speakLabel(label, azimuth, urgency);
      }
    } catch (err) {
      console.error('Failed to play spatial cue:', err);
    }
  }

  /**
   * Doorway Chime: Distinctive, welcoming harmonic major-third chime.
   * High, clear, recognizable beacon signaling an opening or safe passage.
   */
  private synthesizeDoorwayChime(ctx: AudioContext, destination: AudioNode, startTime: number): void {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 triad
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, startTime);

      osc.type = this.soundTheme === 'sonar_pulse' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.35, startTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(startTime + idx * 0.08);
      osc.stop(startTime + idx * 0.08 + 0.6);
    });
  }

  /**
   * Person Ping: Warm, organic double pulse.
   */
  private synthesizePersonPing(
    ctx: AudioContext,
    destination: AudioNode,
    startTime: number,
    urgency: UrgencyLevel
  ): void {
    const pulses = urgency === 'high_priority' ? [480, 560, 640] : [440, 523.25];
    const spacing = urgency === 'high_priority' ? 0.07 : 0.12;

    pulses.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + i * spacing);

      gain.gain.setValueAtTime(0.001, startTime + i * spacing);
      gain.gain.exponentialRampToValueAtTime(0.4, startTime + i * spacing + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + i * spacing + 0.22);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(startTime + i * spacing);
      osc.stop(startTime + i * spacing + 0.25);
    });
  }

  /**
   * Furniture / Solid Object Click: Tactile, hollow woodblock resonance.
   */
  private synthesizeFurnitureClick(
    ctx: AudioContext,
    destination: AudioNode,
    startTime: number,
    urgency: UrgencyLevel
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, startTime);
    filter.Q.setValueAtTime(3, startTime);

    const baseFreq = urgency === 'high_priority' ? 360 : 220;
    osc.type = this.soundTheme === 'minimalist_clicks' ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(baseFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.12);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.45, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + 0.18);
  }

  /**
   * Hazard / Vehicle Alert: High priority dual-tone urgency cue.
   */
  private synthesizeHazardAlert(ctx: AudioContext, destination: AudioNode, startTime: number): void {
    const freqs = [350, 520, 350, 520];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.06);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, startTime);

      gain.gain.setValueAtTime(0.001, startTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.4, startTime + idx * 0.06 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.06 + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(startTime + idx * 0.06);
      osc.stop(startTime + idx * 0.06 + 0.09);
    });
  }

  /**
   * Uncertainty Tone: Muted, soft fluttering chime to indicate low-confidence detection.
   */
  private synthesizeUncertaintyTone(ctx: AudioContext, destination: AudioNode, startTime: number): void {
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    lfo.frequency.setValueAtTime(7, startTime); // 7Hz flutter
    lfoGain.gain.setValueAtTime(30, startTime);
    lfo.connect(lfoGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, startTime);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

    osc.connect(gain);
    gain.connect(destination);

    lfo.start(startTime);
    osc.start(startTime);
    osc.stop(startTime + 0.38);
    lfo.stop(startTime + 0.38);
  }

  /**
   * Spoken speech narration for accessibility (Web Speech API).
   */
  private speakLabel(label: string, azimuth: number, urgency: UrgencyLevel): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    // Debounce speech to avoid overwhelming voice chatter
    const minSpeechInterval = urgency === 'high_priority' ? 1200 : 2500;
    if (now - this.lastSpeechTimestamp < minSpeechInterval) return;

    this.lastSpeechTimestamp = now;

    let dirWord = 'ahead';
    if (azimuth < -0.45) dirWord = 'far left';
    else if (azimuth < -0.15) dirWord = 'left';
    else if (azimuth > 0.45) dirWord = 'far right';
    else if (azimuth > 0.15) dirWord = 'right';

    const utteranceText = `${label}, ${dirWord}`;
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.rate = 1.15; // Slightly brisk for rapid spatial awareness
    utterance.volume = this.masterVolume * 0.9;
    utterance.pitch = urgency === 'high_priority' ? 1.2 : 1.0;

    // Cancel pending utterances to stay in real-time sync
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Tests a specific directional angle with an audio ping.
   * angleDeg: -90 (hard left) to +90 (hard right)
   */
  public testDirection(angleDeg: number, label?: string): void {
    const azimuth = Math.max(-1, Math.min(1, angleDeg / 90));
    this.playSpatialCue('person', azimuth, 0.6, 'attention', label);
  }
}

export const spatialAudio = new SpatialAudioEngine();
