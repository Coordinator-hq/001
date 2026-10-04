import React, { useState } from 'react';
import { Trophy, Search } from 'lucide-react';
import { Team } from '../types/game';

interface LeaderboardViewProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  teams,
  onSelectTeam
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sort teams strictly by totalBalance descending
  const sortedTeams = [...teams].sort((a, b) => b.totalBalance - a.totalBalance);

  const filteredTeams = sortedTeams.filter((team) => {
    if (!searchQuery) return true;
    return (
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header & Search with Gold & Cursive Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-cursive flex items-center gap-2.5 drop-shadow">
          <Trophy className="w-8 h-8 text-amber-400" />
          <span>Leaderboard</span>
        </h1>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-amber-500/40 rounded-xl pl-9 pr-3 py-2 text-sm font-cursive text-amber-300 placeholder-amber-500/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Elongated Horizontal Team Boxes with Gold & Cursive Lettering */}
      <div className="space-y-4">
        {filteredTeams.map((team, idx) => {
          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className="w-full bg-slate-900/95 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-xl hover:shadow-amber-500/10 flex items-center justify-between cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle gold glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Far Left: Team Logo */}
              <div className="shrink-0 z-10">
                {team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-amber-400/60 shadow-md group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center font-black text-lg sm:text-xl text-amber-300 shadow-md border-2 border-amber-400/60 group-hover:scale-105 transition-transform font-cursive"
                    style={{ backgroundColor: team.primaryColor || '#1e1b4b' }}
                  >
                    {team.tag}
                  </div>
                )}
              </div>

              {/* Center: Stacked Rank, Team Name, and Total Balance in Gold Cursive Font in Naira */}
              <div className="flex-1 flex flex-col items-center justify-center text-center font-cursive text-amber-400 z-10 px-2 select-none">
                {/* 1. Rank */}
                <span className="text-lg sm:text-2xl font-bold tracking-wide text-amber-300/90 drop-shadow-sm leading-tight">
                  Rank #{idx + 1}
                </span>

                {/* 2. Team Name */}
                <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-400 tracking-wide drop-shadow my-0.5 leading-tight group-hover:text-yellow-300 transition-colors">
                  {team.name}
                </h2>

                {/* 3. Total Balance in Naira (₦) */}
                <span className="text-xl sm:text-3xl font-black text-amber-300 tracking-wide drop-shadow leading-tight">
                  ₦{team.totalBalance.toLocaleString()}
                </span>
              </div>

              {/* Far Right Spacer to ensure true geometric center alignment */}
              <div className="w-16 sm:w-20 shrink-0 hidden sm:block pointer-events-none" aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
