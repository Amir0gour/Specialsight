/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { DetectedSpatialObject, AudioSettings, SpatialAudioEvent } from '../types/spatial';
import { objectDetection } from '../services/objectDetectionService';
import { spatialAudio } from '../services/spatialAudioEngine';
import { haptics } from '../services/hapticsService';
import { HorizontalRadar } from './HorizontalRadar';

interface LiveDetectionViewProps {
  settings: AudioSettings;
  updateSettings?: (newSettings: Partial<AudioSettings>) => void;
  isVisionActive: boolean;
  setIsVisionActive: (active: boolean) => void;
  onAudioEventTriggered: (event: SpatialAudioEvent) => void;
  eventLog?: SpatialAudioEvent[];
}

export const LiveDetectionView: React.FC<LiveDetectionViewProps> = ({
  settings,
  updateSettings,
  isVisionActive,
  setIsVisionActive,
  onAudioEventTriggered,
  eventLog = [],
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastInferenceTime = useRef<number>(0);
  const lastAudioTriggerTime = useRef<number>(0);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [detectedObjects, setDetectedObjects] = useState<DetectedSpatialObject[]>([]);
  const [activeSoundAzimuth, setActiveSoundAzimuth] = useState<number | null>(null);
  const [activeSoundCategory, setActiveSoundCategory] = useState<string | null>(null);
  const [primaryHazard, setPrimaryHazard] = useState<DetectedSpatialObject | null>(null);
  const [isSimulatedFeed, setIsSimulatedFeed] = useState<boolean>(false);
  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState<string>('');

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.warn('Video play was rejected:', err);
          });
        };
      }
      setIsSimulatedFeed(false);
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      setCameraError('Camera access unavailable. You can use our real-time simulated feed below.');
    }
  }, [facingMode]);

  // Load TensorFlow model on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsModelLoading(true);
        await objectDetection.loadModel();
        if (isMounted) setIsModelLoading(false);
      } catch (err) {
        console.error('Failed to initialize detection model:', err);
        if (isMounted) {
          setIsModelLoading(false);
          setCameraError('AI detection model failed to load. Please refresh.');
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle camera start/stop
  useEffect(() => {
    if (isVisionActive && !isSimulatedFeed) {
      startCamera();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVisionActive, facingMode, isSimulatedFeed, startCamera]);

  // Fallback simulated objects generator (when user has no camera or clicks simulate)
  const generateSimulatedFrame = useCallback((): DetectedSpatialObject[] => {
    const time = Date.now() / 2500;
    // Oscillating person on left
    const pAzimuth = -0.6 + Math.sin(time) * 0.3;
    // Chair in center
    const cAzimuth = 0.05 + Math.cos(time * 0.7) * 0.15;
    // Doorway opening on right
    const dAzimuth = 0.55;

    return [
      {
        id: 'sim-person',
        label: 'Person',
        category: 'person',
        confidence: 0.88,
        bbox: { x: (pAzimuth + 1) / 2 - 0.15, y: 0.2, width: 0.3, height: 0.65 },
        azimuth: pAzimuth,
        azimuthAngleDeg: Math.round(pAzimuth * 90),
        azimuthLabel: pAzimuth < -0.4 ? 'Far Left' : 'Left',
        estimatedProximityRatio: 0.55 + Math.sin(time) * 0.2,
        approxDistanceMeters: 2.1,
        distanceDescription: 'about 2 meters',
        urgency: 'attention',
      },
      {
        id: 'sim-chair',
        label: 'Chair',
        category: 'furniture',
        confidence: 0.82,
        bbox: { x: (cAzimuth + 1) / 2 - 0.12, y: 0.45, width: 0.24, height: 0.4 },
        azimuth: cAzimuth,
        azimuthAngleDeg: Math.round(cAzimuth * 90),
        azimuthLabel: 'Center',
        estimatedProximityRatio: 0.38,
        approxDistanceMeters: 1.8,
        distanceDescription: 'about 2 meters',
        urgency: 'informational',
      },
      {
        id: 'sim-doorway',
        label: 'Doorway',
        category: 'doorway',
        confidence: 0.79,
        bbox: { x: (dAzimuth + 1) / 2 - 0.15, y: 0.1, width: 0.3, height: 0.8 },
        azimuth: dAzimuth,
        azimuthAngleDeg: Math.round(dAzimuth * 90),
        azimuthLabel: 'Right',
        estimatedProximityRatio: 0.42,
        approxDistanceMeters: 3.2,
        distanceDescription: 'about 3 meters',
        urgency: 'informational',
      },
    ];
  }, []);

  // Main Detection Loop
  useEffect(() => {
    let isCancelled = false;

    const runDetectionLoop = async (timestamp: number) => {
      if (isCancelled) return;

      if (isVisionActive && timestamp - lastInferenceTime.current > 120) {
        lastInferenceTime.current = timestamp;

        let detected: DetectedSpatialObject[] = [];

        if (isSimulatedFeed) {
          detected = generateSimulatedFrame();
        } else if (videoRef.current && objectDetection.isLoaded()) {
          detected = await objectDetection.detectFrame(
            videoRef.current,
            settings.sensitivityThreshold
          );
        }

        setDetectedObjects(detected);

        // Update primary hazard
        const primary = detected.length > 0 ? detected[0] : null;
        setPrimaryHazard(primary);

        // Render Canvas Overlays
        renderCanvasOverlays(detected);

        // Sound sonification trigger (based on cooldown)
        const now = Date.now();
        if (detected.length > 0 && now - lastAudioTriggerTime.current >= settings.cueCooldownMs) {
          lastAudioTriggerTime.current = now;
          const topThreat = detected[0];

          // Trigger spatial sound + spoken announcement ("Chair ahead, about 2 meters")
          spatialAudio.playSpatialCue(
            topThreat.category,
            topThreat.azimuth,
            topThreat.estimatedProximityRatio,
            topThreat.urgency,
            topThreat.label,
            topThreat.distanceDescription
          );

          // Trigger haptics
          if (settings.hapticEnabled) {
            haptics.trigger(topThreat.urgency);
          }

          // Visual wave highlight
          setActiveSoundAzimuth(topThreat.azimuth);
          setActiveSoundCategory(topThreat.label);
          setTimeout(() => {
            setActiveSoundAzimuth(null);
            setActiveSoundCategory(null);
          }, 450);

          // Screen reader accessibility announcement for high priority or changes
          const announcement = `${topThreat.label} ${topThreat.azimuthLabel}, ${topThreat.distanceDescription}`;
          setScreenReaderAnnouncement(announcement);

          // Log event
          onAudioEventTriggered({
            id: `evt-${now}`,
            timestamp: new Date(),
            objectLabel: topThreat.label,
            category: topThreat.category,
            azimuth: topThreat.azimuth,
            azimuthLabel: topThreat.azimuthLabel,
            urgency: topThreat.urgency,
            proximityRatio: topThreat.estimatedProximityRatio,
            approxDistanceMeters: topThreat.approxDistanceMeters,
            distanceDescription: topThreat.distanceDescription,
            source: isSimulatedFeed ? 'diagnostic' : 'camera',
            soundDescription: `${topThreat.label} ${topThreat.azimuthLabel}, ${topThreat.distanceDescription}`,
          });
        }
      }

      animationFrameId.current = requestAnimationFrame(runDetectionLoop);
    };

    if (isVisionActive) {
      animationFrameId.current = requestAnimationFrame(runDetectionLoop);
    }

    return () => {
      isCancelled = true;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [
    isVisionActive,
    isSimulatedFeed,
    settings.sensitivityThreshold,
    settings.cueCooldownMs,
    settings.hapticEnabled,
    generateSimulatedFrame,
    onAudioEventTriggered,
  ]);

  // Draw bounding boxes on canvas
  const renderCanvasOverlays = (objects: DetectedSpatialObject[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If simulated feed, draw a pleasant stylized backdrop
    if (isSimulatedFeed) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#090d16');
      gradient.addColorStop(1, '#131b2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw perspective hallway guidelines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Ceiling line
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.35);
      ctx.lineTo(canvas.width, 0);
      // Floor line
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.7);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();
    }

    // Draw center heading vertical dashed line
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw each detected object
    objects.forEach((obj) => {
      const x = obj.bbox.x * canvas.width;
      const y = obj.bbox.y * canvas.height;
      const w = obj.bbox.width * canvas.width;
      const h = obj.bbox.height * canvas.height;

      // Color based on urgency
      let strokeColor = '#38bdf8'; // sky (informational)
      let fillColor = 'rgba(56, 189, 248, 0.12)';
      if (obj.urgency === 'high_priority') {
        strokeColor = '#f43f5e'; // rose
        fillColor = 'rgba(244, 63, 94, 0.18)';
      } else if (obj.urgency === 'attention') {
        strokeColor = '#f59e0b'; // amber
        fillColor = 'rgba(245, 158, 11, 0.15)';
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Object label tag with direction and distance
      const text = `${obj.label} · ${obj.azimuthLabel} · ~${obj.approxDistanceMeters}m (${obj.distanceDescription})`;
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      const textMetrics = ctx.measureText(text);
      const tagH = 22;
      const tagW = textMetrics.width + 12;

      ctx.fillStyle = strokeColor;
      ctx.fillRect(x, Math.max(0, y - tagH), tagW, tagH);

      ctx.fillStyle = '#0f172a';
      ctx.fillText(text, x + 6, Math.max(14, y - 6));
    });
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const switchToSimulatedFeed = () => {
    setIsSimulatedFeed(true);
    setCameraError(null);
    if (!isVisionActive) {
      setIsVisionActive(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="assertive" aria-atomic="true">
        {screenReaderAnnouncement}
      </div>

      {/* Headphone Advisory Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Headphones strongly recommended:</strong> SpatialSight delivers directional 3D audio cues (Left, Center, Right) straight to your ears.
          </span>
        </div>
        <button
          onClick={() => spatialAudio.testDirection(0, 'Center test')}
          className="text-amber-400 font-semibold hover:text-amber-300 underline whitespace-nowrap shrink-0"
        >
          Quick Audio Check
        </button>
      </div>

      {/* Main Viewport & Video Section */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl aspect-video md:aspect-[16/9] max-h-[500px] flex items-center justify-center">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${isSimulatedFeed ? 'hidden' : 'block'}`}
        />

        {/* Canvas Overlay for Bounding Boxes and Simulated Feed */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
        />

        {/* State Overlays: Model loading, camera error, paused */}
        {isModelLoading && (
          <div className="absolute inset-0 z-20 bg-slate-950/85 flex flex-col items-center justify-center text-center p-6">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Loading On-Device AI Model</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Initializing mobile-optimized Coco-SSD neural network. All inference occurs 100% privately on your device.
            </p>
          </div>
        )}

        {cameraError && !isSimulatedFeed && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6">
            <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Camera Stream Inactive</h3>
            <p className="text-xs text-slate-400 max-w-md mb-4">{cameraError}</p>
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reconnect Camera
              </button>
              <button
                onClick={switchToSimulatedFeed}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" /> Enable Diagnostic Scene
              </button>
            </div>
          </div>
        )}

        {!isVisionActive && !cameraError && (
          <div className="absolute inset-0 z-20 bg-slate-950/75 flex flex-col items-center justify-center text-center p-6">
            <Square className="w-10 h-10 text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Spatial Vision Inactive</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Click Start Vision or press Spacebar to begin environmental spatial sonification.
            </p>
            <button
              onClick={() => setIsVisionActive(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Play className="w-4 h-4" /> Start Spatial Vision
            </button>
          </div>
        )}

        {/* Viewport Top Status Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isVisionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span>{isSimulatedFeed ? 'Diagnostic Scene' : 'Hardware Camera'}</span>
          <span className="text-slate-500">·</span>
          <span className="tabular-nums font-mono text-slate-400">
            {detectedObjects.length} tracked
          </span>
        </div>

        {/* Camera Controls */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          {!isSimulatedFeed && (
            <button
              onClick={toggleCameraFacing}
              className="p-2 bg-slate-950/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 text-xs"
              title="Switch Lens (Front / Rear)"
              aria-label="Switch camera between front and rear"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSimulatedFeed(!isSimulatedFeed)}
            className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 text-xs font-medium"
            title="Toggle between hardware camera and diagnostic scene"
          >
            {isSimulatedFeed ? 'Use Hardware Camera' : 'Diagnostic Scene'}
          </button>
        </div>
      </div>

      {/* 180-Degree Sonic Radar */}
      <HorizontalRadar
        detectedObjects={detectedObjects}
        activeSoundAzimuth={activeSoundAzimuth}
        activeCategory={activeSoundCategory}
      />

      {/* Primary Hazard HUD & Directional Focus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most Urgent Obstacle Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:col-span-2">
          <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
            <span className="font-semibold text-slate-300">Active Spatial Focus</span>
            <span className="text-[11px] text-slate-500">Heuristic visual estimate only</span>
          </div>

          {primaryHazard ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    primaryHazard.urgency === 'high_priority'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : primaryHazard.urgency === 'attention'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  }`}
                >
                  {primaryHazard.label.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{primaryHazard.label}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        primaryHazard.urgency === 'high_priority'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : primaryHazard.urgency === 'attention'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {primaryHazard.urgency.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>
                      Direction:{' '}
                      <strong className="text-amber-300 font-semibold">
                        {primaryHazard.azimuthLabel} ({primaryHazard.azimuthAngleDeg}°)
                      </strong>
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      {primaryHazard.distanceDescription} (~{primaryHazard.approxDistanceMeters}m)
                    </span>
                  </p>
                </div>
              </div>

              {/* Visual proximity meter */}
              <div className="w-full sm:w-48 text-right">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Estimated Distance</span>
                  <span className="font-mono tabular-nums text-emerald-400 font-bold">
                    ~{primaryHazard.approxDistanceMeters}m
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      primaryHazard.estimatedProximityRatio > 0.6
                        ? 'bg-rose-500'
                        : primaryHazard.estimatedProximityRatio > 0.3
                        ? 'bg-amber-500'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${primaryHazard.estimatedProximityRatio * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center text-xs text-slate-500">
              {isVisionActive ? 'No obstacles currently within the camera field of view.' : 'Spatial detection is currently paused.'}
            </div>
          )}
        </div>

        {/* Quick Auditory Controls Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1">Voice & Sonic Cues</span>
            <p className="text-xs text-slate-400 mb-3">
              Combines item acoustic earcons with spoken direction and distance (e.g. &ldquo;Chair ahead, about 2 meters&rdquo;).
            </p>
          </div>

          <div className="space-y-2">
            {updateSettings && (
              <button
                onClick={() => {
                  const nextVal = !settings.speechLabelsEnabled;
                  updateSettings({ speechLabelsEnabled: nextVal });
                  spatialAudio.setSpeechEnabled(nextVal);
                  if (nextVal) {
                    if (primaryHazard) {
                      spatialAudio.playSpatialCue(
                        primaryHazard.category,
                        primaryHazard.azimuth,
                        primaryHazard.estimatedProximityRatio,
                        primaryHazard.urgency,
                        primaryHazard.label,
                        primaryHazard.distanceDescription
                      );
                    } else {
                      spatialAudio.testDirection(0, 'Voice enabled');
                    }
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-colors ${
                  settings.speechLabelsEnabled
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Toggle spoken announcements of item name, direction and distance"
              >
                <Mic className={`w-3.5 h-3.5 ${settings.speechLabelsEnabled ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>Voice Speech: {settings.speechLabelsEnabled ? 'ON (Speaking Distance)' : 'OFF'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (primaryHazard) {
                  spatialAudio.playSpatialCue(
                    primaryHazard.category,
                    primaryHazard.azimuth,
                    primaryHazard.estimatedProximityRatio,
                    primaryHazard.urgency,
                    primaryHazard.label,
                    primaryHazard.distanceDescription
                  );
                } else {
                  spatialAudio.testDirection(0, 'Center preview');
                }
              }}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Ping Current Direction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Spatial Activity Log */}
      {eventLog.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Recent Spatial Sonification Activity</span>
            <span className="text-slate-500 font-mono tabular-nums">{eventLog.length} events recorded</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {eventLog.slice(0, 8).map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      evt.urgency === 'high_priority'
                        ? 'bg-rose-500'
                        : evt.urgency === 'attention'
                        ? 'bg-amber-500'
                        : 'bg-sky-400'
                    }`}
                  />
                  <div>
                    <span className="text-white font-semibold mr-2">{evt.objectLabel}</span>
                    <span className="text-amber-300/90 font-mono text-[11px] mr-2">
                      {evt.azimuthLabel} ({Math.round(evt.azimuth * 90)}°)
                    </span>
                    <span className="text-slate-400 text-[11px]">{evt.soundDescription}</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                  {evt.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
