/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

export type NavTab = 'live' | 'calibration' | 'settings' | 'safety';

interface TopNavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isVisionActive: boolean;
  setIsVisionActive: (active: boolean) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  setActiveTab,
  isVisionActive,
  setIsVisionActive,
  isMuted,
  setIsMuted,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('live')}
          className="text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          aria-label="SpatialSight Navigation Home"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
          <span>SpatialSight</span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => setActiveTab('live')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'live'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Live Vision
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'calibration'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Audio Calibration
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'settings'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              activeTab === 'safety'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white'
            }`}
          >
            Safety & Privacy
          </button>
        </nav>

        {/* Zone 3: Quick primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-850 transition-colors flex items-center gap-2 whitespace-nowrap"
            aria-label={isMuted ? 'Unmute spatial audio' : 'Mute spatial audio'}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-amber-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio Active'}</span>
          </button>

          <button
            onClick={() => setIsVisionActive(!isVisionActive)}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              isVisionActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-amber-500 text-slate-950 font-extrabold hover:bg-amber-400 shadow-md shadow-amber-500/20'
            }`}
            aria-label={isVisionActive ? 'Pause Spatial Vision' : 'Start Spatial Vision'}
          >
            {isVisionActive ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Pause Vision</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Start Vision</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-850 bg-slate-900/90 text-xs">
        <button
          onClick={() => setActiveTab('live')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'live' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          Live Vision
        </button>
        <button
          onClick={() => setActiveTab('calibration')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'calibration' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          Calibration
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'settings' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`py-1.5 px-2 rounded font-medium ${activeTab === 'safety' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          Safety
        </button>
      </div>
    </header>
  );
};
