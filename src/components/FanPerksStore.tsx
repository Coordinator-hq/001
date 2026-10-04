import React from 'react';
import { Zap, Coins, Megaphone, Tv, ShoppingBag, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { FanPerkItem, FanProfile, Team } from '../types/game';
import { FAN_PERKS_CATALOG } from '../data/initialLeagueData';
import { soundManager } from '../utils/audio';

interface FanPerksStoreProps {
  fanProfile: FanProfile;
  favoredTeam?: Team;
  onBuyPerk: (perk: FanPerkItem) => void;
}

export const FanPerksStore: React.FC<FanPerksStoreProps> = ({
  fanProfile,
  favoredTeam,
  onBuyPerk
}) => {
  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case 'Megaphone':
        return <Megaphone className="w-5 h-5 text-amber-400" />;
      case 'Coins':
        return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Championship Armory</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white font-display">
              Fan Syndicate Perks & Power-Ups
            </h3>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              Equip powerful cheer boosters, sponsor match contracts, and arena banners to multiply your crowdfunding impact.
            </p>
          </div>

          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Wallet:</span>
            <span className="text-sm font-bold font-mono text-amber-300 tabular-nums">
              ${fanProfile.coins.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Active Boosters */}
        {fanProfile.activeBoosters.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Currently Active Multipliers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fanProfile.activeBoosters.map((booster) => {
                const secondsLeft = Math.max(0, Math.round((booster.expiresAt - Date.now()) / 1000));
                return (
                  <div
                    key={booster.id}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs"
                  >
                    <span className="font-bold text-white">{booster.name}</span>
                    <span className="font-mono text-amber-400 font-black">
                      {booster.multiplier}x
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      ({secondsLeft}s left)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Perk Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FAN_PERKS_CATALOG.map((perk) => {
          const canAfford = fanProfile.coins >= perk.cost;

          return (
            <div
              key={perk.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {getPerkIcon(perk.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{perk.name}</h4>
                      <span className="text-[11px] text-amber-400 font-mono">
                        {perk.durationSec ? `${perk.durationSec}s Temporary Boost` : 'Permanent Franchise Upgrade'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black font-mono text-amber-300 tabular-nums">
                      ${perk.cost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3">{perk.description}</p>
                <div className="text-[11px] text-slate-500 italic mt-1 font-serif">
                  "{perk.flavor}"
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    onBuyPerk(perk);
                    soundManager.playLevelUp();
                  }}
                  disabled={!canAfford}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>
                    {canAfford ? `Equip for $${perk.cost.toLocaleString()}` : `Insufficient Coins ($${perk.cost.toLocaleString()})`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
