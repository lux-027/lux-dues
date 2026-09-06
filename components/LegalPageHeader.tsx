'use client';

import { ReactNode } from 'react';

interface LegalPageHeaderProps {
  title: string;
  subtitle: string;
  badge: string;
  icon?: ReactNode;
  accent?: 'zinc' | 'indigo' | 'emerald' | 'amber' | 'rose';
}

const accentClasses: Record<NonNullable<LegalPageHeaderProps['accent']>, string> = {
  zinc: 'from-zinc-900 via-zinc-800 to-zinc-700 ring-zinc-200',
  indigo: 'from-indigo-900 via-indigo-800 to-indigo-700 ring-indigo-200',
  emerald: 'from-emerald-900 via-emerald-800 to-emerald-700 ring-emerald-200',
  amber: 'from-amber-900 via-amber-800 to-amber-700 ring-amber-200',
  rose: 'from-rose-900 via-rose-800 to-rose-700 ring-rose-200',
};

const iconBgClasses: Record<NonNullable<LegalPageHeaderProps['accent']>, string> = {
  zinc: 'bg-white/10 text-white',
  indigo: 'bg-white/10 text-white',
  emerald: 'bg-white/10 text-white',
  amber: 'bg-white/10 text-white',
  rose: 'bg-white/10 text-white',
};

export function LegalPageHeader({ title, subtitle, badge, icon, accent = 'zinc' }: LegalPageHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${accentClasses[accent]} p-8 sm:p-12 mb-10 ring-1 shadow-xl`}>
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Large blurred circle decoration */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
        {icon && (
          <div className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${iconBgClasses[accent]} flex items-center justify-center shadow-lg ring-1 ring-white/20 backdrop-blur-sm`}>
            {icon}
          </div>
        )}

        <div className="flex-1 space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white/95 border border-white/20 backdrop-blur-sm">
            {badge}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-white/70 font-light max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
