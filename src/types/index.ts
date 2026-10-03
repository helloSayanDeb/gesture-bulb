export enum GestureType {
  NONE = 'NONE',
  OPEN_HAND = 'OPEN_HAND',
  CLOSED_FIST = 'CLOSED_FIST',
}

export interface HandKeypoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

export interface Hand {
  keypoints: HandKeypoint[];
  score: number;
  handedness?: 'Left' | 'Right';
}

export type BulbColorTheme = 'amber' | 'cyan' | 'emerald' | 'crimson' | 'violet';

export interface FingerTelemetry {
  isCurled: boolean;
  isExtended: boolean;
  ratio: number;
}

export interface HandTelemetry {
  index: FingerTelemetry;
  middle: FingerTelemetry;
  ring: FingerTelemetry;
  pinky: FingerTelemetry;
}

export interface DetectionStats {
  fps: number;
  latencyMs: number;
  handDetected: boolean;
  score: number;
}
