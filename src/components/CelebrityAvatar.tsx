import React, { useState, useMemo } from 'react';

interface CelebrityAvatarProps {
  src: string;
  name: string;
  className?: string;
  borderColor?: string;
}

const MONOGRAM_GRADIENTS = [
  'from-amber-500/25 via-slate-900 to-slate-950 text-amber-300',
  'from-emerald-500/25 via-slate-900 to-slate-950 text-emerald-300',
  'from-sky-500/25 via-slate-900 to-slate-950 text-sky-300',
  'from-violet-500/25 via-slate-900 to-slate-950 text-violet-300',
  'from-rose-500/25 via-slate-900 to-slate-950 text-rose-300'
];

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

  const gradientClass = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return MONOGRAM_GRADIENTS[Math.abs(hash) % MONOGRAM_GRADIENTS.length];
  }, [name]);

  if (!src || hasError) {
    return (
      <div
        className={`${className} flex items-center justify-center font-black bg-gradient-to-br ${gradientClass} border border-slate-700/80 text-sm sm:text-base tracking-widest select-none shrink-0`}
        style={borderColor ? { borderColor } : undefined}
        title={name}
        aria-label={name}
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
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} object-cover shrink-0`}
      style={borderColor ? { borderColor } : undefined}
    />
  );
};
