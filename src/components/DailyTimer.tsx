import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface DailyTimerProps {
  className?: string;
}

export const DailyTimer: React.FC<DailyTimerProps> = ({ className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // UTC timestamp in milliseconds
      const nowUtcMs = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      // GMT+1 timestamp in milliseconds
      const gmtPlusOneMs = nowUtcMs + (1 * 60 * 60 * 1000);
      const gmtPlusOneDate = new Date(gmtPlusOneMs);

      // Target is next 00:00:00 AM GMT+1 (24:00:00 of current day in GMT+1)
      const nextMidnightGmtPlusOne = new Date(gmtPlusOneDate);
      nextMidnightGmtPlusOne.setUTCHours(24, 0, 0, 0);

      const diffMs = nextMidnightGmtPlusOne.getTime() - gmtPlusOneDate.getTime();
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      setTimeLeft({
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/40 rounded-2xl px-5 py-3.5 shadow-xl ${className}`}>
      <div className="flex items-center gap-2 text-amber-400">
        <Timer className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
        <span className="text-base sm:text-lg font-bold font-cursive tracking-wide">
          24hr Round Reset:
        </span>
      </div>
      <div className="flex items-center gap-1.5 font-mono font-black text-lg sm:text-2xl text-amber-300 drop-shadow">
        <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/30">
          {timeLeft.hours}h
        </span>
        <span className="text-amber-500">:</span>
        <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/30">
          {timeLeft.minutes}m
        </span>
        <span className="text-amber-500">:</span>
        <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/30 text-amber-400">
          {timeLeft.seconds}s
        </span>
      </div>
      <div className="text-xs text-amber-400/80 font-sans tracking-wide">
        Starts 00:00 AM GMT+1
      </div>
    </div>
  );
};
