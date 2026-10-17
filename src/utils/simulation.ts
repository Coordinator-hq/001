import { Team, FanActivityEvent } from '../types/game';

export interface BattleItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  teams: [Team, Team];
}

export const BURNA_DAVIDO_FANS = [
  'Outsider_Kelechi', 'Giant_Segun', 'Grammy_Boy', 'Odogwu_Vibes', 'Burna_Soldier',
  '30BG_Tunde', 'OBO_Crew', 'TimelessCrew', 'BaddestFan', 'Fem_Don', 'Adeola_30BG',
  'CityBoys_Squad', 'Damini_Fan', 'StandStrong_Fan', 'OBO_Global', 'AfricanGiant_FC'
];

export const AYRA_TIWA_FANS = [
  'SabiGirl_Joy', 'Celestial_Blessing', 'Rush_Fanatic', 'Commas_Army', 'StarGirl_Amina',
  'SavageSoldier_Chioma', 'QueenTiwa_FC', 'SomebodySon_Fan', 'Tiwa_Army', 'NumberOne_Fan',
  'KeleKele_Love', 'BloodySamaritan_Vibe', 'Loaded_Fan', 'WaterAndGarri_Fan', 'Sabi_Queen'
];

export const DAVIDO_WIZKID_FANS = [
  '30BG_Tunde', 'Starboy_Kelechi', 'OBO_Crew', 'WizkidFC_Amina', 
  'BaddestFan', 'Machala_Vibes', 'Adeola_30BG', 'Starboy_Segun', 
  '30BG_Folarin', 'Starboy_Zino', 'Fem_Don', 'MadeInLagosFan', 
  'TimelessCrew', 'EssenceVibe', 'OBO_Squad', 'Starboy_Global'
];

export const NICKI_CARDI_FANS = [
  'Barbz_Chioma', 'BardiGang_Joy', 'ChunLi_Barb', 'Bodak_Crew', 
  'Roman_Zolanski', 'Bronx_Bardi', 'PinkFriday_Army', 'Invasion_Fan', 
  'GagCity_Vibes', 'WAP_Empire', 'SuperBass_Lover', 'Kulture_Fan', 
  'Barbie_World_Girl', 'Up_Bardi_Squad', 'Queen_Nicki_Army', 'Cardi_Fan_Lagos'
];

export const TACHA_MERCY_FANS = [
  'Titan_Chioma', 'Mercenary_Joy', 'Titan_Blessing', 'Mercenary_Queen',
  'Tunde A.', 'Amina K.', 'Titans_NLNT', 'Emeka E.', 'Lambo_Shield', 
  'Zainab B.', 'Femi D.', 'Ngozi P.', 'Ibrahim M.', 'Funke Y.', 'Titan_Wave'
];

/**
 * Returns fan name based on the specific battle
 */
export function getFanNameForBattle(battleId: string): string {
  let list = BURNA_DAVIDO_FANS;
  if (battleId === 'ayra_vs_tiwa') {
    list = AYRA_TIWA_FANS;
  } else if (battleId === 'davido_vs_wizkid') {
    list = DAVIDO_WIZKID_FANS;
  } else if (battleId === 'nicki_vs_cardi') {
    list = NICKI_CARDI_FANS;
  } else if (battleId === 'tacha_vs_mercy') {
    list = TACHA_MERCY_FANS;
  }
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Weighted random denomination
 */
export function getRandomGiftAmount(): number {
  const rand = Math.random();
  if (rand < 0.007) return 100;
  if (rand < 0.02) return 200;
  if (rand < 0.42) return 500;
  if (rand < 0.74) return 1000;
  if (rand < 0.90) return 2000;
  if (rand < 0.97) return 5000;
  if (rand < 0.993) return 10000;
  return 20000;
}

/**
 * Simulate one or more gifts across battles
 */
export function simulateBatchGifts(
  currentBattles: BattleItem[],
  currentEvents: Record<string, FanActivityEvent[]>,
  count: number
): {
  updatedBattles: BattleItem[];
  updatedEvents: Record<string, FanActivityEvent[]>;
} {
  if (count <= 0) {
    return { updatedBattles: currentBattles, updatedEvents: currentEvents };
  }

  // Clone structures deeply enough for mutations
  const battlesCopy: BattleItem[] = currentBattles.map((b) => ({
    ...b,
    teams: [
      { ...b.teams[0] },
      { ...b.teams[1] }
    ]
  }));

  const eventsCopy: Record<string, FanActivityEvent[]> = { ...currentEvents };
  Object.keys(eventsCopy).forEach((k) => {
    eventsCopy[k] = [...eventsCopy[k]];
  });

  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const battleIdx = Math.floor(Math.random() * battlesCopy.length);
    const targetBattle = battlesCopy[battleIdx];
    if (!targetBattle) continue;

    const [team1, team2] = targetBattle.teams;

    // Keep battle close with balanced weighting
    let targetTeam = team1;
    const diff = team1.totalBalance - team2.totalBalance;
    if (diff > 4000) {
      targetTeam = Math.random() < 0.65 ? team2 : team1;
    } else if (diff < -4000) {
      targetTeam = Math.random() < 0.65 ? team1 : team2;
    } else {
      targetTeam = Math.random() < 0.5 ? team1 : team2;
    }

    const amount = getRandomGiftAmount();
    targetTeam.totalBalance += amount;
    targetTeam.fanCount += 1;

    // Create event
    const fanName = getFanNameForBattle(targetBattle.id);
    const eventTime = now - Math.floor(Math.random() * 500);

    const newEvt: FanActivityEvent = {
      id: `evt_sim_${eventTime}_${Math.floor(Math.random() * 10000)}_${i}`,
      timestamp: eventTime,
      fanName,
      amount,
      teamId: targetTeam.id,
      teamName: targetTeam.name,
      eventType: amount >= 5000 ? 'whale' : 'donation',
      message: `Gifted ₦${amount.toLocaleString()} to ${targetTeam.name}`
    };

    if (!eventsCopy[targetBattle.id]) {
      eventsCopy[targetBattle.id] = [];
    }
    eventsCopy[targetBattle.id] = [newEvt, ...eventsCopy[targetBattle.id].slice(0, 39)];
  }

  return {
    updatedBattles: battlesCopy,
    updatedEvents: eventsCopy
  };
}

/**
 * Average target interval in milliseconds between simulated gifts (approx 450ms = >2 gifts/sec)
 */
export const SIMULATION_AVG_INTERVAL_MS = 450;

/**
 * Calculates and executes simulated catch-up gifts for time elapsed when page was inactive or closed
 */
export function calculateElapsedCatchUp(
  battles: BattleItem[],
  events: Record<string, FanActivityEvent[]>,
  lastTimestamp: number
): {
  updatedBattles: BattleItem[];
  updatedEvents: Record<string, FanActivityEvent[]>;
  giftsSimulated: number;
} {
  const now = Date.now();
  const elapsedMs = Math.max(0, now - lastTimestamp);

  // If less than 600ms, no catchup needed
  if (elapsedMs < 600) {
    return { updatedBattles: battles, updatedEvents: events, giftsSimulated: 0 };
  }

  // Calculate missed gifts based on faster frequency (~450ms per gift)
  // Cap at 4,000 gifts to maintain instant UI performance
  const missedGifts = Math.min(Math.floor(elapsedMs / SIMULATION_AVG_INTERVAL_MS), 4000);

  if (missedGifts <= 0) {
    return { updatedBattles: battles, updatedEvents: events, giftsSimulated: 0 };
  }

  const result = simulateBatchGifts(battles, events, missedGifts);
  return {
    ...result,
    giftsSimulated: missedGifts
  };
}
