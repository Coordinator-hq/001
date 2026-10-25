import React, { useState } from 'react';
import { X, Gift, Flame, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');

  const activeAmount = customAmount ? Math.floor(Number(customAmount) || 0) : selectedAmount;

  const handleSelectPreset = (val: number) => {
    setSelectedAmount(val);
    setCustomAmount('');
    setErrorMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(raw);
    setErrorMessage(null);
  };

  // Real payment flow via Flutterwave gateway
  const handleInitiateGift = () => {
    if (activeAmount < MIN_GIFT_AMOUNT || activeAmount > MAX_GIFT_AMOUNT) {
      setErrorMessage(`GIFT AMOUNT MUST BE BETWEEN ₦${MIN_GIFT_AMOUNT.toLocaleString()} AND ₦${MAX_GIFT_AMOUNT.toLocaleString()}`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('OPENING FLUTTERWAVE GATEWAY...');
    soundManager.playButtonClick();

    initiateFlutterwavePayment({
      amount: activeAmount,
      teamId: figure.id,
      teamName: figure.name,
      teamTag: figure.tag,
      fandomName: figure.fandomName,
      sectorLabel: figure.sectorLabel,
      customerName: donorName.trim() || 'Fan Supporter',
      customerEmail: `fan_${Date.now()}@fanbrawl.com`,
      onSuccess: async (paymentResp) => {
        setStatusMessage('VERIFYING WITH FLUTTERWAVE & CREDITING MASTER LEADERBOARD...');

        try {
          const response = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              transaction_id: paymentResp.transaction_id,
              tx_ref: paymentResp.tx_ref,
              expected_amount: activeAmount,
              figure_id: figure.id,
              figure_name: figure.name,
              gift_description: `Official Supporter Gift to ${figure.name}`,
              supporter_name: donorName.trim() || 'Fan Supporter'
            })
          });

          const data = await response.json();

          if (response.ok && data.verified) {
            setIsSuccess(true);
            setStatusMessage('PAYMENT VERIFIED & CREDITED TO MASTER LEADERBOARD!');
            soundManager.playLevelUp();
            triggerConfetti();
            onGiftSuccess(figure.id, activeAmount);

            setTimeout(() => {
              onClose();
            }, 1400);
          } else {
            setIsProcessing(false);
            setErrorMessage(data.error || 'Payment verification was rejected by server.');
          }
        } catch (err) {
          console.error('[FanBrawl Gifting] Verification error:', err);
          setIsProcessing(false);
          setErrorMessage('Network connection error while verifying payment with server.');
        }
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMessage(err);
      },
      onClose: () => {
        setIsProcessing(false);
        setStatusMessage('');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
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
        <div className="p-5 space-y-4 uppercase">
          
          {/* Supporter Name (Optional) */}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
              YOUR NAME / HANDLE (OPTIONAL)
            </label>
            <input
              type="text"
              disabled={isProcessing}
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="E.G. 30BG_FAN, TITAN_LAGOS"
              className="w-full bg-[#121629] border border-[#232845] focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 outline-none transition-colors uppercase tracking-wider disabled:opacity-60"
            />
          </div>

          {/* Quick Preset Gift Amounts */}
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
              SELECT GIFT AMOUNT (NGN)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !customAmount && selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer border tracking-wider disabled:opacity-60 ${
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
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">
              OR ENTER CUSTOM AMOUNT (₦100 MIN)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                ₦
              </span>
              <input
                type="text"
                disabled={isProcessing}
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="CUSTOM AMOUNT"
                className="w-full bg-[#121629] border border-[#232845] focus:border-amber-400 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-black text-white placeholder-slate-500 outline-none transition-colors uppercase tracking-wider disabled:opacity-60"
              />
            </div>
          </div>

          {/* Live Impact Note */}
          <div className="bg-[#121629]/60 border border-[#1e233d] rounded-2xl p-3 flex items-start gap-2.5 text-[11px] font-bold text-slate-300">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              GIFTING DIRECTLY BOOSTS <strong className="text-white font-black">{figure.name}</strong> ON BOTH THEIR <strong className="text-amber-400 font-black">{figure.sectorLabel}</strong> LEADERBOARD AND THE <strong className="text-amber-400 font-black">MASTER LEADERBOARD</strong>!
            </span>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-xs font-black animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Status / Processing Banner */}
          {isProcessing && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-black ${
              isSuccess 
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Checkout CTA: Icon-Only Button */}
          <button
            type="button"
            disabled={isProcessing || activeAmount < MIN_GIFT_AMOUNT}
            onClick={handleInitiateGift}
            aria-label={`Gift ₦${activeAmount.toLocaleString()}`}
            title={`Gift ₦${activeAmount.toLocaleString()}`}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-sm tracking-wider uppercase shadow-[0_4px_25px_rgba(245,158,11,0.35)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.5)] active:scale-98 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            ) : (
              <Gift className="w-6 h-6 text-black" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
