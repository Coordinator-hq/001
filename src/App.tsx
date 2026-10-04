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
  TEAMS: 'apex_teams_v6',
  EVENTS: 'apex_events_v6'
};

export default function App() {
  // Navigation State
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Teams State
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4 && parsed.some(t => t.id === 'wizkid')) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TEAMS;
  });

  // Fan Activity Events
  const [liveEvents, setLiveEvents] = useState<FanActivityEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(liveEvents.slice(0, 40)));
  }, [liveEvents]);

  // Handle successful Flutterwave payment to credit the pot
  const handlePaymentSuccess = (teamId: string, amount: number) => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            totalBalance: team.totalBalance + amount,
            fanCount: team.fanCount + 1
          };
        }
        return team;
      });

      // Re-sort and rank
      const sorted = [...updated].sort((a, b) => b.totalBalance - a.totalBalance);
      return sorted.map((t, idx) => ({
        ...t,
        previousRank: t.currentRank,
        currentRank: idx + 1
      }));
    });

    // Record activity event
    const targetTeam = teams.find((t) => t.id === teamId);
    const newEvt: FanActivityEvent = {
      id: `evt_fw_${Date.now()}`,
      timestamp: Date.now(),
      fanName: 'Contributor',
      amount: amount,
      teamId: teamId,
      teamName: targetTeam?.name || 'Franchise',
      eventType: amount >= 5000 ? 'whale' : 'donation',
      message: 'Contributed to the pot!'
    };

    setLiveEvents((prev) => [newEvt, ...prev.slice(0, 39)]);
  };

  const sortedTeams = [...teams].sort((a, b) => b.totalBalance - a.totalBalance);
  const currentSelectedTeam = teams.find((t) => t.id === selectedTeamId);
  const currentTeamRank = currentSelectedTeam ? sortedTeams.findIndex((t) => t.id === currentSelectedTeam.id) + 1 : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        {!selectedTeamId ? (
          /* Leaderboard Main View: Just the leaderboard with team names and total balance */
          <LeaderboardView
            teams={teams}
            onSelectTeam={(team) => {
              setSelectedTeamId(team.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentSelectedTeam ? (
          /* Dedicated Team Screen with Flutterwave Payment Gateway */
          <TeamScreen
            team={currentSelectedTeam}
            rank={currentTeamRank}
            totalTeams={teams.length}
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
