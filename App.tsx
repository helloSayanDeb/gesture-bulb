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
    if (gesture === GestureType.INDEX_UP) {
      setIsBulbOn(true);
    } else if (gesture === GestureType.OK_SIGN) {
      setIsBulbOn(false);
    }
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
      case GestureType.INDEX_UP: return { text: 'Index Up', color: 'text-green-400' };
      case GestureType.OK_SIGN: return { text: 'OK Sign', color: 'text-blue-400' };
      default: return { text: 'None', color: 'text-gray-500' };
    }
  };

  const gestureInfo = getGestureLabel(currentGesture);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#2c3e50] to-[#34495e] flex flex-col">
      {/* Header / Status Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-30 pointer-events-none">
        <div>
           <h1 className="text-xl font-bold text-gray-200 tracking-wider">GESTURE<span className="text-yellow-400">LITE</span></h1>
           <p className="text-xs text-gray-400 mt-1">TensorFlow.js • MediaPipe</p>
        </div>

        <div className="flex flex-col items-end space-y-2">
           <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 shadow-lg">
             <div className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Detected Gesture</div>
             <div className={`text-lg font-mono font-bold ${gestureInfo.color} flex items-center space-x-2`}>
                <span className={`w-2 h-2 rounded-full ${currentGesture !== GestureType.NONE ? 'bg-current animate-ping' : 'bg-gray-600'}`}></span>
                <span>{gestureInfo.text}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow relative z-10">
        <LightBulb isOn={isBulbOn} />
      </main>

      {/* Logic & Controllers */}
      <HandController 
        onGesture={handleGesture} 
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Modals */}
      {showInstructions && (
        <Instructions onDismiss={() => setShowInstructions(false)} />
      )}

      {/* Keyboard Accessibility Hint */}
      <div className="absolute bottom-4 left-6 text-gray-500 text-xs opacity-50 z-20">
        Spacebar also toggles light (for accessibility)
      </div>
    </div>
  );
}

export default App;