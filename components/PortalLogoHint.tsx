'use client';

import { useEffect, useState } from 'react';

interface PortalLogoHintProps {
  portal: 'admin' | 'resident';
}

const labels: Record<PortalLogoHintProps['portal'], string> = {
  admin: 'Yönetici Portalı',
  resident: 'Sakin Portalı',
};

export function PortalLogoHint({ portal }: PortalLogoHintProps) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fadeTimer = setTimeout(() => setShow(false), 8000);
    const unmountTimer = setTimeout(() => setMounted(false), 8600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold border shadow-sm bg-zinc-900 text-white border-zinc-800 transition-all duration-500 ${
        show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'
      }`}
      aria-hidden={!show}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      {labels[portal]}
    </span>
  );
}
