import { DailyQuest, FanPerkItem, Team, TriviaQuestion } from '../types/game';

export const TROPHY_IMAGE_URL = '';
export const ARENA_IMAGE_URL = '';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'diamond_king',
    name: 'Diamond King',
    tag: 'DK',
    primaryColor: '#00E599',
    accentColor: '#34D399',
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    logoUrl: '/src/assets/images/diamond_king_original_1791989314302.jpg',
    totalBalance: 580000,
    previousRank: 1,
    currentRank: 1,
    fanCount: 580,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 1,
    isUserFavored: true,
    players: []
  },
  {
    id: 'babs_cardini',
    name: 'Babs Cardini',
    tag: 'BABS',
    primaryColor: '#A855F7',
    accentColor: '#C084FC',
    bgGradient: 'from-purple-500/25 via-violet-500/10 to-transparent',
    logoUrl: '/src/assets/images/babs_cardini_original_1791989347023.jpg',
    totalBalance: 420000,
    previousRank: 2,
    currentRank: 2,
    fanCount: 420,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 1,
    players: []
  }
];

export const INITIAL_QUESTS: DailyQuest[] = [];
export const INITIAL_SHOP_ITEMS: FanPerkItem[] = [];
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
