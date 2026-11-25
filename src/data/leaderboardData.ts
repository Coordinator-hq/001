import { LeaderboardFigure, LiveGiftEvent, SectorCategory } from '../types/leaderboard';

export interface SectorMeta {
  id: SectorCategory;
  label: string;
  icon: string;
  description: string;
  color: string;
  campaignDuration: string;
  campaignStatus: 'ended' | 'live';
  campaignPeriodLabel: string;
}

export const SECTOR_CONFIGS: SectorMeta[] = [
  {
    id: 'unilag_top_artistes',
    label: 'UNILag Top Artistes',
    icon: 'Trophy',
    description: 'University of Lagos Campus Music Leaderboard · 7-Day Gifting Finale',
    color: '#F59E0B',
    campaignDuration: '7 Days',
    campaignStatus: 'ended',
    campaignPeriodLabel: 'Week 1 Campaign Ended · Final Official Results'
  }
];

// Single Leaderboard: UNILag Top Artistes — Final standings after 1 week of fan gifting
export const INITIAL_FIGURES: LeaderboardFigure[] = [
  {
    id: 'cappoditutti',
    name: 'Cappoditutti',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'CAPPO',
    fandomName: 'Cappo Mob',
    slogan: 'Presidential / UNILAG Campus Drop Champion',
    handle: '@cappoditutti',
    bio: 'UNILAG Afro-fusion breakout star and fan-voted campus headliner known for Onigbo, Shora, and Presidential.',
    avatarUrl: '/images/celebrities/cappoditutti.jpg',
    primaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    totalBalance: 187500,
    fanCount: 146,
    verified: true
  },
  {
    id: 'zaylevelten',
    name: 'Zaylevelten',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'TENSKI',
    fandomName: 'Levelten Army',
    slogan: 'Then It Got Crazy / Tenski',
    handle: '@zaylevelten',
    bio: 'UNILAG alumnus, producer, and alté-rap trailblazer behind Pawon, Tease Me, and Watching Me.',
    avatarUrl: '/images/celebrities/zaylevelten.jpg',
    primaryColor: '#10B981',
    accentColor: '#34D399',
    totalBalance: 164200,
    fanCount: 121,
    verified: true
  },
  {
    id: 'sossi',
    name: 'Sossi',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'SOSSI',
    fandomName: 'Sossi Gang',
    slogan: 'Sebee / Bamidele Hitmaker',
    handle: '@officialsossi',
    bio: 'Renowned UNILAG-bred Afropop singer and songwriter celebrated for Sebee, Bamidele, and Neo.',
    avatarUrl: '/images/celebrities/sossi.jpg',
    primaryColor: '#8B5CF6',
    accentColor: '#A78BFA',
    totalBalance: 121800,
    fanCount: 93,
    verified: true
  },
  {
    id: 'soji_boy',
    name: 'Soji Boy',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'SOJIBOI',
    fandomName: 'Acada Movement',
    slogan: 'Acada / Akoka Royalty',
    handle: '@sojiboy_ng',
    bio: 'Veteran UNILAG campus Afropop and hip-hop favorite with loyal student followings across Akoka.',
    avatarUrl: '',
    primaryColor: '#EF4444',
    accentColor: '#F87171',
    totalBalance: 94500,
    fanCount: 74,
    verified: true
  },
  {
    id: 'mr_byno',
    name: 'Mr Byno',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'BYNO',
    fandomName: 'Byno Hive',
    slogan: 'Soulful Campus Melodies',
    handle: '@mrbyno',
    bio: 'UNILAG vocalist and songwriter blending smooth R&B harmonies with Lagos campus Afrobeats.',
    avatarUrl: '',
    primaryColor: '#06B6D4',
    accentColor: '#22D3EE',
    totalBalance: 76000,
    fanCount: 62,
    verified: true
  },
  {
    id: 'young_ace',
    name: 'Young Ace',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'ACE',
    fandomName: 'Ace Nation',
    slogan: 'Campus Freestyle King',
    handle: '@youngace_ng',
    bio: 'High-energy UNILAG lyricist and stage performer commanding cyphers and faculty night lineups.',
    avatarUrl: '',
    primaryColor: '#3B82F6',
    accentColor: '#60A5FA',
    totalBalance: 61400,
    fanCount: 49,
    verified: false
  },
  {
    id: 'sir_hamza',
    name: 'Sir Hamza',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'HAMZA',
    fandomName: 'Hamza Clan',
    slogan: 'Afro-Soul & Street Vibe',
    handle: '@sirhamza_',
    bio: 'Distinctive UNILAG Afro-soul and street-hop vocalist delivering emotive hooks and campus anthems.',
    avatarUrl: '',
    primaryColor: '#F97316',
    accentColor: '#FB923C',
    totalBalance: 48900,
    fanCount: 38,
    verified: false
  },
  {
    id: 'kryptic',
    name: 'Kryptic',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'KRYPTIC',
    fandomName: 'Kryptic Sound',
    slogan: 'Late Night Akoka Bars',
    handle: '@krypticsound',
    bio: 'Underground UNILAG rapper and experimental sound architect with tight wordplay and dark beats.',
    avatarUrl: '',
    primaryColor: '#6366F1',
    accentColor: '#818CF8',
    totalBalance: 37500,
    fanCount: 31,
    verified: false
  },
  {
    id: 'kehney',
    name: 'Kehney',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'KEHNEY',
    fandomName: 'Kehney Tribe',
    slogan: 'Sweet Afro-Pop Hooks',
    handle: '@officialkehney',
    bio: 'Melodic UNILAG singer-songwriter known for infectious hooks and lively campus acoustic sessions.',
    avatarUrl: '',
    primaryColor: '#EC4899',
    accentColor: '#F472B6',
    totalBalance: 28200,
    fanCount: 24,
    verified: false
  },
  {
    id: 'pearly',
    name: 'Pearly',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    tag: 'PEARLY',
    fandomName: 'Pearly Stars',
    slogan: 'Akoka Vocal Gem',
    handle: '@pearlymusic_',
    bio: 'Rising UNILAG songstress bringing silky Afro-R&B vocals and vibrant energy to campus stages.',
    avatarUrl: '',
    primaryColor: '#A855F7',
    accentColor: '#C084FC',
    totalBalance: 19500,
    fanCount: 18,
    verified: false
  }
];

// Closing highlight events from the concluded 7-day gifting campaign
export const FINAL_WEEK_HIGHLIGHTS: LiveGiftEvent[] = [
  {
    id: 'evt_week1_1',
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    fanName: 'Moremi Hall Crew',
    amount: 15000,
    figureId: 'cappoditutti',
    figureName: 'Cappoditutti',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    eventType: 'whale',
    message: 'Final hour boost of ₦15,000 to Cappoditutti'
  },
  {
    id: 'evt_week1_2',
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    fanName: 'Tenski Supporters',
    amount: 10000,
    figureId: 'zaylevelten',
    figureName: 'Zaylevelten',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    eventType: 'whale',
    message: 'Gifted ₦10,000 to Zaylevelten'
  },
  {
    id: 'evt_week1_3',
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
    fanName: 'Jaja Hall Fans',
    amount: 5000,
    figureId: 'sossi',
    figureName: 'Sossi',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    eventType: 'whale',
    message: 'Gifted ₦5,000 to Sossi'
  },
  {
    id: 'evt_week1_4',
    timestamp: Date.now() - 1000 * 60 * 60 * 11,
    fanName: 'Akoka OG',
    amount: 5000,
    figureId: 'soji_boy',
    figureName: 'Soji Boy',
    sector: 'unilag_top_artistes',
    sectorLabel: 'UNILag Top Artistes',
    eventType: 'whale',
    message: 'Gifted ₦5,000 to Soji Boy'
  }
];
