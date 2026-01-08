export enum GestureType {
  NONE = 'NONE',
  INDEX_UP = 'INDEX_UP',
  OK_SIGN = 'OK_SIGN',
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
