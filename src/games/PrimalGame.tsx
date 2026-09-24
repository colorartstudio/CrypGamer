import React, { useState } from 'react';
import { MatchEconomy } from '../types';
import confetti from 'canvas-confetti';

interface PrimalGameProps {
  economy: MatchEconomy;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
}

export const PrimalGame: React.FC<PrimalGameProps> = ({ economy, onFinishMatch }) => {
  const [sectors, setSectors] = useState<('P' | 'E' | null)[]>([null, null, null, null]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [gameResult, setGameResult] = useState<string | null>(null);

  const claimSector = (idx: number) => {
    if (sectors[idx] || gameResult || turn !== 'player') return;
    const next = [...sectors];
    next[idx] = 'P';
    setSectors(next);

    // Check win
    const pCount = next.filter(s => s === 'P').length;
    if (pCount >= 3) {
      setGameResult('Vitória Jurássica! Você dominou o território.');
      confetti({ particleCount: 60 });
      onFinishMatch('player1');
      return;
    }

    if (!next.includes(null)) {
      setGameResult('Empate territorial!');
      onFinishMatch('draw');
      return;
    }

    setTurn('enemy');
    setTimeout(() => {
      const emptyIdxs = next.map((s, i) => s === null ? i : -1).filter(i => i !== -1);
      if (emptyIdxs.length > 0) {
        const pick = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
        next[pick] = 'E';
        setSectors(next);

        const eCount = next.filter(s => s === 'E').length;
        if (eCount >= 3) {
          setGameResult('Derrota! O predador rival conquistou o território.');
          onFinishMatch('player2');
          return;
        }

        if (!next.includes(null)) {
          setGameResult('Empate territorial!');
          onFinishMatch('draw');
          return;
        }
      }
      setTurn('player');
    }, 600);
  };

  return (
    <div className="flex flex-col items-center p-3 max-w-xl mx-auto">
      <div className="w-full flex justify-between items-center bg-[#141414] border border-[#222] px-4 py-2 rounded-xl mb-3 text-xs font-mono">
        <span className="text-amber-500 font-bold">PRIMAL 4 (Proprietário)</span>
        <span>Pote: <strong className="text-[#FF6A00]">{economy.betPerPlayer * 2} RC</strong></span>
      </div>

      <div className="w-full bg-[#111] border border-[#333] rounded-2xl p-6 text-center">
        <p className="text-xs text-neutral-400 mb-4">
          Domine 3 dos 4 quadrantes jurássicos antes do predador adversário!
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {sectors.map((s, i) => (
            <button
              key={i}
              onClick={() => claimSector(i)}
              disabled={s !== null || !!gameResult}
              className={`h-28 rounded-xl flex items-center justify-center text-4xl border-2 transition-all ${
                s === 'P'
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-lg'
                  : s === 'E'
                  ? 'bg-red-950/60 border-red-500 shadow-lg'
                  : 'bg-[#1c1c1c] border-neutral-700 hover:border-[#FF6A00] cursor-pointer active:scale-95'
              }`}
            >
              {s === 'P' ? '🦖' : s === 'E' ? '🦕' : `Q${i + 1}`}
            </button>
          ))}
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
