import { DailyQuest, FanPerkItem, Team, TriviaQuestion } from '../types/game';
import diamondKingImg from '../assets/images/diamond_king_original_1791989314302.jpg';
import babsCardiniImg from '../assets/images/babs_cardini_original_1791989347023.jpg';

export const TROPHY_IMAGE_URL = '';
export const ARENA_IMAGE_URL = '';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'diamond_king',
    name: 'Diamond King',
    tag: 'DK',
    primaryColor: '#EF4444',
    accentColor: '#F87171',
    bgGradient: 'from-red-500/20 via-rose-500/10 to-transparent',
    logoUrl: diamondKingImg || '/images/diamond_king.jpg',
    totalBalance: 0,
    previousRank: 1,
    currentRank: 1,
    fanCount: 0,
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
    primaryColor: '#3B82F6',
    accentColor: '#60A5FA',
    bgGradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
    logoUrl: babsCardiniImg || '/images/babs_cardini.jpg',
    totalBalance: 0,
    previousRank: 2,
    currentRank: 2,
    fanCount: 0,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 1,
    players: []
  }
];

export const INITIAL_QUESTS: DailyQuest[] = [];
export const INITIAL_SHOP_ITEMS: FanPerkItem[] = [];
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
