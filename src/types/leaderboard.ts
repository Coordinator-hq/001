export type SectorCategory = 'unilag_top_artistes';

export interface LeaderboardFigure {
  id: string;
  name: string;
  sector: SectorCategory;
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
  sector: SectorCategory;
  sectorLabel: string;
  eventType: 'whale' | 'donation';
  message: string;
}
