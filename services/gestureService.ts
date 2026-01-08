import { GestureType, HandKeypoint } from '../types';

// Keypoint indices for MediaPipe Hands
const THUMB_TIP = 4;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_PIP = 18;
const PINKY_TIP = 20;

const calculateDistance = (p1: HandKeypoint, p2: HandKeypoint): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectGesture = (keypoints: HandKeypoint[]): GestureType => {
  if (!keypoints || keypoints.length < 21) return GestureType.NONE;

  const thumbTip = keypoints[THUMB_TIP];
  const indexPip = keypoints[INDEX_PIP];
  const indexTip = keypoints[INDEX_TIP];
  const middlePip = keypoints[MIDDLE_PIP];
  const middleTip = keypoints[MIDDLE_TIP];
  const ringPip = keypoints[RING_PIP];
  const ringTip = keypoints[RING_TIP];
  const pinkyPip = keypoints[PINKY_PIP];
  const pinkyTip = keypoints[PINKY_TIP];

  // Check for OK Sign
  // Condition: Thumb tip and Index tip are close
  const pinchDistance = calculateDistance(thumbTip, indexTip);
  // We use a relative threshold based on the hand size (e.g., distance between Index Base and Index PIP)
  // But since we don't have the base handy in this simplified list, we can approximate or use absolute if normalized.
  // Assuming 640x480 coordinates, ~30-40px is a reasonable threshold for a hand near the camera.
  // A more robust way is to compare it to the length of the index finger's first phalanx.
  const referenceDistance = calculateDistance(keypoints[5], keypoints[6]); // Index MCP to PIP
  
  if (pinchDistance < referenceDistance * 0.8) {
    // OK sign usually implies other fingers are extended, but we can be lenient.
    return GestureType.OK_SIGN;
  }

  // Check for Index Finger Up
  // Condition: Index finger is extended (Tip significantly above PIP)
  // Note: Y coordinates increase downwards in computer vision.
  const isIndexExtended = indexTip.y < indexPip.y - (referenceDistance * 0.5);
  
  // Condition: Other fingers are curled (Tip below PIP)
  const isMiddleCurled = middleTip.y > middlePip.y;
  const isRingCurled = ringTip.y > ringPip.y;
  const isPinkyCurled = pinkyTip.y > pinkyPip.y;

  if (isIndexExtended && isMiddleCurled && isRingCurled && isPinkyCurled) {
    return GestureType.INDEX_UP;
  }

  return GestureType.NONE;
};