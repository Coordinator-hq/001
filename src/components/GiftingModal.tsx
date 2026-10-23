import React, { useState } from 'react';
import { X, Gift, Heart, Flame } from 'lucide-react';
import { TwitterVerifiedBadge } from './TwitterVerifiedBadge';
import { LeaderboardFigure } from '../types/leaderboard';
import { initiateFlutterwavePayment, MIN_GIFT_AMOUNT, MAX_GIFT_AMOUNT } from '../utils/flutterwave';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface GiftingModalProps {
  figure: LeaderboardFigure | null;
  onClose: () => void;
  onGiftSuccess: (figureId: string, amount: number) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export const GiftingModal: React.FC<GiftingModalProps> = ({
  figure,
  onClose,
  onGiftSuccess
}) => {
  if (!figure) return null;

  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');

  const activeAmount = customAmount ? Math.floor(Number(customAmount) || 0) : selectedAmount;

  const handleSelectPreset = (val: number) => {
    setSelectedAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(raw);
  };

  const handleInitiateGift = () => {
    if (activeAmount < MIN_GIFT_AMOUNT || activeAmount > MAX_GIFT_AMOUNT) return;

    setIsProcessing(true);
    soundManager.playButtonClick();

    initiateFlutterwavePayment({
      amount: activeAmount,
      teamId: figure.id,
      teamName: figure.name,
      teamTag: figure.tag,
      customerName: donorName.trim() || 'Fan Supporter',
      customerEmail: `fan_${Date.now()}@fanwars.com`,
      onSuccess: () => {
        setIsProcessing(false);
        soundManager.playLevelUp();
        triggerConfetti();
        onGiftSuccess(figure.id, activeAmount);
        onClose();
      },
      onClose: () => {
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#0c0e1a] border border-[#232845] rounded-3xl shadow-2xl overflow-hidden relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div 
          className="relative px-5 pt-6 pb-4 border-b border-[#1c2138] flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${figure.primaryColor}25 0%, #0c0e1a 100%)`
          }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={figure.avatarUrl}
                alt={figure.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 shadow-lg"
                style={{ borderColor: figure.primaryColor }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span 
                className="absolute -bottom-1 -right-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full text-white shadow"
                style={{ backgroundColor: figure.primaryColor }}
              >
                {figure.sectorLabel}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-black text-white">{figure.name}</h3>
                {figure.verified && (
                  <TwitterVerifiedBadge className="w-4.5 h-4.5" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {figure.fandomName} • <span className="text-amber-400 font-bold">₦{figure.totalBalance.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          
          {/* Supporter Name (Optional) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Your Name / Handle (Optional)
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. 30BG_Fan, Titan_Lagos"
              className="w-full bg-[#121629] border border-[#232845] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          {/* Quick Preset Gift Amounts */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Gift Amount (NGN)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !customAmount && selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]'
                        : 'bg-[#121629] hover:bg-[#1a203b] text-slate-200 border-[#232845]'
                    }`}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Or Enter Custom Amount (₦100 min)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₦
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Custom Amount"
                className="w-full bg-[#121629] border border-[#232845] focus:border-amber-400 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Live Impact Note */}
          <div className="bg-[#121629]/60 border border-[#1e233d] rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-slate-300">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              Gifting directly boosts <strong className="text-white">{figure.name}</strong> on both their <strong className="text-amber-400">{figure.sectorLabel}</strong> leaderboard and the <strong className="text-amber-400">Master Leaderboard</strong>!
            </span>
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            disabled={isProcessing || activeAmount < MIN_GIFT_AMOUNT}
            onClick={handleInitiateGift}
            aria-label={`Gift ₦${activeAmount.toLocaleString()}`}
            title={`Gift ₦${activeAmount.toLocaleString()}`}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm tracking-wider uppercase shadow-[0_4px_25px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.5)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Gift className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
