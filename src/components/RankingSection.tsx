import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Trophy, Medal, Flame, Zap, Award, Search, Filter } from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../data/initialData';

interface RankingSectionProps {
  language: Language;
}

export const RankingSection: React.FC<RankingSectionProps> = ({ language }) => {
  const t = translations[language];
  const [timeFilter, setTimeFilter] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [sortFilter, setSortFilter] = useState<'wins' | 'xp' | 'winRate'>('wins');

  const sortedLeaderboard = [...INITIAL_LEADERBOARD].sort((a, b) => {
    if (sortFilter === 'wins') return b.wins - a.wins;
    if (sortFilter === 'xp') return b.xp - a.xp;
    return parseFloat(b.winRate) - parseFloat(a.winRate);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-8 h-8 text-[#FF6A00]" />
            {t.rankingTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {t.rankingSubtitle}
          </p>
        </div>

        {/* Time filters */}
        <div className="flex bg-[#141414] p-1 rounded-xl border border-[#222]">
          <button
            onClick={() => setTimeFilter('global')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              timeFilter === 'global' ? 'bg-[#FF6A00] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.filterGlobal}
          </button>
          <button
            onClick={() => setTimeFilter('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              timeFilter === 'weekly' ? 'bg-[#FF6A00] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.filterWeekly}
          </button>
          <button
            onClick={() => setTimeFilter('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              timeFilter === 'monthly' ? 'bg-[#FF6A00] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.filterMonthly}
          </button>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
        {/* Rank 2 */}
        {sortedLeaderboard[1] && (
          <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 text-center flex flex-col items-center sm:order-1 order-2">
            <div className="w-8 h-8 rounded-full bg-neutral-700 text-white font-black flex items-center justify-center text-xs mb-2">
              #2
            </div>
            <img
              src={sortedLeaderboard[1].avatar}
              alt={sortedLeaderboard[1].username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-500 mb-2 shadow-lg"
            />
            <span className="font-bold text-white text-sm">{sortedLeaderboard[1].username}</span>
            <span className="text-[11px] text-[#FF6A00] font-mono font-bold mt-0.5">{sortedLeaderboard[1].badge}</span>
            <div className="mt-3 pt-2 border-t border-[#222] w-full grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[10px]">Vitórias</span>
                <span className="text-white font-bold">{sortedLeaderboard[1].wins}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Win Rate</span>
                <span className="text-[#20D67B] font-bold">{sortedLeaderboard[1].winRate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Rank 1 (Champion) */}
        {sortedLeaderboard[0] && (
          <div className="bg-gradient-to-b from-orange-950/40 via-[#171717] to-black border-2 border-[#FF6A00] rounded-2xl p-5 text-center flex flex-col items-center sm:order-2 order-1 shadow-2xl relative">
            <div className="absolute -top-3 bg-[#FF6A00] text-black font-black text-xs px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <Award className="w-3.5 h-3.5 fill-black" /> #1 CAMPEÃO
            </div>
            <img
              src={sortedLeaderboard[0].avatar}
              alt={sortedLeaderboard[0].username}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#FF6A00] mb-2 shadow-xl glow-orange mt-2"
            />
            <span className="font-black text-white text-base">{sortedLeaderboard[0].username}</span>
            <span className="text-xs text-[#FF6A00] font-mono font-bold mt-0.5">{sortedLeaderboard[0].badge}</span>
            <div className="mt-4 pt-3 border-t border-white/10 w-full grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-neutral-400 block text-[10px]">Vitórias</span>
                <span className="text-2xl font-black text-white">{sortedLeaderboard[0].wins}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px]">Win Rate</span>
                <span className="text-2xl font-black text-[#20D67B]">{sortedLeaderboard[0].winRate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {sortedLeaderboard[2] && (
          <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 text-center flex flex-col items-center sm:order-3 order-3">
            <div className="w-8 h-8 rounded-full bg-amber-900 text-white font-black flex items-center justify-center text-xs mb-2">
              #3
            </div>
            <img
              src={sortedLeaderboard[2].avatar}
              alt={sortedLeaderboard[2].username}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-700 mb-2 shadow-lg"
            />
            <span className="font-bold text-white text-sm">{sortedLeaderboard[2].username}</span>
            <span className="text-[11px] text-[#FF6A00] font-mono font-bold mt-0.5">{sortedLeaderboard[2].badge}</span>
            <div className="mt-3 pt-2 border-t border-[#222] w-full grid grid-cols-2 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[10px]">Vitórias</span>
                <span className="text-white font-bold">{sortedLeaderboard[2].wins}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Win Rate</span>
                <span className="text-[#20D67B] font-bold">{sortedLeaderboard[2].winRate}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#222] flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Classificação Completa
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortFilter('wins')}
              className={`text-xs px-2.5 py-1 rounded font-mono ${sortFilter === 'wins' ? 'bg-[#FF6A00] text-black font-bold' : 'text-neutral-400'}`}
            >
              Vitórias
            </button>
            <button
              onClick={() => setSortFilter('winRate')}
              className={`text-xs px-2.5 py-1 rounded font-mono ${sortFilter === 'winRate' ? 'bg-[#FF6A00] text-black font-bold' : 'text-neutral-400'}`}
            >
              Win Rate
            </button>
            <button
              onClick={() => setSortFilter('xp')}
              className={`text-xs px-2.5 py-1 rounded font-mono ${sortFilter === 'xp' ? 'bg-[#FF6A00] text-black font-bold' : 'text-neutral-400'}`}
            >
              XP
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#1c1c1c]">
          {sortedLeaderboard.map(player => (
            <div
              key={player.rank}
              className={`p-3.5 sm:px-5 flex items-center justify-between transition-colors ${
                player.username === 'PLAYERX' ? 'bg-orange-950/20 border-l-4 border-[#FF6A00]' : 'hover:bg-[#161616]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 text-center font-mono font-black text-sm text-neutral-400">
                  #{player.rank}
                </span>
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-10 h-10 rounded-xl object-cover border border-[#333]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">{player.username}</span>
                    <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">{player.badge}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {player.matches} partidas • Streak: {player.streak}🔥
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div className="text-right">
                  <span className="text-neutral-500 text-[10px] block">Vitórias</span>
                  <span className="font-bold text-white">{player.wins}</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 text-[10px] block">Win Rate</span>
                  <span className="font-bold text-[#20D67B]">{player.winRate}</span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-neutral-500 text-[10px] block">XP Gamer</span>
                  <span className="font-bold text-neutral-300">{player.xp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
