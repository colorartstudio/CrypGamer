import React, { useState } from 'react';
import { CpuDifficulty, MatchEconomy } from '../types';
import { Sparkles, Zap, Shield, Flame, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CatsGameProps {
  isSingleplayer: boolean;
  cpuDifficulty?: CpuDifficulty;
  economy: MatchEconomy;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
  language: 'pt' | 'en' | 'es';
}

interface CatCard {
  id: string;
  name: string;
  element: 'fire' | 'lightning' | 'shadow' | 'heal';
  damage: number;
  energyCost: number;
  icon: string;
  desc: string;
}

const CARDS: CatCard[] = [
  { id: 'c1', name: 'Garra Flamejante', element: 'fire', damage: 24, energyCost: 20, icon: '🔥🐾', desc: 'Arranca pelos e incendeia o adversário' },
  { id: 'c2', name: 'Mordida Cibernética', element: 'lightning', damage: 28, energyCost: 25, icon: '⚡😼', desc: 'Descarga elétrica de alto impacto' },
  { id: 'c3', name: 'Manto de Sombras', element: 'shadow', damage: 15, energyCost: 10, icon: '🌑🐈', desc: 'Golpe furtivo impossível de esquivar' },
  { id: 'c4', name: 'Lambida Curativa', element: 'heal', damage: -25, energyCost: 15, icon: '💖🐱', desc: 'Recupera 25 pontos de vitalidade' },
];

export const CatsGame: React.FC<CatsGameProps> = ({
  economy,
  onFinishMatch,
}) => {
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(100);
  const [energy, setEnergy] = useState<number>(60);
  const [round, setRound] = useState<number>(1);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [statusLog, setStatusLog] = useState<string>('Sua vez! Escolha uma carta de combate.');

  const playCard = (card: CatCard) => {
    if (gameResult || energy < card.energyCost) return;

    setEnergy(e => e - card.energyCost);

    let nextEnemyHp = enemyHp;
    let nextPlayerHp = playerHp;

    if (card.damage < 0) {
      nextPlayerHp = Math.min(100, playerHp - card.damage);
      setPlayerHp(nextPlayerHp);
      setStatusLog(`Você usou ${card.name} e curou ${-card.damage} HP!`);
    } else {
      nextEnemyHp = Math.max(0, enemyHp - card.damage);
      setEnemyHp(nextEnemyHp);
      setStatusLog(`Você usou ${card.name} e causou ${card.damage} de dano!`);
    }

    if (nextEnemyHp <= 0) {
      setGameResult('Vitória! Seu gato guerreiro dominou a arena.');
      confetti({ particleCount: 70 });
      onFinishMatch('player1');
      return;
    }

    // Enemy responds
    setTimeout(() => {
      const enemyDmg = Math.floor(15 + Math.random() * 15);
      const enemyHpAfter = Math.max(0, nextPlayerHp - enemyDmg);
      setPlayerHp(enemyHpAfter);
      setEnergy(e => Math.min(100, e + 30));
      setRound(r => r + 1);
      setStatusLog(`O oponente contra-atacou com Golpe Felino causando ${enemyDmg} de dano.`);

      if (enemyHpAfter <= 0) {
        setGameResult('Derrota! O gato adversário foi implacável.');
        onFinishMatch('player2');
      }
    }, 700);
  };

  return (
    <div className="flex flex-col items-center p-3 max-w-2xl mx-auto">
      <div className="w-full flex justify-between items-center bg-[#141414] border border-[#222] px-4 py-2 rounded-xl mb-3 text-xs font-mono">
        <span className="text-purple-400 font-bold">CATS IN FURY (Proprietário)</span>
        <span>Pote: <strong className="text-[#FF6A00]">{economy.betPerPlayer * 2} RC</strong></span>
      </div>

      {/* Arena */}
      <div className="w-full bg-gradient-to-b from-purple-950/40 via-[#101010] to-black border border-purple-500/30 rounded-2xl p-5 shadow-2xl">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/60 p-3 rounded-xl border border-white/10">
            <span className="text-xs text-neutral-400 block">Seu Gato Guerreiro</span>
            <span className="text-2xl font-black text-[#20D67B] font-mono">{playerHp} / 100 HP</span>
            <div className="w-full h-2 bg-neutral-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${playerHp}%` }} />
            </div>
            <span className="text-[11px] text-[#FF6A00] mt-1 block font-mono">Energia: {energy}/100</span>
          </div>

          <div className="bg-black/60 p-3 rounded-xl border border-white/10 text-right">
            <span className="text-xs text-neutral-400 block">Adversário</span>
            <span className="text-2xl font-black text-red-400 font-mono">{enemyHp} / 100 HP</span>
            <div className="w-full h-2 bg-neutral-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-red-500 ml-auto" style={{ width: `${enemyHp}%` }} />
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block font-mono">Rodada {round}</span>
          </div>
        </div>

        <div className="text-center py-2 bg-black/40 border border-white/5 rounded-lg mb-4 text-xs font-mono text-neutral-300">
          {statusLog}
        </div>

        {/* Hand of cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CARDS.map(c => {
            const canAfford = energy >= c.energyCost && !gameResult;
            return (
              <button
                key={c.id}
                onClick={() => playCard(c)}
                disabled={!canAfford}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  canAfford
                    ? 'bg-[#1a1a1a] hover:bg-[#252525] border-purple-500/40 hover:border-purple-400 cursor-pointer active:scale-95'
                    : 'bg-[#111] border-neutral-800 opacity-40 cursor-not-allowed'
                }`}
              >
                <span className="text-3xl mb-1">{c.icon}</span>
                <span className="font-bold text-xs text-white leading-tight">{c.name}</span>
                <span className="text-[10px] text-purple-300 font-mono mt-1">Custo: {c.energyCost}⚡</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">{c.desc}</span>
              </button>
            );
          })}
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
