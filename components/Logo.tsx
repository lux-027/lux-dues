import Image from 'next/image';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
  variant?: 'light' | 'dark';
}

// Central logo component. Uses the official LuxDues mark from /public/logo-white.png
// (source file: "public/LuxDues Logo White.png"). Reuse this component instead of
// referencing the image path directly so the brand mark stays consistent everywhere.
//
// variant prop controls the wordmark text color; the logo mark itself is always rendered
// without a background frame so it sits cleanly on any surface.
export function Logo({
  className = '',
  showWordmark = true,
  wordmarkClassName = '',
  size = 36,
  variant = 'light',
}: LogoProps) {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-white.png"
        alt="LuxDues"
        width={size}
        height={size}
        className="object-contain rounded-lg"
        style={{ width: size, height: size }}
        priority
      />
      {showWordmark && (
        <span
          className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-zinc-900'
          } ${wordmarkClassName}`}
        >
          LuxDues
        </span>
      )}
    </div>
  );
}
