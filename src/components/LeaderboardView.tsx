import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Team } from '../types/game';

export interface FandomLeaderboardItem extends Team {
  fandomName: string;
  battleId: string;
  battleTitle: string;
}

interface LeaderboardViewProps {
  fandoms: FandomLeaderboardItem[];
  onBack: () => void;
  onSelectBattle: (battleId: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  fandoms,
  onBack,
  onSelectBattle
}) => {
  // Ranking is based strictly on gifts received (descending)
  const sortedRows = [...fandoms]
    .map((f) => ({
      ...f,
      gifts: f.totalBalance || 0
    }))
    .sort((a, b) => b.gifts - a.gifts);

  return (
    <div className="w-full max-w-[500px] mx-auto font-sans select-none animate-fadeIn pb-8 px-1">
      
      {/* Top Bar with Back Navigation */}
      <div className="flex items-center justify-between py-2 mb-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Battle"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0f111e] hover:bg-[#1a1d30] border border-[#232742] px-3.5 py-1.5 rounded-full transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-300" />
          <span>Back to Battle</span>
        </button>

        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          Live Fandom Standings
        </span>
      </div>

      {/* Main Standings Table Container */}
      <div className="bg-[#0b0c16] border border-[#1e2238] rounded-2xl shadow-2xl overflow-hidden">
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1a1d30] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0a0b14]">
              <th scope="col" className="py-3.5 pl-4 pr-2 text-left font-normal">
                Rank
              </th>
              <th
                scope="col"
                className="py-3.5 pl-2 pr-4 text-right font-normal text-slate-300"
              >
                Gifts Received
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#151829] text-xs">
            {sortedRows.map((row, index) => {
              const rank = index + 1;
              const isTopRanked = rank <= 3;

              return (
                <tr
                  key={`fandom_${row.id}`}
                  onClick={() => onSelectBattle(row.battleId)}
                  className="hover:bg-[#131627] transition-colors cursor-pointer group"
                >
                  {/* Rank & Fandom Info with Logo */}
                  <td className="py-3.5 pl-3 pr-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank Number with subtle left qualification stripe */}
                      <div className="relative pl-2.5 flex items-center justify-center min-w-[22px]">
                        {isTopRanked && (
                          <span className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-blue-500" />
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-300 group-hover:text-white tabular-nums">
                          {rank}
                        </span>
                      </div>

                      {/* Fandom Avatar */}
                      <img
                        src={row.logoUrl}
                        alt={row.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-[#232742] shadow-sm flex-shrink-0"
                      />

                      {/* Fandom and Star Name */}
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-semibold text-white truncate block group-hover:text-amber-300 transition-colors">
                          {row.fandomName}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {row.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Gifts Received */}
                  <td className="py-3.5 pl-2 pr-4 text-right font-extrabold text-amber-300 text-sm sm:text-base tabular-nums">
                    ₦{row.gifts.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer Link to return to Battle */}
        <div className="p-3 bg-[#0a0b14] border-t border-[#1a1d30] flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 px-4 rounded-full bg-[#141628] hover:bg-[#1e223b] border border-[#252a48] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
          >
            <span>Back to Battle Arena</span>
          </button>
          <span className="text-[10px] text-slate-500">
            Tap any fandom to jump to their live battle
          </span>
        </div>

      </div>
    </div>
  );
};
