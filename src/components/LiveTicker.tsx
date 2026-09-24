import React from 'react';
import { TickerEvent } from '../types';
import { Radio } from 'lucide-react';

interface LiveTickerProps {
  events: TickerEvent[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ events }) => {
  return (
    <div className="w-full bg-[#0d0d0d] border-y border-[#1c1c1c] overflow-hidden flex items-center h-10 select-none">
      {/* Fixed left tag */}
      <div className="flex items-center gap-1.5 px-3 bg-[#FF6A00] text-black font-black text-[11px] h-full z-10 shrink-0 font-mono">
        <span className="w-2 h-2 rounded-full bg-black animate-ping" />
        <Radio className="w-3.5 h-3.5" />
        <span>AO VIVO</span>
      </div>

      {/* Marquee track */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {events.concat(events).map((event, idx) => (
            <div key={`${event.id}-${idx}`} className="inline-flex items-center gap-2 mx-5 text-xs text-neutral-300">
              <span className="text-sm">{event.icon}</span>
              <span className="font-semibold text-neutral-200">{event.text}</span>
              {event.highlight && (
                <span className="text-[#20D67B] font-mono font-bold bg-[#20D67B]/10 px-1.5 py-0.5 rounded text-[11px]">
                  {event.highlight}
                </span>
              )}
              <span className="text-[10px] text-neutral-500 font-mono">({event.timeAgo})</span>
              <span className="text-neutral-700 ml-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
