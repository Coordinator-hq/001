/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LeaderboardView } from './components/LeaderboardView';
import { TeamScreen } from './components/TeamScreen';
import { 
  Team, 
  FanActivityEvent 
} from './types/game';
import { 
  INITIAL_TEAMS 
} from './data/initialLeagueData';

const STORAGE_KEYS = {
  TEAMS: 'fanbrawl_hardened_v1',
  EVENTS: 'fanbrawl_events_v1'
};

export default function App() {
  // Navigation State
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Teams State - Hardened: starts with 100,000 each for Arsenal, Man City, Man Utd, Chelsea
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) && 
          parsed.length === 4 && 
          parsed.some(t => t.id === 'arsenal') &&
          parsed.every(t => typeof t.totalBalance === 'number' && !isNaN(t.totalBalance))
        ) {
          return parsed.map((savedTeam: Team) => {
            const initial = INITIAL_TEAMS.find((it) => it.id === savedTeam.id);
            return {
              ...savedTeam,
              logoUrl: savedTeam.logoUrl || initial?.logoUrl
            };
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TEAMS;
  });

  // Fan Activity Events - strictly from real user contributions
  const [liveEvents, setLiveEvents] = useState<FanActivityEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // NO automated steady stream of gifts - balance strictly controlled by real user inputs

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(liveEvents.slice(0, 40)));
  }, [liveEvents]);

  // Handle verified user contribution to credit the pot
  const handlePaymentSuccess = (teamId: string, amount: number) => {
    const validAmount = Math.max(100, Math.floor(Number(amount) || 0));
    if (isNaN(validAmount) || validAmount <= 0) return;

    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            totalBalance: team.totalBalance + validAmount,
            fanCount: team.fanCount + 1
          };
        }
        return team;
      });

      // Re-sort strictly by totalBalance descending
      const sorted = [...updated].sort((a, b) => b.totalBalance - a.totalBalance);
      return sorted.map((t, idx) => ({
        ...t,
        previousRank: t.currentRank,
        currentRank: idx + 1
      }));
    });

    // Record verified user activity event
    const targetTeam = teams.find((t) => t.id === teamId);
    const newEvt: FanActivityEvent = {
      id: `evt_real_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      fanName: 'Real Fan',
      amount: validAmount,
      teamId: teamId,
      teamName: targetTeam?.name || 'Team',
      eventType: validAmount >= 5000 ? 'whale' : 'donation',
      message: `Gifted ₦${validAmount.toLocaleString()} to ${targetTeam?.name || 'Team'}`
    };

    setLiveEvents((prev) => [newEvt, ...prev.slice(0, 39)]);
  };

  const currentSelectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-500 selection:text-white p-3 sm:p-5 flex flex-col items-start justify-start">
      <main className="w-full max-w-4xl mr-auto ml-0">
        {!selectedTeamId ? (
          /* Leaderboard of Four Teams: Arsenal, Man City, Man Utd, Chelsea */
          <LeaderboardView
            teams={teams}
            onSelectTeam={(team) => {
              setSelectedTeamId(team.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentSelectedTeam ? (
          /* Dedicated Team Screen with Real User Gift Input Console */
          <TeamScreen
            team={currentSelectedTeam}
            onBack={() => {
              setSelectedTeamId(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPaymentSuccess={handlePaymentSuccess}
          />
        ) : null}
      </main>
    </div>
  );
}
