import React, { useState } from 'react';
import { CpuDifficulty, MatchEconomy } from '../types';
import { Target, Zap, Shield, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnimalPenaltyProps {
  isSingleplayer: boolean;
  cpuDifficulty?: CpuDifficulty;
  economy: MatchEconomy;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
  language: 'pt' | 'en' | 'es';
}

const GOALKEEPERS = [
  { id: 'gorilla', name: 'Gorila Paredão', icon: '🦍🧤', agility: 0.6 },
  { id: 'leopard', name: 'Leopardo Ágil', icon: '🐆⚡', agility: 0.75 },
  { id: 'bear', name: 'Urso Titã', icon: '🐻🛡️', agility: 0.5 },
];

export const AnimalPenaltyGame: React.FC<AnimalPenaltyProps> = ({
  economy,
  onFinishMatch,
}) => {
  const [gk] = useState(GOALKEEPERS[0]);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [cpuScore, setCpuScore] = useState<number>(0);
  const [currentShot, setCurrentShot] = useState<number>(1);
  const [gkDive, setGkDive] = useState<'left' | 'center' | 'right' | null>(null);
  const [ballPosition, setBallPosition] = useState<'left' | 'center' | 'right' | null>(null);
  const [shotResultText, setShotResultText] = useState<string>('Escolha onde chutar a bola!');
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isKicking, setIsKicking] = useState<boolean>(false);

  const handleShoot = (target: 'left' | 'center' | 'right') => {
    if (isKicking || gameResult) return;
    setIsKicking(true);
    setBallPosition(target);

    // Goalkeeper AI decision
    const options: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
    const dive = options[Math.floor(Math.random() * options.length)];
    setGkDive(dive);

    const isSaved = dive === target;
    let newPlayerScore = playerScore;

    if (!isSaved) {
      newPlayerScore += 1;
      setPlayerScore(newPlayerScore);
      setShotResultText('⚽ GOOOOOL! A bola estufou as redes!');
    } else {
      setShotResultText(`🧤 DEFESSO DO ${gk.name.toUpperCase()}! Ele espalmou!`);
    }

    // Next round or check end
    setTimeout(() => {
      // Simulate CPU kick
      const cpuScored = Math.random() > 0.4;
      const newCpuScore = cpuScore + (cpuScored ? 1 : 0);
      setCpuScore(newCpuScore);

      if (currentShot >= 5) {
        // End of match
        if (newPlayerScore > newCpuScore) {
          setGameResult(`Vitória! Placar final: ${newPlayerScore} x ${newCpuScore}`);
          confetti({ particleCount: 70 });
          onFinishMatch('player1');
        } else if (newPlayerScore < newCpuScore) {
          setGameResult(`Derrota! Placar final: ${newPlayerScore} x ${newCpuScore}`);
          onFinishMatch('player2');
        } else {
          setGameResult(`Empate! Placar final: ${newPlayerScore} x ${newCpuScore}`);
          onFinishMatch('draw');
        }
      } else {
        setCurrentShot(s => s + 1);
        setBallPosition(null);
        setGkDive(null);
        setIsKicking(false);
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center p-3 max-w-2xl mx-auto">
      <div className="w-full flex justify-between items-center bg-[#141414] border border-[#222] px-4 py-2 rounded-xl mb-3 text-xs font-mono">
        <span className="text-emerald-400 font-bold">ANIMAL PENALTY (Proprietário)</span>
        <span>Pote: <strong className="text-[#FF6A00]">{economy.betPerPlayer * 2} RC</strong></span>
      </div>

      {/* Goal Stadium */}
      <div className="w-full bg-gradient-to-b from-sky-950/40 via-[#0a1a0f] to-black border-2 border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative">
        {/* Scoreboard */}
        <div className="flex justify-between items-center mb-6 bg-black/60 p-3 rounded-xl border border-white/10 font-mono">
          <div className="text-center">
            <span className="text-xs text-neutral-400 block">Você</span>
            <span className="text-2xl font-black text-[#20D67B]">{playerScore}</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-neutral-500">Cobrança</span>
            <span className="text-sm font-bold text-white block">{currentShot} / 5</span>
          </div>
          <div className="text-center">
            <span className="text-xs text-neutral-400 block">{gk.name}</span>
            <span className="text-2xl font-black text-red-400">{cpuScore}</span>
          </div>
        </div>

        {/* Goal Post View */}
        <div className="h-44 border-4 border-white/80 rounded-t-xl bg-black/40 relative flex items-center justify-center overflow-hidden">
          {/* Net grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />

          {/* Goalkeeper */}
          <div
            className={`text-5xl transition-all duration-300 ${
              gkDive === 'left' ? '-translate-x-28 translate-y-4 rotate-[-20deg]' :
              gkDive === 'right' ? 'translate-x-28 translate-y-4 rotate-[20deg]' :
              gkDive === 'center' ? 'scale-110' : ''
            }`}
          >
            {gk.icon}
          </div>

          {/* Ball */}
          {ballPosition && (
            <div
              className={`absolute bottom-4 text-3xl transition-all duration-300 ${
                ballPosition === 'left' ? '-translate-x-28 -translate-y-16 scale-75' :
                ballPosition === 'right' ? 'translate-x-28 -translate-y-16 scale-75' :
                '-translate-y-20 scale-75'
              }`}
            >
              ⚽
            </div>
          )}
        </div>

        <div className="text-center py-2 mt-4 text-xs font-mono text-neutral-300">
          {shotResultText}
        </div>

        {/* Shoot Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <button
            onClick={() => handleShoot('left')}
            disabled={isKicking || !!gameResult}
            className="py-3 bg-[#1c1c1c] hover:bg-[#FF6A00] hover:text-black font-bold text-xs rounded-xl border border-[#333] transition-colors"
          >
            Cantinho Esquerdo ⬅️
          </button>
          <button
            onClick={() => handleShoot('center')}
            disabled={isKicking || !!gameResult}
            className="py-3 bg-[#1c1c1c] hover:bg-[#FF6A00] hover:text-black font-bold text-xs rounded-xl border border-[#333] transition-colors"
          >
            No Meio / Cavadinha ⬆️
          </button>
          <button
            onClick={() => handleShoot('right')}
            disabled={isKicking || !!gameResult}
            className="py-3 bg-[#1c1c1c] hover:bg-[#FF6A00] hover:text-black font-bold text-xs rounded-xl border border-[#333] transition-colors"
          >
            Cantinho Direito ➡️
          </button>
        </div>
      </div>

      {gameResult && (
        <div className="w-full mt-3 bg-gradient-to-r from-orange-950/90 to-black border border-[#FF6A00] p-4 rounded-xl text-center">
          <span className="text-lg font-black text-white">{gameResult}</span>
        </div>
      )}
    </div>
  );
};
