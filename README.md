# 💡 Gesture Bulb — AI Hand Gesture Controlled Lighting

An AI-powered, browser-native interactive lighting experience controlled by real-time hand gestures using **Next.js 16 (App Router)**, **TensorFlow.js**, and **MediaPipe Hands**.

Built with a cyberpunk/industrial aesthetic, dynamic multi-color emissive filament glow, synthesized mechanical relay audio feedback, and real-time skeleton tracking telemetry.

---

## 🚀 Features

- 🖐️ **Real-Time Hand Gesture Detection**:
  - **Open Hand (✋)**: Engages the circuit and powers the lamp **ON**.
  - **Closed Fist (✊)**: Disengages the circuit and switches the lamp **OFF**.
  - **Debounced Stability**: 150ms stability threshold prevents accidental state flickering.

- 🦴 **Live Skeleton Landmark Overlay**:
  - Real-time HTML5 Canvas overlay rendering the 21 MediaPipe hand keypoints and skeletal links on top of the mirrored video feed.
  - Color-coded joint nodes and bone connectors matching the selected color theme.
  - Toggle on/off with the `L` key or toolbar icon.

- 🌈 **5 Dynamic Emissive Color Themes**:
  - **Tungsten Amber (2700K)**: Classic warm Edison vintage filament.
  - **Cyber Cyan (6500K)**: Sci-fi neon blue luminescent arc.
  - **Matrix Emerald**: Cyberpunk terminal laser green.
  - **Crimson Core**: High-voltage reactor alert ruby red.
  - **Violet Plasma**: Deep synthwave plasma purple.

- 🔊 **Synthesized Physical Audio Feedback**:
  - 100% client-side Web Audio API sound synthesis (zero external audio file dependencies).
  - Heavy mechanical relay snap + electromagnetic coil thump when switching on/off.
  - Filament warm-up resonance and UI feedback ticks.
  - Mute/unmute with the `M` key.

- 🎛️ **Full Interactive Controls**:
  - **Dimmer Slider**: Smooth brightness control from 20% to 100%.
  - **Tactile Manual Override**: Click the bulb directly, pull the cord, or press `Spacebar`.
  - **Camera Controls**: Switch between user-facing and environment/webcam inputs.
  - **Telemetry HUD**: Live FPS counter, latency meter (ms), model confidence percentage, and 4-finger extension status (Index, Middle, Ring, Pinky).
  - **Custom Cyberpunk Checkbox**: Sleek, accessible startup preference controls.
  - **Fullscreen Toggle**: Immerse the display into ambient lighting mode.

- ⌨️ **Keyboard Accessibility**:
  | Key | Action |
  |---|---|
  | `Space` | Toggle Lamp ON / OFF |
  | `T` | Cycle Color Theme |
  | `L` | Toggle Skeleton Landmarks |
  | `M` | Mute / Unmute Audio |
  | `H` | Open System Instructions Modal |
  | `Esc` | Close Dialogs |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library**: React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, Vanilla CSS Custom Keyframes & Filters
- **AI & Vision**:
  - `@tensorflow/tfjs-core` (v4.10.0)
  - `@tensorflow/tfjs-backend-webgl` (v4.10.0)
  - `@tensorflow-models/hand-pose-detection` (v2.0.1)
  - `@mediapipe/hands` (v0.4.1675469240)
- **Audio**: Web Audio API Sound Synthesizer
- **Icons**: Lucide React
- **Typography**: Google Fonts via `next/font/google` (`Syne`, `DM Sans`, `JetBrains Mono`)

---

## 📦 Getting Started

### 1. Installation

```bash
git clone https://github.com/helloSayanDeb/gesture-bulb.git
cd gesture-bulb
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Architecture

```
gesture-bulb/
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind v4, glow keyframes, metallic sheens
│   │   ├── layout.tsx          # Root layout with Syne, DM Sans, JetBrains Mono fonts & SEO
│   │   └── page.tsx            # Main cybernetic dashboard & stage assembly
│   ├── components/
│   │   ├── LightBulb.tsx       # Industrial socket, blown glass envelope, hot tungsten filament
│   │   ├── HandController.tsx  # Webcam feed, skeleton canvas, FPS/latency HUD, debounce loop
│   │   ├── ControlToolbar.tsx  # Power toggle, theme picker, dimmer, audio switch, guide
│   │   └── InstructionsModal.tsx # System control guide & startup preference
│   ├── hooks/
│   │   └── useHandPoseModel.ts # Resilient sequential loader for TF.js & MediaPipe detector
│   ├── services/
│   │   ├── gestureService.ts   # Geometric keypoint heuristics & finger telemetry
│   │   └── soundService.ts     # Web Audio API mechanical relay sound synthesizer
│   └── types/
│       └── index.ts            # Gestures, keypoints, telemetry, themes, detection stats
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Privacy

All hand gesture recognition runs **100% locally in your browser** via client-side WebGL and WebAssembly. No video frames, camera data, or images are ever transmitted to any server.

---

## 📄 License

MIT © [Sayan Deb](https://github.com/helloSayanDeb)
