import React, { useState, useEffect } from 'react';
import { CpuDifficulty, MatchEconomy } from '../types';
import { Zap, Shield, Flame, Swords, Heart, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RinhaGameProps {
  isSingleplayer: boolean;
  cpuDifficulty?: CpuDifficulty;
  economy: MatchEconomy;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
  language: 'pt' | 'en' | 'es';
}

interface Fighter {
  id: string;
  name: string;
  avatar: string;
  maxHp: number;
  type: string;
}

const FIGHTERS: Fighter[] = [
  { id: 'cyborg_cock', name: 'Galo Cibernético', avatar: '🐔⚡', maxHp: 100, type: 'Ciborgue' },
  { id: 'iron_bot', name: 'Robô Fighter MK-II', avatar: '🤖🔥', maxHp: 110, type: 'Mecatrônico' },
  { id: 'beast_prime', name: 'Mutante Brutal', avatar: '🦍🩸', maxHp: 120, type: 'Biológico' },
  { id: 'cosmic_phoenix', name: 'Fênix do Vácuo', avatar: '🦅✨', maxHp: 95, type: 'Energético' },
];

export const RinhaGame: React.FC<RinhaGameProps> = ({
  isSingleplayer,
  cpuDifficulty = 'medium',
  economy,
  onFinishMatch,
}) => {
  const [selectedFighter, setSelectedFighter] = useState<Fighter>(FIGHTERS[0]);
  const [enemyFighter, setEnemyFighter] = useState<Fighter>(FIGHTERS[1]);
  
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [enemyHp, setEnemyHp] = useState<number>(110);
  const [playerEnergy, setPlayerEnergy] = useState<number>(30);
  const [enemyEnergy, setEnemyEnergy] = useState<number>(30);

  const [combatLog, setCombatLog] = useState<{ text: string; isCrit?: boolean; isHeal?: boolean }[]>([
    { text: 'A arena Rinha Evolution foi iniciada! Escolha seu golpe.' }
  ]);
  const [playerAnimation, setPlayerAnimation] = useState<string>('');
  const [enemyAnimation, setEnemyAnimation] = useState<string>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const addLog = (text: string, isCrit = false, isHeal = false) => {
    setCombatLog(prev => [{ text, isCrit, isHeal }, ...prev.slice(0, 10)]);
  };

  const handlePlayerAction = (action: 'light' | 'heavy' | 'shield' | 'super') => {
    if (isBusy || gameResult) return;
    setIsBusy(true);

    let damage = 0;
    let energyGain = 15;
    let actionDesc = '';
    let anim = '';

    if (action === 'light') {
      damage = Math.floor(12 + Math.random() * 8);
      actionDesc = `Você desferiu um Golpe Rápido causando ${damage} de dano!`;
      anim = 'translate-x-6';
    } else if (action === 'heavy') {
      const hit = Math.random() > 0.2;
      if (hit) {
        damage = Math.floor(22 + Math.random() * 12);
        actionDesc = `Golpe Pesado Conectado! Crítico devastador de ${damage} de dano!`;
      } else {
        damage = 0;
        actionDesc = 'O golpe pesado errou o alvo!';
      }
      energyGain = 20;
      anim = 'scale-110 translate-x-8';
    } else if (action === 'shield') {
      const shieldHeal = 15;
      setPlayerHp(h => Math.min(selectedFighter.maxHp, h + shieldHeal));
      actionDesc = `Você ativou a Barreira Protetora e recuperou ${shieldHeal} de HP!`;
      energyGain = 25;
      anim = 'scale-95';
    } else if (action === 'super') {
      if (playerEnergy < 100) {
        setIsBusy(false);
        return;
      }
      damage = Math.floor(45 + Math.random() * 15);
      actionDesc = `💥 SUPER GOLPE CÓSMICO! Explosão nuclear de ${damage} de dano!`;
      setPlayerEnergy(0);
      energyGain = 0;
      anim = 'scale-125 translate-x-12';
    }

    setPlayerAnimation(anim);
    setTimeout(() => setPlayerAnimation(''), 400);

    // Apply damage to enemy
    const newEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(newEnemyHp);
    if (action !== 'super') {
      setPlayerEnergy(e => Math.min(100, e + energyGain));
    }
    addLog(actionDesc, action === 'heavy' || action === 'super', action === 'shield');

    // Check enemy defeat
    if (newEnemyHp <= 0) {
      setGameResult('K.O.! Você venceu o confronto!');
      confetti({ particleCount: 80, spread: 70 });
      onFinishMatch('player1');
      setIsBusy(false);
      return;
    }

    // CPU Turn response
    setTimeout(() => {
      executeEnemyTurn(newEnemyHp);
    }, 800);
  };

  const executeEnemyTurn = (currentEnemyHp: number) => {
    let enemyDmg = 0;
    let enemyDesc = '';
    const shouldSuper = enemyEnergy >= 100;

    if (shouldSuper) {
      enemyDmg = Math.floor(40 + Math.random() * 12);
      enemyDesc = `⚠️ O adversário usou o SUPER GOLPE e causou ${enemyDmg} de dano!`;
      setEnemyEnergy(0);
    } else {
      const moves = ['light', 'heavy', 'shield'];
      const pick = moves[Math.floor(Math.random() * moves.length)];
      if (pick === 'light') {
        enemyDmg = Math.floor(10 + Math.random() * 8);
        enemyDesc = `O adversário acertou um golpe ágil causando ${enemyDmg} de dano.`;
      } else if (pick === 'heavy') {
        enemyDmg = Math.floor(18 + Math.random() * 10);
        enemyDesc = `Golpe pesado do adversário conectou por ${enemyDmg} de dano!`;
      } else {
        setEnemyHp(h => Math.min(enemyFighter.maxHp, h + 12));
        enemyDesc = 'O adversário bloqueou e recuperou energia.';
      }
      setEnemyEnergy(e => Math.min(100, e + 20));
    }

    setEnemyAnimation('-translate-x-6');
    setTimeout(() => setEnemyAnimation(''), 400);

    const newPlayerHp = Math.max(0, playerHp - enemyDmg);
    setPlayerHp(newPlayerHp);
    addLog(enemyDesc, shouldSuper);

    if (newPlayerHp <= 0) {
      setGameResult('K.O.! Você foi derrotado na arena.');
      onFinishMatch('player2');
    }

    setIsBusy(false);
  };

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 max-w-4xl mx-auto">
      {/* Economy Bar */}
      <div className="w-full flex items-center justify-between bg-[#141414] border border-[#222] px-4 py-2 rounded-xl mb-3">
        <span className="text-xs font-mono text-neutral-400">
          Arena: <strong className="text-white">Rinha Evolution PvP</strong>
        </span>
        <span className="text-xs font-mono text-neutral-400">
          Pote em jogo: <strong className="text-[#FF6A00]">{economy.betPerPlayer * 2} RC</strong>
        </span>
      </div>

      {/* Main Fighting Arena Stage */}
      <div className="w-full bg-gradient-to-b from-[#1b120c] via-[#0e0e0e] to-black border-2 border-[#2b2b2b] rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Arena Backdrop details */}
        <div className="absolute inset-0 bg-[radial-gradient(#FF6A00_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        {/* Fighter Status Bars */}
        <div className="grid grid-cols-2 gap-4 relative z-10 mb-6">
          {/* Player Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                {selectedFighter.name}
              </span>
              <span className="text-xs font-mono font-bold text-[#20D67B]">{playerHp} HP</span>
            </div>
            {/* HP Bar */}
            <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-neutral-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-300"
                style={{ width: `${(playerHp / selectedFighter.maxHp) * 100}%` }}
              />
            </div>
            {/* Super Energy Bar */}
            <div className="flex justify-between items-center mt-1.5 text-[10px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1 text-[#FF6A00]">
                <Flame className="w-3 h-3 fill-[#FF6A00]" /> Fúria Especial
              </span>
              <span>{playerEnergy}%</span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${playerEnergy}%` }}
              />
            </div>
          </div>

          {/* Enemy Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-bold text-red-400">{enemyHp} HP</span>
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                {enemyFighter.name}
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              </span>
            </div>
            <div className="w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-neutral-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300 ml-auto"
                style={{ width: `${(enemyHp / enemyFighter.maxHp) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[10px] text-neutral-400 font-mono">
              <span>{enemyEnergy}%</span>
              <span className="flex items-center gap-1 text-red-400">
                Fúria Inimiga <Flame className="w-3 h-3 fill-red-500" />
              </span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-300 ml-auto"
                style={{ width: `${enemyEnergy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fighters In-Ring Display */}
        <div className="flex items-center justify-between px-8 sm:px-16 py-8 relative">
          {/* Player Character */}
          <div className={`flex flex-col items-center transition-transform duration-200 ${playerAnimation}`}>
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-[#241306] to-[#451f08] border-2 border-[#FF6A00] flex items-center justify-center text-5xl sm:text-6xl shadow-xl relative glow-orange-sm">
              {selectedFighter.avatar}
              <div className="absolute -bottom-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#FF6A00] border border-[#FF6A00]/40">
                VOCÊ
              </div>
            </div>
          </div>

          {/* VS Center Marker */}
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-black text-neutral-700 italic">VS</span>
            <Swords className="w-6 h-6 text-[#FF6A00] animate-bounce" />
          </div>

          {/* Enemy Character */}
          <div className={`flex flex-col items-center transition-transform duration-200 ${enemyAnimation}`}>
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-[#1a0808] to-[#361010] border-2 border-red-500 flex items-center justify-center text-5xl sm:text-6xl shadow-xl relative">
              {enemyFighter.avatar}
              <div className="absolute -bottom-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-red-400 border border-red-500/40">
                OPONENTE
              </div>
            </div>
          </div>
        </div>

        {/* Combat Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <button
            onClick={() => handlePlayerAction('light')}
            disabled={isBusy || !!gameResult}
            className="py-3 px-2 bg-[#1c1c1c] hover:bg-[#252525] text-white rounded-xl border border-[#333] font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Soco Rápido</span>
            <span className="text-[10px] font-normal text-neutral-400">+15 Fúria • 10-20 Dano</span>
          </button>

          <button
            onClick={() => handlePlayerAction('heavy')}
            disabled={isBusy || !!gameResult}
            className="py-3 px-2 bg-[#1c1c1c] hover:bg-[#252525] text-white rounded-xl border border-[#333] font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <Swords className="w-4 h-4 text-orange-500" />
            <span>Chute Carregado</span>
            <span className="text-[10px] font-normal text-neutral-400">+20 Fúria • Alto Crítico</span>
          </button>

          <button
            onClick={() => handlePlayerAction('shield')}
            disabled={isBusy || !!gameResult}
            className="py-3 px-2 bg-[#1c1c1c] hover:bg-[#252525] text-white rounded-xl border border-[#333] font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Escudo de Defesa</span>
            <span className="text-[10px] font-normal text-neutral-400">+15 HP • +25 Fúria</span>
          </button>

          <button
            onClick={() => handlePlayerAction('super')}
            disabled={isBusy || !!gameResult || playerEnergy < 100}
            className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col items-center gap-1 transition-all active:scale-95 border ${
              playerEnergy >= 100
                ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF8A1F] text-black border-yellow-400 animate-pulse glow-orange'
                : 'bg-[#151515] text-neutral-500 border-[#262626] opacity-60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>SUPER GOLPE</span>
            <span className="text-[10px] font-normal">
              {playerEnergy >= 100 ? 'PRONTO! 45-60 DANO' : 'Requer 100% Fúria'}
            </span>
          </button>
        </div>
      </div>

      {/* Combat Log Feed */}
      <div className="w-full bg-[#121212] border border-[#222] rounded-xl p-3 mt-3 max-h-32 overflow-y-auto">
        <span className="text-xs font-mono text-neutral-400 block mb-1.5">Registro de Combate</span>
        <div className="space-y-1">
          {combatLog.map((log, idx) => (
            <div
              key={idx}
              className={`text-xs font-mono ${
                log.isCrit
                  ? 'text-orange-400 font-bold'
                  : log.isHeal
                  ? 'text-blue-400'
                  : 'text-neutral-300'
              }`}
            >
              • {log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {gameResult && (
        <div className="w-full mt-3 bg-gradient-to-r from-orange-950/90 to-black border-2 border-[#FF6A00] p-4 rounded-xl text-center">
          <span className="text-xl font-black text-white block">{gameResult}</span>
          <span className="text-xs text-[#20D67B] font-mono mt-1 block">
            Prêmio de {economy.winnerPrize} RC transferido para a carteira!
          </span>
        </div>
      )}
    </div>
  );
};
