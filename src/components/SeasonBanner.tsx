import React from 'react';
import { Play, Pause, FastForward, Calendar, Trophy, Zap, AlertCircle } from 'lucide-react';
import { SeasonState, Team } from '../types/game';
import { TROPHY_IMAGE_URL } from '../data/initialLeagueData';

interface SeasonBannerProps {
  season: SeasonState;
  leadingTeam?: Team;
  secondTeam?: Team;
  onSetSpeed: (speed: number) => void;
  onSimulateToEnd: () => void;
  onResetSeason: () => void;
}

export const SeasonBanner: React.FC<SeasonBannerProps> = ({
  season,
  leadingTeam,
  secondTeam,
  onSetSpeed,
  onSimulateToEnd,
  onResetSeason
}) => {
  const daysRemaining = Math.max(0, season.totalDays - season.currentDay);
  const percentComplete = Math.min(100, Math.round((season.currentDay / season.totalDays) * 100));

  const gap = (leadingTeam && secondTeam) ? (leadingTeam.totalBalance - secondTeam.totalBalance) : 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Side: Trophy + Season Countdown */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 shrink-0 shadow-lg shadow-amber-500/10">
            <img
              src={TROPHY_IMAGE_URL}
              alt="Year-End Championship Trophy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Season {season.year} Championship Calendar</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-semibold">{season.stageName}</span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-display">
              <span>Day {season.currentDay} of {season.totalDays}</span>
              <span className="text-sm font-normal text-slate-400 font-sans">
                ({daysRemaining === 0 ? 'Dec 31 · Finale Day' : `${daysRemaining} days left`})
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              At the end of the year on <strong className="text-white">Day 365 (Dec 31)</strong>, the team with the highest total fan balance wins the grand Golden Aegis Cup & 60% Mega Prize Pool!
            </p>
          </div>
        </div>

        {/* Right Side: Leading Stats & Simulation Speed Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
          {/* Leading Gap Stat Box */}
          {leadingTeam && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 min-w-[200px]">
              <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>#1 Rank Leader</span>
                <span className="text-amber-400 font-mono font-bold">{leadingTeam.tag}</span>
              </div>
              <div className="text-sm font-bold text-white flex items-center justify-between mt-0.5">
                <span className="truncate max-w-[120px]">{leadingTeam.name}</span>
                <span className="font-mono text-emerald-400 tabular-nums">
                  ${leadingTeam.totalBalance.toLocaleString()}
                </span>
              </div>
              {secondTeam && (
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between border-t border-slate-800/60 pt-1">
                  <span>Lead over #2 ({secondTeam.tag}):</span>
                  <span className="font-mono text-amber-300 tabular-nums">+${gap.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Time & Simulation Controls */}
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
              <button
                onClick={() => onSetSpeed(0)}
                title="Pause Season Clock"
                className={`p-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  season.speed === 0 ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onSetSpeed(1)}
                title="Normal Speed (1 Day every 2.5s)"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  season.speed === 1 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 inline mr-1" />
                1x
              </button>

              <button
                onClick={() => onSetSpeed(5)}
                title="Fast Speed (5x)"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  season.speed === 5 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                5x
              </button>

              <button
                onClick={() => onSetSpeed(20)}
                title="Turbo Speed (20x)"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  season.speed === 20 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FastForward className="w-3.5 h-3.5 inline mr-1" />
                20x
              </button>
            </div>

            {/* Fast-forward to Year End Action */}
            <div className="flex items-center gap-2">
              {!season.isFinished ? (
                <button
                  onClick={onSimulateToEnd}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-xs rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/30 whitespace-nowrap cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate to Year-End</span>
                </button>
              ) : (
                <button
                  onClick={onResetSeason}
                  className="px-3.5 py-1.5 bg-slate-800 text-amber-300 font-semibold text-xs rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1.5 border border-amber-400/30 whitespace-nowrap cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>New Season {season.year + 1}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Season Progress Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Season Progression: {percentComplete}%</span>
          </span>
          <span className="font-mono text-slate-400 tabular-nums">
            {season.currentDay < 90 ? 'Stage 1: Spring Kickoff' : season.currentDay < 180 ? 'Stage 2: Mid-Year Clashes' : season.currentDay < 270 ? 'Stage 3: Rivalry Season' : 'Stage 4: Year-End Climax'}
          </span>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
};
