import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
  leftIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  leftIcon,
}) => {
  const variantClasses = {
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    default: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold shadow-sm ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {leftIcon}
      {children}
    </span>
  );
};
