export type PlayerRole = 'Captain' | 'Striker' | 'Strategist' | 'Sniper' | 'Fan Magnet';
export type FanTier = 'Rookie' | 'All-Star' | 'Superstar' | 'Legend';

export interface Player {
  id: string;
  name: string;
  handle: string;
  teamId: string;
  role: PlayerRole;
  avatarUrl?: string;
  personalBalance: number;
  cheerCount: number;
  winRate: number;
  mvpPoints: number;
  perks: string[];
  fanTier: FanTier;
  previousRank: number;
  currentRank: number;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  slogan: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  logoUrl?: string;
  totalBalance: number;
  previousRank: number;
  currentRank: number;
  fanCount: number;
  boostMultiplier: number;
  passiveIncomePerSec: number;
  players: Player[];
  bio: string;
  championshipWins: number;
  isUserFavored?: boolean;
}

export interface FanProfile {
  name: string;
  avatar: string;
  coins: number;
  prestigeTier: number;
  cheerLevel: number;
  totalDonated: number;
  favoredTeamId: string;
  favoredPlayerId: string;
  unlockedPerks: string[];
  activeBoosters: {
    id: string;
    name: string;
    multiplier: number;
    expiresAt: number;
  }[];
}

export interface FanPerkItem {
  id: string;
  name: string;
  description: string;
  iconName: string;
  cost: number;
  effectType: 'passive_income' | 'click_multiplier' | 'sponsor_match' | 'whale_boost';
  boostValue: number;
  durationSec?: number;
  flavor: string;
}

export interface FanActivityEvent {
  id: string;
  timestamp: number;
  fanName: string;
  amount: number;
  teamId: string;
  teamName: string;
  playerId?: string;
  playerName?: string;
  eventType: 'donation' | 'whale' | 'perk_activated' | 'frenzy' | 'rivalry_win';
  message: string;
}

export interface SeasonState {
  year: number;
  currentDay: number;
  totalDays: number;
  isFinished: boolean;
  prizePool: number;
  stageName: string;
  speed: number; // 0 = paused, 1 = normal, 5 = fast, 20 = turbo
  isSimulatingToEnd?: boolean;
  winningTeamId?: string;
  mvpPlayerId?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardExp: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  type: 'tap' | 'contribute' | 'cheer_amount' | 'trivia';
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reward: number;
}
