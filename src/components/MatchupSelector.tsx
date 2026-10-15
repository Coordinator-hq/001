import React from 'react';
import { Flame, Users, Clock, Swords } from 'lucide-react';
import { Matchup } from '../types/game';
import { soundManager } from '../utils/audio';

interface MatchupSelectorProps {
  matchups: Matchup[];
  activeMatchId: string;
  onSelectMatchup: (matchId: string) => void;
  totalConcurrentViewers?: number;
}

export const MatchupSelector: React.FC<MatchupSelectorProps> = ({
  matchups,
  activeMatchId,
  onSelectMatchup,
  totalConcurrentViewers = 15450
}) => {
  return (
    <div className="w-full max-w-[480px] mx-auto mb-3 select-none">
      {/* Header bar with Global Concurrency Badge */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase">
            LIVE ARENAS • {matchups.length} ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#121629]/90 border border-[#232a4a] px-2.5 py-0.5 rounded-full text-[11px] text-slate-300 font-semibold shadow-inner">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>{totalConcurrentViewers.toLocaleString()} fans online</span>
        </div>
      </div>

      {/* Horizontal Scrollable / Grid Matchup Cards */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {matchups.map((match) => {
          const isActive = match.id === activeMatchId;
          const [teamA, teamB] = match.teams;
          const pot = (teamA?.totalBalance || 0) + (teamB?.totalBalance || 0);

          return (
            <button
              key={match.id}
              onClick={() => {
                if (!isActive) {
                  soundManager.playButtonClick();
                  onSelectMatchup(match.id);
                }
              }}
              className={`relative text-left p-2 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-b from-[#181d38] to-[#0e1224] border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50'
                  : 'bg-[#0a0c16]/80 hover:bg-[#12162a] border-[#1d233c] hover:border-[#2d375e] opacity-75 hover:opacity-100'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500" />
              )}

              {/* Top: Status & Pot */}
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                  LIVE
                </span>
                <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  ₦{pot >= 1000 ? `${Math.round(pot / 1000)}k` : pot}
                </span>
              </div>

              {/* Title & VS */}
              <div className="w-full truncate mb-1">
                <div className="text-[11px] font-black text-white truncate leading-tight group-hover:text-amber-300 transition-colors">
                  {teamA?.tag || 'A'} <span className="text-red-400 font-extrabold text-[9px]">VS</span> {teamB?.tag || 'B'}
                </div>
                <div className="text-[9px] text-slate-400 truncate">
                  {match.category}
                </div>
              </div>

              {/* Bottom: Viewers */}
              <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                <Users className="w-2.5 h-2.5 text-slate-400" />
                <span>{match.viewersCount ? `${(match.viewersCount / 1000).toFixed(1)}k` : '3.8k'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
