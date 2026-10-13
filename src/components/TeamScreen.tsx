import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Gift, Sparkles } from 'lucide-react';
import { Team } from '../types/game';
import { TeamLogo } from './TeamLogo';
import { TEAM_GEM_THEMES } from './LeaderboardView';
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

  const theme = TEAM_GEM_THEMES[team.id] || TEAM_GEM_THEMES.arsenal;

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
      customerEmail: 'fan@fanbrawl.com',
      customerName: 'Fan Supporter',
      onSuccess: () => {
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
    <div className="w-full max-w-3xl mr-auto ml-0 space-y-4 animate-fadeIn pb-10 font-cursive text-white touch-pan-y text-sm sm:text-base leading-snug">
      {/* Gemified Diamond Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-1.5 text-white border-2 border-white/60 hover:border-white bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer uppercase shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.7)] backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          <span>Back to Battle</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
        </button>
      </div>

      {/* Gemified Team Hero Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b-2 border-white/20">
        <div className="flex items-center gap-3 sm:gap-4">
          <TeamLogo team={team} size="lg" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_20px_rgba(255,255,255,0.95)]">
                {team.name}
              </h1>
              <span className={`text-sm font-black px-2.5 py-0.5 rounded-xl border border-white/70 bg-gradient-to-b from-white/30 via-white/10 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.4)] backdrop-blur-md text-white uppercase ${theme.tagGlow}`}>
                {team.tag}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-100 font-bold mt-1 font-cursive drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              <span>{team.fanCount.toLocaleString()} Total Gifts</span>
            </div>
          </div>
        </div>

        {/* Total Balance in pure sparkling diamond letters */}
        <div className="text-left sm:text-right">
          <span className="text-xs font-black text-cyan-100 uppercase tracking-wider block font-cursive drop-shadow-sm">
            Total Balance
          </span>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_20px_rgba(255,255,255,1)] tabular-nums font-cursive">
            ₦{team.totalBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Gemified Gift Console */}
      <form onSubmit={handlePay} className="space-y-4 pt-2">
        {/* Gift Amount Selection Presets */}
        <div>
          <label className="text-xs sm:text-sm font-black text-white uppercase tracking-wide block mb-2 font-cursive drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            Gift Amount (₦)
          </label>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presetAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectPreset(val)}
                className={`py-2 px-2 text-center rounded-xl text-xs sm:text-sm font-black border-2 transition-all cursor-pointer backdrop-blur-md ${
                  amount === val && customAmount === val.toString()
                    ? 'border-white bg-gradient-to-b from-white via-cyan-100 to-slate-200 text-slate-950 shadow-[0_0_25px_rgba(255,255,255,1)] scale-[1.04]'
                    : 'border-white/30 text-white bg-white/10 hover:border-white/70 hover:bg-white/20 shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                }`}
              >
                ₦{val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input in Diamond Glass */}
        <div>
          <label className="block text-xs font-black text-white uppercase tracking-wide mb-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            Or Custom Gift (₦)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-cyan-200">
              ₦
            </span>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomChange}
              placeholder="Enter amount"
              className="w-full bg-white/10 border-2 border-white/40 focus:border-white focus:ring-2 focus:ring-white/50 focus:shadow-[0_0_20px_rgba(255,255,255,0.7)] rounded-xl pl-8 pr-3 py-2 text-sm font-black text-white placeholder-cyan-100/60 outline-none backdrop-blur-md shadow-inner transition-all"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-xl border border-red-400 text-red-200 font-bold text-xs bg-red-950/70 backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            {errorMessage}
          </div>
        )}

        {/* Gemified Action Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3.5 rounded-xl border-2 border-white bg-gradient-to-b from-white via-cyan-100 to-slate-200 text-slate-950 font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.95)] hover:shadow-[0_0_45px_rgba(255,255,255,1)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          <Gift className="w-5 h-5 text-slate-950" />
          <span>
            {isProcessing ? 'Connecting Flutterwave...' : `Send ₦${(amount || 0).toLocaleString()} Gift`}
          </span>
          <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
        </button>
      </form>

      {/* Gemified Success Modal */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950/95 border-2 border-white rounded-2xl p-6 max-w-sm w-full text-center shadow-[0_0_40px_rgba(255,255,255,0.8)] space-y-3 animate-scaleUp font-cursive">
            <CheckCircle2 className="w-12 h-12 text-cyan-200 mx-auto animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-sm">
              Gift Received!
            </h3>
            <p className="text-sm font-bold text-white">
              Thank you for contributing <span className="font-black text-cyan-200">₦{successAmount.toLocaleString()}</span> to {team.name}!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
