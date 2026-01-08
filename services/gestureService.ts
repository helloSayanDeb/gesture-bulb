import { GestureType, HandKeypoint } from '../types';

// Keypoint indices for MediaPipe Hands
const WRIST = 0;
const THUMB_CMC = 1;
const THUMB_MCP = 2;
const THUMB_IP = 3;
const THUMB_TIP = 4;

const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_DIP = 7;
const INDEX_TIP = 8;

const MIDDLE_MCP = 9;
const MIDDLE_PIP = 10;
const MIDDLE_DIP = 11;
const MIDDLE_TIP = 12;

const RING_MCP = 13;
const RING_PIP = 14;
const RING_DIP = 15;
const RING_TIP = 16;

const PINKY_MCP = 17;
const PINKY_PIP = 18;
const PINKY_DIP = 19;
const PINKY_TIP = 20;

const calculateDistance = (p1: HandKeypoint, p2: HandKeypoint): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectGesture = (keypoints: HandKeypoint[]): GestureType => {
  if (!keypoints || keypoints.length < 21) return GestureType.NONE;

  // Helper to determine the state of a finger (curled or extended)
  // We use the Proximal Phalanx (MCP to PIP) as a reference length unit.
  // We measure the distance from the Tip to the MCP joint.
  // - If the finger is curled, the Tip is close to the MCP.
  // - If the finger is extended, the Tip is far from the MCP.
  const getFingerState = (tipIdx: number, mcpIdx: number, pipIdx: number) => {
    const tip = keypoints[tipIdx];
    const mcp = keypoints[mcpIdx];
    const pip = keypoints[pipIdx];

    // Calculate the length of the first finger segment (MCP to PIP)
    // This scales automatically with hand size and camera distance.
    const segmentLen = calculateDistance(mcp, pip);
    
    // Calculate the distance from the Tip to the base of the finger (MCP)
    const tipToMcp = calculateDistance(tip, mcp);

    // Heuristics derived from hand geometry:
    
    // Threshold for "Curled" (Fist)
    // Reduced to 1.35 for stricter fist detection.
    // The finger tip must be pulled in closer to the MCP.
    const isCurled = tipToMcp < (segmentLen * 1.35);

    // Threshold for "Extended" (Open Hand)
    // Set to 1.9 to ensure fingers are actually straight.
    // Creates a neutral zone between 1.35 and 1.9 where no gesture is detected.
    const isExtended = tipToMcp > (segmentLen * 1.9);

    return { isCurled, isExtended };
  };

  const index = getFingerState(INDEX_TIP, INDEX_MCP, INDEX_PIP);
  const middle = getFingerState(MIDDLE_TIP, MIDDLE_MCP, MIDDLE_PIP);
  const ring = getFingerState(RING_TIP, RING_MCP, RING_PIP);
  const pinky = getFingerState(PINKY_TIP, PINKY_MCP, PINKY_PIP);

  // Closed Fist Detection
  // Primary condition: Index, Middle, Ring, and Pinky are all curled.
  if (index.isCurled && middle.isCurled && ring.isCurled && pinky.isCurled) {
    return GestureType.CLOSED_FIST;
  }

  // Open Hand Detection
  // Primary condition: Index, Middle, Ring, and Pinky are all extended.
  if (index.isExtended && middle.isExtended && ring.isExtended && pinky.isExtended) {
    return GestureType.OPEN_HAND;
  }

  return GestureType.NONE;
};