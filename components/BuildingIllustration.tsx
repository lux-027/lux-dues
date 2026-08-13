export function BuildingIllustration() {
  return (
    <svg
      viewBox="0 0 640 560"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#FAFAFA" />
        </linearGradient>

        <linearGradient id="towerGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#18181B" />
        </linearGradient>

        <linearGradient id="towerFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4F4F5" />
          <stop offset="100%" stopColor="#E4E4E7" />
        </linearGradient>

        <linearGradient id="windowGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>

        <linearGradient id="windowGlassDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A1A1AA" />
          <stop offset="100%" stopColor="#71717A" />
        </linearGradient>

        <linearGradient id="accentGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0" />
        </radialGradient>

        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#18181B" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Sky backdrop */}
      <rect x="0" y="0" width="640" height="560" fill="url(#sky)" rx="24" />
      <circle cx="500" cy="110" r="90" fill="url(#sun)" />

      {/* Ground */}
      <rect x="0" y="486" width="640" height="74" fill="#F4F4F5" />
      <ellipse cx="320" cy="488" rx="280" ry="14" fill="#E4E4E7" />

      {/* ---- Background building (left) ---- */}
      <g filter="url(#softShadow)">
        <rect x="46" y="228" width="130" height="260" rx="8" fill="url(#towerFace)" />
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 3 }).map((_, col) => (
            <rect
              key={`bl-${row}-${col}`}
              x={62 + col * 38}
              y={248 + row * 38}
              width="24"
              height="26"
              rx="3"
              fill="url(#windowGlassDark)"
              opacity={0.85}
            />
          ))
        )}
      </g>

      {/* ---- Background building (right) ---- */}
      <g filter="url(#softShadow)">
        <rect x="470" y="260" width="118" height="228" rx="8" fill="url(#towerFace)" />
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 3 }).map((_, col) => (
            <rect
              key={`br-${row}-${col}`}
              x={484 + col * 36}
              y={280 + row * 38}
              width="22"
              height="24"
              rx="3"
              fill="url(#windowGlassDark)"
              opacity={0.85}
            />
          ))
        )}
      </g>

      {/* ---- Main tower ---- */}
      <g filter="url(#softShadow)">
        {/* Tower shell */}
        <rect x="188" y="92" width="264" height="396" rx="14" fill="url(#towerGlass)" />

        {/* Rooftop cap + antenna */}
        <rect x="188" y="92" width="264" height="20" rx="10" fill="#09090B" />
        <rect x="314" y="58" width="4" height="36" fill="#3F3F46" />
        <circle cx="316" cy="54" r="5" fill="#4F46E5" />

        {/* Rooftop mechanical unit */}
        <rect x="380" y="100" width="40" height="16" rx="3" fill="#27272A" />

        {/* Glass curtain-wall grid */}
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => {
            const isAccent = (row === 3 && col === 2) || (row === 5 && col === 4);
            return (
              <rect
                key={`main-${row}-${col}`}
                x={206 + col * 48}
                y={128 + row * 42}
                width="38"
                height="30"
                rx="3"
                fill={isAccent ? 'url(#accentGlass)' : 'url(#windowGlass)'}
                opacity={0.92}
              />
            );
          })
        )}

        {/* Floor separators */}
        {Array.from({ length: 8 }).map((_, row) => (
          <rect
            key={`sep-${row}`}
            x="188"
            y={120 + row * 42}
            width="264"
            height="3"
            fill="#09090B"
            opacity={0.5}
          />
        ))}

        {/* Entrance canopy */}
        <rect x="270" y="440" width="100" height="8" rx="4" fill="#4F46E5" />
        {/* Entrance */}
        <rect x="284" y="448" width="72" height="40" rx="4" fill="#09090B" />
        <rect x="316" y="456" width="10" height="32" rx="2" fill="url(#accentGlass)" />
        <rect x="296" y="456" width="14" height="32" rx="2" fill="url(#windowGlass)" opacity={0.6} />
        <rect x="330" y="456" width="14" height="32" rx="2" fill="url(#windowGlass)" opacity={0.6} />
      </g>

      {/* Foreground landscaping */}
      <g opacity="0.9">
        <circle cx="150" cy="472" r="16" fill="#D4D4D8" />
        <rect x="146" y="472" width="8" height="18" fill="#A1A1AA" />
        <circle cx="500" cy="466" r="18" fill="#D4D4D8" />
        <rect x="496" y="466" width="8" height="22" fill="#A1A1AA" />
      </g>
    </svg>
  );
}
