/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Headphones, Volume2, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { AudioSettings } from '../types/spatial';
import { spatialAudio } from '../services/spatialAudioEngine';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  updateSettings,
}) => {
  if (!isOpen) return null;

  const playWelcomeSound = () => {
    spatialAudio.testDirection(0, 'Welcome to SpatialSight');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg"
          aria-label="Close onboarding modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h2 id="onboarding-title" className="text-xl font-bold text-white">
              Welcome to SpatialSight
            </h2>
            <p className="text-xs text-slate-400">
              AI-powered 3D spatial audio vision for the visually impaired.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <strong className="text-white text-sm block">1. Connect Stereo Headphones</strong>
            <p className="text-slate-400 leading-relaxed">
              SpatialSight maps detected obstacles into 3D stereo audio around your head. Left obstacles sound on your left; doorways chime on your right.
            </p>
            <button
              onClick={playWelcomeSound}
              className="mt-2 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" /> Test Stereo Sound
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <strong className="text-white text-sm block">2. Select Your Preferred Experience</strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => {
                  updateSettings({ speechLabelsEnabled: false });
                  spatialAudio.setSpeechEnabled(false);
                }}
                className="p-3 rounded-lg border border-slate-800 hover:border-amber-500/50 text-left bg-slate-900"
              >
                <span className="font-bold text-white block mb-0.5">Gentle Earcons Only</span>
                <span className="text-[11px] text-slate-400">Calm musical micro-tones without robotic speech.</span>
              </button>
              <button
                onClick={() => {
                  updateSettings({ speechLabelsEnabled: true });
                  spatialAudio.setSpeechEnabled(true);
                }}
                className="p-3 rounded-lg border border-slate-800 hover:border-amber-500/50 text-left bg-slate-900"
              >
                <span className="font-bold text-white block mb-0.5">Audio + Spoken Distance</span>
                <span className="text-[11px] text-slate-400">Earcons paired with spoken item name and distance (e.g. &ldquo;Chair ahead, about 2 meters&rdquo;).</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Private & On-Device:</strong> Video streams are processed purely inside your browser. No image data is ever uploaded or recorded.
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
        >
          <span>Get Started with SpatialSight</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
