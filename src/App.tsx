/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LeaderboardDashboard } from './components/LeaderboardDashboard';
import { GiftingModal } from './components/GiftingModal';
import { LeaderboardFigure, LiveGiftEvent } from './types/leaderboard';
import { INITIAL_FIGURES } from './data/leaderboardData';
import { soundManager } from './utils/audio';

const STORAGE_KEYS = {
  FIGURES: 'fanwars_figures_master_v5',
  EVENTS: 'fanwars_live_events_v5'
};

function getInitialLocalState(): {
  figures: LeaderboardFigure[];
  events: LiveGiftEvent[];
} {
  let loadedFigures: LeaderboardFigure[] = INITIAL_FIGURES.filter((f) => f.id !== 'mazi_ezenmore');
  let loadedEvents: LiveGiftEvent[] = [];

  const savedFigures = localStorage.getItem(STORAGE_KEYS.FIGURES);
  if (savedFigures) {
    try {
      const parsed = JSON.parse(savedFigures);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        loadedFigures = INITIAL_FIGURES.filter((f) => f.id !== 'mazi_ezenmore').map((initFig) => {
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
        loadedEvents = parsedEvts.filter((e: LiveGiftEvent) => e.figureId !== 'mazi_ezenmore');
      }
    } catch (e) {
      console.error('Failed to parse saved events:', e);
    }
  }

  return {
    figures: loadedFigures.filter((f) => f.id !== 'mazi_ezenmore'),
    events: loadedEvents.filter((e) => e.figureId !== 'mazi_ezenmore')
  };
}

export default function App() {
  const [initialData] = useState(() => getInitialLocalState());
  const [figures, setFigures] = useState<LeaderboardFigure[]>(initialData.figures);
  const [liveEvents, setLiveEvents] = useState<LiveGiftEvent[]>(initialData.events);
  const [selectedFigureToGift, setSelectedFigureToGift] = useState<LeaderboardFigure | null>(null);

  // Sync to local cache for instant cold starts
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FIGURES, JSON.stringify(figures));
  }, [figures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(liveEvents));
  }, [liveEvents]);

  // Initial Fetch: Load authoritative server snapshot on mount
  useEffect(() => {
    let isCancelled = false;

    async function loadServerLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data.figures) && data.figures.length > 0) {
            setFigures(data.figures);
            if (Array.isArray(data.recentEvents) && data.recentEvents.length > 0) {
              setLiveEvents(data.recentEvents);
            }
          }
        }
      } catch (err) {
        console.warn('[FanBrawl] Initial snapshot fetch failed, relying on local fallback:', err);
      }
    }

    loadServerLeaderboard();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Server-Sent Events (SSE): Real-time synchronization across ALL concurrent users
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    function connectSSE() {
      if (!isMounted) return;

      try {
        eventSource = new EventSource('/api/live/stream');

        eventSource.onmessage = (event) => {
          if (!isMounted || !event.data) return;

          try {
            const data = JSON.parse(event.data);

            if (data.type === 'INITIAL_SNAPSHOT') {
              if (Array.isArray(data.figures) && data.figures.length > 0) {
                setFigures(data.figures);
              }
              if (Array.isArray(data.recentEvents) && data.recentEvents.length > 0) {
                setLiveEvents(data.recentEvents);
              }
            } else if (data.type === 'PAYMENT_VERIFIED') {
              // Real verified payment broadcast from ANY user anywhere!
              if (data.updatedFigure) {
                setFigures((prev) => {
                  return prev.map((f) => (f.id === data.updatedFigure.id ? data.updatedFigure : f));
                });
              } else if (Array.isArray(data.figures)) {
                setFigures(data.figures);
              }

              if (data.event) {
                setLiveEvents((prev) => [data.event, ...prev].slice(0, 50));
                // Audio cue for whale gifts
                if (data.event.amount >= 5000) {
                  soundManager.playLevelUp();
                }
              }
            } else if (data.type === 'STREAM_TICK') {
              // Server heartbeat simulated gift keeping the leaderboard alive across all clients
              if (data.figureId) {
                setFigures((prev) =>
                  prev.map((f) => {
                    if (f.id !== data.figureId) return f;
                    return {
                      ...f,
                      totalBalance: data.newBalance || f.totalBalance + data.event.amount,
                      fanCount: data.newFanCount || f.fanCount + 1
                    };
                  })
                );
              }

              if (data.event) {
                setLiveEvents((prev) => [data.event, ...prev].slice(0, 50));
              }
            }
          } catch (parseError) {
            console.error('[FanBrawl SSE] Error parsing payload:', parseError);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) {
            // Reconnect after 3 seconds
            reconnectTimeout = setTimeout(connectSSE, 3000);
          }
        };
      } catch (err) {
        console.error('[FanBrawl SSE] Setup failed:', err);
        if (isMounted) {
          reconnectTimeout = setTimeout(connectSSE, 4000);
        }
      }
    }

    connectSSE();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, []);

  // Handle local optimistic gift completion (backed by server SSE)
  const handleGiftSuccess = (figureId: string, amount: number) => {
    const validAmount = Math.max(100, Math.floor(Number(amount) || 0));
    if (isNaN(validAmount) || validAmount <= 0) return;

    let targetFigureName = 'Nigerian Star';
    let targetSectorLabel = 'Leaderboard';
    let targetSector: LeaderboardFigure['sector'] = 'music';

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

    const newEvt: LiveGiftEvent = {
      id: `evt_local_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
    <div className="min-h-screen bg-[#06070c] text-white selection:bg-amber-500 selection:text-black uppercase font-extrabold">
      <main className="w-full">
        <LeaderboardDashboard
          figures={figures}
          liveEvents={liveEvents}
          onSelectFigureToGift={(figure) => setSelectedFigureToGift(figure)}
        />
      </main>

      {/* Gifting Modal with Flutterwave checkout and Server Verification */}
      <GiftingModal
        figure={selectedFigureToGift}
        onClose={() => setSelectedFigureToGift(null)}
        onGiftSuccess={handleGiftSuccess}
      />
    </div>
  );
}
