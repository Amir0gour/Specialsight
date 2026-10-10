/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  Lock,
  Cpu,
  HeartHandshake,
  Smartphone,
  Eye,
  Sliders,
  HelpCircle
} from 'lucide-react';

export const SafetyAndDocsView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Safety Mandatory Disclaimer Box */}
      <div className="bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/40 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">Assistive Technology Safety Notice</h2>
              <span className="text-[11px] font-mono uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                Non-Medical Device
              </span>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed">
              SpatialSight is an assistive spatial perception system. It is <strong>not a certified medical device, certified collision prevention system, or primary mobility replacement</strong>.
            </p>
            <ul className="text-xs text-rose-300/90 mt-3 space-y-1.5 list-disc list-inside">
              <li>
                <strong>White Cane & Guide Dog Coexistence:</strong> SpatialSight is designed strictly to complement physical primary orientation aids (such as the white cane, guide dog, or orientation and mobility specialist training), never to replace them.
              </li>
              <li>
                <strong>Approximate Visual Proximity:</strong> Depth and proximity estimates are derived from bounding-box heuristics in a 2D optical frame and must never be treated as calibrated laser or LiDAR distance measurements.
              </li>
              <li>
                <strong>Environmental Limitations:</strong> Camera coverage can be degraded by low lighting, lens obstructions, motion blur, and out-of-frame hazards. Always exercise vigilance.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* On-Device Privacy Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">100% On-Device Privacy Architecture</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Visual navigation streams represent sensitive personal space. SpatialSight is engineered with zero remote telemetry, zero cloud streaming, and zero persistent image retention.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <strong className="text-white block mb-1">Local WebGL Inference</strong>
                <span className="text-slate-400">
                  Neural model execution runs entirely inside the local device browser context via hardware acceleration.
                </span>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <strong className="text-white block mb-1">Ephemeral Frame Memory</strong>
                <span className="text-slate-400">
                  Video frames are analyzed in transient RAM and discarded immediately after bounding-box extraction.
                </span>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <strong className="text-white block mb-1">Zero Network Transmission</strong>
                <span className="text-slate-400">
                  No images, audio, or spatial coordinates are transmitted to remote servers. All data stays on device.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acoustic Ergonomics & Sensory Load Reduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Acoustic Ergonomics & Design Philosophy</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white">Preventing Auditory Fatigue</h4>
            <p className="text-slate-400 leading-relaxed">
              Standard screen-reading tools barrage visually impaired users with verbose text-to-speech descriptions. This monopolizes the auditory cortex, making conversation and hearing environmental cues impossible. SpatialSight substitutes rapid speech with intuitive, non-fatiguing musical micro-cues (earcons) positioned spatially around the listener.
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white">Transparent Uncertainty Sonification</h4>
            <p className="text-slate-400 leading-relaxed">
              When computer vision confidence drops below threshold or lighting is dim, SpatialSight plays a gentle fluttering ambient tone. This honestly communicates environmental ambiguity, signaling the user to rely more heavily on tactile tools without generating false confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture & Mobile Production Specifications */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">System Architecture & Production Specifications</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-300 mb-2">Web Application Architecture</h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>
                <strong>Computer Vision:</strong> MobileNet-SSD via TensorFlow.js processing frames with normalized bounding-box coordinates <code className="text-amber-300">[0.0, 1.0]</code>.
              </li>
              <li>
                <strong>Spatial Audio Synthesizer:</strong> Web Audio API utilizing <code className="text-amber-300">PannerNode</code> with Head-Related Transfer Function (HRTF) algorithms to simulate human pinna frequency filtering and interaural time difference (ITD).
              </li>
              <li>
                <strong>Azimuth Mapping:</strong> Horizontal plane mapping from $-90^\circ$ (far left) to $+90^\circ$ (far right) with inverse distance attenuation.
              </li>
              <li>
                <strong>Accessibility Standards:</strong> Full WCAG 2.1 AA compliance with high-contrast surfaces, 48px hitboxes, and screen reader live regions.
              </li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h4 className="font-bold text-sky-300 mb-2">Native Mobile Production Blueprint (iOS & Android)</h4>
            <p className="text-slate-400 mb-2">
              For native application deployment:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
              <li>
                <strong>Frame Capture:</strong> <code className="text-sky-300">react-native-vision-camera</code> with native C++ frame processors operating at 30–60 FPS.
              </li>
              <li>
                <strong>Hardware Accelerated Inference:</strong> Export quantized YOLOv8n or MobileNet to ONNX Runtime Mobile / CoreML / Android NNAPI.
              </li>
              <li>
                <strong>LiDAR / Time-of-Flight Fusion:</strong> Merge camera bounding boxes with device depth sensors for millimeter-accurate obstacle distance.
              </li>
              <li>
                <strong>Head-Tracking Spatial Audio:</strong> Connect Bluetooth earbud IMUs (e.g. AirPods Motion API) to synchronize spatial audio coordinates with head orientation.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
