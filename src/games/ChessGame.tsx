import React, { useState, useEffect } from 'react';
import { CpuDifficulty, MatchEconomy } from '../types';
import { Flag, Handshake, HelpCircle, RotateCcw, Clock, Volume2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChessGameProps {
  isSingleplayer: boolean;
  cpuDifficulty?: CpuDifficulty;
  economy: MatchEconomy;
  onFinishMatch: (winner: 'player1' | 'player2' | 'draw') => void;
  language: 'pt' | 'en' | 'es';
}

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const PIECE_NAMES: Record<PieceType, { pt: string; en: string; es: string }> = {
  k: { pt: 'Rei', en: 'King', es: 'Rey' },
  q: { pt: 'Rainha', en: 'Queen', es: 'Reina' },
  r: { pt: 'Torre', en: 'Rook', es: 'Torre' },
  b: { pt: 'Bispo', en: 'Bishop', es: 'Alfil' },
  n: { pt: 'Cavalo', en: 'Knight', es: 'Caballo' },
  p: { pt: 'Peão', en: 'Pawn', es: 'Peón' },
};

const INITIAL_BOARD: (Piece | null)[][] = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ],
];

export const ChessGame: React.FC<ChessGameProps> = ({
  isSingleplayer,
  cpuDifficulty = 'medium',
  economy,
  onFinishMatch,
  language,
}) => {
  const [board, setBoard] = useState<(Piece | null)[][]>(INITIAL_BOARD);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [showMoveHelp, setShowMoveHelp] = useState<boolean>(true);
  const [history, setHistory] = useState<string[]>([]);
  const [timerW, setTimerW] = useState<number>(300);
  const [timerB, setTimerB] = useState<number>(300);
  const [gameResult, setGameResult] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (gameResult) return;
    const interval = setInterval(() => {
      if (turn === 'w') {
        setTimerW(t => {
          if (t <= 1) {
            handleGameOver('b', 'Tempo esgotado');
            return 0;
          }
          return t - 1;
        });
      } else {
        setTimerB(t => {
          if (t <= 1) {
            handleGameOver('w', 'Tempo esgotado');
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [turn, gameResult]);

  // CPU move trigger
  useEffect(() => {
    if (isSingleplayer && turn === 'b' && !gameResult) {
      const delay = cpuDifficulty === 'easy' ? 900 : cpuDifficulty === 'pro' ? 400 : 700;
      const timeout = setTimeout(() => {
        makeCpuMove();
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [turn, isSingleplayer, gameResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMovesForSquare = (r: number, c: number, currentBoard: (Piece | null)[][]): [number, number][] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    const moves: [number, number][] = [];
    const color = piece.color;
    const oppColor = color === 'w' ? 'b' : 'w';

    const addIfValid = (nr: number, nc: number) => {
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const dest = currentBoard[nr][nc];
        if (!dest) {
          moves.push([nr, nc]);
          return true; // continue ray
        } else if (dest.color === oppColor) {
          moves.push([nr, nc]);
          return false; // hit enemy, stop ray
        }
      }
      return false;
    };

    if (piece.type === 'p') {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      // 1 step forward
      if (r + dir >= 0 && r + dir < 8 && !currentBoard[r + dir][c]) {
        moves.push([r + dir, c]);
        // 2 steps from start
        if (r === startRow && !currentBoard[r + dir * 2][c]) {
          moves.push([r + dir * 2, c]);
        }
      }
      // Captures
      [-1, 1].forEach(dc => {
        const nc = c + dc;
        const nr = r + dir;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const target = currentBoard[nr][nc];
          if (target && target.color === oppColor) {
            moves.push([nr, nc]);
          }
        }
      });
    } else if (piece.type === 'n') {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightOffsets.forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
    } else if (piece.type === 'b') {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      dirs.forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (addIfValid(nr, nc)) {
          nr += dr;
          nc += dc;
        }
      });
    } else if (piece.type === 'r') {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (addIfValid(nr, nc)) {
          nr += dr;
          nc += dc;
        }
      });
    } else if (piece.type === 'q') {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (addIfValid(nr, nc)) {
          nr += dr;
          nc += dc;
        }
      });
    } else if (piece.type === 'k') {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => addIfValid(r + dr, c + dc));
    }

    return moves;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (gameResult) return;
    if (isSingleplayer && turn === 'b') return;

    if (selectedPos) {
      const [sr, sc] = selectedPos;
      // Check if clicked square is among valid moves
      const isMove = validMoves.some(([vr, vc]) => vr === r && vc === c);
      if (isMove) {
        executeMove(sr, sc, r, c);
        setSelectedPos(null);
        setValidMoves([]);
        return;
      }
    }

    // Select piece
    const piece = board[r][c];
    if (piece && piece.color === turn) {
      setSelectedPos([r, c]);
      setValidMoves(getMovesForSquare(r, c, board));
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  };

  const executeMove = (sr: number, sc: number, dr: number, dc: number) => {
    const movingPiece = board[sr][sc];
    if (!movingPiece) return;

    const targetPiece = board[dr][dc];
    const newBoard = board.map(row => [...row]);
    
    // Check if king captured (end of match)
    if (targetPiece?.type === 'k') {
      newBoard[dr][dc] = movingPiece;
      newBoard[sr][sc] = null;
      setBoard(newBoard);
      handleGameOver(movingPiece.color, 'Xeque-mate');
      return;
    }

    // Pawn promotion to Queen
    if (movingPiece.type === 'p' && (dr === 0 || dr === 7)) {
      newBoard[dr][dc] = { type: 'q', color: movingPiece.color };
    } else {
      newBoard[dr][dc] = movingPiece;
    }
    newBoard[sr][sc] = null;

    // Log notation
    const colLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const notation = `${movingPiece.type.toUpperCase()}${colLabels[sc]}${8 - sr} → ${colLabels[dc]}${8 - dr}${targetPiece ? ' ⚔️' : ''}`;
    setHistory(h => [notation, ...h.slice(0, 15)]);

    setBoard(newBoard);
    setTurn(turn === 'w' ? 'b' : 'w');
  };

  const makeCpuMove = () => {
    // Gather all possible moves for black
    const allMoves: { from: [number, number]; to: [number, number]; score: number }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.color === 'b') {
          const moves = getMovesForSquare(r, c, board);
          moves.forEach(([tr, tc]) => {
            let score = 0;
            const target = board[tr][tc];
            if (target) {
              if (target.type === 'k') score += 1000;
              else if (target.type === 'q') score += 90;
              else if (target.type === 'r') score += 50;
              else if (target.type === 'b' || target.type === 'n') score += 30;
              else if (target.type === 'p') score += 10;
            }
            // Add center control preference
            if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) score += 2;
            allMoves.push({ from: [r, c], to: [tr, tc], score });
          });
        }
      }
    }

    if (allMoves.length === 0) {
      handleGameOver('w', 'Sem lances legais');
      return;
    }

    // Sort or randomize by difficulty
    if (cpuDifficulty === 'pro') {
      allMoves.sort((a, b) => b.score - a.score);
    } else if (cpuDifficulty === 'easy') {
      // 50% random
      if (Math.random() > 0.5) allMoves.sort(() => Math.random() - 0.5);
    } else {
      // Medium / Advanced
      allMoves.sort((a, b) => b.score - a.score + (Math.random() * 5 - 2.5));
    }

    const chosen = allMoves[0];
    executeMove(chosen.from[0], chosen.from[1], chosen.to[0], chosen.to[1]);
  };

  const handleGameOver = (winnerColor: PieceColor | 'draw', reason: string) => {
    if (winnerColor === 'draw') {
      setGameResult('Empate!');
      onFinishMatch('draw');
    } else if (winnerColor === 'w') {
      setGameResult(`Vitória das Brancas (${reason})!`);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onFinishMatch('player1');
    } else {
      setGameResult(`Vitória das Negras (${reason})!`);
      onFinishMatch('player2');
    }
  };

  const selectedPiece = selectedPos ? board[selectedPos[0]][selectedPos[1]] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start justify-center p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Board Column */}
      <div className="flex flex-col items-center w-full max-w-[460px] mx-auto">
        {/* Opponent Info Header */}
        <div className="w-full flex items-center justify-between bg-[#141414] border border-[#222] px-4 py-2 rounded-t-xl mb-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-800 border border-neutral-600" />
            <span className="text-sm font-semibold text-neutral-300">
              {isSingleplayer ? `CPU CrypBot (${cpuDifficulty.toUpperCase()})` : 'Adversário'}
            </span>
            {turn === 'b' && !gameResult && (
              <span className="text-xs bg-[#FF6A00]/20 text-[#FF6A00] px-2 py-0.5 rounded font-mono animate-pulse">
                Pensando...
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm font-mono bg-[#0d0d0d] px-2.5 py-1 rounded text-neutral-300 border border-[#262626]">
            <Clock className="w-3.5 h-3.5 text-[#FF6A00]" />
            {formatTime(timerB)}
          </div>
        </div>

        {/* 8x8 Board */}
        <div className="w-full aspect-square bg-[#121212] p-1.5 rounded-lg border-2 border-[#2b2b2b] shadow-2xl relative">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded overflow-hidden">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
                const isValidDest = validMoves.some(([vr, vc]) => vr === r && vc === c);

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    className={`relative flex items-center justify-center transition-all select-none
                      ${isLight ? 'bg-[#333333]' : 'bg-[#181818]'}
                      ${isSelected ? 'ring-2 ring-[#FF6A00] bg-orange-950/40' : ''}
                      hover:brightness-110 active:scale-95`}
                  >
                    {/* Move hint dots */}
                    {isValidDest && (
                      <div
                        className={`absolute rounded-full z-10 ${
                          piece
                            ? 'w-6 h-6 border-2 border-[#FF6A00] bg-[#FF6A00]/30 animate-pulse'
                            : 'w-3 h-3 bg-[#FF6A00]/70'
                        }`}
                      />
                    )}

                    {/* Piece Symbol */}
                    {piece && (
                      <span
                        className={`text-2xl sm:text-4xl drop-shadow-md transition-transform ${
                          piece.color === 'w' ? 'text-amber-100' : 'text-neutral-900'
                        }`}
                        style={{
                          textShadow: piece.color === 'b' ? '0 0 2px rgba(255,255,255,0.4)' : '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        {PIECE_SYMBOLS[piece.color][piece.type]}
                      </span>
                    )}

                    {/* Coordinates label */}
                    {c === 0 && (
                      <span className="absolute top-0.5 left-1 text-[9px] font-mono text-neutral-500 pointer-events-none">
                        {8 - r}
                      </span>
                    )}
                    {r === 7 && (
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-neutral-500 pointer-events-none">
                        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c]}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Player Info Footer */}
        <div className="w-full flex items-center justify-between bg-[#141414] border border-[#222] px-4 py-2 rounded-b-xl mt-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300" />
            <span className="text-sm font-semibold text-white">Você (Brancas)</span>
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

      {/* Side HUD & Controls */}
      <div className="w-full lg:w-72 flex flex-col gap-3">
        {/* Pot & Economy Box */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-3.5">
          <div className="flex items-center justify-between border-b border-[#262626] pb-2 mb-2">
            <span className="text-xs text-neutral-400">Pote da Partida</span>
            <span className="text-base font-bold text-[#FF6A00] font-mono">
              {economy.betPerPlayer * 2} RC
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#1b1b1b] p-2 rounded border border-[#262626]">
              <span className="text-neutral-400 block">Prêmio Final</span>
              <span className="font-bold text-[#20D67B] font-mono text-sm">
                {economy.winnerPrize} RC
              </span>
            </div>
            <div className="bg-[#1b1b1b] p-2 rounded border border-[#262626]">
              <span className="text-neutral-400 block">Rake Total (15%)</span>
              <span className="font-bold text-neutral-300 font-mono text-sm">
                {economy.totalRake} RC
              </span>
            </div>
          </div>
        </div>

        {/* Feature from Prompt: "Mostrar jogabilidade das peças" */}
        <div className="bg-[#171717] border border-[#262626] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              <HelpCircle className="w-4 h-4 text-[#FF6A00]" />
              <span>Jogabilidade das Peças</span>
            </div>
            <button
              onClick={() => setShowMoveHelp(!showMoveHelp)}
              className={`text-[11px] px-2 py-0.5 rounded font-mono transition-colors ${
                showMoveHelp ? 'bg-[#FF6A00] text-black font-bold' : 'bg-[#262626] text-neutral-400'
              }`}
            >
              {showMoveHelp ? 'ATIVADO' : 'DESATIVADO'}
            </button>
          </div>

          {selectedPiece && showMoveHelp ? (
            <div className="bg-[#101010] p-2.5 rounded border border-orange-500/30 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl text-[#FF6A00]">
                  {PIECE_SYMBOLS[selectedPiece.color][selectedPiece.type]}
                </span>
                <div>
                  <span className="font-bold text-white block">
                    {PIECE_NAMES[selectedPiece.type][language]}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {validMoves.length} movimento(s) disponível(is)
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                {selectedPiece.type === 'n' && 'Salta em formato de L (2 casas retas + 1 lateral). Ignora peças no caminho.'}
                {selectedPiece.type === 'b' && 'Move-se livremente pelas diagonais da sua cor.'}
                {selectedPiece.type === 'r' && 'Move-se em linhas retas (colunas e fileiras).'}
                {selectedPiece.type === 'q' && 'Combina o poder da Torre e do Bispo em qualquer direção.'}
                {selectedPiece.type === 'k' && 'Move-se 1 casa em qualquer direção.'}
                {selectedPiece.type === 'p' && 'Avança 1 casa para frente (2 no 1º lance) e captura nas diagonais.'}
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-400">
              Clique em qualquer peça para ver a área de alcance e lances válidos com indicadores visuais.
            </p>
          )}
        </div>

        {/* Move History */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-3 max-h-36 overflow-y-auto">
          <span className="text-xs font-semibold text-neutral-400 block mb-1.5">
            Histórico de Lances
          </span>
          {history.length === 0 ? (
            <span className="text-xs text-neutral-600 italic">Nenhum lance efetuado</span>
          ) : (
            <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
              {history.map((h, idx) => (
                <span key={idx} className="bg-[#1c1c1c] px-1.5 py-0.5 rounded text-neutral-300">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* In-Game Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => handleGameOver('b', 'Desistência voluntária')}
            disabled={!!gameResult}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1e1e1e] hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-[#2c2c2c] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Flag className="w-3.5 h-3.5" />
            Desistir
          </button>
          <button
            onClick={() => handleGameOver('draw', 'Acordo entre jogadores')}
            disabled={!!gameResult}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1e1e1e] hover:bg-neutral-800 text-neutral-300 border border-[#2c2c2c] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Handshake className="w-3.5 h-3.5" />
            Propor Empate
          </button>
        </div>

        {/* Match Result Overlay/Alert */}
        {gameResult && (
          <div className="bg-gradient-to-r from-orange-950/80 to-black border border-[#FF6A00] p-3 rounded-xl text-center">
            <span className="text-base font-bold text-white block">{gameResult}</span>
            <span className="text-xs text-[#20D67B] block mt-1">
              Partida finalizada e saldo liquidado!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
