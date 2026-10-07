import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface VersusTimerProps {
  onRoundFinish?: () => void;
  className?: string;
}

export const VersusTimer: React.FC<VersusTimerProps> = ({ onRoundFinish, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<{ minutes: string; seconds: string }>({
    minutes: '10',
    seconds: '00'
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const TEN_MINUTES_IN_SECONDS = 10 * 60; // 600 seconds
      const nowSeconds = Math.floor(Date.now() / 1000);
      const elapsedInTenMinBlock = nowSeconds % TEN_MINUTES_IN_SECONDS;
      const remaining = TEN_MINUTES_IN_SECONDS - elapsedInTenMinBlock;

      const m = Math.floor(remaining / 60);
      const s = remaining % 60;

      if (remaining === TEN_MINUTES_IN_SECONDS && onRoundFinish) {
        onRoundFinish();
      }

      setTimeLeft({
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [onRoundFinish]);

  return (
    <div className={`flex items-center justify-center gap-2 bg-slate-900/95 border border-amber-500/40 rounded-2xl py-2 px-4 shadow-xl uppercase ${className}`}>
      <Timer className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <div className="flex items-center gap-1 font-mono font-black text-lg sm:text-xl text-amber-300 drop-shadow uppercase">
        <span className="bg-slate-950 px-2 py-0.5 rounded-lg border border-amber-500/30">
          {timeLeft.minutes}M
        </span>
        <span className="text-amber-500">:</span>
        <span className="bg-slate-950 px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-400">
          {timeLeft.seconds}S
        </span>
      </div>
    </div>
  );
};
