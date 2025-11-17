import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-black" />
      
      {/* Animated aura layers */}
      <div className="absolute inset-0">
        {/* Aura 1 - Blue */}
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" 
             style={{ animationDuration: '8s' }} />
        
        {/* Aura 2 - Purple */}
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-600/15 rounded-full blur-[120px] animate-pulse-slow" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
        
        {/* Aura 3 - Cyan */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-cyan-600/10 rounded-full blur-[140px] animate-pulse-slow" 
             style={{ animationDuration: '12s', animationDelay: '4s' }} />
        
        {/* Moving orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float-delayed" />
      </div>
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]"
           style={{
             backgroundImage: `
               linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }} />
    </div>
  );
};

export default AnimatedBackground;
