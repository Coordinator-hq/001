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
    sm: 'w-7 h-7',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14 sm:w-16 sm:h-16'
  };

  const currentSizeClass = sizeClasses[size];

  if (team.logoUrl && !hasError) {
    return (
      <div
        className={`${currentSizeClass} shrink-0 rounded-xl bg-slate-950/80 p-1 flex items-center justify-center border border-amber-500/30 shadow-md ${className}`}
      >
        <img
          src={team.logoUrl}
          alt={`${team.name} Logo`}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain filter drop-shadow"
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful fallback shield with team colors & tag
  return (
    <div
      className={`${currentSizeClass} shrink-0 rounded-xl bg-slate-950 flex flex-col items-center justify-center border border-amber-500/40 shadow-md relative overflow-hidden ${className}`}
      style={{
        borderColor: team.primaryColor || '#F59E0B'
      }}
    >
      <Shield
        className="w-full h-full p-1 opacity-25 absolute inset-0"
        style={{ color: team.primaryColor || '#F59E0B' }}
      />
      <span
        className="font-black text-[10px] sm:text-xs relative z-10 text-amber-300 tracking-tighter"
      >
        {team.tag}
      </span>
    </div>
  );
};
