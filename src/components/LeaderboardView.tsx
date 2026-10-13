import React from 'react';
import { Gift } from 'lucide-react';
import { Team } from '../types/game';
import { TeamLogo } from './TeamLogo';

interface LeaderboardViewProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  teams,
  onSelectTeam
}) => {
  // Sort teams strictly by totalBalance descending
  const sortedTeams = [...teams].sort((a, b) => b.totalBalance - a.totalBalance);
  const totalLeaguePot = sortedTeams.reduce((sum, t) => sum + t.totalBalance, 0);

  return (
    <div className="w-full max-w-4xl mr-auto ml-0 pt-0 space-y-4 font-cursive text-amber-300 animate-fadeIn uppercase">
      {/* Header Total Pot */}
      <div className="flex flex-col items-start justify-start text-left">
        <div className="text-sm sm:text-base font-bold text-amber-400 tracking-wider">
          TOTAL POT: ₦{totalLeaguePot.toLocaleString()}
        </div>
      </div>

      {/* Pot Distribution Momentum Bar */}
      <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-amber-400 tracking-wider">
          {sortedTeams.map((team) => {
            const pct = totalLeaguePot > 0 ? Math.round((team.totalBalance / totalLeaguePot) * 100) : 25;
            return (
              <span key={team.id}>
                {team.tag} {pct}%
              </span>
            );
          })}
        </div>
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex border border-amber-500/50 p-0.5 shadow-inner">
          {sortedTeams.map((team, idx) => {
            const pct = totalLeaguePot > 0 ? (team.totalBalance / totalLeaguePot) * 100 : 25;
            const gradients = [
              'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500',
              'bg-amber-600',
              'bg-slate-900 border-l border-amber-500/30',
              'bg-slate-950 border-l border-amber-500/40'
            ];
            return (
              <div
                key={team.id}
                className={`h-full ${gradients[idx % gradients.length]} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Leaderboard Cards List */}
      <div className="space-y-3.5">
        {sortedTeams.map((team, index) => {
          const rank = index + 1;
          const isTop = rank === 1;

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className={`bg-slate-900/95 border ${
                isTop
                  ? 'border-amber-400 shadow-xl shadow-amber-500/20 bg-gradient-to-r from-slate-900/95 via-amber-500/5 to-slate-900/95'
                  : 'border-amber-500/30 hover:border-amber-400/80 shadow-lg'
              } rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-all duration-200 hover:scale-[1.01] cursor-pointer group relative overflow-hidden`}
            >
              {/* Left: Team Logo & Tag */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <TeamLogo team={team} size="md" />
                <span className="text-sm sm:text-base font-black uppercase tracking-wider bg-slate-950 px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-400">
                  {team.tag}
                </span>
              </div>

              {/* Right: Balance & Gift Button */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                {/* Balance */}
                <div className="text-right">
                  <div className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 drop-shadow tabular-nums">
                    ₦{team.totalBalance.toLocaleString()}
                  </div>
                </div>

                {/* Gift Button (Gift Icon Only as previously requested) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTeam(team);
                  }}
                  aria-label={`Gift ${team.name}`}
                  className="py-3 px-3.5 sm:px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-95 font-bold rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 transition-all cursor-pointer shrink-0"
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
