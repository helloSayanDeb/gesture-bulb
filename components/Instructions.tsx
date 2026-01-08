import React from 'react';

interface InstructionsProps {
  onDismiss: () => void;
}

export const Instructions: React.FC<InstructionsProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Gesture Control</h2>
        <p className="text-center text-gray-500 mb-6">Control the light bulb with your hand.</p>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              ☝️
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Turn ON</h3>
              <p className="text-sm text-gray-600">Raise your index finger</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              👌
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Turn OFF</h3>
              <p className="text-sm text-gray-600">Make an OK sign</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onDismiss}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          Got it, let's go!
        </button>
      </div>
    </div>
  );
};