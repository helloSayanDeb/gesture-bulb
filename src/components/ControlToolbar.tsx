'use client';

import React from 'react';
import { BulbColorTheme } from '../types';
import {
  Volume2,
  VolumeX,
  Sun,
  Palette,
  HelpCircle,
  Power,
  Maximize,
  Minimize,
  Sliders,
} from 'lucide-react';

interface ControlToolbarProps {
  isBulbOn: boolean;
  onToggleBulb: () => void;
  colorTheme: BulbColorTheme;
  onChangeColorTheme: (theme: BulbColorTheme) => void;
  brightness: number;
  onChangeBrightness: (brightness: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHelp: () => void;
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  isBulbOn,
  onToggleBulb,
  colorTheme,
  onChangeColorTheme,
  brightness,
  onChangeBrightness,
  isMuted,
  onToggleMute,
  onOpenHelp,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showPalette, setShowPalette] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const themes: { id: BulbColorTheme; label: string; color: string }[] = [
    { id: 'amber', label: 'Tungsten Amber', color: '#F59E0B' },
    { id: 'cyan', label: 'Cyber Cyan', color: '#06B6D4' },
    { id: 'emerald', label: 'Matrix Emerald', color: '#10B981' },
    { id: 'crimson', label: 'Crimson Core', color: '#F43F5E' },
    { id: 'violet', label: 'Violet Plasma', color: '#A855F7' },
  ];

  return (
    <nav
      aria-label="Bulb controls and presets"
      className="fixed bottom-3 left-3 md:bottom-6 md:left-6 z-40 flex items-center space-x-2 select-none"
    >
      {/* Metallic Cyber Dock */}
      <div className="bg-[#080808]/90 backdrop-blur-md border border-[#2b2b2b] px-3 py-2 flex items-center space-x-2 md:space-x-3 shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
        {/* Quick Power Switch */}
        <button
          onClick={onToggleBulb}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm font-mono text-[10px] md:text-xs font-bold uppercase transition-all ${
            isBulbOn
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
              : 'bg-[#151515] text-gray-400 hover:text-white border border-[#333]'
          }`}
          title="Toggle Power (Spacebar)"
        >
          <Power className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isBulbOn ? 'LAMP ON' : 'LAMP OFF'}</span>
        </button>

        <div className="w-[1px] h-5 bg-[#222]"></div>

        {/* Theme Picker Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowPalette((prev) => !prev)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors flex items-center space-x-1"
            title="Choose Color Theme (Press T)"
          >
            <Palette className="w-4 h-4" />
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: themes.find((t) => t.id === colorTheme)?.color,
              }}
            ></span>
          </button>

          {showPalette && (
            <div className="absolute bottom-12 left-0 bg-[#0e0e0e] border border-[#2c2c2c] p-2 rounded shadow-2xl flex flex-col space-y-1.5 w-40 z-50 animate-fade-in">
              <span className="text-[9px] font-mono uppercase tracking-wider text-gray-400 font-bold px-1">
                Color Emissive
              </span>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onChangeColorTheme(t.id);
                    setShowPalette(false);
                  }}
                  className={`flex items-center space-x-2 px-2 py-1 rounded text-[10px] font-mono transition-all ${
                    colorTheme === t.id
                      ? 'bg-[#1e1e1e] text-white font-bold'
                      : 'text-gray-400 hover:bg-[#161616] hover:text-gray-200'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: t.color }}
                  ></span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brightness Dimmer Control */}
        <div className="hidden sm:flex items-center space-x-1.5 px-1">
          <Sun className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="range"
            min={20}
            max={100}
            value={brightness}
            onChange={(e) => onChangeBrightness(Number(e.target.value))}
            className="w-16 md:w-24 h-1 bg-[#222] rounded-lg appearance-none cursor-pointer accent-amber-400"
            title={`Brightness: ${brightness}%`}
          />
          <span className="text-[9px] font-mono text-gray-500 w-6">{brightness}%</span>
        </div>

        <div className="w-[1px] h-5 bg-[#222]"></div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
          title={isMuted ? 'Unmute relay sounds (M)' : 'Mute relay sounds (M)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-gray-600" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors hidden md:block"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Instructions Modal Button */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
          title="Instructions & Gestures (H)"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
