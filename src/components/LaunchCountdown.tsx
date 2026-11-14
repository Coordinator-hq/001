import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Crown } from 'lucide-react';

// Target: January 25, 2027 at 00:00:00 WAT (UTC+1, Lagos Time)
const LAUNCH_TIMESTAMP = new Date('2027-01-25T00:00:00+01:00').getTime();

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

function getTimeRemaining(): TimeRemaining {
  const now = Date.now();
  const diff = LAUNCH_TIMESTAMP - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, isLive: false };
}

export const LaunchCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(() => getTimeRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (val: number) => String(val).padStart(2, '0');

  const units = [
    { label: 'DAYS', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'HRS', value: pad(timeLeft.hours) },
    { label: 'MINS', value: pad(timeLeft.minutes) },
    { label: 'SECS', value: pad(timeLeft.seconds) }
  ];

  return (
    <section
      aria-label="Platform Launch Countdown"
      className="mb-4 bg-gradient-to-br from-[#0e1222] via-[#0b0e1a] to-[#080a12] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Launch Headline & Date Metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-black text-amber-400 tracking-widest">
              FANWARS NIGERIA
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-white tracking-wide leading-snug">
            {timeLeft.isLive ? 'PLATFORM IS NOW LIVE' : 'COUNTDOWN TO OFFICIAL LAUNCH'}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold text-slate-400 mt-1 tracking-wider">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>JANUARY 25, 2027</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
              <span>00:00 WAT</span>
            </span>
          </div>
        </div>

        {/* Right: 4-Unit Tabular Digital Countdown */}
        {timeLeft.isLive ? (
          <div className="px-5 py-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-sm font-black tracking-wider whitespace-nowrap shrink-0">
            LIVE NOW
          </div>
        ) : (
          <div
            className="grid grid-cols-4 gap-2 sm:gap-2.5 shrink-0"
            role="timer"
            aria-live="off"
          >
            {units.map((unit, index) => (
              <div
                key={unit.label}
                className={`flex flex-col items-center justify-center min-w-[60px] sm:min-w-[72px] py-2.5 px-2 rounded-xl bg-[#060810] border ${
                  index === units.length - 1
                    ? 'border-amber-500/40'
                    : 'border-[#1f2540]'
                }`}
              >
                <span
                  className={`font-mono text-xl sm:text-2xl font-black tabular-nums leading-none ${
                    index === units.length - 1 ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {unit.value}
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 mt-1.5 tracking-widest">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
