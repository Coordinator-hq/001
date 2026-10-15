import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2, Timer } from 'lucide-react';
import { Team, FanActivityEvent } from '../types/game';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { initiateFlutterwavePayment } from '../utils/flutterwave';
import diamondKingImg from '../assets/images/diamond_king_original_1791989314302.jpg';
import babsCardiniImg from '../assets/images/babs_cardini_original_1791989347023.jpg';

interface PvPBattleDashboardProps {
  teams: Team[];
  onPaymentSuccess: (teamId: string, amount: number) => void;
  recentEvents?: FanActivityEvent[];
}

export const PvPBattleDashboard: React.FC<PvPBattleDashboardProps> = ({
  teams,
  onPaymentSuccess,
  recentEvents
}) => {
  // Find Diamond King and Babs Cardini explicitly
  const diamondKing = teams.find((t) => t.id === 'diamond_king') || teams[0];
  const babsCardini = teams.find((t) => t.id === 'babs_cardini') || teams[1] || teams[0];

  const totalPot = (diamondKing?.totalBalance || 0) + (babsCardini?.totalBalance || 0);

  // Dynamic percentage calculation (defaults to 50/50 when pot is zero)
  const hasPot = totalPot > 0;
  const diamondKingPct = hasPot ? Math.round((diamondKing.totalBalance / totalPot) * 100) : 50;
  const babsCardiniPct = hasPot ? 100 - diamondKingPct : 50;

  // 10-Minute Battle Countdown Timer (Starts NOW for 10 minutes: 10:00 -> 00:00)
  const DURATION_SECONDS = 10 * 60; // 600 seconds
  const TIMER_STORAGE_KEY = 'fanbrawl_battle_timer_10m_now_v1';

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    const now = Date.now();
    if (saved) {
      const target = parseInt(saved, 10);
      if (!isNaN(target) && target > now && target <= now + DURATION_SECONDS * 1000) {
        return Math.floor((target - now) / 1000);
      }
    }
    // Set timer to start right NOW for 10 minutes
    const newTarget = now + DURATION_SECONDS * 1000;
    localStorage.setItem(TIMER_STORAGE_KEY, newTarget.toString());
    return DURATION_SECONDS;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let target = parseInt(localStorage.getItem(TIMER_STORAGE_KEY) || '0', 10);

      // Reset to a fresh 10-minute round when finished
      if (!target || target <= now) {
        target = now + DURATION_SECONDS * 1000;
        localStorage.setItem(TIMER_STORAGE_KEY, target.toString());
      }

      const remaining = Math.max(0, Math.floor((target - now) / 1000));
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Selected magician to gift to (defaults to Diamond King)
  const [selectedTeamId, setSelectedTeamId] = useState<'diamond_king' | 'babs_cardini'>('diamond_king');
  const activeTeam = selectedTeamId === 'diamond_king' ? diamondKing : babsCardini;

  // Gifting state
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // 8 Preset Denominations strictly matching the reference design:
  // Row 1: ₦100, ₦200, ₦500, ₦1,000
  // Row 2: ₦2,000, ₦5,000, ₦10,000, ₦20,000
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
      customerName: 'Fan Supporter',
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

  const activeColor = selectedTeamId === 'diamond_king' ? '#EF4444' : '#3B82F6';

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4 font-sans select-none animate-fadeIn pb-6">
      
      {/* Success Notification Alert */}
      {successNotice && (
        <div className="bg-emerald-500/90 border border-emerald-400 text-white p-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-center text-sm font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* CARD 1: Percentage Bar, Pot Balance, Live Timer & Horizontal Diamond King vs Babs Cardini */}
      <div className="bg-[#0b0c16] border border-[#1e2238] rounded-[28px] p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        
        {/* Top: Percentages, Pot Balance & Live Timer */}
        <div className="flex justify-between items-center px-1 mb-2.5">
          <div className="flex flex-col items-start">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {diamondKingPct}%
            </span>
          </div>

          <div className="text-center flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase block">
              POT BALANCE
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400 tabular-nums">
              ₦{totalPot.toLocaleString()}
            </span>
            
            {/* 10-Minute Battle Countdown Timer */}
            <div
              className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-200 bg-slate-900/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full shadow-md"
            >
              <Timer className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="tabular-nums font-bold tracking-wider text-slate-100">
                {timerDisplay}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {babsCardiniPct}%
            </span>
          </div>
        </div>

        {/* Dynamic Dual-Color Percentage Bar */}
        <div className="w-full h-3.5 sm:h-4 bg-[#141628] rounded-full overflow-hidden flex border border-[#232742] p-0.5 shadow-inner">
          {/* Diamond King Left Portion (Vibrant Red) */}
          <div
            className="h-full bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#F87171] rounded-l-full transition-all duration-700 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
            style={{ width: `${diamondKingPct}%` }}
          />
          {/* Babs Cardini Right Portion (Vibrant Blue) */}
          <div
            className="h-full bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#60A5FA] rounded-r-full transition-all duration-700 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            style={{ width: `${babsCardiniPct}%` }}
          />
        </div>

        {/* Dynamic Live Balance Sub-bar */}
        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 mt-2 px-1">
          <span className="text-[#EF4444] tabular-nums">
            ₦{diamondKing.totalBalance.toLocaleString()}
          </span>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
            Tap magician to gift
          </span>
          <span className="text-[#3B82F6] tabular-nums">
            ₦{babsCardini.totalBalance.toLocaleString()}
          </span>
        </div>

        {/* Real-time simulated fan activity live ticker */}
        {recentEvents && recentEvents.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5 py-1 px-3 rounded-full bg-[#121424] border border-[#232742] text-[10px] text-slate-300 animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-white">{recentEvents[0].fanName}</span>
            <span className="text-slate-400">gifted</span>
            <span className="font-black text-amber-400 tabular-nums">₦{recentEvents[0].amount.toLocaleString()}</span>
            <span className="text-slate-400">to</span>
            <span
              className="font-bold"
              style={{ color: recentEvents[0].teamId === 'diamond_king' ? '#EF4444' : '#3B82F6' }}
            >
              {recentEvents[0].teamName}
            </span>
          </div>
        )}

        {/* Matchup Portraits Section: Diamond King v Babs Cardini with "Vs" Badge */}
        <div className="relative mt-3.5 grid grid-cols-2 gap-2 sm:gap-2.5">
          
          {/* Diamond King Portrait Card (Left) */}
          <button
            type="button"
            onClick={() => setSelectedTeamId('diamond_king')}
            aria-label="Select Diamond King"
            className={`relative aspect-square sm:aspect-[4/4.5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group text-left border ${
              selectedTeamId === 'diamond_king'
                ? 'border-2 border-[#EF4444] shadow-[0_0_22px_rgba(239,68,68,0.4)] scale-[1.01]'
                : 'border-[#1e2238] hover:border-[#EF4444]/60 opacity-90 hover:opacity-100'
            }`}
          >
            <img
              src={diamondKing.logoUrl || diamondKingImg || '/images/diamond_king.jpg'}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/diamond_king.jpg')) {
                  target.src = '/images/diamond_king.jpg';
                }
              }}
              alt="Diamond King"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            {/* Vignette Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

            {/* Bottom Name Label */}
            <div className="absolute bottom-2 sm:bottom-2.5 inset-x-0 text-center pointer-events-none px-1">
              <span className="text-base sm:text-lg font-black text-white tracking-wide drop-shadow-md block leading-tight">
                Diamond King
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                Magician
              </span>
            </div>

            {/* Active Glow Indicator */}
            {selectedTeamId === 'diamond_king' && (
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />
            )}
          </button>

          {/* Center Stylized "Vs" Badge Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-black italic text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.7)]">
              Vs
            </span>
          </div>

          {/* Babs Cardini Portrait Card (Right) */}
          <button
            type="button"
            onClick={() => setSelectedTeamId('babs_cardini')}
            aria-label="Select Babs Cardini"
            className={`relative aspect-square sm:aspect-[4/4.5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group text-left border ${
              selectedTeamId === 'babs_cardini'
                ? 'border-2 border-[#3B82F6] shadow-[0_0_22px_rgba(59,130,246,0.4)] scale-[1.01]'
                : 'border-[#1e2238] hover:border-[#3B82F6]/60 opacity-90 hover:opacity-100'
            }`}
          >
            <img
              src={babsCardini.logoUrl || babsCardiniImg || '/images/babs_cardini.jpg'}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/images/babs_cardini.jpg')) {
                  target.src = '/images/babs_cardini.jpg';
                }
              }}
              alt="Babs Cardini"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
            {/* Vignette Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

            {/* Bottom Name Label */}
            <div className="absolute bottom-2 sm:bottom-2.5 inset-x-0 text-center pointer-events-none px-1">
              <span className="text-base sm:text-lg font-black text-white tracking-wide drop-shadow-md block leading-tight">
                Babs Cardini
              </span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                Magician
              </span>
            </div>

            {/* Active Glow Indicator */}
            {selectedTeamId === 'babs_cardini' && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]" />
            )}
          </button>

        </div>
      </div>

      {/* CARD 2: Gifting Denominations, Custom Amount & Dynamic Readout */}
      <div className="bg-[#0b0c16] border border-[#1e2238] rounded-[28px] p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
        
        {/* Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Choose <span className="text-slate-300">Amount</span>
          </h2>

          {/* Active target badge */}
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#121424] border border-[#232742]">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: activeColor }}
            />
            <span className="text-slate-300">Gifting:</span>
            <span className="font-bold text-white">{activeTeam.name}</span>
          </div>
        </div>

        {/* 4x2 Grid of Gifting Denominations */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {presetAmounts.map((val) => {
            const isSelected = selectedAmount === val && customAmount === '';

            // Selected button border/glow matches the active magician's color (red or blue)
            const activeStyle = selectedTeamId === 'diamond_king'
              ? 'border-2 border-[#EF4444] text-white bg-[#EF4444]/15 shadow-[0_0_16px_rgba(239,68,68,0.3)]'
              : 'border-2 border-[#3B82F6] text-white bg-[#3B82F6]/15 shadow-[0_0_16px_rgba(59,130,246,0.3)]';

            return (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectPreset(val)}
                className={`py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  isSelected
                    ? activeStyle
                    : 'border border-[#232742] bg-[#121424] hover:border-[#383d63] text-slate-200'
                }`}
              >
                ₦{val.toLocaleString()}
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input & Glowing Gift Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Custom Amount Input with Double-Stroked Naira Symbol */}
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

          {/* Gifting Button with Glowing Box */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            aria-label={`Gift ₦${selectedAmount.toLocaleString()} to ${activeTeam.name}`}
            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all disabled:opacity-50 ${
              selectedTeamId === 'diamond_king'
                ? 'border-red-500/70 bg-gradient-to-br from-red-700/30 to-red-500/25 hover:from-red-700/50 hover:to-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                : 'border-blue-500/70 bg-gradient-to-br from-blue-700/30 to-blue-500/25 hover:from-blue-700/50 hover:to-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.35)]'
            }`}
          >
            <Gift
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                selectedTeamId === 'diamond_king' ? 'text-red-400' : 'text-blue-400'
              }`}
            />
          </button>
        </div>

        {/* Dynamic Readout of the Amount Being Gifted */}
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
              {activeTeam.name}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
