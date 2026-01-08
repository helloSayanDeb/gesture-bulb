import React, { useState, useCallback, useEffect } from 'react';
import { LightBulb } from './components/LightBulb';
import { HandController } from './components/HandController';
import { Instructions } from './components/Instructions';
import { GestureType } from './types';

function App() {
  const [isBulbOn, setIsBulbOn] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.NONE);

  const handleGesture = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);
    if (gesture === GestureType.OPEN_HAND) {
      setIsBulbOn(true);
    } else if (gesture === GestureType.CLOSED_FIST) {
      setIsBulbOn(false);
    }
  }, []);

  // Memoize this function so HandController props don't change on every render
  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  // Global Keyboard Listener for Accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsBulbOn(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getGestureLabel = (gesture: GestureType) => {
    switch(gesture) {
      case GestureType.OPEN_HAND: return { text: 'OPEN HAND', color: 'text-white' };
      case GestureType.CLOSED_FIST: return { text: 'CLOSED FIST', color: 'text-white' };
      default: return { text: 'WAITING...', color: 'text-gray-500' };
    }
  };

  const gestureInfo = getGestureLabel(currentGesture);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex flex-col">
      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-30 pointer-events-none">
        <div>
           <h1 className="text-4xl font-bold text-white tracking-tighter uppercase font-[Syne]">
             Gesture<span className="text-gray-500">Lite</span>
           </h1>
           <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.2em] font-semibold border-l-2 border-gray-800 pl-3">
             TensorFlow.js • MediaPipe
           </p>
        </div>

        <div className="flex flex-col items-end space-y-2 pointer-events-auto">
           {/* Metallic Card Component */}
           <div className="bg-[#050505] border-l border-t border-[#333] border-r border-b border-black p-4 w-64 metallic-sheen">
             <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Detected Gesture</div>
             <div className={`text-xl font-[Syne] font-bold ${gestureInfo.color} flex items-center justify-between`}>
                <span>{gestureInfo.text}</span>
                <span className={`w-3 h-3 ${currentGesture !== GestureType.NONE ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-[#111] border border-[#333]'}`}></span>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow relative z-10 flex items-center justify-center">
        {/* Subtle grid background for tech feel */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{
               backgroundImage: `linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }}
        ></div>
        
        <LightBulb isOn={isBulbOn} />
      </main>

      {/* Logic & Controllers */}
      <HandController 
        onGesture={handleGesture} 
        onCameraReady={handleCameraReady}
      />

      {/* Modals */}
      {showInstructions && (
        <Instructions onDismiss={() => setShowInstructions(false)} />
      )}

      {/* Keyboard Accessibility Hint */}
      <div className="absolute bottom-6 left-8 text-gray-600 text-[10px] uppercase tracking-widest opacity-50 z-20 font-bold">
        [Spacebar] Manual Override
      </div>
    </div>
  );
}

export default App;