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
  const [model, setModel] = useState<HandDetector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const requestRef = useRef<number>(0);
  const lastGestureRef = useRef<GestureType>(GestureType.NONE);
  const lastGestureTimeRef = useRef<number>(0);

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

    // Give the scripts a moment to parse if they haven't already (though they are blocking in head)
    if ((window as any).tf) {
        loadModel();
    } else {
        window.addEventListener('load', loadModel);
        return () => window.removeEventListener('load', loadModel);
    }
  }, []);

  // Initialize Camera
  useEffect(() => {
    const setupCamera = async () => {
      if (!videoRef.current) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Wait for metadata to load to ensure dimensions are correct
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play().catch(e => console.error("Play error:", e));
                setPermissionGranted(true);
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
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCameraReady]);

  // Detection Loop
  const detect = useCallback(async () => {
    if (!model || !videoRef.current || !permissionGranted) return;

    if (videoRef.current.readyState === 4) {
      try {
        const hands = await model.estimateHands(videoRef.current, { flipHorizontal: true });
        
        if (hands && hands.length > 0) {
          const keypoints = hands[0].keypoints as HandKeypoint[];
          const gesture = detectGesture(keypoints);
          
          // Simple debouncing / persistence check
          const now = Date.now();
          if (gesture !== GestureType.NONE) {
            if (gesture === lastGestureRef.current) {
                // If same gesture held for > 300ms, trigger
                if (now - lastGestureTimeRef.current > 300) {
                     onGesture(gesture);
                }
            } else {
                // New gesture detected, reset timer
                lastGestureRef.current = gesture;
                lastGestureTimeRef.current = now;
            }
          } else {
              // Reset if no gesture
              lastGestureRef.current = GestureType.NONE;
          }
        }
      } catch (err) {
        console.warn("Detection error", err);
      }
    }

    requestRef.current = requestAnimationFrame(detect);
  }, [model, permissionGranted, onGesture]);

  useEffect(() => {
    if (model && permissionGranted) {
      requestRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [model, permissionGranted, detect]);

  return (
    <div className="absolute bottom-4 right-4 z-40">
      {/* Hidden Video Element for Processing */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        width="640"
        height="480"
      />

      {/* Preview UI */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 shadow-xl w-32 md:w-48 transition-all hover:scale-105">
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-xs text-center p-2 text-gray-400">
                Loading AI...
            </div>
        )}
        {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-xs text-center p-2 text-white">
                {error}
            </div>
        )}
        
        {/* We mirror the video for natural interaction */}
        {permissionGranted && (
             <video
                ref={(node) => {
                    // This is a bit of a hack to mirror the stream to a visible video element
                    // since the original ref is hidden for processing.
                    // In a real app we might use a canvas to draw the output.
                    if (node && videoRef.current) {
                        node.srcObject = videoRef.current.srcObject;
                        node.play();
                    }
                }}
                className="w-full h-auto transform scale-x-[-1]"
                playsInline
                muted
             />
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1">
             <div className="flex items-center justify-center space-x-1">
                 <div className={`w-2 h-2 rounded-full ${permissionGranted ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <span className="text-[10px] text-gray-300 font-medium">
                    {isLoading ? 'Init Model...' : permissionGranted ? 'Active' : 'No Camera'}
                 </span>
             </div>
        </div>
      </div>
    </div>
  );
};