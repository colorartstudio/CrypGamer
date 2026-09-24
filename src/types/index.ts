export type Language = 'pt' | 'en' | 'es';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  balance: number;        // RC total
  lockedBalance: number;  // RC currently locked in active bets
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  referralCode: string;
  referredBy?: string;
  networkCount: number;
  totalNetworkEarnings: number;
  joinedDate: string;
}

export type GameCategory = 'all' | 'traditional' | 'proprietary' | 'fast_pvp';

export interface GameModeConfig {
  singleplayer: boolean;
  multiplayerInvite: boolean;
  bookOfChallenges: boolean;
}

export interface GameDefinition {
  id: string;
  name: string;
  slug: string;
  category: 'traditional' | 'proprietary';
  tagline: string;
  description: string;
  thumbnail: string;
  banner: string;
  badge?: string;
  status: 'published' | 'draft' | 'maintenance';
  version: string;
  minBet: number;
  maxBet: number;
  modes: GameModeConfig;
  playerCount: string;
  engine: 'chess' | 'checkers' | 'pool' | 'rinha' | 'cats' | 'animal_penalty' | 'primal';
  popularity: number;
}

export type CpuDifficulty = 'easy' | 'medium' | 'intermediate' | 'advanced' | 'pro';

export interface CpuDifficultyConfig {
  id: CpuDifficulty;
  name: string;
  rating: number;
  reactionTimeMs: number;
  mistakeRate: number;
  color: string;
}

export type MatchState = 
  | 'WAITING'
  | 'MATCHED'
  | 'READY'
  | 'PLAYING'
  | 'FINISHED'
  | 'CANCELLED'
  | 'DRAW'
  | 'DISPUTED';

export interface MatchPlayer {
  id: string;
  username: string;
  avatar: string;
  level: number;
  isCpu?: boolean;
}

export interface MatchEconomy {
  betPerPlayer: number;
  totalPotBeforeRake: number;
  rakePerPlayer: number;
  totalRake: number;
  winnerPrize: number;
  networkPool: number;
  jackpotPool: number;
  platformPool: number;
  networkLevelDistribution: {
    level: number;
    weight: number;
    percentage: number;
    amount: number;
  }[];
}

export interface Match {
  id: string;
  gameId: string;
  gameName: string;
  mode: 'singleplayer' | 'invite' | 'book';
  betAmount: number;
  state: MatchState;
  players: [MatchPlayer, MatchPlayer];
  winnerId?: string | null;
  economy: MatchEconomy;
  createdAt: number;
  cpuDifficulty?: CpuDifficulty;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  bgGradient: string;
  image: string;
  buttonText: string;
  relatedGameSlug?: string;
  active: boolean;
  order: number;
}

export interface TickerEvent {
  id: string;
  icon: string;
  text: string;
  highlight?: string;
  timeAgo: string;
  type: 'win' | 'entry' | 'challenge' | 'gain' | 'new_game';
}

export interface ForumTopic {
  id: string;
  category: 'general' | 'games' | 'challenges' | 'tournaments' | 'strategies' | 'news';
  author: {
    username: string;
    avatar: string;
    level: number;
  };
  title: string;
  content: string;
  likes: number;
  repliesCount: number;
  timestamp: string;
  challengeBet?: number;
  challengeGameId?: string;
}

export interface ReferralTier {
  level: number;
  membersCount: number;
  percentageOfRake: number; // e.g. 25, 10, 5, 5, 5
  percentageOfBet: number;  // 3.75, 1.50, 0.75, 0.75, 0.75
  totalEarned: number;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet_locked' | 'bet_refund' | 'win_prize' | 'referral_comm' | 'jackpot_win';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}
