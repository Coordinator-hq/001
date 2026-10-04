import React, { useEffect } from 'react';
import { Trophy, Crown, Sparkles, Award, RotateCcw, X, Flame } from 'lucide-react';
import { Player, SeasonState, Team } from '../types/game';
import { TROPHY_IMAGE_URL } from '../data/initialLeagueData';
import { triggerConfetti } from '../utils/confetti';
import { soundManager } from '../utils/audio';

interface ChampionshipCeremonyModalProps {
  season: SeasonState;
  winningTeam: Team;
  runnerUpTeam?: Team;
  thirdTeam?: Team;
  mvpPlayer?: Player;
  onClose: () => void;
  onStartNewSeason: () => void;
}

export const ChampionshipCeremonyModal: React.FC<ChampionshipCeremonyModalProps> = ({
  season,
  winningTeam,
  runnerUpTeam,
  thirdTeam,
  mvpPlayer,
  onClose,
  onStartNewSeason
}) => {
  useEffect(() => {
    soundManager.playVictoryBuzzer();
    triggerConfetti(['#F59E0B', '#FCD34D', '#10B981', '#EC4899', '#3B82F6', '#8B5CF6']);
    const interval = setInterval(() => {
      triggerConfetti(['#F59E0B', '#FDE047', '#10B981']);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalPrize = 2500000;
  const firstPrize = Math.round(totalPrize * 0.6);
  const secondPrize = Math.round(totalPrize * 0.25);
  const thirdPrize = Math.round(totalPrize * 0.15);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/30">
          <Crown className="w-4 h-4" />
          <span>YEAR-END CHAMPIONSHIP CEREMONY · SEASON {season.year}</span>
        </div>

        {/* Trophy Image & Crown */}
        <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-slate-950 shadow-2xl shadow-amber-500/30">
          <img
            src={TROPHY_IMAGE_URL}
            alt="Championship Trophy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Winner Announcement */}
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            Golden Aegis Cup Champion
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight font-display">
            {winningTeam.name.toUpperCase()}
          </h2>
          <p className="text-xs text-slate-300 italic mt-1 font-serif">
            "{winningTeam.slogan}"
          </p>
          <div className="mt-3 text-2xl font-black font-mono text-amber-400 tabular-nums">
            ${winningTeam.totalBalance.toLocaleString()} FINAL BALANCE
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Backed by {winningTeam.fanCount.toLocaleString()} passionate syndicate backers
          </div>
        </div>

        {/* Podium Standings & Prize Distribution */}
        <div className="grid grid-cols-3 gap-2.5 text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          {/* #2 */}
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400">#2 Silver Podium</div>
            <div className="font-bold text-white truncate mt-0.5">{runnerUpTeam?.name || 'Runner Up'}</div>
            <div className="font-mono text-emerald-400 font-bold mt-1">
              +${secondPrize.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ${runnerUpTeam?.totalBalance.toLocaleString()}
            </div>
          </div>

          {/* #1 Winner */}
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/50">
            <div className="text-[10px] font-bold text-amber-400 flex items-center justify-center gap-1">
              <Crown className="w-3 h-3" />
              <span>#1 CHAMPION</span>
            </div>
            <div className="font-bold text-white truncate mt-0.5">{winningTeam.name}</div>
            <div className="font-mono text-amber-300 font-black text-sm mt-1">
              +${firstPrize.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-400 font-mono">
              ${winningTeam.totalBalance.toLocaleString()}
            </div>
          </div>

          {/* #3 */}
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400">#3 Bronze Podium</div>
            <div className="font-bold text-white truncate mt-0.5">{thirdTeam?.name || 'Third'}</div>
            <div className="font-mono text-emerald-400 font-bold mt-1">
              +${thirdPrize.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ${thirdTeam?.totalBalance.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Season MVP Player Award */}
        {mvpPlayer && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                MVP
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Season MVP Player of the Year
                </div>
                <div className="text-sm font-bold text-white">
                  {mvpPlayer.name} <span className="text-amber-300">"{mvpPlayer.handle}"</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-emerald-400">
                ${mvpPlayer.personalBalance.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">{mvpPlayer.cheerCount.toLocaleString()} cheers</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onStartNewSeason}
            className="w-full sm:flex-1 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>START CHAMPIONSHIP SEASON {season.year + 1}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Inspect Final Archive
          </button>
        </div>
      </div>
    </div>
  );
};
