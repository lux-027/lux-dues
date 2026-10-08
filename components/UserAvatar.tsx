'use client';

import { useState } from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ name, avatarUrl, size = 40, className = '' }: UserAvatarProps) {
  const [error, setError] = useState(false);

  const initials = name.trim().charAt(0).toUpperCase();

  const containerStyle = {
    width: size,
    height: size,
    fontSize: size < 32 ? 10 : size < 48 ? 12 : 14,
  };

  if (avatarUrl && !error) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={containerStyle}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-zinc-900 text-zinc-100 flex items-center justify-center font-semibold flex-shrink-0 ${className}`}
      style={containerStyle}
    >
      {initials || name.charAt(0).toUpperCase()}
    </div>
  );
}
