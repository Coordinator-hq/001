import React, { useState, useEffect, useRef } from 'react';
import { Flame, Zap, Trophy, Sparkles, Play, RotateCcw, Award } from 'lucide-react';
import { FanProfile, Team } from '../types/game';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface FanFrenzyRushProps {
  favoredTeam?: Team;
  fanProfile: FanProfile;
  onFrenzyComplete: (earnedCoins: number, teamBonusDonation: number, tapCount: number) => void;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export const FanFrenzyRush: React.FC<FanFrenzyRushProps> = ({
  favoredTeam,
  fanProfile,
  onFrenzyComplete
}) => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'SUMMARY'>('IDLE');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [taps, setTaps] = useState<number>(0);
  const [currentCombo, setCurrentCombo] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [highestCombo, setHighestCombo] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reactorRef = useRef<HTMLButtonElement | null>(null);

  // Multiplier tiers based on combo
  const getMultiplier = (combo: number) => {
    if (combo >= 70) return 10;
    if (combo >= 45) return 8;
    if (combo >= 25) return 4;
    if (combo >= 12) return 2;
    return 1;
  };

  const getTierLabel = (combo: number) => {
    if (combo >= 70) return '🔥 10x FRENZY GOD!';
    if (combo >= 45) return '⚡ 8x SUPERNOVA!';
    if (combo >= 25) return '✨ 4x HYPERDRIVE!';
    if (combo >= 12) return '🚀 2x OVERCHARGE!';
    return '1x BASE POWER';
  };

  const startFrenzy = () => {
    setGameState('PLAYING');
    setTimeLeft(15);
    setTaps(0);
    setCurrentCombo(0);
    setTotalEarned(0);
    setHighestCombo(0);
    setFloatingTexts([]);
    soundManager.playLevelUp();
  };

  // Game loop timer
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle game end
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0) {
      setGameState('SUMMARY');
      const teamBonus = Math.round(totalEarned * 1.5);
      onFrenzyComplete(totalEarned, teamBonus, taps);
      soundManager.playVictoryBuzzer();
      triggerConfetti(['#F59E0B', '#EF4444', '#10B981', '#6366F1']);
    }
  }, [timeLeft, gameState, totalEarned, taps, onFrenzyComplete]);

  const handleTap = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (gameState !== 'PLAYING') return;

    const newCombo = currentCombo + 1;
    setCurrentCombo(newCombo);
    if (newCombo > highestCombo) setHighestCombo(newCombo);

    const mult = getMultiplier(newCombo);
    const baseValue = 10;
    const addedValue = baseValue * mult;

    setTaps((prev) => prev + 1);
    setTotalEarned((prev) => prev + addedValue);

    soundManager.playFrenzyTap(newCombo);

    // Create floating text at click position
    const rect = reactorRef.current?.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : (e as React.MouseEvent).clientY;

    const x = clientX - (rect?.left || 0) + (Math.random() - 0.5) * 40;
    const y = clientY - (rect?.top || 0) + (Math.random() - 0.5) * 40;

    const newFloat: FloatingText = {
      id: Date.now() + Math.random(),
      x,
      y,
      text: `+$${addedValue}`,
      color: mult >= 8 ? '#F59E0B' : mult >= 4 ? '#EC4899' : '#10B981'
    };

    setFloatingTexts((prev) => [...prev.slice(-12), newFloat]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span>15-Second Fan Frenzy Mini-Game</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white font-display">
          Tap Rush Stadium Overdrive
        </h2>
        <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto mt-1">
          Tap the Energy Core as fast as you can to trigger high multiplier combo streaks! Earn coins for your wallet and directly boost {favoredTeam?.name || 'your franchise'}!
        </p>
      </div>

      {/* Main Game Arena */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative min-h-[420px] flex flex-col items-center justify-between shadow-2xl overflow-hidden">
        {/* HUD Top Bar */}
        <div className="w-full flex items-center justify-between z-10">
          {/* Timer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">Time:</span>
            <span className={`text-xl font-black font-mono tabular-nums ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Current Tier Multiplier */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Streak Tier</div>
            <div className="text-xs font-black text-amber-400 font-mono">
              {getTierLabel(currentCombo)}
            </div>
          </div>

          {/* Earned Score */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">Total:</span>
            <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
              ${totalEarned.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center Game Action Area */}
        <div className="relative my-8 flex flex-col items-center justify-center">
          {gameState === 'IDLE' && (
            <div className="text-center space-y-4">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-1 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 animate-pulse">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Flame className="w-12 h-12 text-amber-400" />
                </div>
              </div>
              <button
                onClick={startFrenzy}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-base rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-500/25 flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>START FRENZY RUSH</span>
              </button>
            </div>
          )}

          {gameState === 'PLAYING' && (
            <div className="relative">
              {/* Floating Combo Multiplier Text */}
              {floatingTexts.map((f) => (
                <div
                  key={f.id}
                  className="absolute pointer-events-none font-mono font-black text-sm animate-bounce"
                  style={{
                    left: `${f.x}px`,
                    top: `${f.y}px`,
                    color: f.color
                  }}
                >
                  {f.text}
                </div>
              ))}

              {/* Energy Core Pulsing Button */}
              <button
                ref={reactorRef}
                onClick={handleTap}
                className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-yellow-400 p-2 shadow-2xl shadow-amber-500/40 transform active:scale-95 transition-transform cursor-pointer focus:outline-none select-none relative group"
              >
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center border-4 border-amber-400/40">
                  <Zap className="w-14 h-14 text-amber-400 group-hover:scale-110 transition-transform animate-pulse" />
                  <span className="text-xl font-black text-white font-mono mt-1">
                    TAP!
                  </span>
                  <span className="text-xs font-mono text-amber-300">
                    {currentCombo} Combo ({getMultiplier(currentCombo)}x)
                  </span>
                </div>
              </button>
            </div>
          )}

          {gameState === 'SUMMARY' && (
            <div className="text-center space-y-4 max-w-md bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-xl font-black text-white">Frenzy Complete!</h3>
              
              <div className="grid grid-cols-2 gap-3 text-left text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Total Taps:</span>
                  <div className="text-base font-bold font-mono text-white">{taps}</div>
                </div>
                <div>
                  <span className="text-slate-400">Max Combo Streak:</span>
                  <div className="text-base font-bold font-mono text-amber-400">{highestCombo}x</div>
                </div>
                <div>
                  <span className="text-slate-400">Coins Added to Wallet:</span>
                  <div className="text-base font-bold font-mono text-emerald-400">+${totalEarned.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-400">Team Vault Bonus:</span>
                  <div className="text-base font-bold font-mono text-amber-300">+${Math.round(totalEarned * 1.5).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center pt-2">
                <button
                  onClick={startFrenzy}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Combo Gauge at Bottom */}
        <div className="w-full">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Combo Overdrive Meter</span>
            <span className="font-mono text-amber-400">{currentCombo} Hits</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-150"
              style={{ width: `${Math.min(100, (currentCombo / 70) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
