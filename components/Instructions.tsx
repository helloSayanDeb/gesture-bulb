import React from 'react';

interface InstructionsProps {
  onDismiss: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
      {/* Metallic Card */}
      <div className="bg-[#050505] text-white max-w-lg w-full p-1 relative border-l border-t border-[#333] border-r border-b border-black shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
        {/* Inner Content Container */}
        <div className="bg-[#080808] p-6 md:p-8 relative">
            <button 
            onClick={onDismiss}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-500 hover:text-white transition-colors"
            >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white font-[Syne] uppercase tracking-tight">System Control</h2>
            <p className="text-gray-500 mb-6 md:mb-8 font-[DM Sans] text-[10px] md:text-sm tracking-wide">INITIALIZE GESTURE RECOGNITION PROTOCOLS</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 md:mb-8">
            {/* Instruction Item 1 */}
            <div className="bg-[#0a0a0a] p-4 md:p-6 border border-[#1a1a1a] hover:border-[#333] transition-colors group flex md:block items-center md:items-start gap-4 md:gap-0">
                <div className="mb-0 md:mb-4 text-2xl md:text-3xl opacity-80 group-hover:opacity-100 transition-opacity">✋</div>
                <div>
                   <h3 className="font-bold text-white uppercase tracking-wider text-xs md:text-sm mb-1 font-[Syne]">Engage</h3>
                   <p className="text-[10px] md:text-xs text-gray-500 font-mono">GESTURE: OPEN HAND</p>
                </div>
            </div>
            
            {/* Instruction Item 2 */}
            <div className="bg-[#0a0a0a] p-4 md:p-6 border border-[#1a1a1a] hover:border-[#333] transition-colors group flex md:block items-center md:items-start gap-4 md:gap-0">
                <div className="mb-0 md:mb-4 text-2xl md:text-3xl opacity-80 group-hover:opacity-100 transition-opacity">✊</div>
                <div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-xs md:text-sm mb-1 font-[Syne]">Disengage</h3>
                    <p className="text-[10px] md:text-xs text-gray-500 font-mono">GESTURE: CLOSED FIST</p>
                </div>
            </div>
            </div>

            <button 
            onClick={onDismiss}
            className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white font-bold py-3 md:py-4 px-6 uppercase tracking-[0.2em] text-[10px] md:text-xs border border-[#333] metallic-sheen transition-all active:translate-y-[1px]"
            >
            Initialize System
            </button>
        </div>
      </div>
    </div>
  );
};