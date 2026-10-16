/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { PvPBattleDashboard } from './components/PvPBattleDashboard';
import { LeaderboardView, FandomLeaderboardItem } from './components/LeaderboardView';
import { Team, FanActivityEvent } from './types/game';
import { INITIAL_BATTLES } from './data/initialLeagueData';

const STORAGE_KEYS = {
  BATTLES: 'fanbrawl_battles_burna_ayra_v3',
  EVENTS: 'fanbrawl_events_burna_ayra_v3'
};

export default function App() {
  const [currentBattleIndex, setCurrentBattleIndex] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Battles State (Burna vs Davido, Ayra vs Tiwa, Davido vs Wizkid, Nicki vs Cardi, Tacha vs Mercy)
  const [battles, setBattles] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BATTLES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 5) {
          return parsed.map((savedBattle) => {
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
                logoUrl: initTeam?.logoUrl || st.logoUrl,
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
    return INITIAL_BATTLES;
  });

  // Events history per battle
  const [battleEvents, setBattleEvents] = useState<Record<string, FanActivityEvent[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved battle events:', e);
      }
    }
    return {
      burna_vs_davido: [],
      ayra_vs_tiwa: [],
      davido_vs_wizkid: [],
      nicki_vs_cardi: [],
      tacha_vs_mercy: []
    };
  });

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BATTLES, JSON.stringify(battles));
  }, [battles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(battleEvents));
  }, [battleEvents]);

  // Faux gifting simulation running alongside true gifting action by real users
  useEffect(() => {
    const BURNA_DAVIDO_FANS = [
      'Outsider_Kelechi', 'Giant_Segun', 'Grammy_Boy', 'Odogwu_Vibes', 'Burna_Soldier',
      '30BG_Tunde', 'OBO_Crew', 'TimelessCrew', 'BaddestFan', 'Fem_Don', 'Adeola_30BG',
      'CityBoys_Squad', 'Damini_Fan', 'StandStrong_Fan'
    ];

    const AYRA_TIWA_FANS = [
      'SabiGirl_Joy', 'Celestial_Blessing', 'Rush_Fanatic', 'Commas_Army', 'StarGirl_Amina',
      'SavageSoldier_Chioma', 'QueenTiwa_FC', 'SomebodySon_Fan', 'Tiwa_Army', 'NumberOne_Fan',
      'KeleKele_Love', 'BloodySamaritan_Vibe', 'Loaded_Fan', 'WaterAndGarri_Fan'
    ];

    const DAVIDO_WIZKID_FANS = [
      '30BG_Tunde', 'Starboy_Kelechi', 'OBO_Crew', 'WizkidFC_Amina', 
      'BaddestFan', 'Machala_Vibes', 'Adeola_30BG', 'Starboy_Segun', 
      '30BG_Folarin', 'Starboy_Zino', 'Fem_Don', 'MadeInLagosFan', 
      'TimelessCrew', 'EssenceVibe', 'OBO_Squad', 'Starboy_Global'
    ];

    const NICKI_CARDI_FANS = [
      'Barbz_Chioma', 'BardiGang_Joy', 'ChunLi_Barb', 'Bodak_Crew', 
      'Roman_Zolanski', 'Bronx_Bardi', 'PinkFriday_Army', 'Invasion_Fan', 
      'GagCity_Vibes', 'WAP_Empire', 'SuperBass_Lover', 'Kulture_Fan', 
      'Barbie_World_Girl', 'Up_Bardi_Squad', 'Queen_Nicki_Army', 'Cardi_Fan_Lagos'
    ];

    const TACHA_MERCY_FANS = [
      'Titan_Chioma', 'Mercenary_Joy', 'Titan_Blessing', 'Mercenary_Queen',
      'Tunde A.', 'Amina K.', 'Titans_NLNT', 'Emeka E.', 'Lambo_Shield', 
      'Zainab B.', 'Femi D.', 'Ngozi P.', 'Ibrahim M.', 'Funke Y.'
    ];

    let timerId: ReturnType<typeof setTimeout>;

    const executeSimulatedGift = () => {
      const battleIdx = Math.floor(Math.random() * battles.length);
      const targetBattle = battles[battleIdx];
      if (!targetBattle) return;

      const [team1, team2] = targetBattle.teams;

      // Choose target team with natural close competition
      let targetTeamId = team1.id;
      const diff = team1.totalBalance - team2.totalBalance;
      if (diff > 4000) {
        targetTeamId = Math.random() < 0.65 ? team2.id : team1.id;
      } else if (diff < -4000) {
        targetTeamId = Math.random() < 0.65 ? team1.id : team2.id;
      } else {
        targetTeamId = Math.random() < 0.5 ? team1.id : team2.id;
      }

      // Weighted gift amounts: amounts < ₦500 are very rare (< 2%)
      const rand = Math.random();
      let amount = 500;
      if (rand < 0.007) {
        amount = 100;
      } else if (rand < 0.02) {
        amount = 200;
      } else if (rand < 0.42) {
        amount = 500;
      } else if (rand < 0.74) {
        amount = 1000;
      } else if (rand < 0.90) {
        amount = 2000;
      } else if (rand < 0.97) {
        amount = 5000;
      } else if (rand < 0.993) {
        amount = 10000;
      } else {
        amount = 20000;
      }

      // Update team in battle state
      setBattles((prevBattles) => {
        return prevBattles.map((b) => {
          if (b.id !== targetBattle.id) return b;
          const updatedTeams = b.teams.map((t) => {
            if (t.id === targetTeamId) {
              return {
                ...t,
                totalBalance: t.totalBalance + amount,
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

      // Fan name based on battle
      let fanList = BURNA_DAVIDO_FANS;
      if (targetBattle.id === 'ayra_vs_tiwa') {
        fanList = AYRA_TIWA_FANS;
      } else if (targetBattle.id === 'davido_vs_wizkid') {
        fanList = DAVIDO_WIZKID_FANS;
      } else if (targetBattle.id === 'nicki_vs_cardi') {
        fanList = NICKI_CARDI_FANS;
      } else if (targetBattle.id === 'tacha_vs_mercy') {
        fanList = TACHA_MERCY_FANS;
      }

      const fanName = fanList[Math.floor(Math.random() * fanList.length)];
      const targetTeam = targetBattle.teams.find((t) => t.id === targetTeamId);

      const newEvt: FanActivityEvent = {
        id: `evt_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        fanName: fanName,
        amount: amount,
        teamId: targetTeamId,
        teamName: targetTeam?.name || 'Star',
        eventType: amount >= 5000 ? 'whale' : 'donation',
        message: `Gifted ₦${amount.toLocaleString()} to ${targetTeam?.name || 'Star'}`
      };

      setBattleEvents((prev) => ({
        ...prev,
        [targetBattle.id]: [newEvt, ...(prev[targetBattle.id] || []).slice(0, 39)]
      }));

      // Schedule next simulated gift tick between 0.4s and 1.0s
      const delay = 400 + Math.random() * 600;
      timerId = setTimeout(executeSimulatedGift, delay);
    };

    timerId = setTimeout(executeSimulatedGift, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [battles]);

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
