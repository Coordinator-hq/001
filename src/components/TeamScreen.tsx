import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
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
      setErrorMessage('Please enter a valid contribution amount.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    initiateFlutterwavePayment({
      amount: amount,
      customerEmail: `contributor_${Date.now()}@apexleaderboard.com`,
      customerName: 'Anonymous Contributor',
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12 font-cursive touch-pan-y">
      {/* Back button with subtle swipe-right indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 rounded-xl text-base font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Leaderboard</span>
        </button>
      </div>

      {/* Main Team Hero Banner in Gold & Cursive */}
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black text-amber-400 tracking-wide drop-shadow">
                {team.name}
              </h1>
              <span className="text-sm font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-lg shadow-sm">
                {team.tag}
              </span>
            </div>

            <p className="text-lg md:text-xl text-amber-300/90 italic mt-1 font-cursive">
              "{team.slogan}"
            </p>

            <div className="flex items-center gap-3 text-base text-amber-400/90 mt-2">
              <span className="font-extrabold text-amber-300">
                Rank #{rank} of {totalTeams}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-bold">{team.fanCount.toLocaleString()} Total Contributions</span>
            </div>
          </div>

          {/* Prominent Team Total Balance Display in Naira */}
          <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 min-w-[240px] text-right w-full md:w-auto shadow-inner">
            <span className="text-sm font-bold text-amber-400 uppercase tracking-wider block">
              Team Total Balance
            </span>
            <div className="text-3xl md:text-4xl font-black text-amber-300 tabular-nums mt-1 drop-shadow">
              ₦{team.totalBalance.toLocaleString()}
            </div>
            <div className="text-xs text-amber-500/80 mt-1 font-sans">
              Verified 001 Pot Balance
            </div>
          </div>
        </div>
      </div>

      {/* Payment Contribution Console */}
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl">
        <form onSubmit={handlePay} className="space-y-6">
          {/* Amount Selection Presets in Naira */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-lg font-bold text-amber-400 uppercase tracking-wide">
                Contribution Amount (₦)
              </label>
            </div>

            {/* Presets with Gold Highlighting */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                    amount === preset
                      ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black border-yellow-200 shadow-lg shadow-amber-500/30 text-base scale-105'
                      : 'bg-slate-950 border-amber-500/30 text-amber-300 hover:border-amber-400 text-sm font-bold'
                  }`}
                >
                  ₦{preset.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-4 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 text-lg font-black">
                ₦
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Or enter custom amount in Naira..."
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-10 pr-4 py-3 text-lg font-bold text-amber-300 placeholder-amber-500/50 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-sans"
              />
            </div>
          </div>

          {/* Error / Success Feedback in Gold */}
          {errorMessage && (
            <div className="text-sm text-rose-400 font-bold">
              {errorMessage}
            </div>
          )}

          {isSuccess && (
            <div className="p-4 bg-amber-500/15 border border-amber-400 rounded-xl text-base text-amber-300 font-extrabold flex items-center gap-3 shadow-lg">
              <CheckCircle2 className="w-6 h-6 text-amber-400 shrink-0" />
              <span>
                Payment successful! Contributed ₦{successAmount.toLocaleString()} to {team.name}'s pot!
              </span>
            </div>
          )}

          {/* Pay Button */}
          <button
            type="submit"
            disabled={amount <= 0 || isProcessing}
            className={`w-full py-4 px-6 rounded-xl font-black text-xl tracking-wide transition-all flex items-center justify-center gap-3 cursor-pointer ${
              isProcessing
                ? 'bg-slate-800 text-amber-400/50 cursor-wait border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/30'
            }`}
          >
            <Lock className="w-5 h-5 text-slate-950" />
            <span>
              {isProcessing ? 'Processing...' : `Pay ₦${amount.toLocaleString()}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
