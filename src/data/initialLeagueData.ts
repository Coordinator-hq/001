import { DailyQuest, FanPerkItem, Team, TriviaQuestion } from '../types/game';

export const TROPHY_IMAGE_URL = '';
export const ARENA_IMAGE_URL = '';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'arsenal',
    name: 'Arsenal',
    tag: 'ARS',
    primaryColor: '#EF4444',
    accentColor: '#FDE047',
    bgGradient: 'from-red-600/20 via-amber-500/10 to-transparent',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    totalBalance: 100000,
    previousRank: 1,
    currentRank: 1,
    fanCount: 0,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 13,
    isUserFavored: true,
    players: []
  },
  {
    id: 'mancity',
    name: 'Man City',
    tag: 'MCI',
    primaryColor: '#06B6D4',
    accentColor: '#67E8F9',
    bgGradient: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    totalBalance: 100000,
    previousRank: 2,
    currentRank: 2,
    fanCount: 0,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 10,
    players: []
  },
  {
    id: 'manutd',
    name: 'Man Utd',
    tag: 'MUN',
    primaryColor: '#DC2626',
    accentColor: '#FCA5A5',
    bgGradient: 'from-red-700/20 via-amber-500/10 to-transparent',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    totalBalance: 100000,
    previousRank: 3,
    currentRank: 3,
    fanCount: 0,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 20,
    players: []
  },
  {
    id: 'chelsea',
    name: 'Chelsea',
    tag: 'CHE',
    primaryColor: '#2563EB',
    accentColor: '#93C5FD',
    bgGradient: 'from-blue-600/20 via-cyan-500/10 to-transparent',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    totalBalance: 100000,
    previousRank: 4,
    currentRank: 4,
    fanCount: 0,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 6,
    players: []
  }
];

export const INITIAL_QUESTS: DailyQuest[] = [];
export const INITIAL_SHOP_ITEMS: FanPerkItem[] = [];
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
