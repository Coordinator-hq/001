import { LeaderboardFigure, LiveGiftEvent } from '../types/leaderboard';

export const NIGERIAN_FAN_NAMES = [
  '30BG_Tunde', 'Outsider_Kelechi', 'Starboy_Segun', 'Titan_Chioma', 'Mercenary_Joy',
  'Jenifa_Funke_Fan', 'Sabinus_Investor_Lagos', 'Peller_Hamzat_Vibe', 'Lerry_FC_Tobi',
  'Regha_Critique_Fan', 'Ravers_Amina', 'SabiGirl_Blessing', 'Icons_Chidi', 'Machala_Burna',
  'Nollywood_Enthusiast', 'Tao_Army_Zainab', 'Shaggi_Swagger_Femi', 'DrinkWater_Aproko',
  'Pooja_Sports_Ngozi', 'Phynation_Ibrahim', 'Baye_Tribe_Faith', 'KieKie_Glam_Dami',
  'Genny_Icon_Kola', 'RMD_Classic_Emeka', 'Ololade_Vibe_Yomi', 'BrainJotter_Fan',
  'Zanku_General', 'DaSilva_Lagos', 'Basketmouth_Ribs', 'AY_Live_VIP', 'Bovi_Fire_Fan', 'Macaroni_Ooin'
];

/**
 * Weighted random gift denomination in NGN
 */
export function getRandomGiftAmount(): number {
  const rand = Math.random();
  if (rand < 0.007) return 100;
  if (rand < 0.02) return 200;
  if (rand < 0.40) return 500;
  if (rand < 0.72) return 1000;
  if (rand < 0.88) return 2000;
  if (rand < 0.96) return 5000;
  if (rand < 0.992) return 10000;
  return 20000;
}

/**
 * Simulates a batch of gifts across the 60 figures
 */
export function simulateBatchGiftsFigures(
  currentFigures: LeaderboardFigure[],
  currentEvents: LiveGiftEvent[],
  count: number
): {
  updatedFigures: LeaderboardFigure[];
  updatedEvents: LiveGiftEvent[];
} {
  if (count <= 0 || currentFigures.length === 0) {
    return { updatedFigures: currentFigures, updatedEvents: currentEvents };
  }

  // Clone figures
  const figuresCopy: LeaderboardFigure[] = currentFigures.map((f) => ({ ...f }));
  const newEvents: LiveGiftEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    // Pick random figure with slight weight towards popular figures
    const idx = Math.floor(Math.random() * figuresCopy.length);
    const target = figuresCopy[idx];
    if (!target) continue;

    const amount = getRandomGiftAmount();
    target.totalBalance += amount;
    target.fanCount += 1;

    const fanName = NIGERIAN_FAN_NAMES[Math.floor(Math.random() * NIGERIAN_FAN_NAMES.length)];
    const eventTime = now - Math.floor(Math.random() * 400);

    const event: LiveGiftEvent = {
      id: `evt_sim_${eventTime}_${Math.floor(Math.random() * 10000)}_${i}`,
      timestamp: eventTime,
      fanName,
      amount,
      figureId: target.id,
      figureName: target.name,
      sector: target.sector,
      sectorLabel: target.sectorLabel,
      eventType: amount >= 5000 ? 'whale' : 'donation',
      message: `Gifted ₦${amount.toLocaleString()} to ${target.name} (${target.sectorLabel})`
    };

    newEvents.unshift(event);
  }

  const updatedEvents = [...newEvents, ...currentEvents].slice(0, 50);

  return {
    updatedFigures: figuresCopy,
    updatedEvents
  };
}

/**
 * Average target interval between simulated gifts (approx 400ms = 2.5 gifts/sec)
 */
export const SIMULATION_AVG_INTERVAL_MS = 400;

/**
 * Calculates and executes simulated catch-up gifts for time elapsed when page was inactive or closed
 */
export function calculateElapsedCatchUpFigures(
  figures: LeaderboardFigure[],
  events: LiveGiftEvent[],
  lastTimestamp: number
): {
  updatedFigures: LeaderboardFigure[];
  updatedEvents: LiveGiftEvent[];
  giftsSimulated: number;
} {
  const now = Date.now();
  const elapsedMs = Math.max(0, now - lastTimestamp);

  if (elapsedMs < 600) {
    return { updatedFigures: figures, updatedEvents: events, giftsSimulated: 0 };
  }

  // Cap at 3,500 gifts to maintain snappy performance
  const missedGifts = Math.min(Math.floor(elapsedMs / SIMULATION_AVG_INTERVAL_MS), 3500);

  if (missedGifts <= 0) {
    return { updatedFigures: figures, updatedEvents: events, giftsSimulated: 0 };
  }

  const result = simulateBatchGiftsFigures(figures, events, missedGifts);
  return {
    ...result,
    giftsSimulated: missedGifts
  };
}
