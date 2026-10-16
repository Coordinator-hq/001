import React, { useState, useEffect, useRef } from 'react';
import { Gift, CheckCircle2, Timer } from 'lucide-react';
import { Team, FanActivityEvent } from '../types/game';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { initiateFlutterwavePayment } from '../utils/flutterwave';
import { getGmt1CountdownSeconds, formatCountdownTime } from '../utils/timer';

interface PvPBattleDashboardProps {
  battleId?: string;
  battleTitle?: string;
  battleSubtitle?: string;
  battleCategory?: string;
  teams: [Team, Team];
  onPaymentSuccess: (teamId: string, amount: number) => void;
  recentEvents?: FanActivityEvent[];
  currentIndex?: number;
  totalBattles?: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSelectBattle?: (index: number) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const PvPBattleDashboard: React.FC<PvPBattleDashboardProps> = ({
  teams,
  onPaymentSuccess,
  recentEvents,
  onSwipeLeft,
  onSwipeRight,
  onMouseEnter,
  onMouseLeave
}) => {
  const team1 = teams[0];
  const team2 = teams[1];

  // Strict Red and Blue theme for every battle:
  const RED_COLOR = '#EF4444';
  const BLUE_COLOR = '#3B82F6';

  const totalPot = (team1?.totalBalance || 0) + (team2?.totalBalance || 0);

  // Dynamic percentage calculation
  const hasPot = totalPot > 0;
  const team1Pct = hasPot ? Math.round((team1.totalBalance / totalPot) * 100) : 50;
  const team2Pct = hasPot ? 100 - team1Pct : 50;

  // 24-Hour Countdown Timer
  const [timeLeft, setTimeLeft] = useState<number>(() => getGmt1CountdownSeconds());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getGmt1CountdownSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timerDisplay = formatCountdownTime(timeLeft);

  // Selected team to gift to
  const [selectedTeamId, setSelectedTeamId] = useState<string>(team1.id);

  useEffect(() => {
    if (selectedTeamId !== team1.id && selectedTeamId !== team2.id) {
      setSelectedTeamId(team1.id);
    }
  }, [team1.id, team2.id, selectedTeamId]);

  const isTeam1 = selectedTeamId === team1.id;
  const activeTeam = isTeam1 ? team1 : team2;
  const activeColor = isTeam1 ? RED_COLOR : BLUE_COLOR;

  // Gifting state
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const presetAmounts = [100, 200, 500, 1000, 2000, 5000, 10000, 20000];

  const handleSelectPreset = (val: number) => {
    setSelectedAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) {
      setSelectedAmount(num);
    } else {
      setSelectedAmount(0);
    }
  };

  const handlePay = () => {
    const amountToGift = selectedAmount;
    if (amountToGift < 100) {
      alert('Minimum gift amount is ₦100');
      return;
    }

    setIsProcessing(true);
    initiateFlutterwavePayment({
      amount: amountToGift,
      teamId: activeTeam.id,
      teamName: activeTeam.name,
      customerEmail: 'fan@fanbrawl.com',
      customerName: 'Real Fan Supporter',
      onSuccess: () => {
        setIsProcessing(false);
        setSuccessNotice(`Gifted ₦${amountToGift.toLocaleString()} to ${activeTeam.name}!`);
        soundManager.playLevelUp();
        triggerConfetti();
        onPaymentSuccess(activeTeam.id, amountToGift);

        setTimeout(() => {
          setSuccessNotice(null);
        }, 4000);
      },
      onClose: () => {
        setIsProcessing(false);
      }
    });
  };

  // Touch Swipe Gesture Detection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="w-full max-w-[480px] mx-auto space-y-4 font-sans select-none animate-slideIn pb-6"
    >
      {/* Success Notification Alert */}
      {successNotice && (
        <div className="bg-emerald-500/90 border border-emerald-400 text-white p-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-center text-sm font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* CARD 1: Percentage Bar, Pot Balance, Clean Timer & Head-to-Head Visuals */}
      <div className="bg-[#0b0c16] border border-[#1e2238] rounded-[28px] p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Top: Percentages, Pot Balance & Clean Timer */}
        <div className="flex justify-between items-center px-1 mb-2.5">
          <div className="flex flex-col items-start">
            <span
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: RED_COLOR }}
            >
              {team1Pct}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {team1.tag}
            </span>
          </div>

          <div className="text-center flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase block">
              POT BALANCE
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
              ₦{totalPot.toLocaleString()}
            </span>
            
            {/* Clean Countdown Timer */}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-200 bg-slate-900/90 border border-slate-700/60 px-2.5 py-0.5 rounded-full shadow-md">
              <Timer className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="tabular-nums font-bold tracking-wider text-slate-100">
                {timerDisplay}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: BLUE_COLOR }}
            >
              {team2Pct}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {team2.tag}
            </span>
          </div>
        </div>

        {/* Dynamic Dual-Color Percentage Bar (Strictly Red and Blue) */}
        <div className="w-full h-3.5 sm:h-4 bg-[#141628] rounded-full overflow-hidden flex border border-[#232742] p-0.5 shadow-inner">
          <div
            className="h-full rounded-l-full transition-all duration-700"
            style={{
              width: `${team1Pct}%`,
              backgroundColor: RED_COLOR,
              boxShadow: '0 0 14px rgba(239, 68, 68, 0.6)'
            }}
          />
          <div
            className="h-full rounded-r-full transition-all duration-700"
            style={{
              width: `${team2Pct}%`,
              backgroundColor: BLUE_COLOR,
              boxShadow: '0 0 14px rgba(59, 130, 246, 0.6)'
            }}
          />
        </div>

        {/* Dynamic Live Balance Sub-bar */}
        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mt-2 px-1">
          <span
            className="tabular-nums font-extrabold"
            style={{ color: RED_COLOR }}
          >
            ₦{team1.totalBalance.toLocaleString()}
          </span>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
            Tap star to gift
          </span>
          <span
            className="tabular-nums font-extrabold"
            style={{ color: BLUE_COLOR }}
          >
            ₦{team2.totalBalance.toLocaleString()}
          </span>
        </div>

        {/* Real-time fan activity live ticker */}
        {recentEvents && recentEvents.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5 py-1 px-3 rounded-full bg-[#121424] border border-[#232742] text-[10px] text-slate-300 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-white truncate max-w-[110px]">
              {recentEvents[0].fanName}
            </span>
            <span className="text-slate-400">gifted</span>
            <span className="font-black text-amber-400 tabular-nums">
              ₦{recentEvents[0].amount.toLocaleString()}
            </span>
            <span className="text-slate-400">to</span>
            <span
              className="font-bold truncate max-w-[100px]"
              style={{
                color: recentEvents[0].teamId === team1.id ? RED_COLOR : BLUE_COLOR
              }}
            >
              {recentEvents[0].teamName}
            </span>
          </div>
        )}

        {/* Matchup Portraits Section: Team 1 (Red) vs Team 2 (Blue) */}
        <div className="relative mt-3.5 grid grid-cols-2 gap-2 sm:gap-2.5">
          
          {/* Team 1 Portrait Card (Left - Red) */}
          <button
            type="button"
            onClick={() => setSelectedTeamId(team1.id)}
            aria-label={`Select ${team1.name}`}
            className={`relative aspect-square sm:aspect-[4/4.5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group text-left border ${
              isTeam1
                ? 'border-2 scale-[1.01]'
                : 'border-[#1e2238] opacity-90 hover:opacity-100'
            }`}
            style={{
              borderColor: isTeam1 ? RED_COLOR : undefined,
              boxShadow: isTeam1 ? '0 0 22px rgba(239, 68, 68, 0.45)' : undefined
            }}
          >
            <img
              src={team1.logoUrl}
              alt={team1.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

            <div className="absolute bottom-2 sm:bottom-2.5 inset-x-0 text-center pointer-events-none px-1">
              <span className="text-base sm:text-lg font-black text-white tracking-wide drop-shadow-md block leading-tight">
                {team1.name}
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                {team1.slogan || team1.tag}
              </span>
            </div>

            {isTeam1 && (
              <div
                className="absolute top-2 left-2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: RED_COLOR,
                  boxShadow: `0 0 8px ${RED_COLOR}`
                }}
              />
            )}
          </button>

          {/* Center Stylized "Vs" Badge Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black italic text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.7)]">
              Vs
            </span>
          </div>

          {/* Team 2 Portrait Card (Right - Blue) */}
          <button
            type="button"
            onClick={() => setSelectedTeamId(team2.id)}
            aria-label={`Select ${team2.name}`}
            className={`relative aspect-square sm:aspect-[4/4.5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group text-left border ${
              !isTeam1
                ? 'border-2 scale-[1.01]'
                : 'border-[#1e2238] opacity-90 hover:opacity-100'
            }`}
            style={{
              borderColor: !isTeam1 ? BLUE_COLOR : undefined,
              boxShadow: !isTeam1 ? '0 0 22px rgba(59, 130, 246, 0.45)' : undefined
            }}
          >
            <img
              src={team2.logoUrl}
              alt={team2.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

            <div className="absolute bottom-2 sm:bottom-2.5 inset-x-0 text-center pointer-events-none px-1">
              <span className="text-base sm:text-lg font-black text-white tracking-wide drop-shadow-md block leading-tight">
                {team2.name}
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                {team2.slogan || team2.tag}
              </span>
            </div>

            {!isTeam1 && (
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: BLUE_COLOR,
                  boxShadow: `0 0 8px ${BLUE_COLOR}`
                }}
              />
            )}
          </button>
        </div>

      </div>

      {/* CARD 2: Interactive Gifting Stations */}
      <div className="bg-[#0b0c16] border border-[#1e2238] rounded-[28px] p-4 sm:p-5 shadow-2xl space-y-4">
        
        {/* Card Header with Active Star */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
            Choose Amount
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: activeColor }}
            />
            <span className="text-slate-300">Gifting:</span>
            <span
              className="font-bold"
              style={{ color: activeColor }}
            >
              {activeTeam.name}
            </span>
          </div>
        </div>

        {/* 4x2 Grid of Gifting Denominations */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {presetAmounts.map((val) => {
            const isSelected = selectedAmount === val && customAmount === '';

            return (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectPreset(val)}
                className="py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer"
                style={
                  isSelected
                    ? {
                        border: `2px solid ${activeColor}`,
                        color: '#FFFFFF',
                        backgroundColor: `${activeColor}25`,
                        boxShadow: `0 0 16px ${activeColor}55`
                      }
                    : {
                        border: '1px solid #232742',
                        backgroundColor: '#121424',
                        color: '#E2E8F0'
                      }
                }
              >
                ₦{val.toLocaleString()}
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input & Glowing Gift Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          <div
            className="flex-1 relative flex items-center bg-[#121424] border border-[#232742] rounded-xl px-3.5 sm:px-4 py-3 sm:py-3.5 transition-all"
            style={{
              borderColor: customAmount ? activeColor : undefined
            }}
          >
            <span className="text-slate-400 font-black text-base sm:text-lg select-none">
              ₦
            </span>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomChange}
              placeholder="Custom amount"
              className="w-full bg-transparent text-white placeholder-slate-500 font-medium text-xs sm:text-sm outline-none ml-2.5"
            />
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            aria-label={`Gift ₦${selectedAmount.toLocaleString()} to ${activeTeam.name}`}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
            style={{
              borderColor: `${activeColor}B3`,
              background: `linear-gradient(135deg, ${activeColor}40, ${activeColor}20)`,
              boxShadow: `0 0 20px ${activeColor}55`
            }}
          >
            <Gift
              className="w-5 h-5 sm:w-6 sm:h-6"
              style={{ color: activeColor }}
            />
          </button>
        </div>

        {/* Dynamic Readout */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#121424] border border-[#232742] text-xs font-semibold">
          <span className="text-slate-400">
            Dynamic Readout:
          </span>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-400">Gifting</span>
            <span className="text-white font-black tabular-nums">
              ₦{Number(selectedAmount || 0).toLocaleString()}
            </span>
            <span className="text-slate-400">to</span>
            <span
              className="font-black"
              style={{ color: activeColor }}
            >
              {activeTeam.name} ({activeTeam.tag})
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
