import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Gift } from 'lucide-react';
import { Team } from '../types/game';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { initiateFlutterwavePayment } from '../utils/flutterwave';

interface TeamScreenProps {
  team: Team;
  onBack: () => void;
  onPaymentSuccess: (teamId: string, amount: number) => void;
}

export const TeamScreen: React.FC<TeamScreenProps> = ({
  team,
  onBack,
  onPaymentSuccess
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successAmount, setSuccessAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Touch swipe-right tracking to navigate back
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
      
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;

      // Detect deliberate horizontal right swipe (>= 75px) with minimal vertical drift
      if (deltaX > 75 && Math.abs(deltaY) < 60) {
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

  const presetAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
    setErrorMessage('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(rawVal);
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      setAmount(num);
    } else {
      setAmount(0);
    }
    setErrorMessage('');
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage('Please enter a valid gift amount (minimum ₦100).');
      return;
    }
    if (amount < 100) {
      setErrorMessage('Minimum gift amount is ₦100.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Initiate Real Flutterwave Payment Modal
    initiateFlutterwavePayment({
      amount: amount,
      teamId: team.id,
      teamName: team.name,
      customerEmail: 'fan@001league.app',
      customerName: 'Fan Supporter',
      onSuccess: (response) => {
        setIsProcessing(false);
        setIsSuccess(true);
        setSuccessAmount(amount);
        soundManager.playLevelUp();
        triggerConfetti();

        // Credit to the team pot state
        onPaymentSuccess(team.id, amount);

        // Reset success modal after 4s
        setTimeout(() => {
          setIsSuccess(false);
        }, 4000);
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
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md uppercase"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Back to Battle</span>
        </button>
      </div>

      {/* Main Team Hero Banner in Compact Gold Cursive */}
      <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 tracking-wide drop-shadow uppercase">
                {team.name}
              </h1>
              <span className="text-xs font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-sm uppercase">
                {team.tag}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-400/90 mt-1.5 font-cursive">
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

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presetAmounts.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelectPreset(val)}
                  className={`py-2 px-2 text-center rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                    amount === val && customAmount === val.toString()
                      ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md scale-[1.02]'
                      : 'bg-slate-950 text-amber-300 border-amber-500/30 hover:border-amber-400'
                  }`}
                >
                  ₦{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input in Naira */}
          <div>
            <label className="block text-xs font-bold text-amber-400/90 uppercase tracking-wide mb-1">
              Or Custom Gift (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-400">
                ₦
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Enter amount"
                className="w-full bg-slate-950 border border-amber-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl pl-8 pr-3 py-2 text-sm font-cursive text-amber-300 placeholder-amber-500/40 outline-none transition-all"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black rounded-xl text-base tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Gift className="w-5 h-5 text-slate-950" />
            <span>
              {isProcessing ? 'Connecting Flutterwave...' : `Send ₦${(amount || 0).toLocaleString()} Gift`}
            </span>
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-400 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-3 animate-scaleUp font-cursive">
            <CheckCircle2 className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-amber-300">
              Gift Received!
            </h3>
            <p className="text-sm text-amber-400/90 font-sans">
              ₦{successAmount.toLocaleString()} has been added to {team.name}'s balance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
