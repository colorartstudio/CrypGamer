import { MatchEconomy, MatchState } from '../types';

export const RAKE_RATE = 0.15; // 15% per player
export const NETWORK_SHARE_OF_RAKE = 0.50; // 50% of rake
export const JACKPOT_SHARE_OF_RAKE = 0.10; // 10% of rake
export const PLATFORM_SHARE_OF_RAKE = 0.40; // 40% of rake

export const NETWORK_TIERS = [
  { level: 1, weight: 5, pctOfNetwork: 0.50, pctOfRake: 0.25, pctOfBet: 0.0375 },
  { level: 2, weight: 2, pctOfNetwork: 0.20, pctOfRake: 0.10, pctOfBet: 0.0150 },
  { level: 3, weight: 1, pctOfNetwork: 0.10, pctOfRake: 0.05, pctOfBet: 0.0075 },
  { level: 4, weight: 1, pctOfNetwork: 0.10, pctOfRake: 0.05, pctOfBet: 0.0075 },
  { level: 5, weight: 1, pctOfNetwork: 0.10, pctOfRake: 0.05, pctOfBet: 0.0075 },
];

/**
 * Calculates the exact transparent economy breakdown for a PvP match
 * based on the individual wager.
 */
export function calculateMatchEconomy(betPerPlayer: number): MatchEconomy {
  if (betPerPlayer <= 0) {
    return {
      betPerPlayer: 0,
      totalPotBeforeRake: 0,
      rakePerPlayer: 0,
      totalRake: 0,
      winnerPrize: 0,
      networkPool: 0,
      jackpotPool: 0,
      platformPool: 0,
      networkLevelDistribution: NETWORK_TIERS.map(t => ({
        level: t.level,
        weight: t.weight,
        percentage: t.pctOfRake * 100,
        amount: 0,
      }))
    };
  }

  const totalPotBeforeRake = betPerPlayer * 2;
  const rakePerPlayer = Math.floor(betPerPlayer * RAKE_RATE);
  const totalRake = rakePerPlayer * 2;
  const winnerPrize = totalPotBeforeRake - totalRake; // e.g. 2000 - 300 = 1700 RC

  // Total Rake distribution (for both players' combined rake)
  const totalNetworkPool = Math.floor(totalRake * NETWORK_SHARE_OF_RAKE); // 50%
  const totalJackpotPool = Math.floor(totalRake * JACKPOT_SHARE_OF_RAKE); // 10%
  
  // 5-level referral distribution (per player basis is 37, 15, 7, 7, 7 for 1000 RC; for combined rake it's * 2)
  const networkLevelDistribution = NETWORK_TIERS.map(tier => {
    // Individual player's rake contribution to this tier:
    const tierPerPlayer = Math.floor(rakePerPlayer * tier.pctOfRake);
    const amount = tierPerPlayer * 2; // both players
    return {
      level: tier.level,
      weight: tier.weight,
      percentage: tier.pctOfRake * 100,
      amount,
    };
  });

  const distributedNetwork = networkLevelDistribution.reduce((sum, item) => sum + item.amount, 0);
  const platformPool = totalRake - distributedNetwork - totalJackpotPool;

  return {
    betPerPlayer,
    totalPotBeforeRake,
    rakePerPlayer,
    totalRake,
    winnerPrize,
    networkPool: distributedNetwork,
    jackpotPool: totalJackpotPool,
    platformPool,
    networkLevelDistribution,
  };
}

/**
 * Settles a PvP match according to platform financial security rules:
 * - WIN: Winner gets (Pot - Total Rake). Total Rake distributed to Network, Jackpot, Platform.
 * - DRAW: Rake is 0%. Both players refunded 100% of their wagers.
 */
export function settleMatchResult(
  betPerPlayer: number,
  state: 'FINISHED' | 'DRAW',
  winnerIndex: 0 | 1 | null
): {
  state: MatchState;
  winnerPrize: number;
  player1Payout: number;
  player2Payout: number;
  economy: MatchEconomy;
  jackpotAdded: number;
  networkDistributed: number;
} {
  const economy = calculateMatchEconomy(betPerPlayer);

  if (state === 'DRAW' || winnerIndex === null) {
    // Rule: empate = rake 0. 100% refund.
    return {
      state: 'DRAW',
      winnerPrize: 0,
      player1Payout: betPerPlayer,
      player2Payout: betPerPlayer,
      economy: {
        ...economy,
        totalRake: 0,
        rakePerPlayer: 0,
        winnerPrize: 0,
        networkPool: 0,
        jackpotPool: 0,
        platformPool: 0,
        networkLevelDistribution: economy.networkLevelDistribution.map(item => ({ ...item, amount: 0 })),
      },
      jackpotAdded: 0,
      networkDistributed: 0,
    };
  }

  return {
    state: 'FINISHED',
    winnerPrize: economy.winnerPrize,
    player1Payout: winnerIndex === 0 ? economy.winnerPrize : 0,
    player2Payout: winnerIndex === 1 ? economy.winnerPrize : 0,
    economy,
    jackpotAdded: economy.jackpotPool,
    networkDistributed: economy.networkPool,
  };
}
