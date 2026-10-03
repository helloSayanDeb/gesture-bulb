'use client';

import { useState, useEffect, useRef } from 'react';

export interface HandDetectorInstance {
  estimateHands: (video: HTMLVideoElement, config?: { flipHorizontal?: boolean }) => Promise<unknown[]>;
}

const SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.10.0/dist/tf-core.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.10.0/dist/tf-backend-webgl.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.10.0/dist/tf-converter.min.js',
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection@2.0.1/dist/hand-pose-detection.min.js',
];

const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Preserve execution order
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

export function useHandPoseModel() {
  const [model, setModel] = useState<HandDetectorInstance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState<string>('Initializing runtime...');
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    let isMounted = true;

    const initDetector = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load scripts sequentially
        for (let i = 0; i < SCRIPTS.length; i++) {
          const script = SCRIPTS[i];
          const scriptName = script.split('/').slice(-2).join('/');
          setProgressText(`Loading neural libraries (${i + 1}/${SCRIPTS.length}): ${scriptName}`);
          await loadScript(script);
        }

        const win = window as unknown as {
          tf?: { ready: () => Promise<void> };
          handPoseDetection?: {
            SupportedModels: { MediaPipeHands: string };
            createDetector: (model: string, config: unknown) => Promise<HandDetectorInstance>;
          };
        };

        if (!win.tf || !win.handPoseDetection) {
          throw new Error('TensorFlow.js or HandPoseDetection global was not found after loading scripts.');
        }

        setProgressText('Warming up WebGL GPU backend...');
        await win.tf.ready();

        setProgressText('Compiling MediaPipe Hands neural model...');
        const detector = await win.handPoseDetection.createDetector(
          win.handPoseDetection.SupportedModels.MediaPipeHands,
          {
            runtime: 'tfjs',
            modelType: 'lite',
            maxHands: 1,
          }
        );

        if (isMounted) {
          setModel(detector);
          setIsLoading(false);
          setProgressText('Model ready');
        }
      } catch (err: unknown) {
        console.error('Error initializing HandPose detector:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize hand detection model.');
          setIsLoading(false);
        }
      }
    };

    initDetector();

    return () => {
      isMounted = false;
    };
  }, []);

  return { model, isLoading, error, progressText };
}
