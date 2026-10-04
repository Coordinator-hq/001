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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Search with Gold & Cursive Styling */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
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

      {/* Elongated Horizontal Team Boxes with Pure Gold Cursive Typography */}
      <div className="space-y-4">
        {filteredTeams.map((team, idx) => {
          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team)}
              className="w-full bg-slate-900/95 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-400 rounded-2xl py-6 px-6 sm:px-8 transition-all duration-200 shadow-xl hover:shadow-amber-500/10 flex items-center justify-center cursor-pointer group relative overflow-hidden text-center"
            >
              {/* Subtle gold glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Stacked Rank, Team Name, and Total Balance in Gold Cursive Font in Naira */}
              <div className="flex flex-col items-center justify-center font-cursive text-amber-400 z-10 select-none space-y-1">
                {/* 1. Rank */}
                <span className="text-lg sm:text-2xl font-bold tracking-wide text-amber-300/90 drop-shadow-sm leading-tight">
                  Rank #{idx + 1}
                </span>

                {/* 2. Team Name */}
                <h2 className="text-3xl sm:text-5xl font-extrabold text-amber-400 tracking-wide drop-shadow leading-tight group-hover:text-yellow-300 transition-colors">
                  {team.name}
                </h2>

                {/* 3. Total Balance in Naira (₦) */}
                <span className="text-2xl sm:text-4xl font-black text-amber-300 tracking-wide drop-shadow leading-tight">
                  ₦{team.totalBalance.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
