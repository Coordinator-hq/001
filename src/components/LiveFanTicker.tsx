import React from 'react';
import { Activity, Flame, Zap, Heart, Shield, Crown } from 'lucide-react';
import { FanActivityEvent } from '../types/game';

interface LiveFanTickerProps {
  events: FanActivityEvent[];
}

export const LiveFanTicker: React.FC<LiveFanTickerProps> = ({ events }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Global Fan Activity Stream</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-6">
            Awaiting upcoming live fan contributions...
          </div>
        ) : (
          events.slice(0, 15).map((evt) => {
            const isWhale = evt.eventType === 'whale' || evt.amount >= 2500;
            const isFrenzy = evt.eventType === 'frenzy';

            return (
              <div
                key={evt.id}
                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all animate-fadeIn ${
                  isWhale
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : isFrenzy
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-200'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isWhale ? (
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : isFrenzy ? (
                    <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}

                  <div className="truncate">
                    <span className="font-bold text-white">{evt.fanName}</span>
                    <span className="text-slate-400 mx-1">cheered</span>
                    <span className="font-semibold text-white">
                      {evt.playerName ? `"${evt.playerName}" (${evt.teamName})` : evt.teamName}
                    </span>
                    {evt.message && (
                      <span className="text-slate-400 text-[11px] block truncate italic">
                        "{evt.message}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right font-mono font-bold tabular-nums">
                  <span className={isWhale ? 'text-amber-400 font-black' : 'text-emerald-400'}>
                    +${evt.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
