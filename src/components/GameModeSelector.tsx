import React, { useState, useEffect } from 'react';
import { GameDefinition, CpuDifficulty, CpuDifficultyConfig, Language } from '../types';
import { translations } from '../i18n/translations';
import { 
  Bot, 
  Users, 
  Target, 
  Share2, 
  Copy, 
  Check, 
  Clock, 
  Search, 
  ArrowLeft, 
  Zap, 
  ShieldAlert, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface GameModeSelectorProps {
  game: GameDefinition;
  language: Language;
  onSelectSingleplayer: (difficulty: CpuDifficulty) => void;
  onStartPvPMatch: (mode: 'invite' | 'book', betAmount: number, opponentName?: string) => void;
  onBack: () => void;
}

const CPU_LEVELS: CpuDifficultyConfig[] = [
  { id: 'easy', name: 'Fácil', rating: 600, reactionTimeMs: 1200, mistakeRate: 40, color: 'text-green-400' },
  { id: 'medium', name: 'Médio', rating: 1100, reactionTimeMs: 800, mistakeRate: 20, color: 'text-blue-400' },
  { id: 'intermediate', name: 'Intermediário', rating: 1500, reactionTimeMs: 600, mistakeRate: 10, color: 'text-amber-400' },
  { id: 'advanced', name: 'Avançado', rating: 1900, reactionTimeMs: 400, mistakeRate: 5, color: 'text-orange-400' },
  { id: 'pro', name: 'Profissional', rating: 2400, reactionTimeMs: 250, mistakeRate: 1, color: 'text-red-400' },
];

const STAKE_OPTIONS = [100, 250, 500, 1000];

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  game,
  language,
  onSelectSingleplayer,
  onStartPvPMatch,
  onBack,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'single' | 'invite' | 'book'>('single');
  const [selectedDifficulty, setSelectedDifficulty] = useState<CpuDifficulty>('medium');
  const [selectedBet, setSelectedBet] = useState<number>(100);

  // Invite states
  const [inviteCode] = useState(() => 'CG-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);

  // Book matchmaking state
  const [isSearching, setIsSearching] = useState(false);
  const [searchSeconds, setSearchSeconds] = useState(0);
  const [opponentFound, setOpponentFound] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(4);

  // Matchmaking search timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching && !opponentFound) {
      interval = setInterval(() => {
        setSearchSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching, opponentFound]);

  // Simulate finding an opponent after 3-5 seconds in MVP
  useEffect(() => {
    if (isSearching && searchSeconds >= 4 && !opponentFound) {
      const opponents = ['ShadowBR', 'Valkyria', 'KingLeo', 'CyberGamer77', 'MasterTactician'];
      const chosen = opponents[Math.floor(Math.random() * opponents.length)];
      setOpponentFound(chosen);
    }
  }, [isSearching, searchSeconds, opponentFound]);

  // Countdown when opponent found
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (opponentFound && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(c => c - 1);
      }, 1000);
    } else if (opponentFound && countdown === 0) {
      onStartPvPMatch('book', selectedBet, opponentFound);
    }
    return () => clearTimeout(timer);
  }, [opponentFound, countdown, onStartPvPMatch, selectedBet]);

  const handleCopyInvite = () => {
    const link = `https://crypgamer.com/challenge/${inviteCode}?bet=${selectedBet}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = `🎮 Você foi desafiado por PLAYERX para jogar ${game.name} valendo ${selectedBet} RC na CrypGamer! Aceite agora: https://crypgamer.com/challenge/${inviteCode}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaTelegram = () => {
    const text = `🎮 Desafio CrypGamer: ${game.name} por ${selectedBet} RC!`;
    const url = `https://crypgamer.com/challenge/${inviteCode}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Back button and game header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Portal</span>
        </button>
        <span className="text-xs font-mono text-[#FF6A00] bg-[#FF6A00]/10 px-2.5 py-1 rounded-full border border-[#FF6A00]/30 font-bold">
          {game.playerCount} • {game.version}
        </span>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Game Title & Tagline */}
        <div className="text-center mb-8">
          <div className="inline-block p-2 rounded-2xl bg-[#1a1a1a] border border-[#333] mb-3">
            <img src={game.thumbnail} alt={game.name} className="w-16 h-16 rounded-xl object-cover" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-wider">
            {game.name}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mt-1">
            {game.tagline}
          </p>
          <div className="text-xs font-bold text-[#FF6A00] uppercase tracking-widest mt-4">
            {t.howToPlay}
          </div>
        </div>

        {/* 3 Main Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#0a0a0a] rounded-xl border border-[#222] mb-6">
          <button
            onClick={() => { setActiveTab('single'); setIsSearching(false); }}
            className={`py-3 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'single'
                ? 'bg-[#FF6A00] text-black shadow-lg font-black'
                : 'text-neutral-400 hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>SINGLEPLAYER</span>
            <span className="text-[10px] opacity-80 hidden sm:inline">Treino CPU</span>
          </button>

          <button
            onClick={() => { setActiveTab('invite'); setIsSearching(false); }}
            className={`py-3 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'invite'
                ? 'bg-[#FF6A00] text-black shadow-lg font-black'
                : 'text-neutral-400 hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>CONVITE</span>
            <span className="text-[10px] opacity-80 hidden sm:inline">Desafiar Amigo</span>
          </button>

          <button
            onClick={() => { setActiveTab('book'); }}
            className={`py-3 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              activeTab === 'book'
                ? 'bg-[#FF6A00] text-black shadow-lg font-black'
                : 'text-neutral-400 hover:text-white hover:bg-[#151515]'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>BOOK DESAFIOS</span>
            <span className="text-[10px] opacity-80 hidden sm:inline">Matchmaking</span>
          </button>
        </div>

        {/* CONTENT FOR TAB: SINGLEPLAYER */}
        {activeTab === 'single' && (
          <div className="space-y-6">
            <div className="bg-[#171717] border border-[#282828] rounded-xl p-4 text-xs text-neutral-300 flex items-start gap-3">
              <Bot className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5">Treinamento sem apostas</strong>
                Aprimore suas habilidades e familiarização antes de entrar em partidas PvP valendo RC.
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5">
                Escolha o Nível da CPU:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {CPU_LEVELS.map(level => {
                  const isSelected = selectedDifficulty === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setSelectedDifficulty(level.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF6A00]/15 border-[#FF6A00] ring-1 ring-[#FF6A00]'
                          : 'bg-[#151515] border-[#262626] hover:border-[#444]'
                      }`}
                    >
                      <span className={`text-xs font-bold block ${level.color}`}>
                        {level.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 block mt-1">
                        Rating: {level.rating}
                      </span>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">
                        Erro: {level.mistakeRate}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => onSelectSingleplayer(selectedDifficulty)}
              className="w-full py-4 bg-[#FF6A00] hover:bg-[#FF8A1F] active:scale-98 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl glow-orange cursor-pointer"
            >
              INICIAR TREINO CONTRA CPU ({selectedDifficulty.toUpperCase()})
            </button>
          </div>
        )}

        {/* CONTENT FOR TAB: MULTIPLAYER INVITE */}
        {activeTab === 'invite' && (
          <div className="space-y-6">
            {/* Choose Bet */}
            <div>
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                Valor da Aposta em RC:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {STAKE_OPTIONS.map(bet => (
                  <button
                    key={bet}
                    onClick={() => setSelectedBet(bet)}
                    className={`py-3 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                      selectedBet === bet
                        ? 'bg-[#FF6A00] text-black border-[#FF6A00] font-black'
                        : 'bg-[#151515] border-[#282828] text-neutral-300 hover:border-[#444]'
                    }`}
                  >
                    {bet} RC
                  </button>
                ))}
              </div>
            </div>

            {/* Invite Details */}
            <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Código de Desafio:</span>
                <span className="font-mono font-bold text-[#FF6A00]">{inviteCode}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Pote Estimado:</span>
                <span className="font-mono font-bold text-[#20D67B]">{selectedBet * 2} RC</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Rake da Plataforma (15%):</span>
                <span className="font-mono text-neutral-400">{Math.floor(selectedBet * 0.15) * 2} RC</span>
              </div>
            </div>

            {/* Share Channels */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Enviar Desafio Via:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={shareViaWhatsApp}
                  className="py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={shareViaTelegram}
                  className="py-3 px-4 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] border border-[#229ED9]/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Telegram
                </button>
                <button
                  onClick={handleCopyInvite}
                  className="py-3 px-4 rounded-xl bg-[#1e1e1e] hover:bg-[#282828] text-white border border-[#333] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            </div>

            {/* Enter room button */}
            <button
              onClick={() => onStartPvPMatch('invite', selectedBet, 'Amigo Convidado')}
              className="w-full py-4 bg-[#FF6A00] hover:bg-[#FF8A1F] active:scale-98 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl glow-orange cursor-pointer"
            >
              CRIAR SALA & AGUARDAR ADVERSÁRIO ({selectedBet} RC)
            </button>
          </div>
        )}

        {/* CONTENT FOR TAB: BOOK DE DESAFIOS */}
        {activeTab === 'book' && (
          <div className="space-y-6">
            {!isSearching && !opponentFound && (
              <>
                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">
                    Escolha o Valor do Book:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {STAKE_OPTIONS.map(bet => (
                      <button
                        key={bet}
                        onClick={() => setSelectedBet(bet)}
                        className={`py-3 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                          selectedBet === bet
                            ? 'bg-[#FF6A00] text-black border-[#FF6A00] font-black'
                            : 'bg-[#151515] border-[#282828] text-neutral-300 hover:border-[#444]'
                        }`}
                      >
                        {bet} RC
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#141414] border border-[#222] rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Modalidade:</span>
                    <span className="font-bold text-white">Book Global 1v1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Tempo Máximo de Espera:</span>
                    <span className="font-mono text-white">03:00 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Prêmio do Vencedor:</span>
                    <span className="font-mono font-bold text-[#20D67B]">
                      {Math.floor(selectedBet * 2 - selectedBet * 0.15 * 2)} RC
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsSearching(true);
                    setSearchSeconds(0);
                    setOpponentFound(null);
                  }}
                  className="w-full py-4 bg-[#FF6A00] hover:bg-[#FF8A1F] active:scale-98 text-black font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl glow-orange cursor-pointer flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  ENTRAR NO BOOK DE DESAFIOS ({selectedBet} RC)
                </button>
              </>
            )}

            {/* Searching queue UI */}
            {isSearching && !opponentFound && (
              <div className="text-center py-8 bg-[#141414] border border-[#282828] rounded-2xl p-6">
                <div className="w-16 h-16 rounded-full border-4 border-[#FF6A00] border-t-transparent animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {t.searchingOpponent}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Buscando guerreiro compatível na faixa de {selectedBet} RC
                </p>

                <div className="inline-flex items-center gap-2 bg-black/60 px-4 py-2 rounded-xl border border-white/10 font-mono text-lg font-bold text-[#FF6A00] mt-4">
                  <Clock className="w-4 h-4" />
                  {formatTimer(searchSeconds)}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setIsSearching(false)}
                    className="px-6 py-2.5 bg-[#222] hover:bg-[#333] text-neutral-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {t.cancelSearch}
                  </button>
                </div>
              </div>
            )}

            {/* Opponent Found Modal UI */}
            {opponentFound && (
              <div className="text-center py-6 bg-gradient-to-b from-orange-950/40 via-[#141414] to-black border-2 border-[#FF6A00] rounded-2xl p-6 animate-in zoom-in-95">
                <span className="text-xs font-mono font-bold text-[#20D67B] uppercase tracking-widest block mb-2">
                  ADVERSÁRIO ENCONTRADO!
                </span>
                <div className="flex items-center justify-center gap-6 my-4">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-orange-500/20 border border-[#FF6A00] flex items-center justify-center text-xl font-bold text-[#FF6A00] mx-auto">
                      VOCÊ
                    </div>
                    <span className="text-xs font-bold text-white block mt-1">PLAYERX</span>
                  </div>
                  <div className="text-2xl font-black text-[#FF6A00] italic">VS</div>
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-xl bg-red-500/20 border border-red-500 flex items-center justify-center text-xl font-bold text-red-400 mx-auto">
                      OPP
                    </div>
                    <span className="text-xs font-bold text-white block mt-1">{opponentFound}</span>
                  </div>
                </div>

                <div className="text-sm font-mono text-neutral-300 mb-4">
                  Partida iniciando em: <strong className="text-2xl text-[#FF6A00]">{countdown}s</strong>
                </div>

                <button
                  onClick={() => onStartPvPMatch('book', selectedBet, opponentFound)}
                  className="w-full py-3.5 bg-[#FF6A00] hover:bg-[#FF8A1F] text-black font-black text-sm uppercase rounded-xl transition-all shadow-lg glow-orange cursor-pointer"
                >
                  ENTRAR AGORA
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
