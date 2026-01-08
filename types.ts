export enum GestureType {
  NONE = 'NONE',
  OPEN_HAND = 'OPEN_HAND',
  CLOSED_FIST = 'CLOSED_FIST',
}

export interface HandKeypoint {
  x: number;
  y: number;
  name?: string;
}

export interface Hand {
  keypoints: HandKeypoint[];
  score: number;
}