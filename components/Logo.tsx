import Image from 'next/image';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
}

// Central logo component. Uses the official LuxDues mark from /public/logo-white.png
// (source file: "public/LuxDues Logo White.png"). Reuse this component instead of
// referencing the image path directly so the brand mark stays consistent everywhere.
export function Logo({
  className = '',
  showWordmark = true,
  wordmarkClassName = '',
  size = 36,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-white.png"
        alt="LuxDues"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
        priority
      />
      {showWordmark && (
        <span className={`text-lg font-medium text-zinc-900 ${wordmarkClassName}`}>
          LuxDues
        </span>
      )}
    </div>
  );
}
