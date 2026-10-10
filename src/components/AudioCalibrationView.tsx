/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  Headphones,
  Sliders,
  Compass,
  Play,
  CheckCircle2,
  HelpCircle,
  DoorClosed,
  User,
  Box,
  ShieldAlert
} from 'lucide-react';
import { AudioSettings, CueCategory, SpatialAudioMode } from '../types/spatial';
import { spatialAudio } from '../services/spatialAudioEngine';

interface AudioCalibrationViewProps {
  settings: AudioSettings;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
}

export const AudioCalibrationView: React.FC<AudioCalibrationViewProps> = ({
  settings,
  updateSettings,
}) => {
  const [activeTestAngle, setActiveTestAngle] = useState<number | null>(null);
  const [playingCategory, setPlayingCategory] = useState<CueCategory | null>(null);

  const testAngles = [
    { label: 'Far Left', angle: -90, azimuth: -1.0, description: '100% Left Channel' },
    { label: 'Mid Left', angle: -45, azimuth: -0.5, description: 'Biased Left' },
    { label: 'Center', angle: 0, azimuth: 0.0, description: 'Equal Stereo Balance' },
    { label: 'Mid Right', angle: 45, azimuth: 0.5, description: 'Biased Right' },
    { label: 'Far Right', angle: 90, azimuth: 1.0, description: '100% Right Channel' },
  ];

  const soundPalette: {
    category: CueCategory;
    title: string;
    description: string;
    acousticProfile: string;
    icon: React.ReactNode;
  }[] = [
    {
      category: 'doorway',
      title: 'Open Doorway / Exit',
      description: 'Ascending major harmonic chime (C5-E5-G5 triad)',
      acousticProfile: 'Sweet, resonant chime signaling unobstructed pathways or doorways ahead.',
      icon: <DoorClosed className="w-5 h-5 text-emerald-400" />,
    },
    {
      category: 'person',
      title: 'Person Approaching',
      description: 'Warm organic double pulse (440Hz / 523Hz)',
      acousticProfile: 'Gentle human presence sonification, distinct from rigid inanimate objects.',
      icon: <User className="w-5 h-5 text-sky-400" />,
    },
    {
      category: 'furniture',
      title: 'Furniture & Static Obstacle',
      description: 'Tactile woodblock / marimba impulse (220Hz resonance)',
      acousticProfile: 'Short, dry percussive tap for chairs, tables, desks, and interior furniture.',
      icon: <Box className="w-5 h-5 text-amber-400" />,
    },
    {
      category: 'hazard',
      title: 'Hazard & Moving Vehicle',
      description: 'Dual-tone urgent alert pulse (350Hz / 520Hz)',
      acousticProfile: 'High-priority alert requiring immediate pause or directional redirection.',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
    },
    {
      category: 'uncertain',
      title: 'Detection Uncertainty',
      description: 'Soft fluttering ambient tone (380Hz vibrato)',
      acousticProfile: 'Transparently communicates ambiguity when lighting is poor or model confidence is low.',
      icon: <HelpCircle className="w-5 h-5 text-purple-400" />,
    },
  ];

  const triggerDirectionTest = (angle: number, azimuth: number, label: string) => {
    setActiveTestAngle(angle);
    spatialAudio.playSpatialCue('person', azimuth, 0.6, 'attention', `${label} test`);
    setTimeout(() => {
      setActiveTestAngle(null);
    }, 600);
  };

  const triggerCatalogSound = (category: CueCategory) => {
    setPlayingCategory(category);
    // Play slightly centered or slightly left for preview
    spatialAudio.playSpatialCue(category, 0.0, 0.6, 'attention');
    setTimeout(() => {
      setPlayingCategory(null);
    }, 700);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">
              Audio Calibration & Directional Sound Test
            </h2>
            <p className="text-sm text-slate-400">
              Test spatial panning across your left and right ears. Verify that directional cues are distinguishable before navigating.
            </p>
          </div>
        </div>
      </div>

      {/* 5-Point Directional Sound Test */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">5-Point Directional Test</h3>
          </div>
          <span className="text-xs text-slate-400">Click any position to trigger sound</span>
        </div>

        {/* Directional Arc Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {testAngles.map((item) => {
            const isActive = activeTestAngle === item.angle;
            return (
              <button
                key={item.angle}
                onClick={() => triggerDirectionTest(item.angle, item.azimuth, item.label)}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[90px] ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 ring-4 ring-amber-500/30 scale-105'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-850'
                }`}
                aria-label={`Test direction: ${item.label} (${item.angle} degrees)`}
              >
                <span className="text-sm font-bold block mb-1">{item.label}</span>
                <span
                  className={`text-xs font-mono tabular-nums ${
                    isActive ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.angle > 0 ? `+${item.angle}°` : `${item.angle}°`}
                </span>
                <span
                  className={`text-[10px] mt-1 ${
                    isActive ? 'text-slate-950 font-medium' : 'text-slate-500'
                  }`}
                >
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Visual Channel Balance Bar */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">Left Channel</span>
            <span className="text-slate-500">Center Stereo</span>
            <span className="font-semibold text-slate-300">Right Channel</span>
          </div>
          <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="absolute top-0 bottom-0 left-1/2 w-1 -ml-0.5 bg-amber-400 z-10" />
            {activeTestAngle !== null && (
              <div
                className="absolute top-0 bottom-0 w-8 -ml-4 bg-amber-500 rounded-full transition-all duration-200"
                style={{ left: `${((activeTestAngle + 90) / 180) * 100}%` }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Spatial Engine: Stereo vs HRTF 3D */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Spatial Audio Architecture</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              updateSettings({ spatialMode: 'hrtf' });
              spatialAudio.setSpatialMode('hrtf');
              spatialAudio.testDirection(0, '3D HRTF mode');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              settings.spatialMode === 'hrtf'
                ? 'bg-amber-500/10 border-amber-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-amber-300">3D HRTF Binaural Spatializer</span>
              {settings.spatialMode === 'hrtf' && (
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Uses Web Audio PannerNode with Head-Related Transfer Function algorithms. Models realistic pinna diffraction, interaural time difference (ITD), and 3D distance rolloff.
            </p>
          </button>

          <button
            onClick={() => {
              updateSettings({ spatialMode: 'stereo' });
              spatialAudio.setSpatialMode('stereo');
              spatialAudio.testDirection(0, 'Stereo Panner mode');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              settings.spatialMode === 'stereo'
                ? 'bg-amber-500/10 border-amber-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-slate-200">Standard Stereo Panner</span>
              {settings.spatialMode === 'stereo' && (
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Classical equal-power stereo balance between left and right channels. Lightweight and universally compatible with all mobile audio drivers.
            </p>
          </button>
        </div>
      </div>

      {/* Earcon Sound Palette Catalog */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white mb-1">Acoustic Earcon Library</h3>
        <p className="text-xs text-slate-400 mb-4">
          SpatialSight uses non-fatiguing synthesized micro-sounds instead of relentless robotic speech. Listen to each signature tone:
        </p>

        <div className="space-y-3">
          {soundPalette.map((item) => {
            const isPlaying = playingCategory === item.category;
            return (
              <div
                key={item.category}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-amber-400/90 font-mono mt-0.5">
                      {item.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{item.acousticProfile}</p>
                  </div>
                </div>

                <button
                  onClick={() => triggerCatalogSound(item.category)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-all ${
                    isPlaying
                      ? 'bg-amber-500 text-slate-950 scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                  aria-label={`Play ${item.title} sound cue`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlaying ? 'Playing...' : 'Play Sample'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
