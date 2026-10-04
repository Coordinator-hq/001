import React from 'react';
import { X, Heart, Flame, Trophy, Users, Zap, Shield, Crown } from 'lucide-react';
import { Team, Player } from '../types/game';
import { soundManager } from '../utils/audio';

interface TeamDetailModalProps {
  team: Team;
  isFavored: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Player) => void;
  onQuickCheer: (teamId: string, amount: number, playerId?: string) => void;
  onSetFavoredTeam: (teamId: string) => void;
}

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  isFavored,
  onClose,
  onSelectPlayer,
  onQuickCheer,
  onSetFavoredTeam
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Team Header */}
        <div className="flex items-start gap-4">
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-slate-700 shadow-lg shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg"
              style={{ backgroundColor: team.primaryColor }}
            >
              {team.tag}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white truncate">
                {team.name}
              </h2>
              <span className="text-xs font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-bold">
                {team.tag}
              </span>
              <span className="text-xs font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                Rank #{team.currentRank}
              </span>
            </div>

            <p className="text-xs text-slate-300 italic mt-0.5 font-serif">
              "{team.slogan}"
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span>{team.fanCount.toLocaleString()} Backers</span>
              <span aria-hidden="true">·</span>
              <span>{team.championshipWins} Aegis Cups</span>
            </div>
          </div>

          <button
            onClick={() => onSetFavoredTeam(team.id)}
            className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer shrink-0 ${
              isFavored
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavored ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Bio */}
        <p className="text-xs md:text-sm text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          {team.bio}
        </p>

        {/* Balance & Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Total Crowdfund:</span>
            <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
              ${team.totalBalance.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Passive Vault:</span>
            <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">
              +${team.passiveIncomePerSec}/sec
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Boost Multiplier:</span>
            <div className="font-mono font-bold text-cyan-400 text-sm mt-0.5">
              {team.boostMultiplier.toFixed(2)}x
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Season Standing:</span>
            <div className="font-mono font-bold text-white text-sm mt-0.5">
              Top Tier #{team.currentRank}
            </div>
          </div>
        </div>

        {/* Star Players Roster */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Star Players & Active Roster ({team.players.length})
          </h3>
          <div className="space-y-2">
            {team.players.map((player) => (
              <div
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-amber-400">
                    {player.handle.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {player.name} <span className="text-amber-400 font-normal">"{player.handle}"</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {player.role} · {player.fanTier} · {player.winRate}% Win Rate
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-emerald-400">
                      ${player.personalBalance.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {player.cheerCount.toLocaleString()} cheers
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickCheer(team.id, 50, player.id);
                      soundManager.playCoin();
                    }}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    +$50
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Team Cheer Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => {
              onQuickCheer(team.id, 100);
              soundManager.playCoin();
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Flame className="w-4 h-4" />
            <span>Cheer Entire Team Vault +$100</span>
          </button>
        </div>
      </div>
    </div>
  );
};
