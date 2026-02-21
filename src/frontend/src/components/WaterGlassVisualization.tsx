import { useEffect, useState } from 'react';

interface WaterGlassVisualizationProps {
  percentage: number;
  current: number;
  goal: number;
}

export function WaterGlassVisualization({ percentage, current, goal }: WaterGlassVisualizationProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const waterHeight = Math.min(animatedPercentage, 100);
  const fillColor = waterHeight >= 100 ? '#42A5F5' : waterHeight >= 75 ? '#64B5F6' : waterHeight >= 50 ? '#90CAF9' : '#BBDEFB';

  return (
    <div className="relative w-full max-w-xs mx-auto">
      {/* Glass container */}
      <div className="relative w-64 h-80 mx-auto">
        {/* Water fill with animation */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-[40px]">
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-1000 ease-out"
            style={{
              height: `${waterHeight}%`,
              background: `linear-gradient(to top, ${fillColor}, ${fillColor}dd)`,
            }}
          >
            {/* Wave effect */}
            <div className="absolute inset-x-0 top-0 h-8 animate-wave opacity-60">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0,0 C150,50 350,0 600,50 C850,100 1050,50 1200,0 L1200,120 L0,120 Z"
                  fill="rgba(255,255,255,0.3)"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Glass outline */}
        <div className="absolute inset-0 border-4 border-primary/30 rounded-[40px] bg-gradient-to-b from-transparent via-primary/5 to-primary/10 backdrop-blur-sm">
          {/* Glass shine effect */}
          <div className="absolute top-4 left-4 w-16 h-32 bg-white/20 rounded-full blur-xl" />
        </div>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <div className="text-5xl font-bold gradient-text mb-2">
              {Math.round(percentage)}%
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {current} / {goal} ml
            </div>
          </div>
        </div>
      </div>

      {/* Droplet decoration */}
      <div className="absolute -top-4 right-8 animate-bounce">
        <img 
          src="/assets/generated/water-droplet.dim_64x64.png" 
          alt="droplet" 
          className="w-12 h-12 opacity-70"
        />
      </div>
    </div>
  );
}
