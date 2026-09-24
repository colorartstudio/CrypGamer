import React, { useState } from 'react';
import { GameDefinition, BannerSlide, Language } from '../types';
import { translations } from '../i18n/translations';
import {
  Shield,
  Plus,
  Pencil,
  Database,
} from 'lucide-react';

interface AdminPanelProps {
  games: GameDefinition[];
  banners: BannerSlide[];
  onAddGame: (game: GameDefinition) => void;
  onUpdateGame: (game: GameDefinition) => void;
  onAddBanner: (banner: BannerSlide) => void;
  onUpdateBanner: (banner: BannerSlide) => void;
  onToggleBanner: (id: string) => void;
  language: Language;
}

const DEFAULT_GAME_THUMB = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500';
const DEFAULT_GAME_BANNER = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200';
const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  games,
  banners,
  onAddGame,
  onUpdateGame,
  onAddBanner,
  onUpdateBanner,
  onToggleBanner,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'games' | 'banners' | 'economy'>('games');
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameDefinition | null>(null);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);

  // Game form state
  const [gameName, setGameName] = useState('');
  const [gameSlug, setGameSlug] = useState('');
  const [gameDesc, setGameDesc] = useState('');
  const [gameTagline, setGameTagline] = useState('');
  const [gameThumb, setGameThumb] = useState(DEFAULT_GAME_THUMB);
  const [gameBanner, setGameBanner] = useState(DEFAULT_GAME_BANNER);
  const [gameCategory, setGameCategory] = useState<'traditional' | 'proprietary'>('proprietary');
  const [gameStatus, setGameStatus] = useState<GameDefinition['status']>('published');
  const [gameMinBet, setGameMinBet] = useState(100);
  const [gameMaxBet, setGameMaxBet] = useState(5000);
  const [allowSingle, setAllowSingle] = useState(true);
  const [allowInvite, setAllowInvite] = useState(true);
  const [allowBook, setAllowBook] = useState(true);

  // Banner form state
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerImage, setBannerImage] = useState(DEFAULT_BANNER_IMAGE);
  const [bannerButtonText, setBannerButtonText] = useState('JOGAR AGORA');
  const [bannerRelatedSlug, setBannerRelatedSlug] = useState('rinha-evolution');
  const [bannerOrder, setBannerOrder] = useState(1);
  const [bannerActive, setBannerActive] = useState(true);

  const resetGameForm = () => {
    setGameName('');
    setGameSlug('');
    setGameDesc('');
    setGameTagline('');
    setGameThumb(DEFAULT_GAME_THUMB);
    setGameBanner(DEFAULT_GAME_BANNER);
    setGameCategory('proprietary');
    setGameStatus('published');
    setGameMinBet(100);
    setGameMaxBet(5000);
    setAllowSingle(true);
    setAllowInvite(true);
    setAllowBook(true);
  };

  const resetBannerForm = () => {
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerBadge('');
    setBannerImage(DEFAULT_BANNER_IMAGE);
    setBannerButtonText('JOGAR AGORA');
    setBannerRelatedSlug(games[0]?.slug || 'rinha-evolution');
    setBannerOrder(banners.length + 1);
    setBannerActive(true);
  };

  const openNewGame = () => {
    setEditingGame(null);
    resetGameForm();
    setGameModalOpen(true);
  };

  const openEditGame = (game: GameDefinition) => {
    setEditingGame(game);
    setGameName(game.name);
    setGameSlug(game.slug);
    setGameDesc(game.description);
    setGameTagline(game.tagline);
    setGameThumb(game.thumbnail);
    setGameBanner(game.banner);
    setGameCategory(game.category);
    setGameStatus(game.status);
    setGameMinBet(game.minBet);
    setGameMaxBet(game.maxBet);
    setAllowSingle(game.modes.singleplayer);
    setAllowInvite(game.modes.multiplayerInvite);
    setAllowBook(game.modes.bookOfChallenges);
    setGameModalOpen(true);
  };

  const closeGameModal = () => {
    setGameModalOpen(false);
    setEditingGame(null);
    resetGameForm();
  };

  const openNewBanner = () => {
    setEditingBanner(null);
    resetBannerForm();
    setBannerModalOpen(true);
  };

  const openEditBanner = (banner: BannerSlide) => {
    setEditingBanner(banner);
    setBannerTitle(banner.title);
    setBannerSubtitle(banner.subtitle);
    setBannerBadge(banner.badge || '');
    setBannerImage(banner.image);
    setBannerButtonText(banner.buttonText);
    setBannerRelatedSlug(banner.relatedGameSlug || games[0]?.slug || '');
    setBannerOrder(banner.order);
    setBannerActive(banner.active);
    setBannerModalOpen(true);
  };

  const closeBannerModal = () => {
    setBannerModalOpen(false);
    setEditingBanner(null);
    resetBannerForm();
  };

  const handleSaveGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameName || !gameSlug) return;

    if (editingGame) {
      onUpdateGame({
        ...editingGame,
        name: gameName,
        slug: gameSlug,
        category: gameCategory,
        tagline: gameTagline || editingGame.tagline,
        description: gameDesc || editingGame.description,
        thumbnail: gameThumb,
        banner: gameBanner,
        status: gameStatus,
        minBet: gameMinBet,
        maxBet: gameMaxBet,
        modes: {
          singleplayer: allowSingle,
          multiplayerInvite: allowInvite,
          bookOfChallenges: allowBook,
        },
      });
    } else {
      const newGame: GameDefinition = {
        id: gameSlug,
        name: gameName,
        slug: gameSlug,
        category: gameCategory,
        tagline: gameTagline || 'Novo título adicionado pelo Admin CrypGamer',
        description: gameDesc || 'Jogo adicionado via painel de administração modular.',
        thumbnail: gameThumb,
        banner: gameBanner,
        badge: 'Novo',
        status: gameStatus,
        version: 'v1.0',
        minBet: gameMinBet,
        maxBet: gameMaxBet,
        modes: {
          singleplayer: allowSingle,
          multiplayerInvite: allowInvite,
          bookOfChallenges: allowBook,
        },
        playerCount: '1v1',
        engine: 'rinha',
        popularity: 80,
      };
      onAddGame(newGame);
    }

    closeGameModal();
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle) return;

    if (editingBanner) {
      onUpdateBanner({
        ...editingBanner,
        title: bannerTitle,
        subtitle: bannerSubtitle,
        badge: bannerBadge || undefined,
        image: bannerImage,
        buttonText: bannerButtonText,
        relatedGameSlug: bannerRelatedSlug,
        order: bannerOrder,
        active: bannerActive,
      });
    } else {
      const newBanner: BannerSlide = {
        id: 'banner-' + Date.now(),
        title: bannerTitle,
        subtitle: bannerSubtitle,
        badge: bannerBadge || undefined,
        bgGradient: 'from-orange-950/70 via-black to-black',
        image: bannerImage,
        buttonText: bannerButtonText,
        relatedGameSlug: bannerRelatedSlug,
        active: bannerActive,
        order: bannerOrder || banners.length + 1,
      };
      onAddBanner(newBanner);
    }

    closeBannerModal();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#FF6A00]" />
            {t.adminTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Gerenciamento modular de jogos, banners e motor econômico da CrypGamer
          </p>
        </div>

        <div className="flex bg-[#141414] p-1 rounded-xl border border-[#262626]">
          <button
            onClick={() => setActiveTab('games')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'games' ? 'bg-[#FF6A00] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.adminGames}
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'banners' ? 'bg-[#FF6A00] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.adminBanners}
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'economy' ? 'bg-[#FF6A00] text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.adminEconomy}
          </button>
        </div>
      </div>

      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              {games.length} Jogos Registrados na Plataforma
            </span>
            <button
              onClick={openNewGame}
              className="px-4 py-2 bg-[#FF6A00] hover:bg-[#FF8A1F] text-black font-black text-xs uppercase rounded-xl flex items-center gap-1.5 shadow-lg glow-orange-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.addNewGame}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map(g => (
              <div key={g.id} className="bg-[#141414] border border-[#242424] rounded-2xl overflow-hidden p-4 flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <img src={g.thumbnail} alt={g.name} className="w-16 h-16 rounded-xl object-cover border border-[#333]" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white text-sm block truncate">{g.name}</span>
                    <span className="text-[10px] text-[#FF6A00] font-mono font-bold uppercase">{g.category}</span>
                    <span className="text-xs text-neutral-400 block mt-1 line-clamp-1">{g.tagline}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-neutral-400 truncate">Apostas: {g.minBet} - {g.maxBet} RC</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[#20D67B] bg-[#20D67B]/10 px-2 py-0.5 rounded">
                      {g.status === 'published' ? '● Publicado' : g.status === 'draft' ? 'Rascunho' : 'Manutenção'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditGame(g)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1e1e1e] hover:bg-[#FF6A00]/15 border border-[#333] hover:border-[#FF6A00]/50 text-neutral-300 hover:text-[#FF6A00] font-bold transition-colors cursor-pointer"
                      title={t.editGame}
                    >
                      <Pencil className="w-3 h-3" />
                      {t.edit}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Banners Ativos no Carrossel da Home
            </span>
            <button
              onClick={openNewBanner}
              className="px-4 py-2 bg-[#FF6A00] hover:bg-[#FF8A1F] text-black font-black text-xs uppercase rounded-xl flex items-center gap-1.5 shadow-lg glow-orange-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t.addNewBanner}
            </button>
          </div>

          <div className="space-y-3">
            {banners.map(b => (
              <div key={b.id} className="bg-[#141414] border border-[#242424] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                  <img src={b.image} alt={b.title} className="w-20 h-14 rounded-xl object-cover border border-[#333] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{b.title}</span>
                      {b.badge && (
                        <span className="text-[9px] bg-[#FF6A00]/20 text-[#FF6A00] px-1.5 py-0.5 rounded font-mono font-bold">
                          {b.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 block line-clamp-1">{b.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap">
                  <button
                    onClick={() => onToggleBanner(b.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                      b.active ? 'bg-[#20D67B]/20 text-[#20D67B]' : 'bg-[#262626] text-neutral-500'
                    }`}
                  >
                    {b.active ? 'Ativo' : 'Inativo'}
                  </button>
                  <span className="text-xs text-neutral-500 font-mono">Ordem #{b.order}</span>
                  <button
                    type="button"
                    onClick={() => openEditBanner(b)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1e1e1e] hover:bg-[#FF6A00]/15 border border-[#333] hover:border-[#FF6A00]/50 text-neutral-300 hover:text-[#FF6A00] text-xs font-bold transition-colors cursor-pointer"
                    title={t.editBanner}
                  >
                    <Pencil className="w-3 h-3" />
                    {t.edit}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'economy' && (
        <div className="space-y-4">
          <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
            <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FF6A00]" />
              Auditoria de Rake e Fundo Compartilhado (Regras de Segurança #34 & #35)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              O motor financeiro opera de forma centralizada e independente dos clientes, garantindo imutabilidade de rake e comissões.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-[#1b1b1b] p-3 rounded-xl border border-[#2a2a2a]">
                <span className="text-neutral-400 block text-[10px]">Rake por Jogador</span>
                <span className="text-xl font-bold text-white">15.0%</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Empate = Rake 0%</span>
              </div>

              <div className="bg-[#1b1b1b] p-3 rounded-xl border border-[#2a2a2a]">
                <span className="text-neutral-400 block text-[10px]">Destinado à Rede (5 Níveis)</span>
                <span className="text-xl font-bold text-[#20D67B]">50.0%</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">7,5% da aposta</span>
              </div>

              <div className="bg-[#1b1b1b] p-3 rounded-xl border border-[#2a2a2a]">
                <span className="text-neutral-400 block text-[10px]">Destinado ao Jackpot</span>
                <span className="text-xl font-bold text-[#FF6A00]">10.0%</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">1,5% da aposta</span>
              </div>

              <div className="bg-[#1b1b1b] p-3 rounded-xl border border-[#2a2a2a]">
                <span className="text-neutral-400 block text-[10px]">Destinado à Plataforma</span>
                <span className="text-xl font-bold text-blue-400">40.0%</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">6,0% da aposta</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2b2b2b] rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-white text-base">
              {editingGame ? t.editGame : 'Adicionar Novo Jogo à CrypGamer'}
            </h2>
            <form onSubmit={handleSaveGame} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1">Nome do Jogo:</label>
                <input
                  type="text"
                  value={gameName}
                  onChange={e => {
                    setGameName(e.target.value);
                    if (!editingGame) {
                      setGameSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="Ex: Cyber Arena PvP"
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Slug:</label>
                <input
                  type="text"
                  value={gameSlug}
                  onChange={e => setGameSlug(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white font-mono disabled:opacity-60"
                  required
                  disabled={!!editingGame}
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Tagline:</label>
                <input
                  type="text"
                  value={gameTagline}
                  onChange={e => setGameTagline(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Descrição:</label>
                <textarea
                  value={gameDesc}
                  onChange={e => setGameDesc(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">URL da Thumbnail:</label>
                <input
                  type="url"
                  value={gameThumb}
                  onChange={e => setGameThumb(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-300 block mb-1">Categoria:</label>
                  <select
                    value={gameCategory}
                    onChange={e => setGameCategory(e.target.value as 'traditional' | 'proprietary')}
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                  >
                    <option value="proprietary">Proprietário</option>
                    <option value="traditional">Tradicional</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Status:</label>
                  <select
                    value={gameStatus}
                    onChange={e => setGameStatus(e.target.value as GameDefinition['status'])}
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                  >
                    <option value="published">Publicado</option>
                    <option value="draft">Rascunho</option>
                    <option value="maintenance">Manutenção</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-300 block mb-1">Aposta Mín (RC):</label>
                  <input
                    type="number"
                    value={gameMinBet}
                    onChange={e => setGameMinBet(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Aposta Máx (RC):</label>
                  <input
                    type="number"
                    value={gameMaxBet}
                    onChange={e => setGameMaxBet(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <label className="inline-flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={allowSingle} onChange={e => setAllowSingle(e.target.checked)} />
                  Singleplayer
                </label>
                <label className="inline-flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={allowInvite} onChange={e => setAllowInvite(e.target.checked)} />
                  Convite
                </label>
                <label className="inline-flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                  <input type="checkbox" checked={allowBook} onChange={e => setAllowBook(e.target.checked)} />
                  Book
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeGameModal}
                  className="px-4 py-2 bg-[#222] text-neutral-300 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6A00] text-black font-black uppercase rounded-lg cursor-pointer"
                >
                  {editingGame ? t.saveChanges : t.saveGame}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2b2b2b] rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-white text-base">
              {editingBanner ? t.editBanner : 'Adicionar Novo Banner ao Carrossel'}
            </h2>
            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1">Título do Banner:</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={e => setBannerTitle(e.target.value)}
                  placeholder="Ex: GRANDE TORNEIO DE VERÃO"
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Subtítulo:</label>
                <textarea
                  value={bannerSubtitle}
                  onChange={e => setBannerSubtitle(e.target.value)}
                  placeholder="Descrição promocional ou chamada..."
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Badge (opcional):</label>
                <input
                  type="text"
                  value={bannerBadge}
                  onChange={e => setBannerBadge(e.target.value)}
                  placeholder="Ex: NOVO JOGO EM DESTAQUE"
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">URL da Imagem:</label>
                <input
                  type="url"
                  value={bannerImage}
                  onChange={e => setBannerImage(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-300 block mb-1">Texto do Botão:</label>
                  <input
                    type="text"
                    value={bannerButtonText}
                    onChange={e => setBannerButtonText(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Ordem:</label>
                  <input
                    type="number"
                    min={1}
                    value={bannerOrder}
                    onChange={e => setBannerOrder(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Jogo relacionado (slug):</label>
                <select
                  value={bannerRelatedSlug}
                  onChange={e => setBannerRelatedSlug(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-white"
                >
                  {games.map(g => (
                    <option key={g.id} value={g.slug}>{g.name}</option>
                  ))}
                </select>
              </div>

              <label className="inline-flex items-center gap-1.5 text-neutral-300 cursor-pointer">
                <input type="checkbox" checked={bannerActive} onChange={e => setBannerActive(e.target.checked)} />
                Banner ativo no carrossel
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeBannerModal}
                  className="px-4 py-2 bg-[#222] text-neutral-300 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6A00] text-black font-black uppercase rounded-lg cursor-pointer"
                >
                  {editingBanner ? t.saveChanges : 'Publicar Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
