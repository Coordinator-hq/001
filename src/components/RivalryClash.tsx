import React, { useState, useEffect } from 'react';
import { Flame, Swords, Shield, Trophy, Zap, AlertTriangle, RotateCcw } from 'lucide-react';
import { Team, FanProfile } from '../types/game';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface RivalryClashProps {
  teams: Team[];
  fanProfile: FanProfile;
  onRivalryWin: (winningTeamId: string, prizeBalance: number) => void;
}

export const RivalryClash: React.FC<RivalryClashProps> = ({
  teams,
  fanProfile,
  onRivalryWin
}) => {
  const [teamAId, setTeamAId] = useState<string>(teams[0]?.id || '');
  const [teamBId, setTeamBId] = useState<string>(teams[1]?.id || '');
  const [tugPosition, setTugPosition] = useState<number>(50); // 50 is center, 0 is Team A win, 100 is Team B win
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState<number>(25);
  const [winnerTeam, setWinnerTeam] = useState<Team | null>(null);

  const teamA = teams.find((t) => t.id === teamAId) || teams[0];
  const teamB = teams.find((t) => t.id === teamBId) || teams[1];

  const prizePool = Math.round((teamA.totalBalance + teamB.totalBalance) * 0.05);

  const startClash = () => {
    setIsPlaying(true);
    setTugPosition(50);
    setRoundTimeLeft(25);
    setWinnerTeam(null);
    soundManager.playLevelUp();
  };

  // Clash timer & bot simulation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let botInterval: NodeJS.Timeout | null = null;

    if (isPlaying) {
      timer = setInterval(() => {
        setRoundTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Bot crowd cheer pushes
      botInterval = setInterval(() => {
        const delta = (Math.random() - 0.48) * 4; // slight random fluctuation
        setTugPosition((pos) => {
          const next = Math.max(0, Math.min(100, pos + delta));
          return next;
        });
      }, 400);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (botInterval) clearInterval(botInterval);
    };
  }, [isPlaying]);

  // Check victory condition
  useEffect(() => {
    if (isPlaying) {
      if (tugPosition <= 5) {
        // Team A wins
        endClash(teamA);
      } else if (tugPosition >= 95) {
        // Team B wins
        endClash(teamB);
      } else if (roundTimeLeft === 0) {
        // Time ran out, determine winner by position
        const winner = tugPosition < 50 ? teamA : teamB;
        endClash(winner);
      }
    }
  }, [tugPosition, roundTimeLeft, isPlaying, teamA, teamB]);

  const endClash = (winner: Team) => {
    setIsPlaying(false);
    setWinnerTeam(winner);
    onRivalryWin(winner.id, prizePool);
    soundManager.playVictoryBuzzer();
    triggerConfetti(['#F59E0B', '#10B981', '#EC4899', '#3B82F6']);
  };

  const handleCheerA = () => {
    if (!isPlaying) return;
    setTugPosition((pos) => Math.max(0, pos - 3.5));
    soundManager.playCoin();
  };

  const handleCheerB = () => {
    if (!isPlaying) return;
    setTugPosition((pos) => Math.min(100, pos + 3.5));
    soundManager.playCoin();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Swords className="w-4 h-4 text-rose-400" />
          <span>Live Fan Tug-of-War Rivalry Arena</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white font-display">
          Head-to-Head Momentum Battle
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto mt-1">
          Two top franchises clash in real-time! Spam cheers for your side to pull the momentum beam into your victory zone and claim the <span className="text-emerald-400 font-bold font-mono">+${prizePool.toLocaleString()} Vault Bonus</span>!
        </p>
      </div>

      {/* Arena Stage */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
        {/* Team Matchup Selectors (When not playing) */}
        {!isPlaying && !winnerTeam && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Red Corner Franchise
              </label>
              <select
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                {teams.filter((t) => t.id !== teamBId).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (${t.totalBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Blue Corner Franchise
              </label>
              <select
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              >
                {teams.filter((t) => t.id !== teamAId).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (${t.totalBalance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Matchup Header Display */}
        <div className="grid grid-cols-2 gap-4 items-center mb-6">
          {/* Team A Card */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            {teamA.logoUrl ? (
              <img
                src={teamA.logoUrl}
                alt={teamA.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-amber-500/50 mb-2 shadow-md"
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg text-white mb-2"
                style={{ backgroundColor: teamA.primaryColor }}
              >
                {teamA.tag}
              </div>
            )}
            <h3 className="font-extrabold text-white text-sm md:text-base">{teamA.name}</h3>
            <span className="text-xs font-mono text-amber-400 font-bold">
              ${teamA.totalBalance.toLocaleString()}
            </span>
            <button
              onClick={handleCheerA}
              disabled={!isPlaying}
              className={`mt-3 w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isPlaying
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 active:scale-95 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>CHEER {teamA.tag} (PULL LEFT)</span>
            </button>
          </div>

          {/* Team B Card */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            {teamB.logoUrl ? (
              <img
                src={teamB.logoUrl}
                alt={teamB.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover border border-cyan-500/50 mb-2 shadow-md"
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg text-white mb-2"
                style={{ backgroundColor: teamB.primaryColor }}
              >
                {teamB.tag}
              </div>
            )}
            <h3 className="font-extrabold text-white text-sm md:text-base">{teamB.name}</h3>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              ${teamB.totalBalance.toLocaleString()}
            </span>
            <button
              onClick={handleCheerB}
              disabled={!isPlaying}
              className={`mt-3 w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isPlaying
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 active:scale-95 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>CHEER {teamB.tag} (PULL RIGHT)</span>
            </button>
          </div>
        </div>

        {/* Center Tug-of-War Beam Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-amber-400 font-bold">{teamA.name} Zone (0%)</span>
            <span className="text-slate-300 font-bold">{roundTimeLeft}s Time Left</span>
            <span className="text-cyan-400 font-bold">{teamB.name} Zone (100%)</span>
          </div>

          <div className="relative w-full h-8 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 p-1">
            {/* Center Line marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10 -translate-x-1/2" />
            {/* Tug indicator knob */}
            <div
              className="absolute top-1 bottom-1 w-7 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-400 shadow-lg shadow-white/20 transition-all duration-100 ease-out -translate-x-1/2 flex items-center justify-center"
              style={{ left: `${tugPosition}%` }}
            >
              <Flame className="w-4 h-4 text-slate-950" />
            </div>
          </div>
        </div>

        {/* Controls / Victory Banner */}
        <div className="text-center pt-2">
          {!isPlaying && !winnerTeam && (
            <button
              onClick={startClash}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white font-black text-sm rounded-xl hover:brightness-110 transition-all shadow-lg shadow-rose-500/25 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>START RIVALRY CLASH</span>
            </button>
          )}

          {winnerTeam && (
            <div className="p-4 bg-slate-900 border border-amber-500/50 rounded-2xl max-w-md mx-auto space-y-3">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
              <div className="text-base font-black text-white">
                VICTORY! {winnerTeam.name.toUpperCase()} WINS!
              </div>
              <div className="text-xs font-mono text-emerald-400">
                +${prizePool.toLocaleString()} Vault Bonus Added!
              </div>
              <button
                onClick={startClash}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Play Another Match</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
