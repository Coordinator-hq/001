import { DailyQuest, FanPerkItem, Team, TriviaQuestion, Matchup } from '../types/game';

export const TROPHY_IMAGE_URL = '';
export const ARENA_IMAGE_URL = '';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

// High quality verified portraits for each star
export const PORTRAITS = {
  burna_boy: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  davido: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  ayra_starr: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  tiwa_savage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
  wizkid: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  nicki_minaj: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  cardi_b: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  tacha: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  mercy_lambo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80'
};

export const INITIAL_BATTLES: {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  teams: [Team, Team];
}[] = [
  {
    id: 'burna_vs_davido',
    title: 'Burna Boy vs Davido',
    subtitle: 'Outsiders vs 30BG',
    category: 'Afrobeats Heavyweights',
    badge: 'Live Battle 1',
    teams: [
      {
        id: 'burna_boy',
        name: 'Burna Boy',
        tag: 'OUTSIDERS',
        slogan: 'African Giant',
        primaryColor: '#EF4444',
        accentColor: '#F87171',
        bgGradient: 'from-red-500/25 via-rose-500/10 to-transparent',
        logoUrl: PORTRAITS.burna_boy,
        totalBalance: 142000,
        previousRank: 1,
        currentRank: 1,
        fanCount: 195,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 18,
        isUserFavored: true,
        players: []
      },
      {
        id: 'davido',
        name: 'Davido',
        tag: '30BG',
        slogan: '001 / Baddest',
        primaryColor: '#3B82F6',
        accentColor: '#60A5FA',
        bgGradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
        logoUrl: PORTRAITS.davido,
        totalBalance: 138500,
        previousRank: 2,
        currentRank: 2,
        fanCount: 189,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 17,
        players: []
      }
    ]
  },
  {
    id: 'ayra_vs_tiwa',
    title: 'Ayra Starr vs Tiwa Savage',
    subtitle: 'Sabi Girls vs Savage Army',
    category: 'Afrobeats Queens',
    badge: 'Live Battle 2',
    teams: [
      {
        id: 'ayra_starr',
        name: 'Ayra Starr',
        tag: 'SABI GIRLS',
        slogan: 'Celestial / Sabi Girl',
        primaryColor: '#EF4444',
        accentColor: '#F87171',
        bgGradient: 'from-red-500/25 via-rose-500/10 to-transparent',
        logoUrl: PORTRAITS.ayra_starr,
        totalBalance: 98500,
        previousRank: 1,
        currentRank: 1,
        fanCount: 146,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 14,
        isUserFavored: true,
        players: []
      },
      {
        id: 'tiwa_savage',
        name: 'Tiwa Savage',
        tag: 'SAVAGE ARMY',
        slogan: 'Queen of Afrobeats',
        primaryColor: '#3B82F6',
        accentColor: '#60A5FA',
        bgGradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
        logoUrl: PORTRAITS.tiwa_savage,
        totalBalance: 97200,
        previousRank: 2,
        currentRank: 2,
        fanCount: 142,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 15,
        players: []
      }
    ]
  },
  {
    id: 'davido_vs_wizkid',
    title: 'Davido vs Wizkid',
    subtitle: '30BG vs Starboy FC',
    category: 'Afrobeats Megastars',
    badge: 'Live Battle 3',
    teams: [
      {
        id: 'davido_team',
        name: 'Davido',
        tag: '30BG',
        slogan: 'OBO / 30 Billion Gang',
        primaryColor: '#EF4444',
        accentColor: '#F87171',
        bgGradient: 'from-red-500/25 via-rose-500/10 to-transparent',
        logoUrl: PORTRAITS.davido,
        totalBalance: 84500,
        previousRank: 1,
        currentRank: 1,
        fanCount: 142,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 16,
        isUserFavored: true,
        players: []
      },
      {
        id: 'wizkid',
        name: 'Wizkid',
        tag: 'STARBOY',
        slogan: 'Starboy / Wizkid FC',
        primaryColor: '#3B82F6',
        accentColor: '#60A5FA',
        bgGradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
        logoUrl: PORTRAITS.wizkid,
        totalBalance: 83900,
        previousRank: 2,
        currentRank: 2,
        fanCount: 138,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 15,
        players: []
      }
    ]
  },
  {
    id: 'nicki_vs_cardi',
    title: 'Nicki Minaj vs Cardi B',
    subtitle: 'Barbz vs Bardi Gang',
    category: 'Hip-Hop Queens',
    badge: 'Live Battle 4',
    teams: [
      {
        id: 'nicki_minaj',
        name: 'Nicki Minaj',
        tag: 'BARBZ',
        slogan: 'Queen of Rap',
        primaryColor: '#EF4444',
        accentColor: '#F87171',
        bgGradient: 'from-red-500/25 via-rose-500/10 to-transparent',
        logoUrl: PORTRAITS.nicki_minaj,
        totalBalance: 112500,
        previousRank: 1,
        currentRank: 1,
        fanCount: 184,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 18,
        isUserFavored: true,
        players: []
      },
      {
        id: 'cardi_b',
        name: 'Cardi B',
        tag: 'BARDI',
        slogan: 'Bardi Gang Queen',
        primaryColor: '#3B82F6',
        accentColor: '#60A5FA',
        bgGradient: 'from-blue-500/25 via-indigo-500/10 to-transparent',
        logoUrl: PORTRAITS.cardi_b,
        totalBalance: 109800,
        previousRank: 2,
        currentRank: 2,
        fanCount: 178,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 14,
        players: []
      }
    ]
  },
  {
    id: 'tacha_vs_mercy',
    title: 'Tacha vs Mercy Lambo',
    subtitle: 'Titans vs Mercenaries',
    category: 'Reality TV Royalty',
    badge: 'Live Battle 5',
    teams: [
      {
        id: 'tacha',
        name: 'Tacha',
        tag: 'TITANS',
        slogan: 'Titan Queen',
        primaryColor: '#EF4444',
        accentColor: '#F87171',
        bgGradient: 'from-red-500/25 via-rose-500/10 to-transparent',
        logoUrl: PORTRAITS.tacha,
        totalBalance: 24500,
        previousRank: 1,
        currentRank: 1,
        fanCount: 42,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 11,
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
        logoUrl: PORTRAITS.mercy_lambo,
        totalBalance: 23800,
        previousRank: 2,
        currentRank: 2,
        fanCount: 39,
        boostMultiplier: 1.0,
        passiveIncomePerSec: 0,
        championshipWins: 10,
        players: []
      }
    ]
  }
];

export const INITIAL_TEAMS: Team[] = [
  ...INITIAL_BATTLES[0].teams,
  ...INITIAL_BATTLES[1].teams,
  ...INITIAL_BATTLES[2].teams,
  ...INITIAL_BATTLES[3].teams,
  ...INITIAL_BATTLES[4].teams
];

export const INITIAL_QUESTS: DailyQuest[] = [];
export const INITIAL_SHOP_ITEMS: FanPerkItem[] = [];
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
