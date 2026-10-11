/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UrgencyLevel = 'informational' | 'attention' | 'high_priority';

export type SpatialAudioMode = 'stereo' | 'hrtf';

export type SoundTheme = 'gentle_acoustic' | 'sonar_pulse' | 'minimalist_clicks';

export type CueCategory = 'person' | 'obstacle' | 'furniture' | 'doorway' | 'vehicle' | 'hazard' | 'uncertain';

export interface BoundingBox {
  x: number;      // 0 to 1 normalized left
  y: number;      // 0 to 1 normalized top
  width: number;  // 0 to 1 normalized width
  height: number; // 0 to 1 normalized height
}

export interface DetectedSpatialObject {
  id: string;
  label: string;
  category: CueCategory;
  confidence: number; // 0 to 1
  bbox: BoundingBox;
  azimuth: number; // -1.0 (far left) to 0.0 (center) to +1.0 (far right)
  azimuthAngleDeg: number; // -90 deg to +90 deg
  azimuthLabel: 'Far Left' | 'Left' | 'Center' | 'Right' | 'Far Right';
  estimatedProximityRatio: number; // 0 (distant) to 1 (immediate proximity)
  approxDistanceMeters: number; // estimated distance in meters
  distanceDescription: string; // e.g. "about 2 meters" or "under 1 meter"
  urgency: UrgencyLevel;
  lastNotifiedAt?: number;
}

export interface SpatialAudioEvent {
  id: string;
  timestamp: Date;
  objectLabel: string;
  category: CueCategory;
  azimuth: number;
  azimuthLabel: string;
  urgency: UrgencyLevel;
  proximityRatio: number;
  approxDistanceMeters?: number;
  distanceDescription?: string;
  source: 'camera' | 'diagnostic' | 'simulation';
  soundDescription: string;
}

export interface AudioSettings {
  volume: number;              // 0.0 to 1.0
  spatialMode: SpatialAudioMode; // 'stereo' | 'hrtf'
  sensitivityThreshold: number; // 0.25 to 0.85
  cueCooldownMs: number;       // 1000ms to 5000ms (default 3000ms)
  speechLabelsEnabled: boolean; // Spoken voice cues
  hapticEnabled: boolean;      // Device vibration feedback
  soundTheme: SoundTheme;
  distanceUnit: 'meters' | 'feet'; // measurement unit for spoken prompts
  highContrastMode: boolean;
  largeTextMode: boolean;
}

export interface CameraState {
  isActive: boolean;
  isModelLoaded: boolean;
  isLoadingModel: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  fps: number;
}
