'use client';

import React, { useState } from 'react';
import { X, Hand, ShieldAlert, Sparkles, Volume2, Keyboard, Check } from 'lucide-react';
import { soundService } from '../services/soundService';

interface InstructionsModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onDismiss }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      try {
        localStorage.setItem('gesture-bulb-hide-instructions', 'true');
      } catch {
        // Ignore localStorage errors
      }
    }
    onDismiss();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
    >
      {/* Metallic Cyber Card */}
      <div className="bg-[#050505] text-white max-w-lg w-full p-[1px] relative border border-[#2b2b2b] shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
        {/* Inner Content Container */}
        <div className="bg-[#0a0a0a] p-5 sm:p-7 md:p-8 relative">
          {/* Close Icon */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-500 hover:text-white p-1 rounded hover:bg-[#1a1a1a] transition-all"
            aria-label="Close instructions modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading */}
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
              Neural Vision Protocol
            </span>
          </div>
          <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold mb-1 text-white tracking-tight uppercase font-[Syne]">
            System Control
          </h2>
          <p className="text-gray-500 mb-6 text-xs sm:text-sm tracking-wide font-mono">
            INITIALIZE AI GESTURE RECOGNITION INTERFACE
          </p>

          {/* Gesture Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Gesture 1: Open Hand */}
            <div className="bg-[#0d0d0d] p-4 border border-[#1e1e1e] hover:border-amber-400/50 transition-colors group flex items-center sm:items-start gap-4 sm:flex-col">
              <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ✋
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  Power ON
                </span>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-0.5 mb-1 font-[Syne]">
                  Engage Light
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">GESTURE: OPEN HAND</p>
                <p className="text-[10px] text-gray-600 mt-1">Extend all 4 fingers towards the webcam.</p>
              </div>
            </div>

            {/* Gesture 2: Closed Fist */}
            <div className="bg-[#0d0d0d] p-4 border border-[#1e1e1e] hover:border-rose-400/50 transition-colors group flex items-center sm:items-start gap-4 sm:flex-col">
              <div className="w-12 h-12 rounded-lg bg-rose-400/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                ✊
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-rose-400 font-bold tracking-wider">
                  Power OFF
                </span>
                <h3 className="font-bold text-white uppercase tracking-wider text-sm mt-0.5 mb-1 font-[Syne]">
                  Disengage Light
                </h3>
                <p className="text-[11px] text-gray-400 font-mono">GESTURE: CLOSED FIST</p>
                <p className="text-[10px] text-gray-600 mt-1">Curl fingers inward into a tight fist.</p>
              </div>
            </div>
          </div>

          {/* Quick Keys Strip */}
          <div className="bg-[#080808] border border-[#1a1a1a] p-3 mb-6 flex flex-col space-y-1.5">
            <div className="flex items-center space-x-1.5 text-gray-400 text-[10px] font-mono uppercase tracking-wider">
              <Keyboard className="w-3.5 h-3.5 text-gray-500" />
              <span>Keyboard & Interactive Controls</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-gray-300">
              <span className="px-1.5 py-0.5 bg-[#141414] border border-[#2a2a2a] rounded">
                <kbd className="text-amber-400">Space</kbd> Manual Switch
              </span>
              <span className="px-1.5 py-0.5 bg-[#141414] border border-[#2a2a2a] rounded">
                <kbd className="text-amber-400">T</kbd> Color Theme
              </span>
              <span className="px-1.5 py-0.5 bg-[#141414] border border-[#2a2a2a] rounded">
                <kbd className="text-amber-400">M</kbd> Mute Sound
              </span>
              <span className="px-1.5 py-0.5 bg-[#141414] border border-[#2a2a2a] rounded">
                <kbd className="text-amber-400">L</kbd> Skeleton HUD
              </span>
            </div>
          </div>

          {/* Preferences and Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-[#161616]">
            <label className="group flex items-center space-x-2.5 cursor-pointer select-none py-1">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => {
                    setDontShowAgain(e.target.checked);
                    soundService.playUiTick();
                  }}
                  className="sr-only peer"
                />
                {/* Custom Cyberpunk Checkbox Box */}
                <div
                  className={`w-4 h-4 rounded-[3px] border transition-all duration-200 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-black ${
                    dontShowAgain
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                      : 'bg-[#121212] border-[#383838] group-hover:border-amber-500/60 group-hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Check
                    className={`w-3 h-3 text-black stroke-[3] transition-all duration-200 ${
                      dontShowAgain
                        ? 'scale-100 opacity-100'
                        : 'scale-0 opacity-0'
                    }`}
                  />
                </div>
              </div>
              <span
                className={`text-[11px] font-mono tracking-wide transition-colors ${
                  dontShowAgain ? 'text-gray-200' : 'text-gray-400 group-hover:text-gray-300'
                }`}
              >
                Do not show automatically at startup
              </span>
            </label>

            <button
              onClick={handleClose}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-2.5 px-6 uppercase tracking-[0.2em] text-[11px] font-mono border border-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] metallic-sheen transition-all active:translate-y-[1px]"
            >
              Initialize System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
