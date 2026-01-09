import React, { useEffect, useRef, useState, useCallback } from 'react';
import { detectGesture } from '../services/gestureService';
import { GestureType, HandKeypoint } from '../types';

// Define minimal types locally since we aren't importing the package
interface HandDetector {
  estimateHands: (video: HTMLVideoElement, config?: any) => Promise<any[]>;
}

interface HandControllerProps {
  onGesture: (gesture: GestureType) => void;
  onCameraReady: () => void;
}

export const HandController: React.FC<HandControllerProps> = ({ onGesture, onCameraReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const [model, setModel] = useState<HandDetector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  
  const requestRef = useRef<number>(0);
  
  // Debounce Refs
  const lastRawGestureRef = useRef<GestureType>(GestureType.NONE); // The gesture detected in the current frame
  const confirmedGestureRef = useRef<GestureType>(GestureType.NONE); // The last gesture successfully sent to the app
  const lastGestureTimeRef = useRef<number>(0); // Timestamp when the raw gesture started
  
  // Config
  const STABILITY_THRESHOLD_MS = 150; // Gesture must be held this long to register

  // Initialize TensorFlow and Model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        
        // Access globals attached to window
        const tf = (window as any).tf;
        const handPoseDetection = (window as any).handPoseDetection;

        if (!tf || !handPoseDetection) {
           throw new Error("TensorFlow or HandPoseDetection libraries not loaded.");
        }

        // Ensure backend is ready
        await tf.ready();
        
        const modelObj = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
          runtime: 'tfjs',
          modelType: 'lite',
          maxHands: 1,
        }; 
        
        const detector = await handPoseDetection.createDetector(modelObj, detectorConfig);
        setModel(detector);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load model", err);
        setError("Failed to load hand detection model. Please refresh.");
        setIsLoading(false);
      }
    };

    // Give the scripts a moment to parse if they haven't already
    if ((window as any).tf) {
        loadModel();
    } else {
        window.addEventListener('load', loadModel);
        return () => window.removeEventListener('load', loadModel);
    }
  }, []);

  // Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const setupCamera = async () => {
      if (!videoRef.current) return;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
          audio: false,
        });

        // Update state with the new stream
        setActiveStream(stream);

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Wait for metadata to load to ensure dimensions are correct
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(e => {
                  if (e.name !== 'AbortError') console.error("Play error:", e);
                });
                onCameraReady();
            };
        }
      } catch (err) {
        console.error("Camera error", err);
        setError("Camera permission denied or not available.");
      }
    };

    setupCamera();

    return () => {
      // Cleanup stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setActiveStream(null);
    };
  }, [onCameraReady]);

  // Sync Preview Video
  // We use activeStream state as dependency to ensure preview updates if stream changes
  useEffect(() => {
    if (activeStream && previewVideoRef.current) {
       // Only update if it's different to prevent video flickering
       if (previewVideoRef.current.srcObject !== activeStream) {
           previewVideoRef.current.srcObject = activeStream;
           previewVideoRef.current.play().catch(e => {
             if (e.name !== 'AbortError') console.error("Preview play error:", e);
           });
       }
    }
  }, [activeStream]);

  // Detection Loop
  const detect = useCallback(async () => {
    if (!model || !videoRef.current || !activeStream) return;

    if (videoRef.current.readyState === 4) {
      try {
        const hands = await model.estimateHands(videoRef.current, { flipHorizontal: true });
        
        if (hands && hands.length > 0) {
          const keypoints = hands[0].keypoints as HandKeypoint[];
          const currentRawGesture = detectGesture(keypoints);
          
          const now = Date.now();

          // Debounce Logic
          if (currentRawGesture === lastRawGestureRef.current) {
            // The gesture is consistent with the previous frame
            const duration = now - lastGestureTimeRef.current;
            
            if (duration > STABILITY_THRESHOLD_MS) {
                // The gesture has been held long enough to be considered stable
                
                // Only trigger update if it's different from the last CONFIRMED gesture
                // This prevents firing the callback repeatedly for the same state
                if (currentRawGesture !== confirmedGestureRef.current) {
                    confirmedGestureRef.current = currentRawGesture;
                    onGesture(currentRawGesture);
                }
            }
          } else {
            // The gesture changed since the last frame
            // Reset the timer and update the raw reference
            lastRawGestureRef.current = currentRawGesture;
            lastGestureTimeRef.current = now;
          }

        } else {
            // No hands detected
            // Treat as NONE, but apply same debounce logic so we don't flicker if hand is lost for 1 frame
            const currentRawGesture = GestureType.NONE;
            const now = Date.now();
            
            if (currentRawGesture === lastRawGestureRef.current) {
                if (now - lastGestureTimeRef.current > STABILITY_THRESHOLD_MS) {
                     // We don't necessarily want to trigger 'NONE' actions (unless we want to pause?)
                     // But we should update our confirmed state so we know we aren't in a gesture.
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
        console.warn("Detection error", err);
      }
    }

    requestRef.current = requestAnimationFrame(detect);
  }, [model, activeStream, onGesture]);

  useEffect(() => {
    if (model && activeStream) {
      requestRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [model, activeStream, detect]);

  return (
    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-40">
      {/* Hidden Video Element for Processing */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        width="640"
        height="480"
      />

      {/* Preview UI - Metallic Frame - Responsive Sizing - INCREASED SIZE */}
      <div className="relative bg-[#050505] p-1 border-l border-t border-[#333] border-r border-b border-black shadow-2xl w-32 md:w-48 lg:w-64 transition-all hover:border-[#555]">
        <div className="relative bg-black w-full overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] text-[10px] uppercase tracking-widest text-center p-2 text-gray-500 font-bold">
                    Initializing AI
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 text-[10px] text-center p-2 text-red-500 font-bold uppercase">
                    {error}
                </div>
            )}
            
            {/* We mirror the video for natural interaction */}
            {activeStream && (
                <video
                    ref={previewVideoRef}
                    className="w-full h-auto transform scale-x-[-1] opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
                    playsInline
                    muted
                />
            )}
        </div>
        
        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 flex space-x-0.5">
             <div className="w-1 h-1 bg-[#333]"></div>
             <div className="w-1 h-1 bg-[#333]"></div>
             <div className={`w-1 h-1 ${activeStream ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
        
        <div className="mt-2 flex justify-between items-center px-1 pb-1">
             <span className="text-[7px] md:text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                Sensor Feed
             </span>
             <span className="text-[7px] md:text-[9px] text-[#333] font-mono">
                {isLoading ? '...' : 'LIVE'}
             </span>
        </div>
      </div>
    </div>
  );
};