import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Music2,
  Film,
  Twitter,
  Instagram,
  Video,
  Eye,
  Flame,
  Gift,
  Search,
  TrendingUp,
  Radio,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TwitterVerifiedBadge } from './TwitterVerifiedBadge';
import { LeaderboardFigure, SectorCategory, LiveGiftEvent } from '../types/leaderboard';
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
  const [activeSector, setActiveSector] = useState<SectorCategory>('master');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Refs for tab auto-scrolling
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Touch & Mouse Gesture Refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isDraggingMouse = useRef<boolean>(false);

  // Sector indexes and next/prev helpers
  const currentSectorIndex = useMemo(() => {
    const idx = SECTOR_CONFIGS.findIndex((c) => c.id === activeSector);
    return idx >= 0 ? idx : 0;
  }, [activeSector]);

  const nextSector = useMemo(() => {
    return SECTOR_CONFIGS[(currentSectorIndex + 1) % SECTOR_CONFIGS.length];
  }, [currentSectorIndex]);

  const prevSector = useMemo(() => {
    return SECTOR_CONFIGS[(currentSectorIndex - 1 + SECTOR_CONFIGS.length) % SECTOR_CONFIGS.length];
  }, [currentSectorIndex]);

  const handleNextSector = () => {
    setActiveSector(nextSector.id);
    setSearchQuery('');
  };

  const handlePrevSector = () => {
    setActiveSector(prevSector.id);
    setSearchQuery('');
  };

  // Scroll active tab into view when active sector changes
  useEffect(() => {
    const tabEl = tabRefs.current[activeSector];
    if (tabEl) {
      tabEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeSector]);

  // Optimized Touch Swipe Gesture Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Ultra-responsive sensitivity: 25px threshold, 1.05 horizontal/vertical ratio
    if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > Math.abs(deltaY) * 1.05 && deltaTime < 850) {
      if (deltaX < 0) {
        handleNextSector();
      } else {
        handlePrevSector();
      }
    }
  };

  // Mouse Drag Event Handlers for Desktop Testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    isDraggingMouse.current = true;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchStartTime.current = Date.now();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingMouse.current || touchStartX.current === null || touchStartY.current === null) {
      isDraggingMouse.current = false;
      return;
    }
    const deltaX = e.clientX - touchStartX.current;
    const deltaY = e.clientY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    isDraggingMouse.current = false;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > Math.abs(deltaY) * 1.05 && deltaTime < 850) {
      if (deltaX < 0) {
        handleNextSector();
      } else {
        handlePrevSector();
      }
    }
  };

  // Active sector config
  const currentConfig = useMemo(() => {
    return SECTOR_CONFIGS.find((c) => c.id === activeSector) || SECTOR_CONFIGS[0];
  }, [activeSector]);

  // Filtered and sorted figures
  const sortedFigures = useMemo(() => {
    let list = [...figures];

    if (activeSector !== 'master') {
      list = list.filter((f) => f.sector === activeSector);
    }

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
  }, [figures, activeSector, searchQuery]);

  // Podium top 3 & remaining standings
  const top1 = sortedFigures[0];
  const top2 = sortedFigures[1];
  const top3 = sortedFigures[2];
  const remainingRows = sortedFigures.slice(3);

  // Sector Icon Resolver
  const renderSectorIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Trophy':
        return <Trophy className={className} />;
      case 'Music2':
        return <Music2 className={className} />;
      case 'Film':
        return <Film className={className} />;
      case 'Twitter':
        return <Twitter className={className} />;
      case 'Instagram':
        return <Instagram className={className} />;
      case 'Video':
        return <Video className={className} />;
      case 'Eye':
        return <Eye className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="w-full max-w-4xl mx-auto font-sans select-none animate-fadeIn pb-16 pt-2 sm:pt-4 px-2 sm:px-4 touch-pan-y uppercase tracking-wide cursor-grab active:cursor-grabbing"
    >

      {/* Sector Category Navigation Tabs (Pill Switcher) */}
      <nav 
        aria-label="Leaderboard Categories"
        className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none no-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0"
      >
        {SECTOR_CONFIGS.map((sector) => {
          const isActive = activeSector === sector.id;
          return (
            <button
              key={sector.id}
              ref={(el) => {
                tabRefs.current[sector.id] = el;
              }}
              type="button"
              onClick={() => {
                setActiveSector(sector.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border flex-shrink-0 tracking-wider ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.02]'
                  : 'bg-[#0c0e1a] hover:bg-[#161a2e] text-slate-300 border-[#1f243d]'
              }`}
            >
              {renderSectorIcon(sector.icon, isActive ? 'text-black w-3.5 h-3.5' : 'text-slate-400 w-3.5 h-3.5')}
              <span>{sector.label}</span>
              {sector.id === 'master' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  TOP {figures.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live Activity Stream Marquee / Ticker */}
      {liveEvents.length > 0 && (
        <div className="mb-4 bg-[#0a0c16] border border-[#1b2038] rounded-2xl p-2.5 overflow-hidden flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-1 rounded-xl flex-shrink-0 tracking-wider">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="hidden xs:inline">LATEST GIFTS</span>
          </div>

          <div className="overflow-hidden whitespace-nowrap relative w-full text-xs text-slate-300 flex items-center gap-4">
            <div className="flex items-center gap-6 animate-pulse">
              {liveEvents.slice(0, 3).map((evt) => (
                <div key={evt.id} className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase">
                  <span className="font-black text-white">{evt.fanName}</span>
                  <span className="text-slate-500 text-[10px]">GIFTED</span>
                  <span className="font-black text-amber-300">₦{evt.amount.toLocaleString()}</span>
                  <span className="text-slate-500 text-[10px]">TO</span>
                  <span className="font-black text-sky-400">{evt.figureName}</span>
                  <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {evt.sectorLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sector Header Banner & Search */}
      <div className="bg-[#0d1020] border border-[#1e233d] rounded-2xl mb-5 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white flex items-center gap-2 tracking-wide uppercase">
                  <span>{currentConfig.label}</span>
                  <span className="text-xs font-black text-slate-400">
                    ({sortedFigures.length} FIGURES)
                  </span>
                </h2>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {currentConfig.description}
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH STAR, FANDOM OR TAG..."
              className="w-full bg-[#121629] border border-[#232845] focus:border-amber-400 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-white placeholder-slate-500 outline-none transition-colors uppercase tracking-wider"
            />
          </div>
        </div>

        {/* Official Standings Status */}
        <div className="px-4 py-2.5 border-t border-[#1c2138] bg-[#090b14] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Standings</span>
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              • Sorted by Total Gifts
            </span>
          </div>
        </div>
      </div>

      {/* TOP 3 PODIUM SHOWCASE (Shown when no search filter active) */}
      {!searchQuery && top1 && top2 && top3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 pt-6">
          
          {/* Rank 2 (Silver) */}
          <div className="flex flex-col items-center justify-end order-1 sm:order-1">
            <div className="relative w-full bg-[#0b0d18] border border-slate-700/60 rounded-3xl p-3 text-center flex flex-col items-center hover:border-slate-500 transition-all shadow-xl group">
              <div className="absolute -top-3.5 bg-slate-700 text-slate-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Medal className="w-3 h-3 text-slate-300" />
                <span>#2 Rank</span>
              </div>

              <div className="relative my-2">
                <img
                  src={top2.avatarUrl}
                  alt={top2.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-400 shadow-md group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
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

              <button
                type="button"
                onClick={() => onSelectFigureToGift(top2)}
                aria-label={`Gift ${top2.name}`}
                title={`Gift ${top2.name}`}
                className="mt-2.5 w-full py-2 rounded-xl bg-[#171a2e] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow"
              >
                <Gift className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rank 1 (Gold - Elevated Champion) */}
          <div className="flex flex-col items-center justify-end -mt-5 order-2 sm:order-2">
            <div className="relative w-full bg-gradient-to-b from-[#18150c] to-[#0c0d16] border-2 border-amber-400 rounded-3xl p-3 sm:p-4 text-center flex flex-col items-center shadow-[0_0_30px_rgba(245,158,11,0.25)] group">
              <div className="absolute -top-4 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[11px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>#1 Leader</span>
              </div>

              <div className="relative my-2">
                <img
                  src={top1.avatarUrl}
                  alt={top1.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
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

              <button
                type="button"
                onClick={() => onSelectFigureToGift(top1)}
                aria-label={`Gift ${top1.name}`}
                title={`Gift ${top1.name}`}
                className="mt-2.5 w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all cursor-pointer flex items-center justify-center active:scale-95"
              >
                <Gift className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="flex flex-col items-center justify-end order-3 sm:order-3">
            <div className="relative w-full bg-[#0b0d18] border border-amber-800/60 rounded-3xl p-3 text-center flex flex-col items-center hover:border-amber-700 transition-all shadow-xl group">
              <div className="absolute -top-3.5 bg-amber-900/80 text-amber-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Medal className="w-3 h-3 text-amber-400" />
                <span>#3 Rank</span>
              </div>

              <div className="relative my-2">
                <img
                  src={top3.avatarUrl}
                  alt={top3.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-700 shadow-md group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
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

              <button
                type="button"
                onClick={() => onSelectFigureToGift(top3)}
                aria-label={`Gift ${top3.name}`}
                title={`Gift ${top3.name}`}
                className="mt-2.5 w-full py-2 rounded-xl bg-[#171a2e] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow"
              >
                <Gift className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* FULL LEADERBOARD LIST (Ranks 4+ or all when searching) */}
      <div className="bg-[#0b0d18] border border-[#1e233d] rounded-3xl shadow-2xl overflow-hidden">
        <div className="divide-y divide-[#14182b] text-xs">
          {(searchQuery ? sortedFigures : remainingRows).map((row, idx) => {
            const actualRank = searchQuery ? idx + 1 : idx + 4;
            const isTop5 = actualRank <= 5;

            return (
              <div
                key={row.id}
                onClick={() => onSelectFigureToGift(row)}
                className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-4 hover:bg-[#121629]/80 transition-colors cursor-pointer group"
              >
                {/* Rank Number */}
                <div className="w-8 shrink-0 text-center font-black">
                  <span className={`text-xs sm:text-sm ${
                    actualRank === 1 ? 'text-amber-400 text-base' :
                    actualRank === 2 ? 'text-slate-300' :
                    actualRank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{actualRank}
                  </span>
                </div>

                {/* Figure Avatar & Metadata */}
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={row.avatarUrl}
                      alt={row.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border border-[#262c4a] group-hover:border-amber-400/80 transition-all"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {isTop5 && (
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-amber-500 text-black px-1 rounded-full uppercase">
                        TOP 5
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors truncate">
                        {row.name}
                      </span>
                      {row.verified && (
                        <TwitterVerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="text-[9px] font-black bg-[#171c33] text-slate-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                        {row.sectorLabel}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                      {row.fandomName} • <span className="text-slate-500 font-semibold">{row.slogan}</span>
                    </p>
                  </div>
                </div>

                {/* Gifts Received */}
                <div className="text-right shrink-0">
                  <span className="font-black text-amber-300 text-xs sm:text-sm tabular-nums block">
                    ₦{row.totalBalance.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                    {row.fanCount.toLocaleString()} GIFTS
                  </span>
                </div>

                {/* Gift CTA: strictly icon-only, fully in frame */}
                <div className="shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelectFigureToGift(row)}
                    aria-label={`Gift ${row.name}`}
                    title={`Gift ${row.name}`}
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
            NO FIGURES FOUND MATCHING "{searchQuery}"
          </div>
        )}
      </div>

    </div>
  );
};
