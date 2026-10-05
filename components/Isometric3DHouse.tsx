'use client';

interface Isometric3DHouseProps {
  className?: string;
  size?: number;
}

export function Isometric3DHouse({ className = '', size = 42 }: Isometric3DHouseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <defs>
        {/* Soft 3D Drop Shadow */}
        <filter id="houseShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#09090B" floodOpacity="0.25" />
        </filter>

        {/* Floating Base Glow */}
        <radialGradient id="houseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#71717A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#18181B" stopOpacity="0" />
        </radialGradient>

        {/* Roof Faces */}
        <linearGradient id="houseRoofLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>

        <linearGradient id="houseRoofDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>

        {/* Wall Faces */}
        <linearGradient id="houseWallLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#27272A" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>

        <linearGradient id="houseWallRight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>

        {/* Glass Windows */}
        <linearGradient id="houseGlassLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E4E4E7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A1A1AA" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="houseGlassDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#71717A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#27272A" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* 3D Ground Shadow */}
      <ellipse cx="60" cy="102" rx="46" ry="14" fill="url(#houseGlow)" />

      {/* 3D Isometric Base Plate */}
      <g filter="url(#houseShadow)">
        <polygon points="60,84 98,100 60,116 22,100" fill="#E4E4E7" />
        <polygon points="22,100 60,116 60,120 22,104" fill="#71717A" />
        <polygon points="60,116 98,100 98,104 60,120" fill="#A1A1AA" />
      </g>

      {/* ======================================================== */}
      {/* MAIN 3D HOUSE BODY                                        */}
      {/* ======================================================== */}
      <g filter="url(#houseShadow)">
        {/* Left Wall (Dark) */}
        <polygon points="36,64 60,76 60,100 36,88" fill="url(#houseWallLeft)" />
        {/* Right Wall (Light) */}
        <polygon points="60,76 84,64 84,88 60,100" fill="url(#houseWallRight)" />

        {/* Door on Right Face */}
        <polygon points="66,80 78,74 78,90 66,96" fill="#09090B" />
        <polygon points="68,81.5 76,77.5 76,89 68,93" fill="url(#houseGlassLight)" opacity="0.35" />

        {/* Window on Left Face */}
        <polygon points="42,72 54,78 54,84 42,78" fill="url(#houseGlassDark)" />
      </g>

      {/* 3D Roof Prism */}
      <g filter="url(#houseShadow)">
        {/* Left Roof Slope (Dark) */}
        <polygon points="60,44 36,64 60,76" fill="url(#houseRoofDark)" />
        {/* Right Roof Slope (Light) */}
        <polygon points="60,44 84,64 60,76" fill="url(#houseRoofLight)" />
        {/* Ridge Highlight */}
        <line x1="60" y1="44" x2="60" y2="76" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />
      </g>

      {/* Chimney */}
      <g filter="url(#houseShadow)">
        <polygon points="72,50 78,53 78,64 72,61" fill="#3F3F46" />
        <polygon points="72,50 75,48.5 81,51.5 78,53" fill="#A1A1AA" />
        <polygon points="78,53 81,51.5 81,62.5 78,64" fill="#27272A" />
      </g>
    </svg>
  );
}
