/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Language, 
  UserProfile, 
  GameDefinition, 
  BannerSlide, 
  Match, 
  CpuDifficulty, 
  WalletTransaction,
  ForumTopic,
  ReferralTier
} from './types';
import { translations } from './i18n/translations';
import { LOCALE_COOKIE } from './i18n/locale';
import { applyDocumentLang, detectLocaleFromGeo, hasUserLocale, resolveClientLocale, writeLocaleCookie } from './i18n/localeClient';
import { 
  INITIAL_USER, 
  INITIAL_GAMES, 
  INITIAL_BANNERS, 
  INITIAL_TICKER_EVENTS, 
  INITIAL_NETWORK_TIERS, 
  INITIAL_FORUM_TOPICS 
} from './data/initialData';
import { calculateMatchEconomy, settleMatchResult } from './economy/economyEngine';

import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { LiveTicker } from './components/LiveTicker';
import { HeroCarousel } from './components/HeroCarousel';
import { JackpotSection } from './components/JackpotSection';
import { GameModeSelector } from './components/GameModeSelector';
import { GameWindow } from './components/GameWindow';
import { ReferralNetwork } from './components/ReferralNetwork';
import { ForumSection } from './components/ForumSection';
import { RankingSection } from './components/RankingSection';
import { ProfileWalletModal } from './components/ProfileWalletModal';
import { AdminPanel } from './components/AdminPanel';

import { 
  Gamepad2, 
  Swords, 
  Play, 
  Flame, 
  Users, 
  Target, 
  Plus, 
  Search, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>(resolveClientLocale);
  const t = translations[language];

  useEffect(() => {
    applyDocumentLang(language);
  }, [language]);

  useEffect(() => {
    let active = true;
    detectLocaleFromGeo().then(locale => {
      if (active && locale && !hasUserLocale()) setLanguage(locale);
    });
    return () => {
      active = false;
    };
  }, []);

  const selectLanguage = (lang: Language) => {
    writeLocaleCookie(LOCALE_COOKIE, lang);
    setLanguage(lang);
  };

  // Core App State
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [games, setGames] = useState<GameDefinition[]>(INITIAL_GAMES);
  const [banners, setBanners] = useState<BannerSlide[]>(INITIAL_BANNERS);
  const [tickerEvents, setTickerEvents] = useState(INITIAL_TICKER_EVENTS);
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(INITIAL_FORUM_TOPICS);
  const [networkTiers, setNetworkTiers] = useState<ReferralTier[]>(INITIAL_NETWORK_TIERS);
  const [jackpotAmount, setJackpotAmount] = useState<number>(18492);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([
    { id: 'tx-1', type: 'deposit', amount: 1000, description: 'Bônus de boas-vindas CrypGamer', date: 'Hoje', status: 'completed' },
    { id: 'tx-2', type: 'referral_comm', amount: 75, description: 'Comissão de rede Nível 1', date: 'Hoje', status: 'completed' },
    { id: 'tx-3', type: 'win_prize', amount: 850, description: 'Vitória em Xadrez Master PvP', date: 'Hoje', status: 'completed' },
  ]);

  // Navigation & Screens
  const [activeTab, setActiveTab] = useState<string>('home');
  const [gameFilter, setGameFilter] = useState<'all' | 'traditional' | 'proprietary'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Game for Mode Selection
  const [selectedGame, setSelectedGame] = useState<GameDefinition | null>(null);

  // Active Running Match
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);

  // Profile / Wallet Modal
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletDefaultTab, setWalletDefaultTab] = useState<'profile' | 'wallet'>('wallet');

  // Launch a game mode selector
  const handleSelectGame = (game: GameDefinition) => {
    setSelectedGame(game);
  };

  const handleSelectGameBySlug = (slug: string) => {
    const found = games.find(g => g.slug === slug);
    if (found) setSelectedGame(found);
  };

  // Start singleplayer match
  const handleStartSingleplayer = (difficulty: CpuDifficulty) => {
    if (!selectedGame) return;
    const matchId = 'CG-' + Math.floor(100000 + Math.random() * 900000);
    const economy = calculateMatchEconomy(0); // free training

    const match: Match = {
      id: matchId,
      gameId: selectedGame.id,
      gameName: selectedGame.name,
      mode: 'singleplayer',
      betAmount: 0,
      state: 'PLAYING',
      players: [
        { id: user.id, username: user.username, avatar: user.avatar, level: user.level },
        { id: 'cpu', username: `CPU CrypBot (${difficulty.toUpperCase()})`, avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100', level: 20, isCpu: true }
      ],
      economy,
      createdAt: Date.now(),
      cpuDifficulty: difficulty,
    };

    setActiveMatch(match);
  };

  // Start PvP match (invite or book)
  const handleStartPvPMatch = (mode: 'invite' | 'book', betAmount: number, opponentName = 'Adversário') => {
    if (!selectedGame) return;
    if (user.balance < betAmount) {
      alert('Saldo insuficiente em RC! Adicione saldo na sua Carteira para disputar partidas valendo RC.');
      setWalletDefaultTab('wallet');
      setWalletModalOpen(true);
      return;
    }

    // Lock balance
    setUser(u => ({
      ...u,
      balance: u.balance - betAmount,
      lockedBalance: u.lockedBalance + betAmount,
    }));

    const matchId = 'CG-' + Math.floor(100000 + Math.random() * 900000);
    const economy = calculateMatchEconomy(betAmount);

    const match: Match = {
      id: matchId,
      gameId: selectedGame.id,
      gameName: selectedGame.name,
      mode,
      betAmount,
      state: 'PLAYING',
      players: [
        { id: user.id, username: user.username, avatar: user.avatar, level: user.level },
        { id: 'opp-1', username: opponentName, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', level: 16 }
      ],
      economy,
      createdAt: Date.now(),
    };

    setActiveMatch(match);

    // Add ticker event
    setTickerEvents(prev => [
      { id: 't-' + Date.now(), icon: '⚔️', text: `${user.username} iniciou desafio em ${selectedGame.name}`, highlight: `${betAmount} RC`, timeAgo: 'agora', type: 'challenge' },
      ...prev.slice(0, 10)
    ]);
  };

  // Match settlement
  const handleFinishMatch = (winner: 'player1' | 'player2' | 'draw') => {
    if (!activeMatch) return;

    const winnerIndex = winner === 'player1' ? 0 : winner === 'player2' ? 1 : null;
    const settlement = settleMatchResult(activeMatch.betAmount, winner === 'draw' ? 'DRAW' : 'FINISHED', winnerIndex);

    const userPayout = settlement.player1Payout;

    // Update user balance & stats
    setUser(prev => {
      const isWin = winner === 'player1';
      const isLoss = winner === 'player2';
      const isDraw = winner === 'draw';

      return {
        ...prev,
        balance: prev.balance + userPayout,
        lockedBalance: Math.max(0, prev.lockedBalance - activeMatch.betAmount),
        wins: prev.wins + (isWin ? 1 : 0),
        losses: prev.losses + (isLoss ? 1 : 0),
        draws: prev.draws + (isDraw ? 1 : 0),
        winStreak: isWin ? prev.winStreak + 1 : 0,
        xp: prev.xp + (isWin ? 150 : isDraw ? 50 : 25),
      };
    });

    // Feed Jackpot if PvP
    if (settlement.jackpotAdded > 0) {
      setJackpotAmount(j => j + settlement.jackpotAdded);
    }

    // Record ledger
    if (activeMatch.betAmount > 0) {
      const newTx: WalletTransaction = {
        id: 'tx-' + Date.now(),
        type: winner === 'player1' ? 'win_prize' : winner === 'draw' ? 'bet_refund' : 'bet_locked',
        amount: winner === 'player1' ? settlement.winnerPrize : winner === 'draw' ? activeMatch.betAmount : -activeMatch.betAmount,
        description: winner === 'player1' ? `Prêmio da vitória em ${activeMatch.gameName}` : winner === 'draw' ? `Reembolso de empate em ${activeMatch.gameName}` : `Derrota em ${activeMatch.gameName}`,
        date: 'Hoje',
        status: 'completed'
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    // Add winning ticker
    if (winner === 'player1' && activeMatch.betAmount > 0) {
      setTickerEvents(prev => [
        { id: 't-' + Date.now(), icon: '🏆', text: `${user.username} venceu partida de ${activeMatch.gameName}`, highlight: `+${settlement.winnerPrize} RC`, timeAgo: 'agora', type: 'win' },
        ...prev.slice(0, 10)
      ]);
    }
  };

  const handleDepositSim = (amount: number) => {
    setUser(u => ({ ...u, balance: u.balance + amount }));
    setTransactions(prev => [
      { id: 'tx-' + Date.now(), type: 'deposit', amount, description: 'Depósito em RC (Simulação)', date: 'Hoje', status: 'completed' },
      ...prev
    ]);
  };

  const handleWithdrawSim = (amount: number) => {
    if (user.balance < amount) return;
    setUser(u => ({ ...u, balance: u.balance - amount }));
    setTransactions(prev => [
      { id: 'tx-' + Date.now(), type: 'withdraw', amount: -amount, description: 'Saque de RC efetuado', date: 'Hoje', status: 'completed' },
      ...prev
    ]);
  };

  const filteredGames = games.filter(g => {
    const matchesCategory = gameFilter === 'all' || g.category === gameFilter;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col pb-16 lg:pb-0">
      {/* 1. Header Navbar */}
      <Navbar
        language={language}
        onSelectLanguage={selectLanguage}
        user={user}
        activeTab={activeTab}
        onSelectTab={tab => {
          setSelectedGame(null);
          if (tab === 'profile') {
            setWalletDefaultTab('profile');
            setWalletModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenWallet={() => {
          setWalletDefaultTab('wallet');
          setWalletModalOpen(true);
        }}
        onOpenProfile={() => {
          setWalletDefaultTab('profile');
          setWalletModalOpen(true);
        }}
        jackpotAmount={jackpotAmount}
      />

      {/* 2. Realtime Gamer Ticker */}
      <LiveTicker events={tickerEvents} />

      {/* 3. Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5">
        {/* If Game Mode Selector is Open */}
        {selectedGame ? (
          <GameModeSelector
            game={selectedGame}
            language={language}
            onSelectSingleplayer={handleStartSingleplayer}
            onStartPvPMatch={handleStartPvPMatch}
            onBack={() => setSelectedGame(null)}
          />
        ) : (
          <>
            {/* TAB: HOME */}
            {activeTab === 'home' && (
              <div className="space-y-8">
                {/* Hero Carousel */}
                <HeroCarousel
                  banners={banners}
                  onSelectGameBySlug={handleSelectGameBySlug}
                  onOpenJackpot={() => setActiveTab('ranking')}
                />

                {/* Live Jackpot Banner */}
                <JackpotSection
                  jackpotAmount={jackpotAmount}
                  language={language}
                />

                {/* Quick Multiplayer Hub Section (Convidar, Book, Salas) */}
                <div className="bg-[#121212] border border-[#222] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-[#FF6A00]" />
                      <h2 className="font-display text-2xl font-black uppercase text-white tracking-wider">
                        {t.multiplayerHub}
                      </h2>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
                      100% dos ganhos liquidados instantaneamente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleSelectGame(games[0])}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#141414] hover:border-[#FF6A00]/50 border border-[#282828] text-left transition-all group cursor-pointer"
                    >
                      <Users className="w-6 h-6 text-[#FF6A00] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-white text-sm block">{t.inviteFriend}</span>
                      <span className="text-xs text-neutral-400 block mt-1">Crie um link e desafie via WhatsApp ou Telegram.</span>
                    </button>

                    <button
                      onClick={() => handleSelectGame(games[1] || games[0])}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#141414] hover:border-[#FF6A00]/50 border border-[#282828] text-left transition-all group cursor-pointer"
                    >
                      <Target className="w-6 h-6 text-[#20D67B] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-white text-sm block">{t.challengeBook}</span>
                      <span className="text-xs text-neutral-400 block mt-1">Entre na fila global com apostas de 100 a 1.000 RC.</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('forum')}
                      className="p-4 rounded-xl bg-gradient-to-br from-[#1c1c1c] to-[#141414] hover:border-[#FF6A00]/50 border border-[#282828] text-left transition-all group cursor-pointer"
                    >
                      <Flame className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-white text-sm block">Desafios no Fórum</span>
                      <span className="text-xs text-neutral-400 block mt-1">Lance desafios públicos e encontre rivais na comunidade.</span>
                    </button>
                  </div>
                </div>

                {/* Featured Games Gallery Header */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-3xl font-black uppercase text-white tracking-wider flex items-center gap-2">
                        <Gamepad2 className="w-7 h-7 text-[#FF6A00]" />
                        {t.featuredGames}
                      </h2>
                      <p className="text-xs text-neutral-400">
                        {t.subSlogan}
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#222]">
                      <button
                        onClick={() => setGameFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          gameFilter === 'all' ? 'bg-[#FF6A00] text-black font-black' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {t.allGames}
                      </button>
                      <button
                        onClick={() => setGameFilter('traditional')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          gameFilter === 'traditional' ? 'bg-[#FF6A00] text-black font-black' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {t.traditional}
                      </button>
                      <button
                        onClick={() => setGameFilter('proprietary')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          gameFilter === 'proprietary' ? 'bg-[#FF6A00] text-black font-black' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {t.proprietary}
                      </button>
                    </div>
                  </div>

                  {/* Games Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredGames.map(game => (
                      <div
                        key={game.id}
                        onClick={() => handleSelectGame(game)}
                        className="bg-[#171717] hover:bg-[#202020] border border-[#262626] hover:border-[#FF6A00]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group cursor-pointer shadow-lg flex flex-col justify-between"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-black">
                          <img
                            src={game.thumbnail}
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Badges */}
                          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                            {game.badge && (
                              <span className="bg-[#FF6A00] text-black text-[10px] font-mono font-black px-2 py-0.5 rounded-full shadow">
                                {game.badge}
                              </span>
                            )}
                            <span className="bg-black/80 backdrop-blur text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10">
                              {game.playerCount}
                            </span>
                          </div>

                          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-xs font-mono">
                            <span className="text-[#FF6A00] font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur">
                              {game.minBet} - {game.maxBet} RC
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                              {game.category === 'proprietary' ? 'Proprietário CrypGamer' : 'Clássico Tradicional'}
                            </span>
                            <h3 className="font-display text-xl font-black uppercase text-white mt-0.5 group-hover:text-[#FF6A00] transition-colors leading-none">
                              {game.name}
                            </h3>
                            <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                              {game.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between">
                            <span className="text-[11px] text-neutral-500 font-mono">
                              Single + PvP
                            </span>
                            <span className="text-xs font-black text-[#FF6A00] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                              JOGAR <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: GAMES */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
                      {t.allGames}
                    </h1>
                    <p className="text-xs text-neutral-400">
                      Escolha seu jogo favorito, treine contra a CPU ou aposte em disputas PvP.
                    </p>
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={t.searchGame}
                      className="w-full bg-[#141414] border border-[#282828] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGames.map(game => (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="bg-[#171717] hover:bg-[#202020] border border-[#282828] hover:border-[#FF6A00]/50 rounded-2xl overflow-hidden p-4 cursor-pointer transition-all flex gap-4 items-center group"
                    >
                      <img
                        src={game.thumbnail}
                        alt={game.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm truncate">{game.name}</span>
                          <span className="text-[10px] text-[#FF6A00] font-mono font-bold bg-[#FF6A00]/10 px-1.5 py-0.5 rounded shrink-0">
                            {game.playerCount}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{game.tagline}</p>
                        <div className="mt-2 text-xs font-mono text-[#20D67B]">
                          Apostas: {game.minBet} - {game.maxBet} RC
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MULTIPLAYER */}
            {activeTab === 'multiplayer' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Swords className="w-8 h-8 text-[#FF6A00]" />
                    {t.multiplayerHub}
                  </h1>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Selecione um jogo para convidar um amigo ou entrar na fila do Book de Desafios.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map(game => (
                    <div
                      key={game.id}
                      className="bg-[#141414] border border-[#262626] rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <img src={game.thumbnail} alt={game.name} className="w-14 h-14 rounded-xl object-cover" />
                        <div>
                          <span className="font-bold text-white text-sm block">{game.name}</span>
                          <span className="text-xs text-neutral-400 block line-clamp-1">{game.tagline}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#222] grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleSelectGame(game)}
                          className="py-2 bg-[#202020] hover:bg-[#282828] text-neutral-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Convidar
                        </button>
                        <button
                          onClick={() => handleSelectGame(game)}
                          className="py-2 bg-[#FF6A00] hover:bg-[#FF8A1F] text-black text-xs font-black rounded-lg transition-colors cursor-pointer"
                        >
                          Book PvP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: FORUM */}
            {activeTab === 'forum' && (
              <ForumSection
                topics={forumTopics}
                language={language}
                onChallengeTopic={(gameId, bet, opp) => {
                  const targetGame = games.find(g => g.id === gameId) || games[0];
                  setSelectedGame(targetGame);
                  handleStartPvPMatch('book', bet, opp);
                }}
                onAddTopic={newTop => {
                  const created: ForumTopic = {
                    id: 'top-' + Date.now(),
                    category: newTop.category || 'general',
                    author: { username: user.username, avatar: user.avatar, level: user.level },
                    title: newTop.title || 'Tópico',
                    content: newTop.content || '',
                    likes: 1,
                    repliesCount: 0,
                    timestamp: 'Agora',
                    challengeBet: newTop.challengeBet,
                    challengeGameId: newTop.challengeGameId,
                  };
                  setForumTopics(prev => [created, ...prev]);
                }}
              />
            )}

            {/* TAB: RANKING */}
            {activeTab === 'ranking' && (
              <RankingSection language={language} />
            )}

            {/* TAB: MINHA REDE */}
            {activeTab === 'network' && (
              <ReferralNetwork
                user={user}
                tiers={networkTiers}
                language={language}
              />
            )}

            {/* TAB: ADMIN */}
            {activeTab === 'admin' && (
              <AdminPanel
                games={games}
                banners={banners}
                onAddGame={newG => setGames(prev => [newG, ...prev])}
                onUpdateGame={updated => setGames(prev => prev.map(g => g.id === updated.id ? updated : g))}
                onAddBanner={newB => setBanners(prev => [...prev, newB])}
                onUpdateBanner={updated => setBanners(prev => prev.map(b => b.id === updated.id ? updated : b))}
                onToggleBanner={id => setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b))}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Modular Full-screen In-Game Window */}
      {activeMatch && selectedGame && (
        <GameWindow
          game={selectedGame}
          match={activeMatch}
          user={user}
          language={language}
          onBackToPortal={() => {
            setActiveMatch(null);
            setSelectedGame(null);
          }}
          onOpenProfile={() => {
            setWalletDefaultTab('profile');
            setWalletModalOpen(true);
          }}
          onFinishMatch={handleFinishMatch}
        />
      )}

      {/* 5. Mobile Bottom Navbar (Menu on 5th tab with embedded profile) */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={tab => {
          setSelectedGame(null);
          if (tab === 'profile') {
            setWalletDefaultTab('profile');
            setWalletModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        language={language}
        onSelectLanguage={selectLanguage}
        user={user}
        onOpenProfile={() => {
          setWalletDefaultTab('profile');
          setWalletModalOpen(true);
        }}
        onOpenWallet={() => {
          setWalletDefaultTab('wallet');
          setWalletModalOpen(true);
        }}
      />

      {/* 6. Profile & Wallet Modal */}
      <ProfileWalletModal
        user={user}
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        defaultTab={walletDefaultTab}
        language={language}
        onDepositSim={handleDepositSim}
        onWithdrawSim={handleWithdrawSim}
        transactions={transactions}
      />
    </div>
  );
}
