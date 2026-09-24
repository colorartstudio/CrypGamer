import React, { useState, useEffect } from 'react';
import { CpuDifficulty, MatchEconomy } from '../types';
import { Flag, Handshake, RotateCcw, Clock, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckersGameProps {
  isSingleplayer: boolean;
  cpuDifficulty?: CpuDifficulty;
  economy: MatchEconomy;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
  language: 'pt' | 'en' | 'es';
}

type CheckerColor = 'w' | 'b'; // w: player (bottom), b: opponent/CPU (top)

interface CheckerPiece {
  color: CheckerColor;
  isKing: boolean;
}

const buildInitialBoard = (): (CheckerPiece | null)[][] => {
  const board: (CheckerPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { color: 'b', isKing: false };
      }
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { color: 'w', isKing: false };
      }
    }
  }
  return board;
};

export const CheckersGame: React.FC<CheckersGameProps> = ({
  isSingleplayer,
  cpuDifficulty = 'medium',
  economy,
  onFinishMatch,
}) => {
  const [board, setBoard] = useState<(CheckerPiece | null)[][]>(buildInitialBoard);
  const [turn, setTurn] = useState<CheckerColor>('w');
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<{ dest: [number, number]; jumpOver?: [number, number] }[]>([]);
  const [timerW, setTimerW] = useState<number>(300);
  const [timerB, setTimerB] = useState<number>(300);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [capturedByW, setCapturedByW] = useState<number>(0);
  const [capturedByB, setCapturedByB] = useState<number>(0);

  // Timers
  useEffect(() => {
    if (gameResult) return;
    const interval = setInterval(() => {
      if (turn === 'w') {
        setTimerW(t => (t <= 1 ? (handleGameOver('b', 'Tempo'), 0) : t - 1));
      } else {
        setTimerB(t => (t <= 1 ? (handleGameOver('w', 'Tempo'), 0) : t - 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [turn, gameResult]);

  // CPU move trigger
  useEffect(() => {
    if (isSingleplayer && turn === 'b' && !gameResult) {
      const timeout = setTimeout(() => {
        makeCpuMove();
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [turn, isSingleplayer, gameResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMovesForPiece = (
    r: number,
    c: number,
    currentBoard: (CheckerPiece | null)[][]
  ): { dest: [number, number]; jumpOver?: [number, number] }[] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    const moves: { dest: [number, number]; jumpOver?: [number, number] }[] = [];
    const oppColor = piece.color === 'w' ? 'b' : 'w';

    const directions = piece.isKing
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === 'w'
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

    // 1. Regular 1-step moves
    directions.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !currentBoard[nr][nc]) {
        moves.push({ dest: [nr, nc] });
      }
    });

    // 2. Jump captures (kings can jump all 4 directions)
    const jumpDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    jumpDirs.forEach(([dr, dc]) => {
      const midR = r + dr;
      const midC = c + dc;
      const destR = r + dr * 2;
      const destC = c + dc * 2;
      if (destR >= 0 && destR < 8 && destC >= 0 && destC < 8) {
        const midPiece = currentBoard[midR][midC];
        const destPiece = currentBoard[destR][destC];
        if (midPiece && midPiece.color === oppColor && !destPiece) {
          moves.push({ dest: [destR, destC], jumpOver: [midR, midC] });
        }
      }
    });

    return moves;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (gameResult) return;
    if (isSingleplayer && turn === 'b') return;

    if (selectedPos) {
      const move = validMoves.find(m => m.dest[0] === r && m.dest[1] === c);
      if (move) {
        executeMove(selectedPos[0], selectedPos[1], move);
        setSelectedPos(null);
        setValidMoves([]);
        return;
      }
    }

    const piece = board[r][c];
    if (piece && piece.color === turn) {
      setSelectedPos([r, c]);
      setValidMoves(getMovesForPiece(r, c, board));
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  };

  const executeMove = (
    sr: number,
    sc: number,
    move: { dest: [number, number]; jumpOver?: [number, number] }
  ) => {
    const piece = board[sr][sc];
    if (!piece) return;

    const newBoard = board.map(row => [...row]);
    const [dr, dc] = move.dest;

    newBoard[sr][sc] = null;

    let isKing = piece.isKing;
    // King promotion
    if ((piece.color === 'w' && dr === 0) || (piece.color === 'b' && dr === 7)) {
      isKing = true;
    }

    newBoard[dr][dc] = { color: piece.color, isKing };

    // Remove jumped piece
    if (move.jumpOver) {
      const [jr, jc] = move.jumpOver;
      newBoard[jr][jc] = null;
      if (piece.color === 'w') setCapturedByW(c => c + 1);
      else setCapturedByB(c => c + 1);
    }

    setBoard(newBoard);

    // Check win condition (count remaining opposing pieces)
    const oppColor = piece.color === 'w' ? 'b' : 'w';
    let oppRemaining = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (newBoard[r][c]?.color === oppColor) oppRemaining++;
      }
    }

    if (oppRemaining === 0) {
      handleGameOver(piece.color, 'Todas as peças adversárias capturadas');
      return;
    }

    setTurn(turn === 'w' ? 'b' : 'w');
  };

  const makeCpuMove = () => {
    const allMoves: { from: [number, number]; move: { dest: [number, number]; jumpOver?: [number, number] } }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === 'b') {
          const pieceMoves = getMovesForPiece(r, c, board);
          pieceMoves.forEach(m => allMoves.push({ from: [r, c], move: m }));
        }
      }
    }

    if (allMoves.length === 0) {
      handleGameOver('w', 'Sem lances legais');
      return;
    }

    // Prioritize jump captures
    const captures = allMoves.filter(m => !!m.move.jumpOver);
    const chosen = captures.length > 0 ? captures[Math.floor(Math.random() * captures.length)] : allMoves[Math.floor(Math.random() * allMoves.length)];

    executeMove(chosen.from[0], chosen.from[1], chosen.move);
  };

  const handleGameOver = (winner: CheckerColor | 'draw', reason: string) => {
    if (winner === 'draw') {
      setGameResult('Partida empatada!');
      onFinishMatch('draw');
    } else if (winner === 'w') {
      setGameResult(`Vitória! (${reason})`);
      confetti({ particleCount: 70, spread: 60 });
      onFinishMatch('player1');
    } else {
      setGameResult(`Derrota (${reason})`);
      onFinishMatch('player2');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start justify-center p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Board */}
      <div className="flex flex-col items-center w-full max-w-[460px] mx-auto">
        <div className="w-full flex items-center justify-between bg-[#141414] border border-[#222] px-4 py-2 rounded-t-xl mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-red-400" />
            <span className="text-sm font-semibold text-neutral-300">
              {isSingleplayer ? `CPU CrypBot (${cpuDifficulty})` : 'Adversário'}
            </span>
            <span className="text-xs text-neutral-500 font-mono">({12 - capturedByW} restantes)</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-mono bg-[#0d0d0d] px-2.5 py-1 rounded text-neutral-300 border border-[#262626]">
            <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
            {formatTime(timerB)}
          </div>
        </div>

        <div className="w-full aspect-square bg-[#121212] p-1.5 rounded-lg border-2 border-[#2b2b2b] shadow-2xl relative">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded overflow-hidden">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isPlayableSquare = (r + c) % 2 === 1;
                const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
                const moveOption = validMoves.find(m => m.dest[0] === r && m.dest[1] === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    disabled={!isPlayableSquare}
                    className={`relative flex items-center justify-center transition-all select-none
                      ${isPlayableSquare ? 'bg-[#1b1b1b]' : 'bg-[#303030]'}
                      ${isSelected ? 'ring-2 ring-[#FF6A00] bg-orange-950/40' : ''}
                      ${isPlayableSquare ? 'hover:brightness-125' : ''}`}
                  >
                    {/* Destination marker */}
                    {moveOption && (
                      <div
                        className={`absolute rounded-full z-10 ${
                          moveOption.jumpOver
                            ? 'w-6 h-6 border-2 border-red-500 bg-red-500/30 animate-ping'
                            : 'w-3 h-3 bg-[#FF6A00]/80'
                        }`}
                      />
                    )}

                    {/* Checker Piece */}
                    {piece && (
                      <div
                        className={`w-4/5 h-4/5 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform active:scale-95 ${
                          piece.color === 'w'
                            ? 'bg-gradient-to-b from-amber-100 to-amber-300 text-black border-2 border-white'
                            : 'bg-gradient-to-b from-red-600 to-red-900 text-white border-2 border-red-400'
                        } ${isSelected ? 'scale-110 ring-2 ring-[#FF6A00]' : ''}`}
                      >
                        {piece.isKing ? '👑' : ''}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-between bg-[#141414] border border-[#222] px-4 py-2 rounded-b-xl mt-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-200 border border-white" />
            <span className="text-sm font-semibold text-white">Você</span>
            <span className="text-xs text-neutral-500 font-mono">({12 - capturedByB} restantes)</span>
            {turn === 'w' && !gameResult && (
              <span className="text-xs bg-[#20D67B]/20 text-[#20D67B] px-2 py-0.5 rounded font-mono animate-pulse">
                Sua Vez
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm font-mono bg-[#0d0d0d] px-2.5 py-1 rounded text-white border border-[#262626]">
            <Clock className="w-3.5 h-3.5 text-[#20D67B]" />
            {formatTime(timerW)}
          </div>
        </div>
      </div>

      {/* Side HUD */}
      <div className="w-full lg:w-72 flex flex-col gap-3">
        <div className="bg-[#141414] border border-[#222] rounded-xl p-3.5">
          <span className="text-xs text-neutral-400 block mb-1">Aposta Total (Pote)</span>
          <span className="text-lg font-bold text-[#FF6A00] font-mono">
            {economy.betPerPlayer * 2} RC
          </span>
          <div className="mt-2 text-xs grid grid-cols-2 gap-2">
            <div className="bg-[#1c1c1c] p-2 rounded">
              <span className="text-neutral-400 block">Prêmio Final</span>
              <span className="font-bold text-[#20D67B] font-mono">{economy.winnerPrize} RC</span>
            </div>
            <div className="bg-[#1c1c1c] p-2 rounded">
              <span className="text-neutral-400 block">Capturas</span>
              <span className="font-bold text-white font-mono">{capturedByW} vs {capturedByB}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#171717] border border-[#262626] rounded-xl p-3 text-xs leading-relaxed text-neutral-300">
          <span className="font-bold text-white block mb-1">Regras da Mesa</span>
          Peças comuns andam 1 casa para frente em diagonal. Damas coroadas (👑) podem andar para frente e para trás. Saltos sobre peças inimigas realizam capturas!
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => handleGameOver('b', 'Desistência')}
            disabled={!!gameResult}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1e1e1e] hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-[#2c2c2c] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Flag className="w-3.5 h-3.5" />
            Desistir
          </button>
          <button
            onClick={() => handleGameOver('draw', 'Acordo mútuo')}
            disabled={!!gameResult}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1e1e1e] hover:bg-neutral-800 text-neutral-300 border border-[#2c2c2c] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Handshake className="w-3.5 h-3.5" />
            Empate
          </button>
        </div>

        {gameResult && (
          <div className="bg-gradient-to-r from-orange-950/80 to-black border border-[#FF6A00] p-3 rounded-xl text-center">
            <span className="text-base font-bold text-white block">{gameResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
