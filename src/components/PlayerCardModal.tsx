import React from 'react';
import { X, Award, Flame, Zap, Heart, Shield, TrendingUp } from 'lucide-react';
import { Player, Team } from '../types/game';
import { soundManager } from '../utils/audio';

interface PlayerCardModalProps {
  player: Player;
  team?: Team;
  isFavored: boolean;
  onClose: () => void;
  onQuickCheer: (teamId: string, amount: number, playerId?: string) => void;
}

export const PlayerCardModal: React.FC<PlayerCardModalProps> = ({
  player,
  team,
  isFavored,
  onClose,
  onQuickCheer
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Player Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-amber-400/50 flex items-center justify-center text-xl font-black text-amber-400 shadow-lg">
            {player.handle.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                {player.name}
              </h2>
              <span className="text-xs font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                "{player.handle}"
              </span>
            </div>

            <div className="text-xs text-slate-400 mt-0.5">
              <span>{team?.name || 'Independent Syndicate'}</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span className="text-amber-400 font-semibold">{player.role}</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>{player.fanTier} Tier</span>
            </div>
          </div>
        </div>

        {/* Balance & MVP Score Display */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Crowdfunded Balance:</span>
            <div className="font-mono font-bold text-emerald-400 text-lg mt-0.5 tabular-nums">
              ${player.personalBalance.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">MVP Championship Pts:</span>
            <div className="font-mono font-bold text-amber-400 text-lg mt-0.5 tabular-nums">
              {player.mvpPoints} pts
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Tournament Win Rate:</span>
            <div className="font-mono font-bold text-white text-base mt-0.5">
              {player.winRate}%
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400">Total Fan Cheers:</span>
            <div className="font-mono font-bold text-cyan-400 text-base mt-0.5 tabular-nums">
              {player.cheerCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Player Perks */}
        {player.perks.length > 0 && (
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Signature Abilities & Perks
            </span>
            <div className="flex flex-wrap gap-2">
              {player.perks.map((perk, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-300 font-semibold flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{perk}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Direct Cheer CTA */}
        <div className="pt-2 grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              onQuickCheer(player.teamId, 50, player.id);
              soundManager.playCoin();
            }}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            +$50 Cheer
          </button>
          <button
            onClick={() => {
              onQuickCheer(player.teamId, 250, player.id);
              soundManager.playCheer();
            }}
            className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-xl text-xs font-black hover:brightness-110 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            +$250 Hype
          </button>
          <button
            onClick={() => {
              onQuickCheer(player.teamId, 1000, player.id);
              soundManager.playWhaleDrop();
            }}
            className="py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-black hover:brightness-110 transition-all shadow-md shadow-purple-500/20 cursor-pointer"
          >
            +$1,000 Whale
          </button>
        </div>
      </div>
    </div>
  );
};
