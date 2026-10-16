export interface Player {
  id: string;
  name: string;
  role: string;
  rating: number;
  avatarUrl: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  slogan: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  logoUrl: string;
  totalBalance: number;
  previousRank: number;
  currentRank: number;
  fanCount: number;
  boostMultiplier: number;
  passiveIncomePerSec: number;
  championshipWins: number;
  isUserFavored?: boolean;
  players?: Player[];
}

export interface FanActivityEvent {
  id: string;
  timestamp: number;
  fanName: string;
  amount: number;
  teamId: string;
  teamName: string;
  eventType: 'whale' | 'donation' | 'streak';
  message: string;
}

export interface Matchup {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  teams: [Team, Team];
}

export interface DailyQuest {
  id: string;
  title: string;
  reward: number;
}

export interface FanPerkItem {
  id: string;
  name: string;
  price: number;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}
