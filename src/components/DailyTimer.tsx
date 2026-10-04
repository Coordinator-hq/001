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

      // Next 00:00:00 in GMT+1
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
    <div className={`flex items-center justify-center gap-3 bg-slate-900/95 border border-amber-500/40 rounded-2xl py-3 px-6 shadow-xl w-fit mx-auto ${className}`}>
      <Timer className="w-5 h-5 text-amber-400 shrink-0" />
      <div className="flex items-center gap-2 font-mono font-black text-xl sm:text-2xl text-amber-300 drop-shadow">
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
    </div>
  );
};
