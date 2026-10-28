export type SectorCategory = 
  | 'master'
  | 'music'
  | 'movies'
  | 'comedy'
  | 'skits'
  | 'x_influencers'
  | 'instagram_influencers'
  | 'tiktok_influencers'
  | 'bbnaija'
  | 'youtube_tech'
  | 'podcasts';

export interface LeaderboardFigure {
  id: string;
  name: string;
  sector: Exclude<SectorCategory, 'master'>;
  sectorLabel: string;
  tag: string;
  fandomName: string;
  slogan: string;
  avatarUrl: string;
  primaryColor: string;
  accentColor: string;
  totalBalance: number;
  fanCount: number;
  verified?: boolean;
  handle?: string;
  bio?: string;
}

export interface LiveGiftEvent {
  id: string;
  timestamp: number;
  fanName: string;
  amount: number;
  figureId: string;
  figureName: string;
  sector: Exclude<SectorCategory, 'master'>;
  sectorLabel: string;
  eventType: 'whale' | 'donation';
  message: string;
}
