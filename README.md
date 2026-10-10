# SpatialSight — AI Spatial Audio Vision for the Visually Impaired

SpatialSight is an accessibility application that detects environmental obstacles using real-time, on-device computer vision and communicates their approximate direction through 3D binaural spatial audio.

Instead of robotic text-to-speech descriptions, SpatialSight synthesizes distinct, non-fatiguing musical micro-cues (earcons) positioned spatially across the user's stereo or HRTF soundstage.

---

## Key Features

- **100% On-Device Neural Vision:** MobileNet-SSD via `@tensorflow/tfjs` runs locally in your browser's WebGL context. No video frames ever leave your device.
- **3D Spatial Audio Engine:** Web Audio API with `PannerNode` (Head-Related Transfer Function - HRTF) and `StereoPannerNode` providing azimuth positioning from -90° (far left) to +90° (far right).
- **Acoustic Earcon Library:**
  - *Open Doorway / Exit:* Ascending harmonic major triad (C5–E5–G5).
  - *Person Approaching:* Organic warm double-blip (440 Hz / 523 Hz).
  - *Furniture & Static Obstacle:* Resonant woodblock click (220 Hz).
  - *Hazard Alert:* High-priority dual-tone alert (350 Hz / 520 Hz).
  - *Detection Uncertainty:* Soft fluttering tone (380 Hz) honestly signaling low light or ambiguous shapes.
- **Multi-Modal Accessibility:** High-contrast dark theme, large 48px touch targets, mobile haptic vibrations (`navigator.vibrate`), and optional spoken labels.
- **Audio Calibration & Diagnostics:** 5-point azimuth direction tester (-90°, -45°, 0°, +45°, +90°) and diagnostic room scene for environments without hardware camera feeds.

---

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn
- Modern web browser (Chrome, Safari, Edge, or Firefox)
- Stereo headphones recommended for optimal directional perception

### Installation

```bash
# 1. Install project dependencies
npm install

# 2. Start the local development server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

### Production Build

```bash
# Compile and bundle for production
npm run build

# Preview the production build locally
npm run preview
```

---

## Project Structure

```
├── index.html                   # HTML entry point with accessibility metadata
├── metadata.json                # AI Studio application config & permissions
├── package.json                 # Dependencies (TensorFlow.js, Lucide, Tailwind)
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite build configuration with Tailwind CSS v4
├── README.md                    # Project documentation & instructions
└── src/
    ├── main.tsx                 # React application entry
    ├── index.css                # Global styles, Tailwind imports, and WCAG AA focus rings
    ├── App.tsx                  # Main router, keyboard navigation, and state
    ├── types/
    │   └── spatial.ts           # TypeScript interfaces (azimuths, telemetry, urgency)
    ├── services/
    │   ├── spatialAudioEngine.ts # Web Audio API engine (HRTF 3D & earcon synthesizers)
    │   ├── objectDetectionService.ts # TensorFlow.js MobileNet-SSD detector
    │   └── hapticsService.ts    # Tactile vibration service
    └── components/
        ├── TopNavigation.tsx    # 3-Zone top navigation header
        ├── HorizontalRadar.tsx  # 180° Sonic Radar visualizer (-90° to +90°)
        ├── LiveDetectionView.tsx # Camera feed, canvas bounding boxes, hazard HUD
        ├── AudioCalibrationView.tsx # 5-Point directional audio tester & sound catalog
        ├── SettingsView.tsx     # Sensitivity, cooldown, volume & accessibility toggles
        ├── SafetyAndDocsView.tsx # Medical device disclaimers & mobile native roadmap
        └── OnboardingModal.tsx  # First-run guided audio orientation
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **Spacebar** | Start / Pause Spatial Vision |
| **Key M** | Mute / Unmute Spatial Audio |
| **Key L** | Navigate to Live Vision |
| **Key C** | Navigate to Audio Calibration |
| **Key S** | Navigate to Settings |

---

## Safety Notice

SpatialSight is an experimental assistive technology prototype. It is **not a certified medical device or primary mobility aid**. It does not replace a white cane, guide dog, or formal orientation training. Always use with caution in safe, supervised environments.

---

## License

Apache-2.0
