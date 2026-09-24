import React, { useState } from 'react';
import { GameDefinition, Match, UserProfile, Language } from '../types';
import { ChessGame } from '../games/ChessGame';
import { CheckersGame } from '../games/CheckersGame';
import { PoolGame } from '../games/PoolGame';
import { RinhaGame } from '../games/RinhaGame';
import { CatsGame } from '../games/CatsGame';
import { AnimalPenaltyGame } from '../games/AnimalPenaltyGame';
import { PrimalGame } from '../games/PrimalGame';
import { 
  ArrowLeft, 
  Settings, 
  Home, 
  Gamepad2, 
  MessageSquare, 
  User, 
  X, 
  Send, 
  Volume2, 
  VolumeX, 
  Info,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface GameWindowProps {
  game: GameDefinition;
  match: Match;
  user: UserProfile;
  language: Language;
  onBackToPortal: () => void;
  onOpenProfile: () => void;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
}

export const GameWindow: React.FC<GameWindowProps> = ({
  game,
  match,
  user,
  language,
  onBackToPortal,
  onOpenProfile,
  onFinishMatch,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'CrypGamer Bot', text: `Partida ${match.id} iniciada! Boa sorte aos guerreiros.`, time: '12:00' },
    { sender: match.players[1].username, text: 'Boa sorte na partida!', time: '12:01' },
  ]);
  const [inputText, setInputText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { sender: user.username, text: inputText, time: new Date().toLocaleTimeString().slice(0, 5) }
    ]);
    setInputText('');
  };

  const isSingleplayer = match.mode === 'singleplayer';

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col overflow-hidden select-none">
      {/* 1. TOP BAR: ← CrypGamer | Game Title | Stats/Pot | ⚙ Config */}
      <header className="h-14 bg-[#111111] border-b border-[#222] px-3 sm:px-6 flex items-center justify-between shrink-0">
        {/* Left: Back to portal */}
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-300 hover:text-[#FF6A00] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">CrypGamer</span>
          <span className="text-neutral-600 sm:hidden">Sair</span>
        </button>

        {/* Center: Game Title & Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wider">
            {game.name}
          </span>
          <span className="text-[10px] bg-[#1d1d1d] text-[#FF6A00] px-2 py-0.5 rounded font-mono border border-[#FF6A00]/30 font-bold">
            {match.mode === 'singleplayer' ? `CPU (${match.cpuDifficulty?.toUpperCase()})` : `${match.betAmount} RC`}
          </span>
        </div>

        {/* Right: Settings & Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
            title="Som"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-neutral-300" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#1a1a1a] transition-colors"
            title="Configurações da Janela"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN GAME CANVAS / ENGINE AREA */}
      <main className="flex-1 overflow-y-auto relative p-2 sm:p-4 flex flex-col justify-center">
        {game.engine === 'chess' && (
          <ChessGame
            isSingleplayer={isSingleplayer}
            cpuDifficulty={match.cpuDifficulty}
            economy={match.economy}
            onFinishMatch={onFinishMatch}
            language={language}
          />
        )}
        {game.engine === 'checkers' && (
          <CheckersGame
            isSingleplayer={isSingleplayer}
            cpuDifficulty={match.cpuDifficulty}
            economy={match.economy}
            onFinishMatch={onFinishMatch}
            language={language}
          />
        )}
        {game.engine === 'pool' && (
          <PoolGame
            isSingleplayer={isSingleplayer}
            cpuDifficulty={match.cpuDifficulty}
            economy={match.economy}
            onFinishMatch={onFinishMatch}
            language={language}
          />
        )}
        {game.engine === 'rinha' && (
          <RinhaGame
            isSingleplayer={isSingleplayer}
            cpuDifficulty={match.cpuDifficulty}
            economy={match.economy}
            onFinishMatch={onFinishMatch}
            language={language}
          />
        )}
        {game.engine === 'cats' && (
          <CatsGame
            isSingleplayer={isSingleplayer}
            cpuDifficulty={match.cpuDifficulty}
            economy={match.economy}
            onFinishMatch={onFinishMatch}
            language={language}
          />
        )}
        {game.engine === 'animal_penalty' && (
          <AnimalPenaltyGame
            isSingleplayer={isSingleplayer}
            cpuDifficulty={match.cpuDifficulty}
            economy={match.economy}
            onFinishMatch={onFinishMatch}
            language={language}
          />
        )}
        {game.engine === 'primal' && (
          <PrimalGame
            economy={match.economy}
            onFinishMatch={onFinishMatch}
          />
        )}
      </main>

      {/* In-Game Chat Drawer */}
      {chatOpen && (
        <div className="absolute right-0 top-14 bottom-14 w-80 bg-[#121212] border-l border-[#262626] flex flex-col shadow-2xl z-40">
          <div className="p-3 border-b border-[#222] flex justify-between items-center bg-[#171717]">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#FF6A00]" />
              Chat da Partida
            </span>
            <button onClick={() => setChatOpen(false)} className="text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-bold text-[#FF6A00]">{msg.sender}: </span>
                <span className="text-neutral-300">{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-2 border-t border-[#222] flex gap-1">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
            />
            <button type="submit" className="p-1.5 bg-[#FF6A00] text-black rounded-lg">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#141414] border border-[#2b2b2b] rounded-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#262626] pb-2">
              <span className="font-bold text-white text-sm">Ajustes da Partida</span>
              <button onClick={() => setSettingsOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs space-y-2 text-neutral-300">
              <div className="flex justify-between items-center">
                <span>Match ID:</span>
                <span className="font-mono text-[#FF6A00]">{match.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Modo:</span>
                <span className="font-mono">{match.mode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rake Aplicado:</span>
                <span className="font-mono text-neutral-400">15% ({match.economy.totalRake} RC)</span>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full py-2 bg-[#FF6A00] text-black font-bold text-xs rounded-xl"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 3. BOTTOM CONTROL BAR: 🏠 Voltar | 🎮 Jogos | 💬 Chat | 👤 Perfil */}
      <footer className="h-14 bg-[#111111] border-t border-[#222] px-4 flex items-center justify-around shrink-0">
        <button
          onClick={onBackToPortal}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2"
        >
          <Home className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <button
          onClick={onBackToPortal}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2"
        >
          <Gamepad2 className="w-4 h-4 text-[#FF6A00]" />
          <span>Jogos</span>
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer py-1 px-2 ${
            chatOpen ? 'text-[#FF6A00]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#20D67B]" />
        </button>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer py-1 px-2"
        >
          <User className="w-4 h-4" />
          <span>Perfil</span>
        </button>
      </footer>
    </div>
  );
};
