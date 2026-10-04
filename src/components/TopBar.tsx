import React from 'react';
import { Volume2, VolumeX, Sparkles, Coins, Trophy } from 'lucide-react';
import { SeasonState } from '../types/game';
import { soundManager } from '../utils/audio';

interface TopBarProps {
  onGoHome: () => void;
  walletBalance: number;
  season: SeasonState;
  isMuted: boolean;
  onToggleMute: () => void;
  onClaimDailyFaucet: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onGoHome,
  walletBalance,
  season,
  isMuted,
  onToggleMute,
  onClaimDailyFaucet
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Link */}
        <button
          onClick={onGoHome}
          className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
        >
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="font-extrabold text-lg tracking-tight text-white font-display">
            Apex Dynasty
          </span>
          <span className="text-xs font-mono text-amber-400/90 font-medium">
            Season {season.year}
          </span>
        </button>

        {/* Right Zone: Wallet & Controls */}
        <div className="flex items-center gap-3">
          {/* Fan Wallet Balance */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-1.5 shadow-sm">
            <Coins className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Wallet:</span>
              <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                ${walletBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Faucet button */}
          <button
            onClick={() => {
              onClaimDailyFaucet();
              soundManager.playCoin();
            }}
            title="Get +$500 Free Fan Balance to send gifts"
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/20 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+$500 Coins</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
