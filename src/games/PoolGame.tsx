import React, { useRef, useState, useEffect } from 'react';
import { CpuDifficulty, MatchEconomy } from '../types';
import { Target, Zap, RotateCcw, Volume2, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PoolGameProps {
  isSingleplayer: boolean;
  cpuDifficulty?: CpuDifficulty;
  economy: MatchEconomy;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
  language: 'pt' | 'en' | 'es';
}

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isStriped: boolean;
  isPocketed: boolean;
  isCue: boolean;
  isEight: boolean;
}

const TABLE_WIDTH = 580;
const TABLE_HEIGHT = 290;
const POCKET_RADIUS = 18;
const BALL_RADIUS = 8.5;
const FRICTION = 0.985;

export const PoolGame: React.FC<PoolGameProps> = ({
  isSingleplayer,
  cpuDifficulty = 'medium',
  economy,
  onFinishMatch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Assistance mode according to prompt #13:
  // TREINO (Singleplayer): Trajectory line ON, angle, prediction ON
  // PVP (Multiplayer): TRAJETÓRIA: OFF, AUXÍLIO: OFF!
  const hasAssistance = isSingleplayer;

  const [aimAngle, setAimAngle] = useState<number>(0);
  const [shotPower, setShotPower] = useState<number>(50); // 1..100
  const [isBallsMoving, setIsBallsMoving] = useState<boolean>(false);
  const [turn, setTurn] = useState<'player' | 'opponent'>('player');
  const [playerPockets, setPlayerPockets] = useState<number>(0);
  const [opponentPockets, setOpponentPockets] = useState<number>(0);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [shotsCount, setShotsCount] = useState<number>(0);

  const ballsRef = useRef<Ball[]>([]);

  // Pockets locations
  const pockets = [
    { x: 18, y: 18 },
    { x: TABLE_WIDTH / 2, y: 14 },
    { x: TABLE_WIDTH - 18, y: 18 },
    { x: 18, y: TABLE_HEIGHT - 18 },
    { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - 14 },
    { x: TABLE_WIDTH - 18, y: TABLE_HEIGHT - 18 },
  ];

  const resetBalls = () => {
    const balls: Ball[] = [];
    // Cue ball
    balls.push({
      id: 0,
      x: TABLE_WIDTH * 0.28,
      y: TABLE_HEIGHT / 2,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      color: '#ffffff',
      isStriped: false,
      isPocketed: false,
      isCue: true,
      isEight: false,
    });

    // Triangle formation of 10 balls for quick snooker/8-ball game
    const startX = TABLE_WIDTH * 0.70;
    const startY = TABLE_HEIGHT / 2;
    const colors = ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#ec4899', '#06b6d4', '#eab308'];

    let ballId = 1;
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row <= col; row++) {
        const x = startX + col * (BALL_RADIUS * 1.8);
        const y = startY + (row - col / 2) * (BALL_RADIUS * 2.1);
        const isEight = ballId === 5; // Center ball is 8-ball
        balls.push({
          id: ballId,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: BALL_RADIUS,
          color: isEight ? '#111111' : colors[(ballId - 1) % colors.length],
          isStriped: ballId % 2 === 0,
          isPocketed: false,
          isCue: false,
          isEight,
        });
        ballId++;
      }
    }
    ballsRef.current = balls;
  };

  useEffect(() => {
    resetBalls();
  }, []);

  // Main physics loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const balls = ballsRef.current;
      let moving = false;

      // Update positions
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (b.isPocketed) continue;

        if (Math.abs(b.vx) > 0.05 || Math.abs(b.vy) > 0.05) {
          moving = true;
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= FRICTION;
          b.vy *= FRICTION;

          // Wall bounces
          const minX = 22 + b.radius;
          const maxX = TABLE_WIDTH - 22 - b.radius;
          const minY = 22 + b.radius;
          const maxY = TABLE_HEIGHT - 22 - b.radius;

          if (b.x < minX) { b.x = minX; b.vx = -b.vx * 0.85; }
          if (b.x > maxX) { b.x = maxX; b.vx = -b.vx * 0.85; }
          if (b.y < minY) { b.y = minY; b.vy = -b.vy * 0.85; }
          if (b.y > maxY) { b.y = maxY; b.vy = -b.vy * 0.85; }

          // Check pockets
          pockets.forEach(p => {
            const dist = Math.hypot(b.x - p.x, b.y - p.y);
            if (dist < POCKET_RADIUS) {
              b.isPocketed = true;
              b.vx = 0;
              b.vy = 0;

              if (b.isCue) {
                // Scratch penalty: respawn cue ball
                setTimeout(() => {
                  b.isPocketed = false;
                  b.x = TABLE_WIDTH * 0.28;
                  b.y = TABLE_HEIGHT / 2;
                  b.vx = 0;
                  b.vy = 0;
                }, 800);
              } else if (b.isEight) {
                // 8-ball in: win or lose
                if (turn === 'player') {
                  handleGameOver('player1', 'Bola 8 encaçapada!');
                } else {
                  handleGameOver('player2', 'Bola 8 encaçapada!');
                }
              } else {
                if (turn === 'player') setPlayerPockets(c => c + 1);
                else setOpponentPockets(c => c + 1);
              }
            }
          });
        } else {
          b.vx = 0;
          b.vy = 0;
        }

        // Ball to ball collision
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          if (b2.isPocketed) continue;

          const dx = b2.x - b.x;
          const dy = b2.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < b.radius + b2.radius) {
            // Collision resolution
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Separate
            const overlap = (b.radius + b2.radius - dist) / 2;
            b.x -= cos * overlap;
            b.y -= sin * overlap;
            b2.x += cos * overlap;
            b2.y += sin * overlap;

            // Velocities
            const vx1 = b.vx * cos + b.vy * sin;
            const vy1 = b.vy * cos - b.vx * sin;
            const vx2 = b2.vx * cos + b2.vy * sin;
            const vy2 = b2.vy * cos - b2.vx * sin;

            b.vx = vx2 * cos - vy1 * sin;
            b.vy = vy1 * cos + vx2 * sin;
            b2.vx = vx1 * cos - vy2 * sin;
            b2.vy = vy2 * cos + vx1 * sin;
          }
        }
      }

      setIsBallsMoving(moving);

      // DRAW TABLE
      // Outer cushion
      ctx.fillStyle = '#1c130d';
      ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

      // Gold border trim
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, TABLE_WIDTH - 24, TABLE_HEIGHT - 24);

      // Felt cloth (dark modern emerald gamer green)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(20, 20, TABLE_WIDTH - 40, TABLE_HEIGHT - 40);

      // Head string line
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(TABLE_WIDTH * 0.28, 20);
      ctx.lineTo(TABLE_WIDTH * 0.28, TABLE_HEIGHT - 20);
      ctx.stroke();

      // Pockets
      pockets.forEach(p => {
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      const cueBall = balls.find(b => b.isCue && !b.isPocketed);

      // DRAW ASSISTANCE GUIDES (ONLY IN TRAINING MODE!)
      if (hasAssistance && cueBall && !moving) {
        ctx.save();
        ctx.strokeStyle = '#FF6A00';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        const guideDist = 180;
        const targetX = cueBall.x + Math.cos(aimAngle) * guideDist;
        const targetY = cueBall.y + Math.sin(aimAngle) * guideDist;
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Target ghost marker
        ctx.strokeStyle = 'rgba(255, 106, 0, 0.4)';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(targetX, targetY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // DRAW BALLS
      balls.forEach(b => {
        if (b.isPocketed) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.arc(b.x + 1.5, b.y + 1.5, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball Body
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Number/detail
        if (!b.isCue) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 6px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.id.toString(), b.x, b.y + 0.5);
        }

        // Specular highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(b.x - 2, b.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // DRAW CUE STICK
      if (cueBall && !moving) {
        ctx.save();
        ctx.translate(cueBall.x, cueBall.y);
        ctx.rotate(aimAngle + Math.PI);

        const pullback = (shotPower / 100) * 20;
        const cueDistance = 14 + pullback;

        // Cue stick gradient
        const cueGrad = ctx.createLinearGradient(cueDistance, 0, cueDistance + 130, 0);
        cueGrad.addColorStop(0, '#fef3c7');
        cueGrad.addColorStop(0.3, '#d97706');
        cueGrad.addColorStop(1, '#451a03');

        ctx.fillStyle = cueGrad;
        ctx.fillRect(cueDistance, -2, 130, 4);

        // Tip
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(cueDistance - 3, -2, 3, 4);

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [aimAngle, shotPower, hasAssistance, turn]);

  // Handle shooting
  const handleShoot = () => {
    if (isBallsMoving || gameResult) return;
    const cueBall = ballsRef.current.find(b => b.isCue && !b.isPocketed);
    if (!cueBall) return;

    const force = (shotPower / 100) * 16;
    cueBall.vx = Math.cos(aimAngle) * force;
    cueBall.vy = Math.sin(aimAngle) * force;
    setIsBallsMoving(true);
    setShotsCount(s => s + 1);

    // Switch turn
    if (isSingleplayer) {
      setTimeout(() => {
        if (!gameResult) makeCpuShot();
      }, 2500);
    }
  };

  const makeCpuShot = () => {
    const cue = ballsRef.current.find(b => b.isCue && !b.isPocketed);
    const targetBall = ballsRef.current.find(b => !b.isCue && !b.isPocketed);
    if (!cue || !targetBall) return;

    const dx = targetBall.x - cue.x;
    const dy = targetBall.y - cue.y;
    const error = (Math.random() - 0.5) * (cpuDifficulty === 'pro' ? 0.08 : 0.3);
    const angle = Math.atan2(dy, dx) + error;

    cue.vx = Math.cos(angle) * (8 + Math.random() * 6);
    cue.vy = Math.sin(angle) * (8 + Math.random() * 6);
    setIsBallsMoving(true);
  };

  const handleGameOver = (winner: 'player1' | 'player2', reason: string) => {
    if (winner === 'player1') {
      setGameResult(`Vitória! (${reason})`);
      confetti({ particleCount: 70, spread: 60 });
      onFinishMatch('player1');
    } else {
      setGameResult(`Derrota (${reason})`);
      onFinishMatch('player2');
    }
  };

  // Canvas aim by mouse or touch
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isBallsMoving) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = TABLE_WIDTH / rect.width;
    const scaleY = TABLE_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const cueBall = ballsRef.current.find(b => b.isCue && !b.isPocketed);
    if (!cueBall) return;

    const angle = Math.atan2(clickY - cueBall.y, clickX - cueBall.x);
    setAimAngle(angle);
  };

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Mode Assistance Banner (Strict requirement from #13) */}
      <div className="w-full max-w-[620px] flex items-center justify-between bg-[#141414] border border-[#222] px-4 py-2 rounded-xl mb-3">
        <div className="flex items-center gap-2">
          {hasAssistance ? (
            <>
              <ShieldCheck className="w-4 h-4 text-[#20D67B]" />
              <span className="text-xs font-semibold text-[#20D67B]">
                MODO TREINO (Trajetória & Auxílio de Mira: LIGADO)
              </span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-xs font-semibold text-[#FF6A00]">
                MODO PvP (TRAJETÓRIA: OFF • AUXÍLIO: OFF)
              </span>
            </>
          )}
        </div>
        <span className="text-xs font-mono text-neutral-400">
          Pote: <strong className="text-[#FF6A00]">{economy.betPerPlayer * 2} RC</strong>
        </span>
      </div>

      {/* Pool Table Canvas */}
      <div className="relative w-full max-w-[620px] bg-[#0c0c0c] p-2 rounded-2xl border-4 border-[#222] shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          onClick={handleCanvasClick}
          className="w-full h-auto rounded-lg cursor-crosshair touch-none"
        />

        {/* Floating status indicator */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono">
          {isBallsMoving ? '⚪ Bolas em movimento...' : '🎯 Toque na mesa para mirar'}
        </div>
      </div>

      {/* Controls: Aim Angle + Power Meter */}
      <div className="w-full max-w-[620px] bg-[#141414] border border-[#222] rounded-xl p-3 sm:p-4 mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        {/* Aim Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Ângulo de Mira</span>
            <span className="font-mono text-[#FF6A00]">{Math.round((aimAngle * 180) / Math.PI)}°</span>
          </div>
          <input
            type="range"
            min={-Math.PI}
            max={Math.PI}
            step={0.02}
            value={aimAngle}
            disabled={isBallsMoving}
            onChange={e => setAimAngle(parseFloat(e.target.value))}
            className="w-full accent-[#FF6A00]"
          />
        </div>

        {/* Power Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Força da Tacada</span>
            <span className="font-mono text-[#20D67B]">{shotPower}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={shotPower}
            disabled={isBallsMoving}
            onChange={e => setShotPower(parseInt(e.target.value))}
            className="w-full accent-[#20D67B]"
          />
        </div>

        {/* Shoot Button */}
        <button
          onClick={handleShoot}
          disabled={isBallsMoving || !!gameResult}
          className="w-full py-3 bg-[#FF6A00] hover:bg-[#FF8A1F] active:scale-95 text-black font-black rounded-lg text-sm transition-all shadow-lg glow-orange-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
        >
          <Zap className="w-4 h-4 fill-black" />
          EXECUTAR TACADA
        </button>
      </div>

      {/* Score and Stats */}
      <div className="w-full max-w-[620px] grid grid-cols-3 gap-2 mt-3 text-center text-xs font-mono">
        <div className="bg-[#171717] p-2 rounded-lg border border-[#222]">
          <span className="text-neutral-400 block">Suas Encaçapadas</span>
          <span className="text-base font-bold text-[#20D67B]">{playerPockets}</span>
        </div>
        <div className="bg-[#171717] p-2 rounded-lg border border-[#222]">
          <span className="text-neutral-400 block">Tacadas</span>
          <span className="text-base font-bold text-white">{shotsCount}</span>
        </div>
        <div className="bg-[#171717] p-2 rounded-lg border border-[#222]">
          <span className="text-neutral-400 block">Prêmio do Pote</span>
          <span className="text-base font-bold text-[#FF6A00]">{economy.winnerPrize} RC</span>
        </div>
      </div>

      {/* Result Alert */}
      {gameResult && (
        <div className="w-full max-w-[620px] mt-3 bg-gradient-to-r from-orange-950/80 to-black border border-[#FF6A00] p-4 rounded-xl text-center">
          <span className="text-lg font-black text-white block">{gameResult}</span>
        </div>
      )}
    </div>
  );
};
