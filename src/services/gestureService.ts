import { GestureType, HandKeypoint, HandTelemetry, FingerTelemetry } from '../types';

// Keypoint indices for MediaPipe Hands
export const HAND_CONNECTIONS: [number, number][] = [
  // Palm
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17],                               // Palm base connection
];

export const INDEX_MCP = 5;
export const INDEX_PIP = 6;
export const INDEX_TIP = 8;

export const MIDDLE_MCP = 9;
export const MIDDLE_PIP = 10;
export const MIDDLE_TIP = 12;

export const RING_MCP = 13;
export const RING_PIP = 14;
export const RING_TIP = 16;

export const PINKY_MCP = 17;
export const PINKY_PIP = 18;
export const PINKY_TIP = 20;

export const calculateDistance = (p1: HandKeypoint, p2: HandKeypoint): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export interface GestureDetectionResult {
  gesture: GestureType;
  telemetry: HandTelemetry;
  confidence: number;
}

export const analyzeGesture = (
  keypoints: HandKeypoint[],
  curledMultiplier: number = 1.55,
  extendedMultiplier: number = 1.70
): GestureDetectionResult => {
  const defaultTelemetry: HandTelemetry = {
    index: { isCurled: false, isExtended: false, ratio: 0 },
    middle: { isCurled: false, isExtended: false, ratio: 0 },
    ring: { isCurled: false, isExtended: false, ratio: 0 },
    pinky: { isCurled: false, isExtended: false, ratio: 0 },
  };

  if (!keypoints || keypoints.length < 21) {
    return {
      gesture: GestureType.NONE,
      telemetry: defaultTelemetry,
      confidence: 0,
    };
  }

  // Helper to determine the state of a finger (curled or extended)
  const getFingerState = (tipIdx: number, mcpIdx: number, pipIdx: number): FingerTelemetry => {
    const tip = keypoints[tipIdx];
    const mcp = keypoints[mcpIdx];
    const pip = keypoints[pipIdx];

    const segmentLen = Math.max(1, calculateDistance(mcp, pip));
    const tipToMcp = calculateDistance(tip, mcp);
    const ratio = tipToMcp / segmentLen;

    const isCurled = tipToMcp < (segmentLen * curledMultiplier);
    const isExtended = tipToMcp > (segmentLen * extendedMultiplier);

    return { isCurled, isExtended, ratio: Number(ratio.toFixed(2)) };
  };

  const index = getFingerState(INDEX_TIP, INDEX_MCP, INDEX_PIP);
  const middle = getFingerState(MIDDLE_TIP, MIDDLE_MCP, MIDDLE_PIP);
  const ring = getFingerState(RING_TIP, RING_MCP, RING_PIP);
  const pinky = getFingerState(PINKY_TIP, PINKY_MCP, PINKY_PIP);

  const telemetry: HandTelemetry = { index, middle, ring, pinky };

  // Closed Fist Detection: Index, Middle, Ring, and Pinky are all curled
  if (index.isCurled && middle.isCurled && ring.isCurled && pinky.isCurled) {
    const confidence = 0.95;
    return { gesture: GestureType.CLOSED_FIST, telemetry, confidence };
  }

  // Open Hand Detection: Index, Middle, Ring, and Pinky are all extended
  if (index.isExtended && middle.isExtended && ring.isExtended && pinky.isExtended) {
    const confidence = 0.95;
    return { gesture: GestureType.OPEN_HAND, telemetry, confidence };
  }

  return { gesture: GestureType.NONE, telemetry, confidence: 0.5 };
};

// Convenience legacy export matching original API
export const detectGesture = (keypoints: HandKeypoint[]): GestureType => {
  return analyzeGesture(keypoints).gesture;
};
