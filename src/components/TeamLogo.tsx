import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Team } from '../types/game';

interface TeamLogoProps {
  team: Team;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  team,
  className = '',
  size = 'md'
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-16 h-16 sm:w-20 sm:h-20'
  };

  const currentSizeClass = sizeClasses[size];

  if (team.logoUrl && !hasError) {
    return (
      <div className={`${currentSizeClass} shrink-0 flex items-center justify-center ${className}`}>
        <img
          src={team.logoUrl}
          alt={`${team.name} Logo`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] hover:scale-105 transition-transform"
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful fallback with clean icon and no box
  return (
    <div
      className={`${currentSizeClass} shrink-0 flex flex-col items-center justify-center relative ${className}`}
    >
      <Shield
        className="w-full h-full p-1 opacity-90 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
        style={{ color: team.primaryColor || '#FFFFFF' }}
      />
      <span className="font-black text-[10px] sm:text-xs absolute z-10 text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] tracking-tighter">
        {team.tag}
      </span>
    </div>
  );
};
