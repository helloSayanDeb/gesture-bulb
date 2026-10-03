'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { analyzeGesture, HAND_CONNECTIONS } from '../services/gestureService';
import { GestureType, HandKeypoint, HandTelemetry, DetectionStats, BulbColorTheme } from '../types';
import { useHandPoseModel } from '../hooks/useHandPoseModel';
import { Camera, CameraOff, RefreshCw, Eye, EyeOff, Maximize2, Minimize2, AlertCircle } from 'lucide-react';

interface HandControllerProps {
  onGesture: (gesture: GestureType) => void;
  onCameraReady: () => void;
  colorTheme?: BulbColorTheme;
  showLandmarks?: boolean;
  onToggleLandmarks?: () => void;
}

export const HandController: React.FC<HandControllerProps> = ({
  onGesture,
  onCameraReady,
  colorTheme = 'amber',
  showLandmarks = true,
  onToggleLandmarks,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { model, isLoading: isModelLoading, error: modelError, progressText } = useHandPoseModel();

  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [telemetry, setTelemetry] = useState<HandTelemetry | null>(null);
  const [stats, setStats] = useState<DetectionStats>({
    fps: 0,
    latencyMs: 0,
    handDetected: false,
    score: 0,
  });

  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(Date.now());

  // Debounce Refs
  const lastRawGestureRef = useRef<GestureType>(GestureType.NONE);
  const confirmedGestureRef = useRef<GestureType>(GestureType.NONE);
  const lastGestureTimeRef = useRef<number>(0);
  const STABILITY_THRESHOLD_MS = 150;

  // Setup Camera Stream
  const initCamera = useCallback(async () => {
    try {
      setCameraError(null);

      // Stop existing stream tracks
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('WebRTC Camera API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facingMode,
        },
        audio: false,
      });

      setActiveStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => {
            if (e.name !== 'AbortError') console.error('Play error:', e);
          });
          onCameraReady();
        };
      }
    } catch (err: unknown) {
      console.error('Camera initialization error:', err);
      const msg = err instanceof Error ? err.message : 'Camera permission denied or camera device not found.';
      setCameraError(msg);
    }
  }, [facingMode, onCameraReady]);

  // Trigger camera setup on mount or facingMode switch
  useEffect(() => {
    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Sync to preview video
  useEffect(() => {
    if (activeStream && previewVideoRef.current) {
      if (previewVideoRef.current.srcObject !== activeStream) {
        previewVideoRef.current.srcObject = activeStream;
        previewVideoRef.current.play().catch((e) => {
          if (e.name !== 'AbortError') console.error('Preview error:', e);
        });
      }
    }
  }, [activeStream]);

  // Draw hand skeleton landmarks on canvas
  const drawLandmarks = (
    keypoints: HandKeypoint[],
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    if (!showLandmarks || !keypoints || keypoints.length < 21) return;

    // Theme color palette for skeleton lines
    const strokeColors: Record<BulbColorTheme, string> = {
      amber: '#F59E0B',
      cyan: '#06B6D4',
      emerald: '#10B981',
      crimson: '#F43F5E',
      violet: '#A855F7',
    };
    const themeColor = strokeColors[colorTheme] || '#06B6D4';

    // Draw connecting bones
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 6;
    ctx.shadowColor = themeColor;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = keypoints[startIdx];
      const p2 = keypoints[endIdx];
      if (p1 && p2) {
        // Video is mirrored horizontally, so mirror x coordinates on preview canvas
        const x1 = width - (p1.x / 640) * width;
        const y1 = (p1.y / 480) * height;
        const x2 = width - (p2.x / 640) * width;
        const y2 = (p2.y / 480) * height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }

    // Draw keypoint joint nodes
    for (let i = 0; i < keypoints.length; i++) {
      const p = keypoints[i];
      const x = width - (p.x / 640) * width;
      const y = (p.y / 480) * height;

      ctx.beginPath();
      // Fingertips are larger glowing nodes
      const isTip = [4, 8, 12, 16, 20].includes(i);
      ctx.arc(x, y, isTip ? 4 : 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? '#FFFFFF' : themeColor;
      ctx.shadowColor = isTip ? '#FFFFFF' : themeColor;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
  };

  // Detection loop
  const detect = useCallback(async () => {
    if (!model || !videoRef.current || !activeStream) return;

    if (videoRef.current.readyState === 4) {
      const startTime = performance.now();

      try {
        const hands = (await model.estimateHands(videoRef.current, {
          flipHorizontal: false,
        })) as { keypoints: HandKeypoint[]; score: number }[];

        const latency = Math.round(performance.now() - startTime);

        // Update FPS counter
        frameCountRef.current += 1;
        const now = Date.now();
        if (now - lastFpsTimeRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
          setStats((prev) => ({ ...prev, fps, latencyMs: latency }));
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');

        if (hands && hands.length > 0) {
          const hand = hands[0];
          const keypoints = hand.keypoints;
          const { gesture, telemetry: currentTelemetry, confidence } = analyzeGesture(keypoints);

          setTelemetry(currentTelemetry);
          setStats((prev) => ({
            ...prev,
            handDetected: true,
            score: Math.round((hand.score || confidence) * 100),
            latencyMs: latency,
          }));

          if (ctx && canvas) {
            drawLandmarks(keypoints, ctx, canvas.width, canvas.height);
          }

          // Debounce logic
          if (gesture === lastRawGestureRef.current) {
            const duration = now - lastGestureTimeRef.current;
            if (duration > STABILITY_THRESHOLD_MS) {
              if (gesture !== confirmedGestureRef.current) {
                confirmedGestureRef.current = gesture;
                onGesture(gesture);
              }
            }
          } else {
            lastRawGestureRef.current = gesture;
            lastGestureTimeRef.current = now;
          }
        } else {
          // No hands detected
          setStats((prev) => ({ ...prev, handDetected: false, score: 0 }));
          setTelemetry(null);

          if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          const currentRawGesture = GestureType.NONE;
          if (currentRawGesture === lastRawGestureRef.current) {
            if (now - lastGestureTimeRef.current > STABILITY_THRESHOLD_MS) {
              if (currentRawGesture !== confirmedGestureRef.current) {
                confirmedGestureRef.current = currentRawGesture;
                onGesture(currentRawGesture);
              }
            }
          } else {
            lastRawGestureRef.current = currentRawGesture;
            lastGestureTimeRef.current = now;
          }
        }
      } catch (err) {
        console.warn('Detection cycle error:', err);
      }
    }

    requestRef.current = requestAnimationFrame(detect);
  }, [model, activeStream, onGesture, colorTheme, showLandmarks]);

  useEffect(() => {
    if (model && activeStream) {
      requestRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [model, activeStream, detect]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const isLoading = isModelLoading || !activeStream;
  const currentError = modelError || cameraError;

  return (
    <aside
      aria-label="Gesture recognition and camera preview controls"
      className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-40 transition-all select-none"
    >
      {/* Hidden processing video */}
      <video ref={videoRef} className="hidden" playsInline muted width="640" height="480" />

      {/* Metallic Cyber HUD Frame */}
      <div
        className={`relative bg-[#070707] border border-[#2b2b2b] shadow-[0_12px_36px_rgba(0,0,0,0.9)] transition-all duration-300 ${
          isMinimized ? 'w-48' : 'w-44 sm:w-56 md:w-64 lg:w-72'
        }`}
      >
        {/* Frame Top Header Bar */}
        <div className="bg-[#111111] px-2 py-1.5 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                stats.handDetected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : activeStream
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`}
            ></span>
            <span className="text-[9px] md:text-[10px] font-mono uppercase font-bold tracking-wider text-gray-300">
              Sensor Feed
            </span>
          </div>

          <div className="flex items-center space-x-1 text-gray-400">
            {onToggleLandmarks && !isMinimized && (
              <button
                onClick={onToggleLandmarks}
                className="p-1 hover:text-white hover:bg-[#222] rounded transition-colors"
                title={showLandmarks ? 'Hide skeleton overlay' : 'Show skeleton overlay'}
              >
                {showLandmarks ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            )}
            <button
              onClick={toggleCameraFacing}
              className="p-1 hover:text-white hover:bg-[#222] rounded transition-colors"
              title="Flip camera"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 hover:text-white hover:bg-[#222] rounded transition-colors"
              title={isMinimized ? 'Expand feed' : 'Minimize feed'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Video & Skeleton Canvas Body */}
        {!isMinimized && (
          <div className="relative bg-black w-full aspect-[4/3] overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0a]/90 p-3 text-center">
                <div className="w-5 h-5 border-2 border-[#555] border-t-white rounded-full animate-spin mb-2"></div>
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-300 font-mono">
                  {progressText}
                </p>
              </div>
            )}

            {currentError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-rose-950/80 p-3 text-center text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-400 mb-1" />
                <p className="text-[9px] uppercase tracking-wider font-bold mb-1">Feed Offline</p>
                <p className="text-[8px] opacity-80 leading-tight mb-2">{currentError}</p>
                <button
                  onClick={initCamera}
                  className="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 text-white text-[8px] uppercase tracking-wider rounded font-mono"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Video preview feed (mirrored horizontally) */}
            <video
              ref={previewVideoRef}
              className="w-full h-full object-cover transform scale-x-[-1] opacity-75 grayscale hover:grayscale-0 transition-all duration-300"
              playsInline
              muted
            />

            {/* Skeleton Overlay Canvas */}
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Reticle / Crosshair grid lines */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 flex items-center justify-center">
              <div className="w-8 h-8 border border-white/10 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Frame Bottom Telemetry HUD */}
        <div className="px-2 py-1.5 bg-[#0a0a0a] border-t border-[#1a1a1a] flex flex-col space-y-1">
          <div className="flex justify-between items-center text-[8px] md:text-[9px] font-mono text-gray-400">
            <span className="flex items-center space-x-1">
              <span className="text-gray-500">FPS:</span>
              <span className="text-gray-200">{stats.fps || '--'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="text-gray-500">LAT:</span>
              <span className="text-gray-200">{stats.latencyMs}ms</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="text-gray-500">CONF:</span>
              <span className={stats.handDetected ? 'text-emerald-400 font-bold' : 'text-gray-600'}>
                {stats.handDetected ? `${stats.score}%` : 'OFF'}
              </span>
            </span>
          </div>

          {/* Real-time 4-Finger Telemetry Radar */}
          {telemetry && (
            <div className="pt-1 border-t border-[#1a1a1a] grid grid-cols-4 gap-1 text-[7px] font-mono text-center">
              <div className={telemetry.index.isExtended ? 'text-emerald-400' : 'text-gray-600'}>
                IDX: {telemetry.index.isExtended ? 'EXT' : 'CURL'}
              </div>
              <div className={telemetry.middle.isExtended ? 'text-emerald-400' : 'text-gray-600'}>
                MID: {telemetry.middle.isExtended ? 'EXT' : 'CURL'}
              </div>
              <div className={telemetry.ring.isExtended ? 'text-emerald-400' : 'text-gray-600'}>
                RNG: {telemetry.ring.isExtended ? 'EXT' : 'CURL'}
              </div>
              <div className={telemetry.pinky.isExtended ? 'text-emerald-400' : 'text-gray-600'}>
                PNK: {telemetry.pinky.isExtended ? 'EXT' : 'CURL'}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
