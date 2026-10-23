/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LeaderboardDashboard } from './components/LeaderboardDashboard';
import { GiftingModal } from './components/GiftingModal';
import { LeaderboardFigure, LiveGiftEvent } from './types/leaderboard';
import { INITIAL_FIGURES } from './data/leaderboardData';
import {
  simulateBatchGiftsFigures,
  calculateElapsedCatchUpFigures,
  SIMULATION_AVG_INTERVAL_MS
} from './utils/simulation';

const STORAGE_KEYS = {
  FIGURES: 'fanwars_figures_master_v3',
  EVENTS: 'fanwars_live_events_v3',
  LAST_SIM_TIME: 'fanwars_sim_timestamp_v3'
};

// Helper to load, reconcile and catch-up figures state
function getInitialFiguresAndEvents(): {
  figures: LeaderboardFigure[];
  events: LiveGiftEvent[];
} {
  let loadedFigures: LeaderboardFigure[] = INITIAL_FIGURES;
  let loadedEvents: LiveGiftEvent[] = [];

  const savedFigures = localStorage.getItem(STORAGE_KEYS.FIGURES);
  if (savedFigures) {
    try {
      const parsed = JSON.parse(savedFigures);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        // Reconcile saved balance/fans with initial metadata and fresh photo URLs
        loadedFigures = INITIAL_FIGURES.map((initFig) => {
          const saved = parsed.find((p: LeaderboardFigure) => p.id === initFig.id);
          if (!saved) return initFig;
          return {
            ...initFig,
            totalBalance: typeof saved.totalBalance === 'number' && saved.totalBalance > 0
              ? saved.totalBalance
              : initFig.totalBalance,
            fanCount: typeof saved.fanCount === 'number' && saved.fanCount > 0
              ? saved.fanCount
              : initFig.fanCount
          };
        });
      }
    } catch (e) {
      console.error('Failed to parse saved figures:', e);
    }
  }

  const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (savedEvents) {
    try {
      const parsedEvts = JSON.parse(savedEvents);
      if (Array.isArray(parsedEvts)) {
        loadedEvents = parsedEvts;
      }
    } catch (e) {
      console.error('Failed to parse saved events:', e);
    }
  }

  // Catch up simulated gifts for time elapsed while page was closed/offline
  const lastTimeStr = localStorage.getItem(STORAGE_KEYS.LAST_SIM_TIME);
  if (lastTimeStr) {
    const lastTimestamp = parseInt(lastTimeStr, 10);
    if (!isNaN(lastTimestamp) && lastTimestamp > 0) {
      const catchUp = calculateElapsedCatchUpFigures(loadedFigures, loadedEvents, lastTimestamp);
      loadedFigures = catchUp.updatedFigures;
      loadedEvents = catchUp.updatedEvents;
    }
  }

  localStorage.setItem(STORAGE_KEYS.LAST_SIM_TIME, Date.now().toString());

  return {
    figures: loadedFigures,
    events: loadedEvents
  };
}

export default function App() {
  const [initialData] = useState(() => getInitialFiguresAndEvents());
  const [figures, setFigures] = useState<LeaderboardFigure[]>(initialData.figures);
  const [liveEvents, setLiveEvents] = useState<LiveGiftEvent[]>(initialData.events);
  const [selectedFigureToGift, setSelectedFigureToGift] = useState<LeaderboardFigure | null>(null);

  const figuresRef = useRef(figures);
  figuresRef.current = figures;

  const eventsRef = useRef(liveEvents);
  eventsRef.current = liveEvents;

  const lastTickTimeRef = useRef<number>(Date.now());

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIGURES, JSON.stringify(figures));
  }, [figures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(liveEvents));
  }, [liveEvents]);

  // Faster simulated gifting loop & continuous offline/background catch-up
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

      const result = simulateBatchGiftsFigures(figuresRef.current, eventsRef.current, giftsToProcess);
      setFigures(result.updatedFigures);
      setLiveEvents(result.updatedEvents);

      // Fast frequency: 280ms to 520ms (averaging ~400ms = 2.5 gifts/sec)
      const nextDelay = 280 + Math.random() * 240;
      timerId = setTimeout(runSimulationStep, nextDelay);
    };

    timerId = setTimeout(runSimulationStep, 250);

    // Catch-up when user wakes device or returns to tab
    const handleCatchUpOnWake = () => {
      const now = Date.now();
      const lastSavedTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SIM_TIME) || '0', 10);
      const referenceTime = Math.max(lastSavedTime, lastTickTimeRef.current);

      if (now - referenceTime > 800) {
        const catchUp = calculateElapsedCatchUpFigures(figuresRef.current, eventsRef.current, referenceTime);
        if (catchUp.giftsSimulated > 0) {
          setFigures(catchUp.updatedFigures);
          setLiveEvents(catchUp.updatedEvents);
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

  // Handle real gift success via Flutterwave
  const handleGiftSuccess = (figureId: string, amount: number) => {
    const validAmount = Math.max(100, Math.floor(Number(amount) || 0));
    if (isNaN(validAmount) || validAmount <= 0) return;

    let targetFigureName = 'Nigerian Star';
    let targetSectorLabel = 'Leaderboard';
    let targetSector: LeaderboardFigure['sector'] = 'music';

    // Update figure balance & fans in state (feeds both sector and Master leaderboard!)
    setFigures((prevFigures) => {
      return prevFigures.map((f) => {
        if (f.id !== figureId) return f;
        targetFigureName = f.name;
        targetSectorLabel = f.sectorLabel;
        targetSector = f.sector;
        return {
          ...f,
          totalBalance: f.totalBalance + validAmount,
          fanCount: f.fanCount + 1
        };
      });
    });

    // Record verified supporter event
    const newEvt: LiveGiftEvent = {
      id: `evt_real_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      fanName: 'You (Supporter)',
      amount: validAmount,
      figureId,
      figureName: targetFigureName,
      sector: targetSector,
      sectorLabel: targetSectorLabel,
      eventType: validAmount >= 5000 ? 'whale' : 'donation',
      message: `Verified gift of ₦${validAmount.toLocaleString()} to ${targetFigureName}`
    };

    setLiveEvents((prev) => [newEvt, ...prev].slice(0, 50));
  };

  return (
    <div className="min-h-screen bg-[#06070c] text-white selection:bg-amber-500 selection:text-black">
      <main className="w-full">
        <LeaderboardDashboard
          figures={figures}
          liveEvents={liveEvents}
          onSelectFigureToGift={(figure) => setSelectedFigureToGift(figure)}
        />
      </main>

      {/* Gifting Modal with Flutterwave checkout */}
      <GiftingModal
        figure={selectedFigureToGift}
        onClose={() => setSelectedFigureToGift(null)}
        onGiftSuccess={handleGiftSuccess}
      />
    </div>
  );
}
