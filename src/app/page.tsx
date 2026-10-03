'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { LightBulb } from '../components/LightBulb';
import { HandController } from '../components/HandController';
import { InstructionsModal } from '../components/InstructionsModal';
import { ControlToolbar } from '../components/ControlToolbar';
import { GestureType, BulbColorTheme } from '../types';
import { soundService } from '../services/soundService';
import { Cpu, Eye, Radio, Sparkles } from 'lucide-react';

export default function Home() {
  const [isBulbOn, setIsBulbOn] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [currentGesture, setCurrentGesture] = useState<GestureType>(GestureType.NONE);
  const [colorTheme, setColorTheme] = useState<BulbColorTheme>('amber');
  const [brightness, setBrightness] = useState<number>(100);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Check saved startup modal preferences
  useEffect(() => {
    try {
      const hidePref = localStorage.getItem('gesture-bulb-hide-instructions');
      if (!hidePref) {
        setShowInstructions(true);
      }
    } catch {
      setShowInstructions(true);
    }
  }, []);

  // Handle gestures dispatched from HandController
  const handleGesture = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);

    if (gesture === GestureType.OPEN_HAND) {
      setIsBulbOn((prev) => {
        if (!prev) {
          soundService.playRelayClick(true);
          return true;
        }
        return prev;
      });
    } else if (gesture === GestureType.CLOSED_FIST) {
      setIsBulbOn((prev) => {
        if (prev) {
          soundService.playRelayClick(false);
          return false;
        }
        return prev;
      });
    }
  }, []);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
  }, []);

  const handleToggleManual = useCallback(() => {
    setIsBulbOn((prev) => {
      const nextState = !prev;
      soundService.playRelayClick(nextState);
      return nextState;
    });
  }, []);

  const cycleTheme = useCallback(() => {
    const themeList: BulbColorTheme[] = ['amber', 'cyan', 'emerald', 'crimson', 'violet'];
    setColorTheme((prev) => {
      const nextIdx = (themeList.indexOf(prev) + 1) % themeList.length;
      return themeList[nextIdx];
    });
    soundService.playUiTick();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundService.setMuted(next);
      return next;
    });
  }, []);

  // Global Keyboard Listener for Accessibility & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing if user is in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleManual();
      } else if (e.code === 'KeyT') {
        cycleTheme();
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyL') {
        setShowLandmarks((prev) => !prev);
      } else if (e.code === 'KeyH') {
        setShowInstructions((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleManual, cycleTheme, toggleMute]);

  // Label and styling for the current gesture HUD
  const getGestureInfo = (gesture: GestureType) => {
    switch (gesture) {
      case GestureType.OPEN_HAND:
        return {
          text: 'OPEN HAND',
          status: 'LIGHT ENERGIZED',
          color: 'text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_12px_#fbbf24]',
          icon: '✋',
        };
      case GestureType.CLOSED_FIST:
        return {
          text: 'CLOSED FIST',
          status: 'LIGHT DISENGAGED',
          color: 'text-rose-400',
          dot: 'bg-rose-400 shadow-[0_0_12px_#f43f5e]',
          icon: '✊',
        };
      default:
        return {
          text: 'WAITING...',
          status: 'SCANNING FOR GESTURE',
          color: 'text-gray-500',
          dot: 'bg-[#222] border border-[#444]',
          icon: '⚡',
        };
    }
  };

  const gestureInfo = getGestureInfo(currentGesture);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030303] flex flex-col select-none">
      {/* Dynamic Cyber Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-15 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundImage: `linear-gradient(#252525 1px, transparent 1px), linear-gradient(90deg, #252525 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: isBulbOn ? 0.22 : 0.1,
        }}
      ></div>

      {/* Radial vignette mask */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#000000_90%)]"></div>

      {/* Header / Top Status Bar */}
      <header className="relative w-full p-4 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-start gap-4 z-30 shrink-0 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tighter uppercase font-[Syne]">
              Gesture<span className="text-amber-400">Lite</span>
            </h1>
            <span className="px-1.5 py-0.5 bg-[#161616] border border-[#333] text-[9px] font-mono text-gray-400 uppercase tracking-widest rounded">
              Next.js 16
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-1.5 md:mt-2">
            <p className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-[0.2em] font-mono font-semibold border-l-2 border-amber-500/70 pl-2.5">
              TensorFlow.js • MediaPipe Hands • WebGL
            </p>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                cameraReady ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            ></span>
          </div>
        </div>

        {/* Top Right Detected Gesture HUD Card */}
        <div className="flex flex-col items-start md:items-end space-y-2 pointer-events-auto w-full md:w-auto">
          <div className="bg-[#070707]/90 backdrop-blur-md border border-[#2b2b2b] p-3 md:p-4 w-full md:w-72 metallic-sheen shadow-2xl transition-all">
            <div className="flex items-center justify-between text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-mono font-bold">
              <span>Detected Gesture</span>
              <span className="text-gray-500 font-normal">{gestureInfo.status}</span>
            </div>

            <div className="text-lg md:text-xl font-[Syne] font-bold flex items-center justify-between mt-1">
              <span className={`flex items-center space-x-2 ${gestureInfo.color}`}>
                <span className="text-base">{gestureInfo.icon}</span>
                <span>{gestureInfo.text}</span>
              </span>
              <span className={`w-2.5 h-2.5 rounded-full transition-all ${gestureInfo.dot}`}></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Center Stage for Bulb */}
      <main className="flex-grow relative z-10 flex items-start justify-center overflow-hidden">
        <LightBulb
          isOn={isBulbOn}
          colorTheme={colorTheme}
          brightness={brightness}
          onToggleManual={handleToggleManual}
        />
      </main>

      {/* Bottom Left Dock - Controls & Tools */}
      <ControlToolbar
        isBulbOn={isBulbOn}
        onToggleBulb={handleToggleManual}
        colorTheme={colorTheme}
        onChangeColorTheme={(t) => setColorTheme(t)}
        brightness={brightness}
        onChangeBrightness={(b) => setBrightness(b)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHelp={() => setShowInstructions(true)}
      />

      {/* Bottom Right Dock - Sensor Camera Feed & Skeleton HUD */}
      <HandController
        onGesture={handleGesture}
        onCameraReady={handleCameraReady}
        colorTheme={colorTheme}
        showLandmarks={showLandmarks}
        onToggleLandmarks={() => setShowLandmarks((prev) => !prev)}
      />

      {/* Interactive Instructions Modal */}
      <InstructionsModal
        isOpen={showInstructions}
        onDismiss={() => setShowInstructions(false)}
      />

      {/* Keyboard Accessibility Hint in Center Bottom */}
      <div className="absolute bottom-3 md:bottom-6 left-1/2 transform -translate-x-1/2 text-gray-600 text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] opacity-60 z-20 pointer-events-none hidden lg:block">
        [Space] Toggle Lamp • [T] Color Theme • [L] Skeleton HUD • [M] Mute Sound • [H] Guide
      </div>
    </div>
  );
}
