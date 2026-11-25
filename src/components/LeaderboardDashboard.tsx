import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Search,
  Lock,
  CalendarCheck,
  Gift,
  Award
} from 'lucide-react';
import { TwitterVerifiedBadge } from './TwitterVerifiedBadge';
import { CelebrityAvatar } from './CelebrityAvatar';
import { LeaderboardFigure, LiveGiftEvent } from '../types/leaderboard';
import { SECTOR_CONFIGS } from '../data/leaderboardData';

interface LeaderboardDashboardProps {
  figures: LeaderboardFigure[];
  liveEvents: LiveGiftEvent[];
  onSelectFigureToGift: (figure: LeaderboardFigure) => void;
}

export const LeaderboardDashboard: React.FC<LeaderboardDashboardProps> = ({
  figures,
  liveEvents,
  onSelectFigureToGift
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const boardConfig = SECTOR_CONFIGS[0];

  const sortedFigures = useMemo(() => {
    let list = [...figures];
    list.sort((a, b) => b.totalBalance - a.totalBalance);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.fandomName.toLowerCase().includes(q) ||
          f.tag.toLowerCase().includes(q) ||
          f.slogan.toLowerCase().includes(q)
      );
    }

    return list;
  }, [figures, searchQuery]);

  const campaignTotals = useMemo(() => {
    const allSorted = [...figures].sort((a, b) => b.totalBalance - a.totalBalance);
    const totalPool = figures.reduce((acc, f) => acc + f.totalBalance, 0);
    const totalGifts = figures.reduce((acc, f) => acc + f.fanCount, 0);
    const winner = allSorted[0];
    return { totalPool, totalGifts, winner };
  }, [figures]);

  const top1 = sortedFigures[0];
  const top2 = sortedFigures[1];
  const top3 = sortedFigures[2];
  const remainingRows = sortedFigures.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto font-sans select-none animate-fadeIn pb-16 pt-2 sm:pt-4 px-2 sm:px-4 uppercase tracking-wide">
      {/* Final Week Recap Ticker */}
      <div className="mb-4 bg-[#0a0c16] border border-[#1b2038] rounded-2xl p-2.5 overflow-hidden flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl flex-shrink-0 tracking-wider">
          <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>WEEK 1 RECAP</span>
        </div>

        {liveEvents.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar whitespace-nowrap relative w-full text-xs text-slate-300 flex items-center gap-4">
            <div className="flex items-center gap-6">
              {liveEvents.slice(0, 4).map((evt, i) => (
                <div key={evt.id} className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase shrink-0">
                  {i === 0 && (
                    <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                      FINAL BOOST
                    </span>
                  )}
                  <span className="font-black text-white">{evt.fanName}</span>
                  <span className="text-slate-500 text-[10px]">GIFTED</span>
                  <span className="font-black text-amber-300 tabular-nums">₦{evt.amount.toLocaleString()}</span>
                  <span className="text-slate-500 text-[10px]">TO</span>
                  <span className="font-black text-sky-400">{evt.figureName}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-2 truncate tracking-wider">
            <span className="text-amber-400 font-black">7-DAY GIFTING CAMPAIGN CONCLUDED</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="hidden sm:inline">FINAL RESULTS LOCKED FOR ALL {figures.length} ARTISTES</span>
          </div>
        )}
      </div>

      {/* Single Leaderboard Header Banner & Campaign Summary */}
      <div className="bg-[#0d1020] border border-[#1e233d] rounded-2xl mb-5 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                {boardConfig.label}
              </h2>
              <span className="text-xs font-black text-slate-400">
                ({sortedFigures.length} ARTISTES)
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {boardConfig.description}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ARTISTE OR FANDOM..."
              className="w-full bg-[#121629] border border-[#232845] focus:border-amber-400 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 outline-none transition-colors uppercase tracking-wider"
            />
          </div>
        </div>

        {/* Ended Campaign Metrics Strip */}
        <div className="px-4 py-3 border-t border-[#1c2138] bg-[#090b14] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px]">STATUS</span>
              <span className="text-amber-300 font-black">ENDED · 7 DAYS</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">FINAL POOL GIFTED</span>
            <span className="text-white font-black tabular-nums">
              ₦{campaignTotals.totalPool.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">TOTAL FAN GIFTS</span>
            <span className="text-white font-black tabular-nums">
              {campaignTotals.totalGifts.toLocaleString()} GIFTS
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px]">WEEK 1 WINNER</span>
            <span className="text-amber-400 font-black truncate block">
              {campaignTotals.winner?.name ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* TOP 3 FINAL PODIUM SHOWCASE (Shown when no search filter active) */}
      {!searchQuery && top1 && top2 && top3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 pt-6">
          {/* Rank 2 (Silver - Runner-Up) */}
          <div className="flex flex-col items-center justify-end order-1">
            <div
              onClick={() => onSelectFigureToGift(top2)}
              className="relative w-full bg-[#0b0d18] border border-slate-700/60 rounded-3xl p-3 text-center flex flex-col items-center hover:border-slate-500 transition-all shadow-xl group cursor-pointer"
            >
              <div className="absolute -top-3.5 bg-slate-700 text-slate-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Medal className="w-3 h-3 text-slate-300" />
                <span>#2 Runner-Up</span>
              </div>

              <div className="relative my-2">
                <CelebrityAvatar
                  src={top2.avatarUrl}
                  name={top2.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-400 shadow-md group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex items-center justify-center gap-1 max-w-full px-1">
                <span className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                  {top2.name}
                </span>
                {top2.verified && (
                  <TwitterVerifiedBadge className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate max-w-full block mb-1">
                {top2.fandomName}
              </span>

              <span className="text-xs sm:text-sm font-black text-amber-300 tabular-nums">
                ₦{top2.totalBalance.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500 font-bold tabular-nums mt-0.5">
                {top2.fanCount.toLocaleString()} GIFTS
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFigureToGift(top2);
                }}
                aria-label={`View ${top2.name} final stats`}
                title={`View ${top2.name} final stats`}
                className="mt-2.5 w-full py-2 rounded-xl bg-[#171a2e] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-black active:scale-95 shadow"
              >
                <Gift className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FINAL CARD</span>
              </button>
            </div>
          </div>

          {/* Rank 1 (Gold - Week 1 Champion) */}
          <div className="flex flex-col items-center justify-end -mt-5 order-2">
            <div
              onClick={() => onSelectFigureToGift(top1)}
              className="relative w-full bg-gradient-to-b from-[#18150c] to-[#0c0d16] border-2 border-amber-400 rounded-3xl p-3 sm:p-4 text-center flex flex-col items-center shadow-[0_0_30px_rgba(245,158,11,0.25)] group cursor-pointer"
            >
              <div className="absolute -top-4 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[11px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>#1 Winner</span>
              </div>

              <div className="relative my-2">
                <CelebrityAvatar
                  src={top1.avatarUrl}
                  name={top1.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex items-center justify-center gap-1 max-w-full px-1">
                <span className="text-sm sm:text-base font-black text-white truncate leading-tight">
                  {top1.name}
                </span>
                {top1.verified && (
                  <TwitterVerifiedBadge className="w-4 h-4" />
                )}
              </div>
              <span className="text-[11px] text-amber-300/90 font-bold truncate max-w-full block mb-1">
                {top1.fandomName}
              </span>

              <span className="text-sm sm:text-base font-black text-amber-300 tabular-nums">
                ₦{top1.totalBalance.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-bold tabular-nums mt-0.5">
                {top1.fanCount.toLocaleString()} GIFTS
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFigureToGift(top1);
                }}
                aria-label={`View ${top1.name} champion card`}
                title={`View ${top1.name} champion card`}
                className="mt-2.5 w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-black active:scale-95"
              >
                <Award className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CHAMPION CARD</span>
              </button>
            </div>
          </div>

          {/* Rank 3 (Bronze - 3rd Place) */}
          <div className="flex flex-col items-center justify-end order-3">
            <div
              onClick={() => onSelectFigureToGift(top3)}
              className="relative w-full bg-[#0b0d18] border border-amber-800/60 rounded-3xl p-3 text-center flex flex-col items-center hover:border-amber-700 transition-all shadow-xl group cursor-pointer"
            >
              <div className="absolute -top-3.5 bg-amber-900/80 text-amber-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Medal className="w-3 h-3 text-amber-400" />
                <span>#3 Place</span>
              </div>

              <div className="relative my-2">
                <CelebrityAvatar
                  src={top3.avatarUrl}
                  name={top3.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-700 shadow-md group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex items-center justify-center gap-1 max-w-full px-1">
                <span className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                  {top3.name}
                </span>
                {top3.verified && (
                  <TwitterVerifiedBadge className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-[10px] text-slate-400 truncate max-w-full block mb-1">
                {top3.fandomName}
              </span>

              <span className="text-xs sm:text-sm font-black text-amber-300 tabular-nums">
                ₦{top3.totalBalance.toLocaleString()}
              </span>
              <span className="text-[9px] text-slate-500 font-bold tabular-nums mt-0.5">
                {top3.fanCount.toLocaleString()} GIFTS
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFigureToGift(top3);
                }}
                aria-label={`View ${top3.name} final stats`}
                title={`View ${top3.name} final stats`}
                className="mt-2.5 w-full py-2 rounded-xl bg-[#171a2e] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-[10px] font-black active:scale-95 shadow"
              >
                <Gift className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FINAL CARD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL FINAL STANDINGS LIST (Ranks 4–10 or all when searching) */}
      <div className="bg-[#0b0d18] border border-[#1e233d] rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-[#080a13] border-b border-[#14182b] flex items-center justify-between text-[10px] font-black text-slate-400 tracking-wider">
          <span>FINAL OFFICIAL STANDINGS · WEEK 1</span>
          <span>TOTAL GIFTS RECEIVED</span>
        </div>

        <div className="divide-y divide-[#14182b] text-xs">
          {(searchQuery ? sortedFigures : remainingRows).map((row, idx) => {
            const actualRank = searchQuery ? idx + 1 : idx + 4;
            const sharePercent = campaignTotals.totalPool > 0
              ? ((row.totalBalance / campaignTotals.totalPool) * 100).toFixed(1)
              : '0.0';

            return (
              <div
                key={row.id}
                onClick={() => onSelectFigureToGift(row)}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-4 hover:bg-[#121629]/80 transition-colors cursor-pointer group"
              >
                {/* Rank Number */}
                <div className="w-8 shrink-0 text-center font-black tabular-nums">
                  <span
                    className={`text-xs sm:text-sm ${
                      actualRank === 1
                        ? 'text-amber-400 text-base'
                        : actualRank === 2
                        ? 'text-slate-300'
                        : actualRank === 3
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`}
                  >
                    #{actualRank}
                  </span>
                </div>

                {/* Artiste Avatar & Metadata */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <CelebrityAvatar
                      src={row.avatarUrl}
                      name={row.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-[#262c4a] group-hover:border-amber-400/80 transition-all"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors truncate">
                        {row.name}
                      </span>
                      {row.verified && (
                        <TwitterVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                      {row.fandomName} · <span className="text-slate-500 font-semibold">{sharePercent}% OF POOL</span>
                    </p>
                  </div>
                </div>

                {/* Final Gifts Received */}
                <div className="text-right shrink-0">
                  <span className="font-black text-amber-300 text-xs sm:text-sm tabular-nums block">
                    ₦{row.totalBalance.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider tabular-nums">
                    {row.fanCount.toLocaleString()} GIFTS
                  </span>
                </div>

                {/* Profile / Gift Icon */}
                <div className="shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectFigureToGift(row)}
                    aria-label={`View ${row.name} profile`}
                    title={`View ${row.name} profile`}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 hover:bg-amber-400 text-amber-400 hover:text-black border border-amber-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                  >
                    <Gift className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {sortedFigures.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs font-black uppercase tracking-wider">
            NO ARTISTES FOUND MATCHING "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
