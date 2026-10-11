/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AudioSettings, SpatialAudioEvent } from './types/spatial';
import { spatialAudio } from './services/spatialAudioEngine';
import { TopNavigation, NavTab } from './components/TopNavigation';
import { LiveDetectionView } from './components/LiveDetectionView';
import { AudioCalibrationView } from './components/AudioCalibrationView';
import { SettingsView } from './components/SettingsView';
import { SafetyAndDocsView } from './components/SafetyAndDocsView';
import { OnboardingModal } from './components/OnboardingModal';
import { ShieldAlert, HelpCircle } from 'lucide-react';

const DEFAULT_SETTINGS: AudioSettings = {
  volume: 0.85,
  spatialMode: 'hrtf',
  sensitivityThreshold: 0.50,
  cueCooldownMs: 3000, // 3 seconds default sonification cooldown
  speechLabelsEnabled: true, // Enabled by default for spoken direction & distance
  hapticEnabled: true,
  soundTheme: 'gentle_acoustic',
  distanceUnit: 'meters',
  highContrastMode: false,
  largeTextMode: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('live');
  const [isVisionActive, setIsVisionActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_SETTINGS);
  const [eventLog, setEventLog] = useState<SpatialAudioEvent[]>([]);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Sync mute with audio engine
  useEffect(() => {
    spatialAudio.setMuted(isMuted);
  }, [isMuted]);

  // Sync volume & audio params with audio engine
  useEffect(() => {
    spatialAudio.setVolume(settings.volume);
    spatialAudio.setSpatialMode(settings.spatialMode);
    spatialAudio.setSoundTheme(settings.soundTheme);
    spatialAudio.setSpeechEnabled(settings.speechLabelsEnabled);
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    spatialAudio.setVolume(DEFAULT_SETTINGS.volume);
    spatialAudio.setSpatialMode(DEFAULT_SETTINGS.spatialMode);
    spatialAudio.setSoundTheme(DEFAULT_SETTINGS.soundTheme);
    spatialAudio.setSpeechEnabled(DEFAULT_SETTINGS.speechLabelsEnabled);
  }, []);

  const handleAudioEvent = useCallback((event: SpatialAudioEvent) => {
    setEventLog((prev) => [event, ...prev.slice(0, 39)]);
  }, []);

  // Keyboard accessibility listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsVisionActive((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        setActiveTab('calibration');
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveTab('live');
      } else if (e.key === 's' || e.key === 'S') {
        setActiveTab('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${
        settings.highContrastMode ? 'contrast-125' : ''
      }`}
    >
      {/* 3-Zone Top Navigation Bar */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isVisionActive={isVisionActive}
        setIsVisionActive={setIsVisionActive}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'live' && (
          <LiveDetectionView
            settings={settings}
            updateSettings={updateSettings}
            isVisionActive={isVisionActive}
            setIsVisionActive={setIsVisionActive}
            onAudioEventTriggered={handleAudioEvent}
            eventLog={eventLog}
          />
        )}

        {activeTab === 'calibration' && (
          <AudioCalibrationView
            settings={settings}
            updateSettings={updateSettings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            updateSettings={updateSettings}
            resetToDefaults={resetToDefaults}
          />
        )}

        {activeTab === 'safety' && <SafetyAndDocsView />}
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SpatialSight</span>
            <span aria-hidden="true">·</span>
            <span>Spatial Audio Assistive Vision</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">100% On-Device Processing</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Audio Tour</span>
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Safety & Privacy</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        updateSettings={updateSettings}
      />
    </div>
  );
}
