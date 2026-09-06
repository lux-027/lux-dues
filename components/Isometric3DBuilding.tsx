'use client';

interface Isometric3DBuildingProps {
  className?: string;
  size?: number;
}

export function Isometric3DBuilding({ className = '', size = 42 }: Isometric3DBuildingProps) {
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
        <filter id="iso3dShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#09090B" floodOpacity="0.25" />
        </filter>

        {/* Floating Base Glow */}
        <radialGradient id="baseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#71717A" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#18181B" stopOpacity="0" />
        </radialGradient>

        {/* Tower Top Faces (Brightest) */}
        <linearGradient id="roofLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A1A1AA" />
          <stop offset="100%" stopColor="#52525B" />
        </linearGradient>

        {/* Tower Right Faces (Mid Tone Light) */}
        <linearGradient id="rightFaceGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>

        {/* Tower Left Faces (Dark Shadow Side) */}
        <linearGradient id="leftFaceGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#27272A" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>

        {/* Secondary Tower Gradients */}
        <linearGradient id="subRoofLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4D4D8" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>

        <linearGradient id="subRightFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#3F3F46" />
        </linearGradient>

        <linearGradient id="subLeftFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#18181B" />
        </linearGradient>

        {/* Glass Windows Accents */}
        <linearGradient id="glassLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E4E4E7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A1A1AA" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="glassDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#71717A" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#27272A" stopOpacity="0.3" />
        </linearGradient>

        {/* Metallic Bevel Line */}
        <linearGradient id="metalBevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#71717A" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* 3D Ground Shadow */}
      <ellipse cx="60" cy="100" rx="46" ry="14" fill="url(#baseGlow)" />
      
      {/* 3D Isometric Base Plate */}
      <g filter="url(#iso3dShadow)">
        {/* Top of Base Plate */}
        <polygon points="60,82 98,98 60,114 22,98" fill="#E4E4E7" />
        {/* Left Side of Base Plate */}
        <polygon points="22,98 60,114 60,118 22,102" fill="#71717A" />
        {/* Right Side of Base Plate */}
        <polygon points="60,114 98,98 98,102 60,118" fill="#A1A1AA" />
      </g>

      {/* ======================================================== */}
      {/* SECONDARY 3D TOWER (Left / Behind)                        */}
      {/* ======================================================== */}
      <g filter="url(#iso3dShadow)">
        {/* Left Shadow Face */}
        <polygon points="34,60 52,68 52,94 34,86" fill="url(#subLeftFace)" />
        {/* Right Light Face */}
        <polygon points="52,68 70,60 70,86 52,94" fill="url(#subRightFace)" />
        {/* Roof Top */}
        <polygon points="52,52 70,60 52,68 34,60" fill="url(#subRoofLight)" />

        {/* Windows on Sub Tower */}
        <polygon points="38,65 48,69 48,72 38,68" fill="url(#glassDark)" />
        <polygon points="38,73 48,77 48,80 38,76" fill="url(#glassDark)" />
        <polygon points="38,81 48,85 48,88 38,84" fill="url(#glassDark)" />

        <polygon points="56,69 66,65 66,68 56,72" fill="url(#glassLight)" />
        <polygon points="56,77 66,73 66,76 56,80" fill="url(#glassLight)" />
        <polygon points="56,85 66,81 66,84 56,88" fill="url(#glassLight)" />
      </g>

      {/* ======================================================== */}
      {/* MAIN 3D LUXURY TOWER (Foreground / Tall)                  */}
      {/* ======================================================== */}
      <g filter="url(#iso3dShadow)">
        {/* Left Dark Face */}
        <polygon points="44,30 64,40 64,88 44,78" fill="url(#leftFaceGrad)" />
        {/* Right Light Face */}
        <polygon points="64,40 84,30 84,78 64,88" fill="url(#rightFaceGrad)" />
        {/* Main Roof Top */}
        <polygon points="64,20 84,30 64,40 44,30" fill="url(#roofLight)" />

        {/* Center Vertical Highlight Ridge */}
        <line x1="64" y1="40" x2="64" y2="88" stroke="url(#metalBevel)" strokeWidth="1.5" />

        {/* Glass Floor Stripes on Left Face */}
        {Array.from({ length: 5 }).map((_, i) => {
          const yOffset = 46 + i * 8;
          return (
            <g key={`l-band-${i}`}>
              <polygon
                points={`48,${yOffset - 3} 60,${yOffset + 3} 60,${yOffset + 5} 48,${yOffset - 1}`}
                fill="url(#glassDark)"
              />
            </g>
          );
        })}

        {/* Glass Floor Stripes on Right Face */}
        {Array.from({ length: 5 }).map((_, i) => {
          const yOffset = 46 + i * 8;
          return (
            <g key={`r-band-${i}`}>
              <polygon
                points={`68,${yOffset + 3} 80,${yOffset - 3} 80,${yOffset - 1} 68,${yOffset + 5}`}
                fill="url(#glassLight)"
              />
            </g>
          );
        })}

        {/* Penthouse Top Crown (Small 3D Cube) */}
        <polygon points="58,16 64,13 70,16 64,19" fill="#FAFAFA" />
        <polygon points="58,16 64,19 64,22 58,19" fill="#27272A" />
        <polygon points="64,19 70,16 70,19 64,22" fill="#52525B" />

        {/* Antenna / Beacon */}
        <line x1="64" y1="6" x2="64" y2="13" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="64" cy="5" r="1.5" fill="#18181B" />
      </g>
    </svg>
  );
}
