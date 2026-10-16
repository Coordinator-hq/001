import { DailyQuest, FanPerkItem, Team, TriviaQuestion, Matchup } from '../types/game';

export const TROPHY_IMAGE_URL = '';
export const ARENA_IMAGE_URL = '';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

// High quality verified portraits for each star
export const PORTRAITS = {
  burna_boy: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Burna_Boy_in_2023.jpg/640px-Burna_Boy_in_2023.jpg',
  davido: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Davido_2024_%28cropped%29.jpg/640px-Davido_2024_%28cropped%29.jpg',
  ayra_starr: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ayra_Starr_in_2023.jpg/640px-Ayra_Starr_in_2023.jpg',
  tiwa_savage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tiwa_Savage_2022.jpg/640px-Tiwa_Savage_2022.jpg',
  wizkid: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Wizkid_in_2022.jpg/640px-Wizkid_in_2022.jpg',
  nicki_minaj: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nicki_Minaj_at_the_2023_MTV_Video_Music_Awards_03.jpg/640px-Nicki_Minaj_at_the_2023_MTV_Video_Music_Awards_03.jpg',
  cardi_b: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Cardi_B_at_the_2023_MTV_Video_Music_Awards_02.jpg/640px-Cardi_B_at_the_2023_MTV_Video_Music_Awards_02.jpg',
  tacha: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  mercy_lambo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
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
