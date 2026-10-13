import React from 'react';
import { Gift, Trophy } from 'lucide-react';
import { Team } from '../types/game';

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
    <div className="max-w-4xl mx-auto pt-2 space-y-6 font-cursive text-amber-300 animate-fadeIn uppercase">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
          <h1 className="text-4xl sm:text-5xl font-black text-amber-400 tracking-wide drop-shadow">
            LEADERBOARD
          </h1>
        </div>
        <div className="text-xs sm:text-sm text-amber-400/80 tracking-wider">
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
              {/* Left: Rank & Team Details */}
              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                {/* Rank Badge */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 border ${
                    isTop
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                      : 'bg-slate-950 text-amber-400 border-amber-500/40'
                  }`}
                >
                  #{rank}
                </div>

                {/* Team Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-400 group-hover:text-yellow-300 transition-colors drop-shadow truncate">
                      {team.name}
                    </h2>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30 text-amber-400">
                      {team.tag}
                    </span>
                  </div>
                  <div className="text-xs text-amber-400/70 tracking-wide mt-0.5">
                    TOTAL BALANCE
                  </div>
                </div>
              </div>

              {/* Right: Balance & Gift Button */}
              <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                {/* Total Balance */}
                <div className="text-right">
                  <div className="text-xl sm:text-3xl font-black text-amber-300 drop-shadow tabular-nums">
                    ₦{team.totalBalance.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-amber-500/70 hidden sm:block">
                    {team.fanCount.toLocaleString()} GIFTS
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
