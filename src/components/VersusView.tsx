import React from 'react';
import { Gift } from 'lucide-react';
import { Team } from '../types/game';
import { VersusTimer } from './VersusTimer';

interface VersusViewProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export const VersusView: React.FC<VersusViewProps> = ({
  teams,
  onSelectTeam
}) => {
  // Single active versus matchup: Wizkid vs Davido
  const team1 = teams.find((t) => t.id === 'wizkid') || teams[0];
  const team2 = teams.find((t) => t.id === 'davido') || teams[1] || teams[0];

  const totalPot = (team1?.totalBalance || 0) + (team2?.totalBalance || 0);
  const team1Percent = totalPot > 0 ? Math.round(((team1?.totalBalance || 0) / totalPot) * 100) : 50;
  const team2Percent = 100 - team1Percent;

  return (
    <div className="max-w-4xl mx-auto pt-4 font-cursive text-amber-300 animate-fadeIn uppercase">
      {/* Unified Versus Card containing both teams and the integrated 10-min timer */}
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden uppercase">
        {/* Subtle background gold ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-500/5 pointer-events-none" />

        {/* Integrated 10-Minute Auto-Resetting Timer on the Unified Card */}
        <div className="flex flex-col items-center justify-center mb-6 relative z-10 space-y-3 uppercase">
          <VersusTimer />

          {/* Tug-of-War / Balance Split Bar */}
          <div className="w-full max-w-lg mx-auto space-y-1.5 uppercase">
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider">
              <span>{team1.name} ({team1Percent}%)</span>
              <span>({team2Percent}%) {team2.name}</span>
            </div>
            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex border border-amber-500/50 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-l-full transition-all duration-700 shadow-sm"
                style={{ width: `${team1Percent}%` }}
              />
              <div
                className="h-full bg-slate-950 border-l border-amber-500/40 rounded-r-full transition-all duration-700 shadow-inner"
                style={{ width: `${team2Percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Unified Head-to-Head Both Teams Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pt-2 items-stretch uppercase">
          {/* Glowing VS Badge in Center */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-950 border-2 border-amber-400 items-center justify-center shadow-2xl shadow-amber-500/40 uppercase">
            <span className="font-black text-lg text-amber-300 tracking-wider">VS</span>
          </div>

          {/* Team 1 Side (Wizkid) */}
          <div
            onClick={() => onSelectTeam(team1)}
            className="bg-slate-950/90 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-6 sm:p-7 flex flex-col justify-between items-center text-center transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer group uppercase"
          >
            <div className="space-y-2 uppercase">
              <span className="text-xs font-bold uppercase tracking-wider bg-slate-900 px-2.5 py-0.5 rounded border border-amber-500/30 text-amber-400">
                {team1.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-amber-400 tracking-wide drop-shadow group-hover:text-yellow-300 transition-colors uppercase">
                {team1.name}
              </h2>
              <div className="pt-2 uppercase">
                <span className="text-xs text-amber-400/80 uppercase tracking-wider block">
                  TOTAL BALANCE
                </span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-300 tracking-wide drop-shadow block mt-1 uppercase">
                  ₦{team1.totalBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full pt-6 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTeam(team1);
                }}
                aria-label={`Gift ${team1.name}`}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 font-bold rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 transition-all cursor-pointer uppercase"
              >
                <Gift className="w-5 h-5 text-slate-950" />
              </button>
            </div>
          </div>

          {/* Mobile VS separator */}
          <div className="flex md:hidden items-center justify-center my--1 uppercase">
            <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 uppercase">
              <span className="font-black text-sm text-amber-300">VS</span>
            </div>
          </div>

          {/* Team 2 Side (Davido) */}
          <div
            onClick={() => onSelectTeam(team2)}
            className="bg-slate-950/90 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-6 sm:p-7 flex flex-col justify-between items-center text-center transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer group uppercase"
          >
            <div className="space-y-2 uppercase">
              <span className="text-xs font-bold uppercase tracking-wider bg-slate-900 px-2.5 py-0.5 rounded border border-amber-500/30 text-amber-400">
                {team2.tag}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-amber-400 tracking-wide drop-shadow group-hover:text-yellow-300 transition-colors uppercase">
                {team2.name}
              </h2>
              <div className="pt-2 uppercase">
                <span className="text-xs text-amber-400/80 uppercase tracking-wider block">
                  TOTAL BALANCE
                </span>
                <span className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-300 tracking-wide drop-shadow block mt-1 uppercase">
                  ₦{team2.totalBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full pt-6 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTeam(team2);
                }}
                aria-label={`Gift ${team2.name}`}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 font-bold rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 transition-all cursor-pointer uppercase"
              >
                <Gift className="w-5 h-5 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
