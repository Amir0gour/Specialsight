/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sliders,
  Volume2,
  Mic,
  Vibrate,
  Palette,
  Eye,
  Keyboard,
  RotateCcw
} from 'lucide-react';
import { AudioSettings, SoundTheme } from '../types/spatial';
import { spatialAudio } from '../services/spatialAudioEngine';
import { haptics } from '../services/hapticsService';

interface SettingsViewProps {
  settings: AudioSettings;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
  resetToDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  updateSettings,
  resetToDefaults,
}) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Settings Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Sensitivity & Accessibility Preferences
              </h2>
              <p className="text-sm text-slate-400">
                Tailor the sonification engine, sensitivity thresholds, and multi-modal feedback to your navigation needs.
              </p>
            </div>
          </div>
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Audio & Spatial Tuning */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-amber-400" />
          <span>Audio Engine Preferences</span>
        </h3>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <label htmlFor="volume-slider" className="font-semibold">Master Spatial Volume</label>
            <span className="font-mono tabular-nums text-amber-400">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateSettings({ volume: val });
              spatialAudio.setVolume(val);
            }}
            className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Cue Cooldown Interval */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <label htmlFor="cooldown-slider" className="font-semibold">Sonification Pacing (Cooldown)</label>
            <span className="font-mono tabular-nums text-amber-400">
              {(settings.cueCooldownMs / 1000).toFixed(1)}s
            </span>
          </div>
          <input
            id="cooldown-slider"
            type="range"
            min="800"
            max="3500"
            step="200"
            value={settings.cueCooldownMs}
            onChange={(e) => updateSettings({ cueCooldownMs: parseInt(e.target.value, 10) })}
            className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-[11px] text-slate-500">
            Controls minimum delay between consecutive sound cues to avoid auditory overload and sensory fatigue.
          </p>
        </div>

        {/* Sound Theme Selection */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-300 block">Acoustic Sound Palette</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'gentle_acoustic' as SoundTheme, label: 'Gentle Acoustic', desc: 'Warm sine & triangle resonance' },
              { id: 'sonar_pulse' as SoundTheme, label: 'Sonar Pulse', desc: 'Clear radar-style pure pings' },
              { id: 'minimalist_clicks' as SoundTheme, label: 'Minimalist Clicks', desc: 'Crisp percussive micro-taps' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  updateSettings({ soundTheme: theme.id });
                  spatialAudio.setSoundTheme(theme.id);
                  spatialAudio.playSpatialCue('furniture', 0, 0.5, 'attention');
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  settings.soundTheme === theme.id
                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold block text-white mb-0.5">{theme.label}</span>
                <span className="text-[11px] text-slate-400">{theme.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Computer Vision Sensitivity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-amber-400" />
          <span>Vision Sensitivity</span>
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-300">
            <label htmlFor="sensitivity-slider" className="font-semibold">Object Confidence Threshold</label>
            <span className="font-mono tabular-nums text-amber-400">
              {Math.round(settings.sensitivityThreshold * 100)}%
            </span>
          </div>
          <input
            id="sensitivity-slider"
            type="range"
            min="0.25"
            max="0.85"
            step="0.05"
            value={settings.sensitivityThreshold}
            onChange={(e) => updateSettings({ sensitivityThreshold: parseFloat(e.target.value) })}
            className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>More Detections (Low threshold)</span>
            <span>Balanced (50%)</span>
            <span>High Confidence Only (85%)</span>
          </div>
        </div>
      </div>

      {/* Multi-Modal Feedback Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-400" />
          <span>Multi-Modal Accessibility</span>
        </h3>

        {/* Spoken Voice Narration Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-amber-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">Spoken Directional Labels</span>
              <span className="text-xs text-slate-400">
                Speaks brief synthetic voice cues ("Person, left", "Chair, ahead") alongside 3D audio.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.speechLabelsEnabled}
            onChange={(e) => {
              const val = e.target.checked;
              updateSettings({ speechLabelsEnabled: val });
              spatialAudio.setSpeechEnabled(val);
            }}
            className="w-5 h-5 accent-amber-500 cursor-pointer"
            aria-label="Toggle spoken voice labels"
          />
        </div>

        {/* Haptic Feedback Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-amber-400">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">Haptic Vibrations</span>
              <span className="text-xs text-slate-400">
                Vibrates mobile devices with cadences scaled to obstacle proximity.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.hapticEnabled}
            onChange={(e) => {
              const val = e.target.checked;
              updateSettings({ hapticEnabled: val });
              haptics.setEnabled(val);
            }}
            className="w-5 h-5 accent-amber-500 cursor-pointer"
            aria-label="Toggle haptic vibration"
          />
        </div>

        {/* High Contrast UI Mode */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-amber-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">High Contrast Visual Accents</span>
              <span className="text-xs text-slate-400">
                Boosts text contrast and radar element outlines for users with low vision.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.highContrastMode}
            onChange={(e) => updateSettings({ highContrastMode: e.target.checked })}
            className="w-5 h-5 accent-amber-500 cursor-pointer"
            aria-label="Toggle high contrast mode"
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-amber-400" />
          <span>Accessibility Keyboard Navigation</span>
        </h3>
        <p className="text-xs text-slate-400">
          Users of screen readers or physical keyboards can control SpatialSight via standard hotkeys:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
            <kbd className="px-2 py-1 bg-slate-800 rounded text-amber-300 font-mono font-bold block mb-1">
              Spacebar
            </kbd>
            <span className="text-slate-400">Start / Pause Vision</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
            <kbd className="px-2 py-1 bg-slate-800 rounded text-amber-300 font-mono font-bold block mb-1">
              Key M
            </kbd>
            <span className="text-slate-400">Mute / Unmute</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
            <kbd className="px-2 py-1 bg-slate-800 rounded text-amber-300 font-mono font-bold block mb-1">
              Key L
            </kbd>
            <span className="text-slate-400">Live Vision</span>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-center">
            <kbd className="px-2 py-1 bg-slate-800 rounded text-amber-300 font-mono font-bold block mb-1">
              Key C
            </kbd>
            <span className="text-slate-400">Audio Calibration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
