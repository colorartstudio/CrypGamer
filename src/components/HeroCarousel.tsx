import React, { useState, useEffect } from 'react';
import { BannerSlide } from '../types';
import { ChevronLeft, ChevronRight, Play, Flame, Trophy } from 'lucide-react';

interface HeroCarouselProps {
  banners: BannerSlide[];
  onSelectGameBySlug: (slug: string) => void;
  onOpenJackpot: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  onSelectGameBySlug,
  onOpenJackpot,
}) => {
  const activeBanners = banners.filter(b => b.active).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex];

  const handleActionClick = () => {
    if (current.id === 'b4') {
      onOpenJackpot();
    } else if (current.relatedGameSlug) {
      onSelectGameBySlug(current.relatedGameSlug);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#111] border border-[#222] group shadow-2xl">
      {/* Background Image & Ambient Gradients */}
      <div className="relative min-h-[300px] sm:min-h-[360px] md:min-h-[420px] flex items-center">
        <img
          src={current.image}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        {/* Content Box */}
        <div className="relative z-10 max-w-2xl p-6 sm:p-10 md:p-12 flex flex-col items-start">
          {/* Badge */}
          {current.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-[#FF6A00] text-xs font-bold font-mono uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 fill-[#FF6A00]" />
              {current.badge}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-none uppercase drop-shadow-md">
            {current.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed max-w-lg drop-shadow">
            {current.subtitle}
          </p>

          {/* CTA Action Button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleActionClick}
              className="px-6 py-3 rounded-xl bg-[#FF6A00] hover:bg-[#FF8A1F] active:scale-95 text-black font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-xl glow-orange cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              {current.buttonText}
            </button>
            <button
              onClick={onOpenJackpot}
              className="px-4 py-3 rounded-xl bg-[#1a1a1a]/80 hover:bg-[#252525] border border-white/10 text-xs font-bold text-neutral-200 transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FF6A00]" />
              Jackpot 18.492 RC
            </button>
          </div>
        </div>

        {/* Prev / Next Buttons */}
        {activeBanners.length > 1 && (
          <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
              className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1 px-1">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-[#FF6A00]' : 'w-2 bg-neutral-600'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % activeBanners.length)}
              className="p-2 rounded-lg bg-black/60 hover:bg-black/90 border border-white/10 text-white transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
