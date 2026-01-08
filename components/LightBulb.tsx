import React from 'react';

interface LightBulbProps {
  isOn: boolean;
}

export const LightBulb: React.FC<LightBulbProps> = ({ isOn }) => {
  return (
    <div className="relative flex flex-col items-center justify-start h-full pt-0 transform transition-all duration-700 ease-in-out">
      {/* Hanging Wire */}
      <div className="w-[1px] h-32 md:h-48 bg-[#333] z-10"></div>
      
      {/* Bulb Socket - Industrial Sharp Look */}
      <div className="w-16 h-12 bg-[#1a1a1a] z-10 flex flex-col items-center justify-end pb-1 border-b border-black shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
         <div className="w-14 h-1 bg-[#333] mb-1.5"></div>
         <div className="w-14 h-1 bg-[#333] mb-1.5"></div>
         <div className="w-14 h-1 bg-[#333]"></div>
      </div>

      {/* The Bulb */}
      <div className={`relative -mt-1 transition-all duration-700 ease-in-out ${isOn ? 'bulb-on' : ''}`}>
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-700 ease-in-out"
        >
          {/* Glass Bulb Body */}
          <path
            d="M100 0C60 0 30 30 30 70C30 95 45 115 65 125L70 150H130L135 125C155 115 170 95 170 70C170 30 140 0 100 0Z"
            fill={isOn ? "#FFFDE7" : "#1a1a1a"}
            fillOpacity={isOn ? "1" : "0.5"}
            stroke={isOn ? "#FFF59D" : "#333333"}
            strokeWidth="1"
            className="transition-all duration-700 ease-in-out"
          />
          
          {/* Filament Support */}
          <path d="M90 150 L90 100" stroke="#444" strokeWidth="1" />
          <path d="M110 150 L110 100" stroke="#444" strokeWidth="1" />
          
          {/* Filament */}
          <path
            d="M90 100 Q100 80 110 100"
            stroke={isOn ? "#FFD700" : "#333"}
            strokeWidth={isOn ? "2" : "1"}
            fill="none"
            className={`transition-colors duration-500 ease-in-out ${isOn ? 'drop-shadow-md' : ''}`}
          />
          
          {/* Shine/Reflection */}
          <path
             d="M120 20 Q150 20 150 70"
             stroke="white"
             strokeWidth="2"
             strokeOpacity="0.1"
             strokeLinecap="square"
          />
        </svg>

        {/* Glow Effects (CSS implementation for simpler blurring than SVG filters) */}
        {/* We keep the div in DOM but fade opacity for smoother transition than conditional rendering */}
        <div className={`absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-1000 ease-in-out ${isOn ? 'opacity-100' : 'opacity-0'}`}>
             {/* Inner Glow */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full blur-xl opacity-20"></div>
             {/* Outer Glow */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-10"></div>
        </div>
      </div>
      
      {/* Light Cast on Background (Simulated) */}
      <div 
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 -z-10 w-[800px] h-[800px] rounded-full transition-opacity duration-1000 ease-in-out pointer-events-none
          ${isOn ? 'opacity-5 bg-white blur-[100px]' : 'opacity-0'}
        `}
      ></div>
    </div>
  );
};