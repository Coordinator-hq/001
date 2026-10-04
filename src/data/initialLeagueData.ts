import { DailyQuest, FanPerkItem, Team, TriviaQuestion } from '../types/game';

export const PELLER_LOGO = '/src/assets/images/peller_team_logo_1791097702665.jpg';
export const CARTEREFE_LOGO = '/src/assets/images/carterefe_team_logo_1791097714987.jpg';
export const DAVIDO_LOGO = '/src/assets/images/davido_team_logo_1791097725011.jpg';
export const WIZKID_LOGO = '/src/assets/images/wizkid_team_logo_1791097735244.jpg';

export const TROPHY_IMAGE_URL = '/src/assets/images/apex_championship_trophy_1791079233293.jpg';
export const ARENA_IMAGE_URL = '/src/assets/images/apex_arena_stadium_1791079244790.jpg';
export const FAN_PERKS_CATALOG: FanPerkItem[] = [];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'wizkid',
    name: 'Wizkid',
    tag: 'WIZ',
    slogan: 'Starboy Worldwide — More Love, Less Ego',
    primaryColor: '#F59E0B',
    accentColor: '#FDE047',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    logoUrl: WIZKID_LOGO,
    totalBalance: 4850000,
    previousRank: 1,
    currentRank: 1,
    fanCount: 142000,
    boostMultiplier: 1.5,
    passiveIncomePerSec: 150,
    bio: 'The Grammy-winning Afrobeats icon and Starboy FC pioneer leading the leaderboard.',
    championshipWins: 5,
    isUserFavored: true,
    players: []
  },
  {
    id: 'davido',
    name: 'Davido',
    tag: 'OBO',
    slogan: '30 Billion Gang — We Rise by Lifting Others',
    primaryColor: '#EAB308',
    accentColor: '#FEF08A',
    bgGradient: 'from-yellow-500/20 via-amber-500/10 to-transparent',
    logoUrl: DAVIDO_LOGO,
    totalBalance: 4200000,
    previousRank: 2,
    currentRank: 2,
    fanCount: 135000,
    boostMultiplier: 1.45,
    passiveIncomePerSec: 140,
    bio: 'The unstoppable hitmaker and leader of 30BG commanding unprecedented global energy.',
    championshipWins: 4,
    players: []
  },
  {
    id: 'peller',
    name: 'Peller',
    tag: 'PEL',
    slogan: 'Youngest Streaming Sensation',
    primaryColor: '#F59E0B',
    accentColor: '#FCD34D',
    bgGradient: 'from-amber-600/20 via-yellow-500/10 to-transparent',
    logoUrl: PELLER_LOGO,
    totalBalance: 2750000,
    previousRank: 3,
    currentRank: 3,
    fanCount: 88000,
    boostMultiplier: 1.3,
    passiveIncomePerSec: 95,
    bio: 'Dynamic live streaming superstar bringing electric entertainment and viral streams.',
    championshipWins: 2,
    players: []
  },
  {
    id: 'carterefe',
    name: 'Carterefe',
    tag: 'CAR',
    slogan: 'Machala Energy & Maximum Comedic Impact',
    primaryColor: '#D97706',
    accentColor: '#FBBF24',
    bgGradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    logoUrl: CARTEREFE_LOGO,
    totalBalance: 2150000,
    previousRank: 4,
    currentRank: 4,
    fanCount: 76000,
    boostMultiplier: 1.25,
    passiveIncomePerSec: 80,
    bio: 'Viral content creator, streamer and Machala movement champion with intense fan loyalty.',
    championshipWins: 2,
    players: []
  }
];

export const INITIAL_QUESTS: DailyQuest[] = [];
export const INITIAL_SHOP_ITEMS: FanPerkItem[] = [];
export const TRIVIA_QUESTIONS: TriviaQuestion[] = [];
