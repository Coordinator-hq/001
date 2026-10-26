import React, { useState, useMemo } from 'react';

interface CelebrityAvatarProps {
  src: string;
  name: string;
  className?: string;
  borderColor?: string;
}

export const CelebrityAvatar: React.FC<CelebrityAvatarProps> = ({
  src,
  name,
  className = 'w-12 h-12 rounded-2xl',
  borderColor
}) => {
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    const clean = name.replace(/\([^)]*\)/g, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }, [name]);

  if (hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center font-black text-white bg-gradient-to-br from-slate-800 to-slate-900 border text-xs tracking-wider select-none shrink-0`}
        style={borderColor ? { borderColor } : { borderColor: '#334155' }}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${className} object-cover shrink-0`}
      style={borderColor ? { borderColor } : undefined}
    />
  );
};
