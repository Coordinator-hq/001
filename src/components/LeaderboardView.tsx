import React from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { Team } from '../types/game';
import { TeamLogo } from './TeamLogo';

interface LeaderboardViewProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

// Gemified Diamond Themes with crystalline diamond facets
export const TEAM_GEM_THEMES: Record<
  string,
  {
    tagGlow: string;
    barGradient: string;
    hoverGlow: string;
  }
> = {
  arsenal: {
    tagGlow: 'border-rose-300/60 shadow-[0_0_15px_rgba(255,255,255,0.5)]',
    barGradient: 'bg-gradient-to-r from-rose-400 via-white to-red-500',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
  },
  mancity: {
    tagGlow: 'border-cyan-300/60 shadow-[0_0_15px_rgba(255,255,255,0.5)]',
    barGradient: 'bg-gradient-to-r from-cyan-300 via-white to-sky-400',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
  },
  manutd: {
    tagGlow: 'border-red-300/60 shadow-[0_0_15px_rgba(255,255,255,0.5)]',
    barGradient: 'bg-gradient-to-r from-red-400 via-white to-rose-600',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
  },
  chelsea: {
    tagGlow: 'border-blue-300/60 shadow-[0_0_15px_rgba(255,255,255,0.5)]',
    barGradient: 'bg-gradient-to-r from-blue-400 via-white to-indigo-500',
    hoverGlow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
  }
};

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  teams,
  onSelectTeam
}) => {
  // Sort teams strictly by totalBalance descending
  const sortedTeams = [...teams].sort((a, b) => b.totalBalance - a.totalBalance);
  const totalLeaguePot = sortedTeams.reduce((sum, t) => sum + t.totalBalance, 0);

  return (
    <div className="w-full max-w-4xl mr-auto ml-0 pt-0 space-y-4 font-cursive animate-fadeIn uppercase text-white">
      {/* Gemified Total Pot Header with Diamond Shimmer */}
      <div className="flex flex-col items-start justify-start text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_18px_rgba(255,255,255,0.95)]">
            TOTAL POT: ₦{totalLeaguePot.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Gemified Diamond Momentum Bar */}
      <div className="space-y-1.5 w-full">
        <div className="flex justify-between items-center text-xs sm:text-sm font-black tracking-wider">
          {sortedTeams.map((team) => {
            const pct = totalLeaguePot > 0 ? Math.round((team.totalBalance / totalLeaguePot) * 100) : 25;
            return (
              <span
                key={team.id}
                className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] flex items-center gap-1"
              >
                {team.tag} {pct}%
              </span>
            );
          })}
        </div>
        <div className="w-full h-3.5 rounded-full overflow-hidden flex border-2 border-white/60 bg-black/50 backdrop-blur-md p-0.5 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          {sortedTeams.map((team) => {
            const pct = totalLeaguePot > 0 ? (team.totalBalance / totalLeaguePot) * 100 : 25;
            const theme = TEAM_GEM_THEMES[team.id] || TEAM_GEM_THEMES.arsenal;
            return (
              <div
                key={team.id}
                className={`h-full ${theme.barGradient} transition-all duration-700 shadow-[0_0_10px_rgba(255,255,255,0.6)]`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Gemified Leaderboard Rows floating on white diamonds */}
      <div className="space-y-1 pt-1">
        {sortedTeams.map((team) => {
          const theme = TEAM_GEM_THEMES[team.id] || TEAM_GEM_THEMES.arsenal;

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className={`flex items-center justify-between gap-3 sm:gap-4 py-3 sm:py-3.5 px-2 border-b border-white/20 last:border-b-0 cursor-pointer group hover:bg-white/10 rounded-2xl transition-all duration-200 hover:scale-[1.01] ${theme.hoverGlow}`}
            >
              {/* Left: Gemified Diamond Logo & Tag */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <TeamLogo team={team} size="md" />
                <span className={`px-2.5 py-0.5 rounded-xl border border-white/60 bg-gradient-to-b from-white/30 via-white/10 to-transparent text-white font-black text-xl sm:text-2xl tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.4)] backdrop-blur-md drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]`}>
                  {team.tag}
                </span>
              </div>

              {/* Right: Sparkling Diamond Balance & Diamond Button */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                {/* Balance in pure brilliant-cut diamond text */}
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.95)] tabular-nums">
                    ₦{team.totalBalance.toLocaleString()}
                  </div>
                </div>

                {/* Gemified Diamond Cut Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTeam(team);
                  }}
                  aria-label={`Gift ${team.name}`}
                  className="py-2.5 px-3.5 rounded-xl border-2 border-white bg-gradient-to-b from-white via-cyan-100 to-slate-200 text-slate-950 font-black shadow-[0_0_22px_rgba(255,255,255,0.9)] hover:shadow-[0_0_35px_rgba(255,255,255,1)] hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Gift className="w-5 h-5 text-slate-950" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
