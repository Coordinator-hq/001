import { DailyQuest, FanPerkItem, Team, TriviaQuestion } from '../types/game';
import tachaImg from '../assets/images/tacha_portrait_1792074885755.jpg';
import mercyLamboImg from '../assets/images/mercy_lambo_portrait_1792074885420.jpg';

export const TROPHY_IMAGE_URL = '';
export const ARENA_IMAGE_URL = '';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'tacha',
    name: 'Tacha',
    tag: 'TITANS',
    slogan: 'Titan Queen',
    primaryColor: '#F43F5E',
    accentColor: '#FDA4AF',
    bgGradient: 'from-rose-500/25 via-pink-500/10 to-transparent',
    logoUrl: tachaImg,
    totalBalance: 24500,
    previousRank: 1,
    currentRank: 1,
    fanCount: 42,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 1,
    isUserFavored: true,
    players: []
  },
  {
    id: 'mercy_lambo',
    name: 'Mercy Lambo',
    tag: 'MERCENARIES',
    slogan: 'Lambo Queen',
    primaryColor: '#3B82F6',
    accentColor: '#60A5FA',
    bgGradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
    logoUrl: mercyLamboImg,
    totalBalance: 23800,
    previousRank: 2,
    currentRank: 2,
    fanCount: 39,
    boostMultiplier: 1.0,
    passiveIncomePerSec: 0,
    championshipWins: 1,
    players: []
  }
];

export const INITIAL_QUESTS: DailyQuest[] = [];
export const INITIAL_SHOP_ITEMS: FanPerkItem[] = [];
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
