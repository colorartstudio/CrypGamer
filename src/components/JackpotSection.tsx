import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Sparkles, AlertCircle, Award, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface JackpotSectionProps {
  jackpotAmount: number;
  language: Language;
  onOpenRules?: () => void;
}

export const JackpotSection: React.FC<JackpotSectionProps> = ({
  jackpotAmount,
  language,
}) => {
  const t = translations[language];
  const [timeLeft, setTimeLeft] = useState(2538); // seconds to next draw

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHours = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-gradient-to-r from-orange-950/30 via-[#141414] to-amber-950/20 border border-[#2b2b2b] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6A00]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left: Trophy and title */}
        <div className="flex items-center gap-4 text-left w-full lg:w-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF8A1F] flex items-center justify-center shadow-lg glow-orange shrink-0">
            <Trophy className="w-8 h-8 text-black fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#FF6A00] uppercase tracking-wider">
                {t.jackpotTitle}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#20D67B] animate-ping" />
            </div>
            <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
              <span>{jackpotAmount.toLocaleString()}</span>
              <span className="text-[#FF6A00] text-xl font-mono">RC</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md mt-0.5">
              {t.jackpotExplain}
            </p>
          </div>
        </div>

        {/* Right: Countdown & Last Winner */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
              {t.nextDraw}
            </span>
            <div className="flex items-center justify-center gap-1.5 font-mono text-base sm:text-lg font-bold text-[#20D67B]">
              <Clock className="w-4 h-4" />
              <span>{formatHours(timeLeft)}</span>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
              {t.lastWinner}
            </span>
            <div className="flex items-center justify-center gap-1 font-mono text-xs sm:text-sm font-bold text-white truncate">
              <Award className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span className="truncate">CyberMaster_X</span>
            </div>
            <span className="text-[10px] text-[#FF6A00] font-mono">+12.400 RC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
