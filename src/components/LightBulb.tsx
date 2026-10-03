'use client';

import React from 'react';
import { BulbColorTheme } from '../types';

interface LightBulbProps {
  isOn: boolean;
  colorTheme?: BulbColorTheme;
  brightness?: number; // 0 to 100
  onToggleManual?: () => void;
}

export const LightBulb: React.FC<LightBulbProps> = ({
  isOn,
  colorTheme = 'amber',
  brightness = 100,
  onToggleManual,
}) => {
  // Theme color definitions for filament, glass illumination, and ambient drop-shadows
  const themeStyles = {
    amber: {
      glassFill: '#FFFDE7',
      glassStroke: '#FFF59D',
      filament: '#FFB700',
      innerGlow: 'bg-amber-100',
      outerGlow: 'bg-yellow-400',
      castLight: 'bg-amber-300',
      dropShadow: 'drop-shadow-[0_0_50px_rgba(255,183,0,0.85)]',
      wireGlow: 'rgba(255, 183, 0, 0.4)',
      className: 'bulb-on-amber',
    },
    cyan: {
      glassFill: '#E0F7FA',
      glassStroke: '#80DEEA',
      filament: '#00E5FF',
      innerGlow: 'bg-cyan-100',
      outerGlow: 'bg-cyan-400',
      castLight: 'bg-cyan-300',
      dropShadow: 'drop-shadow-[0_0_50px_rgba(0,229,255,0.85)]',
      wireGlow: 'rgba(0, 229, 255, 0.4)',
      className: 'bulb-on-cyan',
    },
    emerald: {
      glassFill: '#E8F5E9',
      glassStroke: '#A5D6A7',
      filament: '#10B981',
      innerGlow: 'bg-emerald-100',
      outerGlow: 'bg-emerald-400',
      castLight: 'bg-emerald-300',
      dropShadow: 'drop-shadow-[0_0_50px_rgba(16,185,129,0.85)]',
      wireGlow: 'rgba(16, 185, 129, 0.4)',
      className: 'bulb-on-emerald',
    },
    crimson: {
      glassFill: '#FFE8EC',
      glassStroke: '#FDA4AF',
      filament: '#F43F5E',
      innerGlow: 'bg-rose-100',
      outerGlow: 'bg-rose-500',
      castLight: 'bg-rose-400',
      dropShadow: 'drop-shadow-[0_0_50px_rgba(244,63,94,0.85)]',
      wireGlow: 'rgba(244, 63, 94, 0.4)',
      className: 'bulb-on-crimson',
    },
    violet: {
      glassFill: '#F3E8FF',
      glassStroke: '#D8B4FE',
      filament: '#A855F7',
      innerGlow: 'bg-purple-100',
      outerGlow: 'bg-purple-500',
      castLight: 'bg-purple-400',
      dropShadow: 'drop-shadow-[0_0_50px_rgba(168,85,247,0.85)]',
      wireGlow: 'rgba(168, 85, 247, 0.4)',
      className: 'bulb-on-violet',
    },
  }[colorTheme];

  const brightnessScale = Math.max(0.2, brightness / 100);

  return (
    <div
      className="relative flex flex-col items-center justify-start h-full pt-0 transform transition-all duration-700 ease-in-out w-full select-none"
      onClick={onToggleManual}
      role="button"
      tabIndex={0}
      aria-label={`Light Bulb: ${isOn ? 'ON' : 'OFF'}. Click or press spacebar to toggle.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggleManual?.();
        }
      }}
      title="Click or pinch/spacebar to toggle lamp"
    >
      {/* Ceiling Mount Rosette */}
      <div className="w-16 h-2 bg-[#222] rounded-b-md border-b border-[#333] shadow-md z-20 flex justify-center items-center">
        <div className="w-3 h-1 bg-[#111] rounded-full"></div>
      </div>

      {/* Hanging Braided Wire - Responsive Height */}
      <div
        className="w-[2px] h-[7vh] sm:h-[14vh] md:h-[18vh] bg-[#2a2a2a] z-10 transition-all duration-500 relative"
        style={{
          boxShadow: isOn ? `0 0 10px ${themeStyles.wireGlow}` : 'none',
        }}
      >
        {/* Subtle wire weave lines */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_2px,transparent_2px,transparent_4px)]"></div>
      </div>

      {/* Industrial Socket - Metallic Brass/Gunmetal Multi-layer */}
      <div className="w-14 h-11 md:w-20 md:h-14 bg-gradient-to-b from-[#222] via-[#1a1a1a] to-[#111] z-20 flex flex-col items-center justify-end pb-1 border-t border-l border-[#3a3a3a] border-b border-r border-black shadow-[0_8px_16px_rgba(0,0,0,0.8)] rounded-t-sm transition-all duration-500 cursor-pointer group">
        {/* Socket cooling fins & thread rings */}
        <div className="w-12 h-1 md:w-16 md:h-1.5 bg-[#2f2f2f] mb-1 rounded-sm border-b border-[#111]"></div>
        <div className="w-12 h-1 md:w-16 md:h-1.5 bg-[#282828] mb-1 rounded-sm border-b border-[#111]"></div>
        <div className="w-12 h-1 md:w-16 md:h-1.5 bg-[#222222] rounded-sm border-b border-[#0a0a0a]"></div>
      </div>

      {/* The Bulb Container */}
      <div
        className={`relative -mt-1 transition-all duration-700 ease-in-out cursor-pointer hover:scale-105 active:scale-95 ${
          isOn ? themeStyles.className : ''
        }`}
        style={{
          opacity: isOn ? 1 : 0.65,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-700 ease-in-out w-36 h-36 md:w-[220px] md:h-[220px]"
        >
          <defs>
            {/* Ambient glass gradient when lamp is ON */}
            <radialGradient id="bulbOnGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor={themeStyles.glassFill} stopOpacity="0.85" />
              <stop offset="85%" stopColor={themeStyles.filament} stopOpacity="0.3" />
              <stop offset="100%" stopColor="#111111" stopOpacity="0.1" />
            </radialGradient>

            {/* Inactive glass gradient */}
            <radialGradient id="bulbOffGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#2c2c2c" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#151515" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
            </radialGradient>

            {/* Filament glow filter */}
            <filter id="filamentGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur1" />
              <feGaussianBlur stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Glass Bulb Body Outer Envelope */}
          <path
            d="M100 0C60 0 30 30 30 70C30 95 45 115 65 125L70 150H130L135 125C155 115 170 95 170 70C170 30 140 0 100 0Z"
            fill={isOn ? 'url(#bulbOnGrad)' : 'url(#bulbOffGrad)'}
            stroke={isOn ? themeStyles.glassStroke : '#333333'}
            strokeWidth={isOn ? 1.5 : 1}
            className="transition-all duration-700 ease-in-out"
          />

          {/* Internal Mount Stem Glass Flare */}
          <path
            d="M80 150 L92 110 L108 110 L120 150 Z"
            fill={isOn ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)'}
            stroke={isOn ? 'rgba(255,255,255,0.2)' : '#222'}
            strokeWidth="0.8"
          />

          {/* Filament Nickel Support Leads */}
          <path d="M88 150 L88 95" stroke={isOn ? '#666' : '#333'} strokeWidth="1.2" />
          <path d="M112 150 L112 95" stroke={isOn ? '#666' : '#333'} strokeWidth="1.2" />

          {/* Center Support Wire */}
          <path d="M100 110 L100 80" stroke={isOn ? '#555' : '#222'} strokeWidth="0.8" />

          {/* Coiled Tungsten Filament */}
          <path
            d="M88 95 Q94 75 100 80 Q106 75 112 95"
            stroke={isOn ? themeStyles.filament : '#383838'}
            strokeWidth={isOn ? 2.8 : 1.2}
            strokeLinecap="round"
            fill="none"
            filter={isOn ? 'url(#filamentGlow)' : undefined}
            className={`transition-colors duration-500 ease-in-out ${isOn ? 'drop-shadow-lg' : ''}`}
          />

          {/* Extra hot core white center when ON */}
          {isOn && (
            <path
              d="M91 93 Q95 79 100 83 Q105 79 109 93"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
          )}

          {/* Blown Glass Convex Curved Highlight/Refraction */}
          <path
            d="M125 18 Q155 18 156 68"
            stroke="white"
            strokeWidth="2.5"
            strokeOpacity={isOn ? 0.35 : 0.08}
            strokeLinecap="round"
          />
          <path
            d="M115 12 Q135 12 140 32"
            stroke="white"
            strokeWidth="1.2"
            strokeOpacity={isOn ? 0.45 : 0.12}
            strokeLinecap="round"
          />
        </svg>

        {/* Dynamic Multi-layered CSS Bloom Emissives */}
        <div
          className={`absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-1000 ease-in-out ${
            isOn ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ opacity: isOn ? brightnessScale : 0 }}
        >
          {/* Intense Filament Core Blur */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 ${themeStyles.innerGlow} rounded-full blur-lg opacity-40`}
          ></div>
          {/* Bulb Body Luminescence */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-44 md:h-44 ${themeStyles.outerGlow} rounded-full blur-2xl opacity-25`}
          ></div>
          {/* Atmospheric Halo */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-72 md:h-72 ${themeStyles.outerGlow} rounded-full blur-3xl opacity-15`}
          ></div>
        </div>
      </div>

      {/* Atmospheric Radial Light Wash on Room Background Wall */}
      <div
        className={`absolute top-4 left-1/2 transform -translate-x-1/2 -z-10 w-[350px] h-[350px] md:w-[850px] md:h-[850px] rounded-full transition-all duration-1000 ease-in-out pointer-events-none ${
          isOn ? 'opacity-15 blur-[60px] md:blur-[120px]' : 'opacity-0'
        } ${themeStyles.castLight}`}
        style={{
          transform: `translate(-50%, 0) scale(${isOn ? brightnessScale : 0.5})`,
        }}
      ></div>

      {/* Pull String Switch (Visual tactile cue) */}
      <div
        className="w-[1px] h-10 md:h-14 bg-[#444] self-center -mt-2 z-10 transition-transform duration-200 group-hover:translate-y-1 flex flex-col items-center justify-end"
        title="Manual pull cord"
      >
        <div className="w-2 h-3 bg-gradient-to-b from-[#666] to-[#333] rounded-full shadow-sm border border-[#222]"></div>
      </div>
    </div>
  );
};
