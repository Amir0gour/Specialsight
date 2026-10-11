/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { CueCategory, DetectedSpatialObject, UrgencyLevel } from '../types/spatial';

class ObjectDetectionService {
  private model: cocoSsd.ObjectDetection | null = null;
  private isModelLoading: boolean = false;
  private modelLoadPromise: Promise<cocoSsd.ObjectDetection> | null = null;

  public async loadModel(): Promise<cocoSsd.ObjectDetection> {
    if (this.model) return this.model;
    if (this.modelLoadPromise) return this.modelLoadPromise;

    this.isModelLoading = true;
    this.modelLoadPromise = (async () => {
      try {
        await tf.ready();
        const loaded = await cocoSsd.load({
          base: 'lite_mobilenet_v2', // Lightweight mobile-optimized backend
        });
        this.model = loaded;
        this.isModelLoading = false;
        return loaded;
      } catch (err) {
        this.isModelLoading = false;
        this.modelLoadPromise = null;
        console.error('Failed to load Coco-SSD model:', err);
        throw err;
      }
    })();

    return this.modelLoadPromise;
  }

  public isLoaded(): boolean {
    return this.model !== null;
  }

  public isLoading(): boolean {
    return this.isModelLoading;
  }

  /**
   * Runs detection on an HTMLVideoElement and maps bounding boxes into spatial telemetry.
   */
  public async detectFrame(
    video: HTMLVideoElement,
    sensitivityThreshold: number = 0.50
  ): Promise<DetectedSpatialObject[]> {
    if (!this.model || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return [];
    }

    try {
      const predictions = await this.model.detect(video, 10, sensitivityThreshold * 0.7);
      const videoW = video.videoWidth;
      const videoH = video.videoHeight;
      const totalPixels = videoW * videoH;

      const results: DetectedSpatialObject[] = predictions
        .filter((pred) => pred.score >= sensitivityThreshold * 0.6)
        .map((pred, index) => {
          const [bx, by, bw, bh] = pred.bbox;

          // Normalized coordinates (0 to 1)
          const normX = Math.max(0, Math.min(1, bx / videoW));
          const normY = Math.max(0, Math.min(1, by / videoH));
          const normW = Math.max(0.01, Math.min(1, bw / videoW));
          const normH = Math.max(0.01, Math.min(1, bh / videoH));

          // Center coordinate
          const centerX = normX + normW / 2;
          // Azimuth: -1.0 (far left) to 0.0 (center) to +1.0 (far right)
          const azimuth = (centerX - 0.5) * 2;
          const azimuthAngleDeg = Math.round(azimuth * 90);

          let azimuthLabel: 'Far Left' | 'Left' | 'Center' | 'Right' | 'Far Right' = 'Center';
          if (azimuth <= -0.5) azimuthLabel = 'Far Left';
          else if (azimuth < -0.15) azimuthLabel = 'Left';
          else if (azimuth > 0.5) azimuthLabel = 'Far Right';
          else if (azimuth > 0.15) azimuthLabel = 'Right';

          // Approximate Proximity heuristic based on bounding-box screen real estate
          const pixelArea = bw * bh;
          const areaRatio = Math.min(1, pixelArea / totalPixels);
          // Visual proximity normalized (0 = distant, 1 = immediate collision threat)
          const proximityRatio = Math.min(1, Math.sqrt(areaRatio) * 1.6);

          // Approximate Distance estimation based on optical pinhole model
          const { meters: approxDistanceMeters, description: distanceDescription } = this.estimateDistance(
            pred.class,
            normH
          );

          const category = this.categorizeClass(pred.class, pred.score);

          // Urgency assessment based on proximity and threat tier
          let urgency: UrgencyLevel = 'informational';
          if (areaRatio > 0.30 || approxDistanceMeters < 1.2 || (category === 'vehicle' && areaRatio > 0.12) || (category === 'hazard' && areaRatio > 0.15)) {
            urgency = 'high_priority';
          } else if (areaRatio > 0.09 || approxDistanceMeters < 2.5 || (category === 'person' && areaRatio > 0.06)) {
            urgency = 'attention';
          }

          return {
            id: `obj-${index}-${pred.class}-${Math.round(pred.score * 100)}`,
            label: this.formatLabel(pred.class),
            category,
            confidence: pred.score,
            bbox: {
              x: normX,
              y: normY,
              width: normW,
              height: normH,
            },
            azimuth,
            azimuthAngleDeg,
            azimuthLabel,
            estimatedProximityRatio: proximityRatio,
            approxDistanceMeters,
            distanceDescription,
            urgency,
          };
        });

      // Sort by urgency then by proximity
      return results.sort((a, b) => {
        const priorityOrder: Record<UrgencyLevel, number> = {
          high_priority: 3,
          attention: 2,
          informational: 1,
        };
        const pDiff = priorityOrder[b.urgency] - priorityOrder[a.urgency];
        if (pDiff !== 0) return pDiff;
        return a.approxDistanceMeters - b.approxDistanceMeters;
      });
    } catch (err) {
      console.error('Frame inference error:', err);
      return [];
    }
  }

  private categorizeClass(rawClass: string, score: number): CueCategory {
    const cls = rawClass.toLowerCase();

    if (score < 0.45) {
      return 'uncertain';
    }

    if (cls === 'person') return 'person';
    if (['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(cls)) return 'vehicle';
    if (['chair', 'couch', 'sofa', 'dining table', 'desk', 'bed'].includes(cls)) return 'furniture';
    if (['door', 'exit', 'entrance'].includes(cls)) return 'doorway';
    if (['traffic light', 'stop sign', 'fire hydrant'].includes(cls)) return 'hazard';

    return 'obstacle';
  }

  public estimateDistance(rawClass: string, normH: number): { meters: number; description: string } {
    const cls = rawClass.toLowerCase();
    let realHeightMeters = 0.8; // default obstacle height in meters

    if (cls === 'person') {
      realHeightMeters = 1.7;
    } else if (cls === 'chair') {
      realHeightMeters = 0.85;
    } else if (['dining table', 'desk'].includes(cls)) {
      realHeightMeters = 0.75;
    } else if (['couch', 'sofa'].includes(cls)) {
      realHeightMeters = 0.85;
    } else if (cls === 'bed') {
      realHeightMeters = 0.75;
    } else if (['car', 'truck', 'bus'].includes(cls)) {
      realHeightMeters = 1.5;
    } else if (['bicycle', 'motorcycle'].includes(cls)) {
      realHeightMeters = 1.1;
    } else if (['door', 'exit', 'entrance'].includes(cls)) {
      realHeightMeters = 2.0;
    } else if (['bottle', 'cup'].includes(cls)) {
      realHeightMeters = 0.25;
    } else if (['backpack', 'handbag', 'suitcase'].includes(cls)) {
      realHeightMeters = 0.5;
    } else if (cls === 'potted plant') {
      realHeightMeters = 0.6;
    }

    // Optical focal approximation: d = (realHeight * 0.85) / normH
    const safeH = Math.max(0.06, normH);
    const rawDist = (realHeightMeters * 0.85) / safeH;
    const meters = Math.max(0.4, Math.min(8.0, Math.round(rawDist * 10) / 10));

    let description = 'about 2 meters';
    if (meters < 0.8) {
      description = 'under 1 meter';
    } else if (meters < 1.3) {
      description = 'about 1 meter';
    } else if (meters < 1.8) {
      description = 'about 1 and a half meters';
    } else if (meters < 2.5) {
      description = 'about 2 meters';
    } else if (meters < 3.5) {
      description = 'about 3 meters';
    } else if (meters < 4.8) {
      description = 'about 4 meters';
    } else {
      description = 'over 5 meters';
    }

    return { meters, description };
  }

  private formatLabel(rawClass: string): string {
    const formatted = rawClass
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return formatted;
  }
}

export const objectDetection = new ObjectDetectionService();
