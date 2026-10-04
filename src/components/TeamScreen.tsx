import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Gift } from 'lucide-react';
import { Team } from '../types/game';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { initiateFlutterwavePayment } from '../utils/flutterwave';

interface TeamScreenProps {
  team: Team;
  rank: number;
  totalTeams: number;
  onBack: () => void;
  onPaymentSuccess: (teamId: string, amount: number) => void;
}

export const TeamScreen: React.FC<TeamScreenProps> = ({
  team,
  rank,
  totalTeams,
  onBack,
  onPaymentSuccess
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successAmount, setSuccessAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Touch swipe-right tracking to navigate back to leaderboard
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length === 0) return;
      
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      
      // Swipe Right detection: horizontally right by at least 65px and predominantly horizontal
      if (deltaX > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        onBack();
      }
      
      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onBack]);

  // Naira Presets
  const presets = [500, 1000, 2500, 5000, 10000, 25000, 50000];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    setErrorMessage('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    const num = parseInt(val, 10) || 0;
    setAmount(num);
    setErrorMessage('');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage('Please enter a valid gift amount.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    initiateFlutterwavePayment({
      amount: amount,
      customerEmail: `gifter_${Date.now()}@001leaderboard.com`,
      customerName: 'Anonymous Gifter',
      teamName: team.name,
      teamId: team.id,
      teamTag: team.tag,
      onSuccess: (response) => {
        setIsProcessing(false);
        const creditedAmount = response.amount || amount;
        onPaymentSuccess(team.id, creditedAmount);

        setSuccessAmount(creditedAmount);
        setIsSuccess(true);
        if (creditedAmount >= 5000) {
          soundManager.playWhaleDrop();
          triggerConfetti(['#F59E0B', '#10B981', '#6366F1', '#EC4899']);
        } else {
          soundManager.playCoin();
        }
        setTimeout(() => setIsSuccess(false), 5000);
      },
      onClose: () => {
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn pb-10 font-cursive text-amber-300 touch-pan-y text-sm sm:text-base leading-snug">
      {/* Back button with subtle swipe-right indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Back to Leaderboard</span>
        </button>
      </div>

      {/* Main Team Hero Banner in Compact Gold Cursive */}
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 tracking-wide drop-shadow">
                {team.name}
              </h1>
              <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-sm">
                {team.tag}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-400/90 mt-1.5 font-cursive">
              <span className="font-bold text-amber-300">
                Rank #{rank} of {totalTeams}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-medium">{team.fanCount.toLocaleString()} Total Gifts</span>
            </div>
          </div>

          {/* Prominent Team Total Balance Display in Naira */}
          <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3.5 sm:p-4 min-w-[200px] text-right w-full sm:w-auto shadow-inner">
            <span className="text-xs font-bold text-amber-400/90 uppercase tracking-wider block font-cursive">
              Total Balance
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums mt-0.5 drop-shadow font-cursive">
              ₦{team.totalBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-500/70 mt-0.5 font-sans">
              Verified 001 Pot Balance
            </div>
          </div>
        </div>
      </div>

      {/* Gift Console */}
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xl">
        <form onSubmit={handlePay} className="space-y-4">
          {/* Gift Amount Selection Presets in Naira */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wide font-cursive">
                Gift Amount (₦)
              </label>
            </div>

            {/* Presets with Compact Gold Highlighting */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer font-cursive ${
                    amount === preset
                      ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black border-yellow-200 shadow-md shadow-amber-500/25 text-xs sm:text-sm scale-105'
                      : 'bg-slate-950 border-amber-500/30 text-amber-300 hover:border-amber-400 text-xs sm:text-sm font-bold'
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-3 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-sm font-bold font-cursive">
                ₦
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Or enter custom gift amount in Naira..."
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-9 pr-3 py-2.5 text-sm sm:text-base font-bold text-amber-300 placeholder-amber-500/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-cursive"
              />
            </div>
          </div>

          {/* Error / Success Feedback in Gold */}
          {errorMessage && (
            <div className="text-xs text-rose-400 font-bold">
              {errorMessage}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-amber-500/15 border border-amber-400 rounded-xl text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Gift sent successfully! Gifted ₦{successAmount.toLocaleString()} to {team.name}'s pot!
              </span>
            </div>
          )}

          {/* Send Gift Button */}
          <button
            type="submit"
            disabled={amount <= 0 || isProcessing}
            className={`w-full py-3 px-5 rounded-xl font-bold text-sm sm:text-base tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer font-cursive ${
              isProcessing
                ? 'bg-slate-800 text-amber-400/50 cursor-wait border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25'
            }`}
          >
            <Gift className="w-4 h-4 text-slate-950" />
            <span>
              {isProcessing ? 'Processing Gift...' : `Send Gift (₦${amount.toLocaleString()})`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
