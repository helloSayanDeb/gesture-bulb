import React from 'react';

interface LightBulbProps {
  isOn: boolean;
}

export const LightBulb: React.FC<LightBulbProps> = ({ isOn }) => {
  return (
    <div className="relative flex flex-col items-center justify-start h-full pt-0 transform transition-all duration-300">
      {/* Hanging Wire */}
      <div className="w-0.5 h-32 md:h-48 bg-gray-800 shadow-sm z-10"></div>
      
      {/* Bulb Socket */}
      <div className="w-16 h-12 bg-gray-700 rounded-sm z-10 flex flex-col items-center justify-end pb-1 border-b border-gray-900 shadow-md">
         <div className="w-14 h-2 bg-gray-600 rounded-full mb-1"></div>
         <div className="w-14 h-2 bg-gray-600 rounded-full mb-1"></div>
         <div className="w-14 h-2 bg-gray-600 rounded-full"></div>
      </div>

      {/* The Bulb */}
      <div className={`relative -mt-1 transition-all duration-500 ease-in-out ${isOn ? 'bulb-on' : ''}`}>
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-500"
        >
          {/* Glass Bulb Body */}
          <path
            d="M100 0C60 0 30 30 30 70C30 95 45 115 65 125L70 150H130L135 125C155 115 170 95 170 70C170 30 140 0 100 0Z"
            fill={isOn ? "#FFFDE7" : "#cfd8dc"}
            fillOpacity={isOn ? "1" : "0.3"}
            stroke={isOn ? "#FFF59D" : "#b0bec5"}
            strokeWidth="1"
          />
          
          {/* Filament Support */}
          <path d="M90 150 L90 100" stroke="#78909c" strokeWidth="2" />
          <path d="M110 150 L110 100" stroke="#78909c" strokeWidth="2" />
          
          {/* Filament */}
          <path
            d="M90 100 Q100 80 110 100"
            stroke={isOn ? "#FFD700" : "#546e7a"}
            strokeWidth={isOn ? "3" : "2"}
            fill="none"
            className={`transition-colors duration-300 ${isOn ? 'drop-shadow-md' : ''}`}
          />
          
          {/* Shine/Reflection */}
          <path
             d="M120 20 Q150 20 150 70"
             stroke="white"
             strokeWidth="3"
             strokeOpacity="0.3"
             strokeLinecap="round"
          />
        </svg>

        {/* Glow Effects (CSS implementation for simpler blurring than SVG filters) */}
        {isOn && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
             {/* Inner Glow */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-50"></div>
             {/* Outer Glow */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
          </div>
        )}
      </div>
      
      {/* Light Cast on Background (Simulated) */}
      <div 
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -z-10 w-[800px] h-[800px] rounded-full transition-opacity duration-700 pointer-events-none
          ${isOn ? 'opacity-20 bg-yellow-100 blur-[100px]' : 'opacity-0'}
        `}
      ></div>
    </div>
  );
};