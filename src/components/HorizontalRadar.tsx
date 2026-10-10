/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DetectedSpatialObject } from '../types/spatial';
import { User, Box, ShieldAlert, DoorClosed, Car, HelpCircle } from 'lucide-react';

interface HorizontalRadarProps {
  detectedObjects: DetectedSpatialObject[];
  activeSoundAzimuth: number | null; // -1 to 1 or null
  activeCategory: string | null;
}

export const HorizontalRadar: React.FC<HorizontalRadarProps> = ({
  detectedObjects,
  activeSoundAzimuth,
  activeCategory,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'person':
        return <User className="w-3.5 h-3.5" />;
      case 'doorway':
        return <DoorClosed className="w-3.5 h-3.5" />;
      case 'vehicle':
        return <Car className="w-3.5 h-3.5" />;
      case 'hazard':
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case 'uncertain':
        return <HelpCircle className="w-3.5 h-3.5" />;
      default:
        return <Box className="w-3.5 h-3.5" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high_priority':
        return 'bg-rose-500 text-white border-rose-300 ring-4 ring-rose-500/30';
      case 'attention':
        return 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-500/20';
      default:
        return 'bg-sky-500 text-slate-950 border-sky-300';
    }
  };

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full"
      role="region"
      aria-label="Horizontal 180 degree spatial radar"
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-semibold text-slate-300">180° Sonic Radar</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> High Priority
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Attention
          </span>
          <span className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Info
          </span>
        </div>
      </div>

      {/* Spatial Arc / Track */}
      <div className="relative h-20 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden flex items-center px-4">
        {/* Subtle grid divisions */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
          <div className="w-px h-full bg-slate-500" />
          <div className="w-px h-full bg-slate-500" />
          <div className="w-px h-full bg-amber-400 opacity-60" /> {/* Center line */}
          <div className="w-px h-full bg-slate-500" />
          <div className="w-px h-full bg-slate-500" />
        </div>

        {/* Dynamic sound ripple indicator when audio fires */}
        {activeSoundAzimuth !== null && (
          <div
            className="absolute top-0 bottom-0 w-16 -ml-8 bg-gradient-to-r from-amber-500/0 via-amber-400/30 to-amber-500/0 pointer-events-none transition-all duration-300 animate-pulse"
            style={{
              left: `${((activeSoundAzimuth + 1) / 2) * 100}%`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] text-amber-300 font-mono tracking-tight font-bold bg-slate-900/80 px-1 py-0.5 rounded border border-amber-400/40">
                ♫ {activeCategory || 'Cue'}
              </span>
            </div>
          </div>
        )}

        {/* Center line indicator */}
        <div className="absolute left-1/2 -top-1 -bottom-1 w-0.5 bg-amber-500/40 pointer-events-none" />

        {/* Detected objects rendered horizontally according to azimuth */}
        {detectedObjects.length === 0 ? (
          <div className="w-full text-center text-xs text-slate-500 italic select-none">
            Listening for surrounding obstacles...
          </div>
        ) : (
          detectedObjects.map((obj) => {
            // azimuth ranges from -1 to 1; convert to percentage (0% to 100%)
            const leftPercent = Math.max(4, Math.min(96, ((obj.azimuth + 1) / 2) * 100));

            return (
              <div
                key={obj.id}
                className="absolute transition-all duration-200 transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPercent}%` }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-md font-bold transition-transform hover:scale-110 ${getUrgencyColor(
                    obj.urgency
                  )}`}
                  title={`${obj.label} at ${obj.azimuthLabel} (${obj.azimuthAngleDeg}°) - ${Math.round(
                    obj.confidence * 100
                  )}% confidence`}
                >
                  {getCategoryIcon(obj.category)}
                </div>
                <span className="text-[10px] text-slate-300 mt-1 font-medium whitespace-nowrap bg-slate-900/90 px-1 rounded border border-slate-750">
                  {obj.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Axis Labels */}
      <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 px-1 tabular-nums">
        <span>-90° (Left)</span>
        <span>-45°</span>
        <span className="text-amber-400/90 font-semibold">0° (Center Ahead)</span>
        <span>+45°</span>
        <span>+90° (Right)</span>
      </div>
    </div>
  );
};
