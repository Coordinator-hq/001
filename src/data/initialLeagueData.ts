import { DailyQuest, FanPerkItem, Team, TriviaQuestion } from '../types/game';
import burnaBoyImg from '../assets/images/burna_boy_portrait_1792138359948.jpg';
import davidoImg from '../assets/images/davido_portrait_1792134896561.jpg';
import ayraStarrImg from '../assets/images/ayra_starr_portrait_1792138360267.jpg';
import tiwaSavageImg from '../assets/images/tiwa_savage_portrait_1792138359683.jpg';
import wizkidImg from '../assets/images/wizkid_portrait_1792134896675.jpg';
import nickiImg from '../assets/images/nicki_minaj_portrait_1792136142118.jpg';
import cardiImg from '../assets/images/cardi_b_portrait_1792136140671.jpg';
import tachaImg from '../assets/images/tacha_portrait_1792074885755.jpg';
import mercyLamboImg from '../assets/images/mercy_lambo_portrait_1792074885420.jpg';

export const TROPHY_IMAGE_URL = '';
export const ARENA_IMAGE_URL = '';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

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
        logoUrl: burnaBoyImg,
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
        logoUrl: davidoImg,
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
        logoUrl: ayraStarrImg,
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
        logoUrl: tiwaSavageImg,
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
        id: 'davido',
        name: 'Davido',
        tag: '30BG',
        slogan: 'OBO / 30 Billion Gang',
        primaryColor: '#EF4444',
        accentColor: '#F87171',
        bgGradient: 'from-red-500/25 via-rose-500/10 to-transparent',
        logoUrl: davidoImg,
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
        logoUrl: wizkidImg,
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
        logoUrl: nickiImg,
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
        logoUrl: cardiImg,
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
        logoUrl: tachaImg,
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
        logoUrl: mercyLamboImg,
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

export const INITIAL_TEAMS: Team[] = INITIAL_BATTLES.flatMap((b) => b.teams);
export const INITIAL_QUESTS: DailyQuest[] = [];
export const INITIAL_SHOP_ITEMS: FanPerkItem[] = [];
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
