/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { PvPBattleDashboard } from './components/PvPBattleDashboard';
import { LeaderboardView, FandomLeaderboardItem } from './components/LeaderboardView';
import { Team, FanActivityEvent } from './types/game';
import { INITIAL_BATTLES } from './data/initialLeagueData';
import {
  BattleItem,
  simulateBatchGifts,
  calculateElapsedCatchUp,
  SIMULATION_AVG_INTERVAL_MS
} from './utils/simulation';

const STORAGE_KEYS = {
  BATTLES: 'fanwars_battles_celebrity_v6',
  EVENTS: 'fanwars_events_celebrity_v6',
  LAST_SIM_TIME: 'fanwars_last_sim_timestamp_v6'
};

// Helper to load and catch up initial state from localStorage
function getInitialBattlesAndEvents(): {
  battles: BattleItem[];
  events: Record<string, FanActivityEvent[]>;
} {
  let loadedBattles: BattleItem[] = INITIAL_BATTLES;
  let loadedEvents: Record<string, FanActivityEvent[]> = {
    burna_vs_davido: [],
    ayra_vs_tiwa: [],
    davido_vs_wizkid: [],
    nicki_vs_cardi: [],
    tacha_vs_mercy: []
  };

  const savedBattles = localStorage.getItem(STORAGE_KEYS.BATTLES);
  if (savedBattles) {
    try {
      const parsed = JSON.parse(savedBattles);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        loadedBattles = parsed.map((savedBattle) => {
          const initial = INITIAL_BATTLES.find((ib) => ib.id === savedBattle.id);
          if (!initial) return savedBattle;

          const updatedTeams = savedBattle.teams.map((st: Team, idx: number) => {
            const initTeam = initial.teams.find((it) => it.id === st.id);
            const isTeam1 = idx === 0 || (initTeam && initTeam.id === initial.teams[0].id);
            return {
              ...st,
              primaryColor: isTeam1 ? '#EF4444' : '#3B82F6',
              accentColor: isTeam1 ? '#F87171' : '#60A5FA',
              bgGradient: isTeam1
                ? 'from-red-500/25 via-rose-500/10 to-transparent'
                : 'from-blue-500/25 via-indigo-500/10 to-transparent',
              // Always guarantee the exact user image from initial configuration is used
              logoUrl: initTeam ? initTeam.logoUrl : st.logoUrl,
              slogan: initTeam?.slogan || st.slogan,
              tag: initTeam?.tag || st.tag,
              championshipWins: typeof st.championshipWins === 'number' && st.championshipWins > 0
                ? st.championshipWins
                : (initTeam?.championshipWins || 10),
              totalBalance: typeof st.totalBalance === 'number' && st.totalBalance > 0 
                ? st.totalBalance 
                : (initTeam?.totalBalance || 25000)
            };
          });

          return {
            ...initial,
            ...savedBattle,
            teams: updatedTeams as [Team, Team]
          };
        });
      }
    } catch (e) {
      console.error('Failed to parse saved battles:', e);
    }
  }

  const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (savedEvents) {
    try {
      loadedEvents = { ...loadedEvents, ...JSON.parse(savedEvents) };
    } catch (e) {
      console.error('Failed to parse saved battle events:', e);
    }
  }

  // Catch up simulated gifts for time elapsed while page was closed/offline
  const lastTimeStr = localStorage.getItem(STORAGE_KEYS.LAST_SIM_TIME);
  if (lastTimeStr) {
    const lastTimestamp = parseInt(lastTimeStr, 10);
    if (!isNaN(lastTimestamp) && lastTimestamp > 0) {
      const catchUp = calculateElapsedCatchUp(loadedBattles, loadedEvents, lastTimestamp);
      loadedBattles = catchUp.updatedBattles;
      loadedEvents = catchUp.updatedEvents;
    }
  }

  // Record current timestamp
  localStorage.setItem(STORAGE_KEYS.LAST_SIM_TIME, Date.now().toString());

  return {
    battles: loadedBattles,
    events: loadedEvents
  };
}

export default function App() {
  const [currentBattleIndex, setCurrentBattleIndex] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Initialize state with catch-up applied
  const [initialData] = useState(() => getInitialBattlesAndEvents());
  const [battles, setBattles] = useState<BattleItem[]>(initialData.battles);
  const [battleEvents, setBattleEvents] = useState<Record<string, FanActivityEvent[]>>(initialData.events);

  const battlesRef = useRef(battles);
  battlesRef.current = battles;

  const eventsRef = useRef(battleEvents);
  eventsRef.current = battleEvents;

  const lastTickTimeRef = useRef<number>(Date.now());

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BATTLES, JSON.stringify(battles));
  }, [battles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(battleEvents));
  }, [battleEvents]);

  // Faster simulated gifting loop & catch-up when returning to the tab
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    const runSimulationStep = () => {
      const now = Date.now();
      const elapsedSinceLastTick = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;
      localStorage.setItem(STORAGE_KEYS.LAST_SIM_TIME, now.toString());

      // If browser was backgrounded/throttled (> 800ms passed), batch calculate gifts
      // Otherwise perform a single rapid gift
      const giftsToProcess = elapsedSinceLastTick > 800
        ? Math.min(Math.floor(elapsedSinceLastTick / SIMULATION_AVG_INTERVAL_MS), 60)
        : 1;

      const result = simulateBatchGifts(battlesRef.current, eventsRef.current, giftsToProcess);
      setBattles(result.updatedBattles);
      setBattleEvents(result.updatedEvents);

      // Fast frequency: 250ms to 550ms (averaging ~400ms = 2.5 gifts/second)
      const nextDelay = 250 + Math.random() * 300;
      timerId = setTimeout(runSimulationStep, nextDelay);
    };

    // Start rapid simulation
    timerId = setTimeout(runSimulationStep, 250);

    // Visibility / focus catch-up when user returns to observing the page
    const handleCatchUpOnWake = () => {
      const now = Date.now();
      const lastSavedTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SIM_TIME) || '0', 10);
      const referenceTime = Math.max(lastSavedTime, lastTickTimeRef.current);

      if (now - referenceTime > 800) {
        const catchUp = calculateElapsedCatchUp(battlesRef.current, eventsRef.current, referenceTime);
        if (catchUp.giftsSimulated > 0) {
          setBattles(catchUp.updatedBattles);
          setBattleEvents(catchUp.updatedEvents);
        }
      }
      lastTickTimeRef.current = now;
      localStorage.setItem(STORAGE_KEYS.LAST_SIM_TIME, now.toString());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleCatchUpOnWake();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleCatchUpOnWake);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleCatchUpOnWake);
      localStorage.setItem(STORAGE_KEYS.LAST_SIM_TIME, Date.now().toString());
    };
  }, []);

  // True gifting action by real users
  const handlePaymentSuccess = (teamId: string, amount: number) => {
    const validAmount = Math.max(100, Math.floor(Number(amount) || 0));
    if (isNaN(validAmount) || validAmount <= 0) return;

    const activeBattle = battles[currentBattleIndex];
    if (!activeBattle) return;

    const targetTeam = activeBattle.teams.find((t) => t.id === teamId);

    // Update real battle balances
    setBattles((prevBattles) => {
      return prevBattles.map((b) => {
        if (b.id !== activeBattle.id) return b;
        const updatedTeams = b.teams.map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              totalBalance: t.totalBalance + validAmount,
              fanCount: t.fanCount + 1
            };
          }
          return t;
        }) as [Team, Team];

        return {
          ...b,
          teams: updatedTeams
        };
      });
    });

    // Record verified real user activity event
    const newEvt: FanActivityEvent = {
      id: `evt_real_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      fanName: 'You (Supporter)',
      amount: validAmount,
      teamId: teamId,
      teamName: targetTeam?.name || 'Star',
      eventType: validAmount >= 5000 ? 'whale' : 'donation',
      message: `Verified gift of ₦${validAmount.toLocaleString()} to ${targetTeam?.name || 'Star'}`
    };

    setBattleEvents((prev) => ({
      ...prev,
      [activeBattle.id]: [newEvt, ...(prev[activeBattle.id] || []).slice(0, 39)]
    }));
  };

  // Swiping navigation
  const handleSwipeLeft = () => {
    setCurrentBattleIndex((prev) => (prev + 1) % battles.length);
  };

  const handleSwipeRight = () => {
    setCurrentBattleIndex((prev) => (prev - 1 + battles.length) % battles.length);
  };

  const handleSelectBattle = (index: number) => {
    if (index >= 0 && index < battles.length) {
      setCurrentBattleIndex(index);
    }
  };

  const activeBattle = battles[currentBattleIndex] || battles[0];
  const activeEvents = battleEvents[activeBattle.id] || [];

  // Distinct Fandoms data for the Leaderboard (aggregated across battles so each fandom appears once)
  const fandomMap = new Map<string, FandomLeaderboardItem>();

  battles.forEach((b) => {
    b.teams.forEach((t) => {
      const fandomName =
        t.tag === 'OUTSIDERS' ? 'Outsiders'
        : t.tag === '30BG' ? '30 Billion Gang'
        : t.tag === 'SABI GIRLS' ? 'Sabi Girls'
        : t.tag === 'SAVAGE ARMY' ? 'Savage Army'
        : t.tag === 'STARBOY' ? 'Starboy FC'
        : t.tag === 'BARBZ' ? 'Barbz'
        : t.tag === 'BARDI' ? 'Bardi Gang'
        : t.tag === 'TITANS' ? 'Titans'
        : t.tag === 'MERCENARIES' ? 'Mercenaries'
        : `${t.name} Fandom`;

      const existing = fandomMap.get(t.id);
      if (existing) {
        fandomMap.set(t.id, {
          ...existing,
          totalBalance: existing.totalBalance + t.totalBalance,
          championshipWins: Math.max(existing.championshipWins, t.championshipWins),
          fanCount: existing.fanCount + t.fanCount
        });
      } else {
        fandomMap.set(t.id, {
          ...t,
          battleId: b.id,
          battleTitle: b.title,
          fandomName
        });
      }
    });
  });

  const fandoms: FandomLeaderboardItem[] = Array.from(fandomMap.values());

  return (
    <div className="min-h-screen bg-[#06070c] text-white selection:bg-amber-500 selection:text-black p-2.5 sm:p-6 flex flex-col items-center justify-center relative">
      
      {/* Top Header Bar: Placed at the top-left above the battle arena so it never obstructs the percentage value */}
      {!showLeaderboard && (
        <header className="w-full max-w-[480px] flex items-center justify-between px-1 mb-2.5">
          <button
            type="button"
            onClick={() => setShowLeaderboard(true)}
            aria-label="View Fandom Leaderboard"
            className="flex items-center gap-2 bg-[#0b0c16] hover:bg-[#15182a] border border-amber-500/50 hover:border-amber-400 text-amber-400 px-3 py-1.5 rounded-xl shadow-md transition-all cursor-pointer group active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black tracking-wider text-amber-300">
              LEADERBOARD
            </span>
          </button>

          {/* Quick Battle Navigation Controls */}
          <div className="flex items-center gap-1.5 bg-[#0b0c16] border border-[#1e2238] px-2 py-1 rounded-xl">
            <button
              type="button"
              onClick={handleSwipeRight}
              aria-label="Previous Battle"
              className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase px-1">
              {currentBattleIndex + 1} / {battles.length}
            </span>
            <button
              type="button"
              onClick={handleSwipeLeft}
              aria-label="Next Battle"
              className="text-slate-400 hover:text-white p-0.5 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      )}

      <main className="w-full flex justify-center">
        {showLeaderboard ? (
          <LeaderboardView
            fandoms={fandoms}
            onBack={() => setShowLeaderboard(false)}
            onSelectBattle={(battleId) => {
              const idx = battles.findIndex((b) => b.id === battleId);
              if (idx !== -1) {
                setCurrentBattleIndex(idx);
              }
              setShowLeaderboard(false);
            }}
          />
        ) : (
          <PvPBattleDashboard
            key={activeBattle.id}
            battleId={activeBattle.id}
            battleTitle={activeBattle.title}
            battleSubtitle={activeBattle.subtitle}
            battleCategory={activeBattle.category}
            teams={activeBattle.teams}
            onPaymentSuccess={handlePaymentSuccess}
            recentEvents={activeEvents}
            currentIndex={currentBattleIndex}
            totalBattles={battles.length}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSelectBattle={handleSelectBattle}
          />
        )}
      </main>
    </div>
  );
}
