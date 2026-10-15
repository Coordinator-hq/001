/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PvPBattleDashboard } from './components/PvPBattleDashboard';
import { 
  Team, 
  FanActivityEvent 
} from './types/game';
import { 
  INITIAL_TEAMS 
} from './data/initialLeagueData';

const STORAGE_KEYS = {
  TEAMS: 'fanbrawl_matchup_tacha_mercy_v1',
  EVENTS: 'fanbrawl_events_tacha_mercy_v1'
};

export default function App() {
  // Navigation State
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Teams State - Tacha vs Mercy Lambo
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) && 
          parsed.length === 2 && 
          parsed.some(t => t.id === 'tacha') &&
          parsed.every(t => typeof t.totalBalance === 'number' && !isNaN(t.totalBalance))
        ) {
          return parsed.map((savedTeam: Team) => {
            const initial = INITIAL_TEAMS.find((it) => it.id === savedTeam.id);
            const baseBalance = savedTeam.totalBalance > 0
              ? savedTeam.totalBalance
              : (savedTeam.id === 'tacha' ? 24500 : 23800);
            return {
              ...savedTeam,
              totalBalance: baseBalance,
              primaryColor: initial?.primaryColor || (savedTeam.id === 'tacha' ? '#F43F5E' : '#3B82F6'),
              accentColor: initial?.accentColor || (savedTeam.id === 'tacha' ? '#FDA4AF' : '#60A5FA'),
              bgGradient: initial?.bgGradient || (savedTeam.id === 'tacha' ? 'from-rose-500/25 via-pink-500/10 to-transparent' : 'from-blue-500/25 via-indigo-500/10 to-transparent'),
              logoUrl: initial?.logoUrl
            };
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TEAMS.map((t) => ({
      ...t,
      totalBalance: t.totalBalance > 0 ? t.totalBalance : (t.id === 'tacha' ? 24500 : 23800)
    }));
  });

  // Fan Activity Events - populated dynamically by simulation and real gifts
  const [liveEvents, setLiveEvents] = useState<FanActivityEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  // Automated dynamic updates to pot balance (independent of user inputs)
  useEffect(() => {
    const NIGERIAN_FAN_NAMES = [
      'Titan_Chioma', 'Mercenary_Joy', 'Titan_Blessing', 'Mercenary_Queen',
      'Tunde A.', 'Amina K.', 'Titans_NLNT', 'Emeka E.', 'Lambo_Shield', 
      'Zainab B.', 'Femi D.', 'Ngozi P.', 'Ibrahim M.', 'Funke Y.', 
      'Damilola S.', 'Kelechi R.', 'Chioma V.', 'Segun T.', 'Halima U.', 
      'Babatunde W.', 'Folake M.', 'Uche C.', 'Adeola J.', 'Yusuf G.'
    ];

    let timerId: ReturnType<typeof setTimeout>;

    const executeSimulatedGift = () => {
      setTeams((prevTeams) => {
        const tacha = prevTeams.find((t) => t.id === 'tacha') || prevTeams[0];
        const mercy = prevTeams.find((t) => t.id === 'mercy_lambo') || prevTeams[1];
        if (!tacha || !mercy) return prevTeams;

        // Choose target team with natural close competition
        let targetId = tacha.id;
        const diff = tacha.totalBalance - mercy.totalBalance;
        if (diff > 3500) {
          targetId = Math.random() < 0.65 ? mercy.id : tacha.id;
        } else if (diff < -3500) {
          targetId = Math.random() < 0.65 ? tacha.id : mercy.id;
        } else {
          targetId = Math.random() < 0.5 ? tacha.id : mercy.id;
        }

        // Weighted gift amounts: amounts less than ₦500 are very very rare (less than 2% combined)
        const rand = Math.random();
        let amount = 500;
        if (rand < 0.007) {
          amount = 100; // ~0.7% - very very rare
        } else if (rand < 0.02) {
          amount = 200; // ~1.3% - very very rare
        } else if (rand < 0.42) {
          amount = 500; // ~40% - standard baseline
        } else if (rand < 0.74) {
          amount = 1000; // ~32% - popular gift
        } else if (rand < 0.90) {
          amount = 2000; // ~16% - strong support
        } else if (rand < 0.97) {
          amount = 5000; // ~7% - big gift
        } else if (rand < 0.993) {
          amount = 10000; // ~2.3% - major drop
        } else {
          amount = 20000; // ~0.7% - whale gift
        }

        const updated = prevTeams.map((team) => {
          if (team.id === targetId) {
            return {
              ...team,
              totalBalance: team.totalBalance + amount,
              fanCount: team.fanCount + 1
            };
          }
          return team;
        });

        // Record simulated fan activity event for the live ticker
        const targetTeam = prevTeams.find((t) => t.id === targetId);
        const fanName = NIGERIAN_FAN_NAMES[Math.floor(Math.random() * NIGERIAN_FAN_NAMES.length)];
        const newEvt: FanActivityEvent = {
          id: `evt_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          fanName: fanName,
          amount: amount,
          teamId: targetId,
          teamName: targetTeam?.name || 'Team',
          eventType: amount >= 5000 ? 'whale' : 'donation',
          message: `Gifted ₦${amount.toLocaleString()} to ${targetTeam?.name || 'Team'}`
        };

        setLiveEvents((prev) => [newEvt, ...prev.slice(0, 39)]);

        return updated;
      });

      // Schedule next dynamic gift tick between 1.5s and 3.5s
      const delay = 1500 + Math.random() * 2000;
      timerId = setTimeout(executeSimulatedGift, delay);
    };

    // First simulated gift triggers quickly (800ms after load)
    timerId = setTimeout(executeSimulatedGift, 800);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

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
    <div className="min-h-screen bg-[#06070c] text-white selection:bg-red-500 selection:text-white p-3 sm:p-6 flex flex-col items-center justify-center">
      <main className="w-full flex justify-center">
        <PvPBattleDashboard
          teams={teams}
          onPaymentSuccess={handlePaymentSuccess}
          recentEvents={liveEvents}
        />
      </main>
    </div>
  );
}
