import React, { useState, useMemo } from 'react';
import {
  Crown,
  Share2,
  MoreHorizontal,
  X,
  Trophy,
  Gift,
  Lock,
  CalendarCheck,
  Check,
  Copy,
  CheckCircle2,
  Twitter
} from 'lucide-react';
import { TwitterVerifiedBadge } from './TwitterVerifiedBadge';
import { CelebrityAvatar } from './CelebrityAvatar';
import { LeaderboardFigure } from '../types/leaderboard';
import { SECTOR_CONFIGS } from '../data/leaderboardData';
import { soundManager } from '../utils/audio';

interface GiftingModalProps {
  figure: LeaderboardFigure | null;
  allFigures?: LeaderboardFigure[];
  onClose: () => void;
  onGiftSuccess?: (figureId: string, amount: number) => void;
}

export const GiftingModal: React.FC<GiftingModalProps> = ({
  figure,
  allFigures,
  onClose
}) => {
  if (!figure) return null;

  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const isCampaignEnded = SECTOR_CONFIGS[0]?.campaignStatus === 'ended';

  // Dynamic ranking within leaderboard
  const sectorRank = useMemo(() => {
    if (!allFigures || allFigures.length === 0) return 1;
    const sorted = [...allFigures].sort((a, b) => b.totalBalance - a.totalBalance);
    const idx = sorted.findIndex((f) => f.id === figure.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [allFigures, figure]);

  const totalPool = useMemo(() => {
    if (!allFigures || allFigures.length === 0) return figure.totalBalance;
    return allFigures.reduce((acc, f) => acc + f.totalBalance, 0);
  }, [allFigures, figure.totalBalance]);

  const poolShare = totalPool > 0 ? ((figure.totalBalance / totalPool) * 100).toFixed(1) : '0.0';

  // Registry metadata or clean defaults
  const profileMeta = useMemo(() => {
    const cleanHandle = figure.handle || `@${figure.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
    const cleanBio =
      figure.bio ||
      `${figure.slogan || figure.fandomName}. Featured artiste on UNILag Top Artistes.`;

    return {
      handle: cleanHandle,
      slogan: figure.slogan,
      bio: cleanBio
    };
  }, [figure]);

  // Share link generation: bit.ly/fanwarsng/(creator name)
  const creatorSlug = useMemo(() => {
    return figure.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }, [figure.name]);

  const shareDisplayLink = `bit.ly/fanwarsng/${creatorSlug}`;
  const shareFullUrl = `https://${shareDisplayLink}`;

  // Functional Share Handler
  const handleShareClick = async () => {
    soundManager.playButtonClick();

    try {
      await navigator.clipboard.writeText(shareFullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${figure.name} — #${sectorRank} on UNILag Top Artistes`,
          text: `${figure.name} finished #${sectorRank} with ₦${figure.totalBalance.toLocaleString()} in Week 1 gifts on FANWARS!`,
          url: shareFullUrl
        });
      } catch {
        // User cancelled share sheet
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLinkOnly = async () => {
    soundManager.playButtonClick();
    try {
      await navigator.clipboard.writeText(shareFullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg min-h-screen sm:min-h-0 bg-[#070913] text-white relative flex flex-col shadow-2xl rounded-none sm:rounded-3xl border-0 sm:border border-[#1e2544] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'radial-gradient(ellipse at 50% 18%, rgba(245, 158, 11, 0.22) 0%, rgba(13, 16, 32, 0.8) 45%, #070913 85%)'
        }}
      >
        {/* Top Header Bar */}
        <header className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 select-none">
            <Crown className="w-6 h-6 text-[#f59e0b] fill-[#f59e0b]" />
            <span className="text-lg font-black tracking-wider text-[#f59e0b] uppercase">
              FANWARS
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Share Button (Functional) */}
            <button
              type="button"
              onClick={handleShareClick}
              aria-label="Share creator profile"
              title={`Share ${figure.name}'s profile (${shareDisplayLink})`}
              className="w-10 h-10 rounded-full bg-[#141829]/90 hover:bg-[#1f253d] border border-[#262f50] text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md group"
            >
              <Share2 className="w-4.5 h-4.5 text-white group-hover:text-amber-400 transition-colors" />
            </button>

            {/* More Options / Three Dots */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                aria-label="More options"
                title="More options"
                className="w-10 h-10 rounded-full bg-[#141829]/90 hover:bg-[#1f253d] border border-[#262f50] text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
              >
                <MoreHorizontal className="w-5 h-5 text-white" />
              </button>

              {/* More Menu Dropdown */}
              {showMoreMenu && (
                <div className="absolute right-0 top-12 w-56 bg-[#0f1325] border border-[#262f50] rounded-2xl shadow-2xl p-2 z-30 animate-fadeIn text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyLinkOnly();
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#1a213d] flex items-center gap-2.5 text-slate-200 hover:text-white cursor-pointer transition-colors"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copy Profile Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareMenu(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#1a213d] flex items-center gap-2.5 text-slate-200 hover:text-white cursor-pointer transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Share Options</span>
                  </button>
                  <div className="h-px bg-[#262f50] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Close Profile</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="w-10 h-10 rounded-full bg-[#141829]/90 hover:bg-[#1f253d] border border-[#262f50] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md ml-0.5"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Floating Share Toast / Confirmation */}
        {copiedLink && (
          <div className="mx-5 mb-2 p-3 bg-gradient-to-r from-emerald-950/90 to-[#0e241b] border border-emerald-500/60 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-200 animate-slideDown shadow-xl z-20">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-white font-black">Link copied to clipboard!</span>
                <span className="text-[11px] text-emerald-300 font-mono">{shareDisplayLink}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCopiedLink(false)}
              className="text-emerald-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Share Options Drawer / Modal */}
        {showShareMenu && (
          <div className="mx-5 mb-3 p-4 bg-[#0d1020] border border-[#232a48] rounded-2xl text-xs z-20 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-white uppercase tracking-wider text-[11px]">
                Share Creator Profile
              </span>
              <button
                type="button"
                onClick={() => setShowShareMenu(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Link Box */}
            <div className="flex items-center justify-between bg-[#12162a] border border-[#232a48] rounded-xl px-3 py-2 mb-3">
              <span className="text-xs font-mono font-bold text-amber-400 truncate">
                {shareDisplayLink}
              </span>
              <button
                type="button"
                onClick={handleCopyLinkOnly}
                className="ml-2 px-2.5 py-1 rounded-lg bg-amber-500 text-black font-black text-[11px] hover:bg-amber-400 flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Send a gift and boost ${figure.name} on the FANWARS Leaderboard! Vote here: ${shareFullUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#1d9bf0]/15 hover:bg-[#1d9bf0]/25 text-[#1d9bf0] border border-[#1d9bf0]/30 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
                <span>Share on X</span>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Support ${figure.name} on FANWARS! Send a gift to boost their rank: ${shareFullUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
          
          {/* Creator Hero Presentation */}
          <div className="flex flex-col items-center text-center pt-2">
            
            {/* Glowing Golden Circular Avatar */}
            <div className="relative my-3">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-[3.5px] bg-[#f59e0b] shadow-[0_0_40px_rgba(245,158,11,0.3)] ring-8 ring-amber-400/15 transition-transform hover:scale-102">
                <CelebrityAvatar
                  src={figure.avatarUrl}
                  name={figure.name}
                  className="w-full h-full rounded-full object-cover shadow-inner"
                />
              </div>
            </div>

            {/* Creator Name + Verified Check */}
            <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                {figure.name}
              </h2>
              {figure.verified && (
                <TwitterVerifiedBadge className="w-5 h-5 shrink-0" />
              )}
            </div>

            {/* Handle */}
            <p className="text-sm font-semibold text-slate-400 mt-0.5">
              {profileMeta.handle}
            </p>

            {/* Title / Slogan in Gold */}
            {profileMeta.slogan && (
              <p className="text-sm font-bold text-[#f59e0b] tracking-wide mt-1">
                {profileMeta.slogan}
              </p>
            )}

            {/* Bio / Description */}
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-md mt-2.5 px-3">
              {profileMeta.bio}
            </p>
          </div>

          {/* Two Metric Cards Side-by-Side */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            
            {/* Left Card: Rank & Sector */}
            <div className="bg-[#0b0e1d] border border-[#1b223c] rounded-2xl p-3.5 flex items-center gap-3 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div className="min-w-0">
                <span className="text-lg sm:text-xl font-black text-white tabular-nums block leading-tight">
                  #{sectorRank}
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block truncate mt-0.5">
                  {figure.sectorLabel} LEADERBOARD
                </span>
              </div>
            </div>

            {/* Right Card: Total Gifts Received */}
            <div className="bg-[#0b0e1d] border border-[#1b223c] rounded-2xl p-3.5 flex items-center gap-3 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div className="min-w-0">
                <span className="text-lg sm:text-xl font-black text-white tabular-nums block leading-tight">
                  ₦{figure.totalBalance.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block truncate mt-0.5">
                  TOTAL GIFTS RECEIVED
                </span>
              </div>
            </div>
          </div>

          {/* Ended Campaign Summary Card */}
          <div className="bg-[#0a0d1b] border border-[#1b223c] rounded-3xl p-4 sm:p-5 mt-5 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isCampaignEnded ? 'Week 1 Gifting Closed' : 'Campaign Summary'}</span>
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  The 7-day UNILag Top Artistes campaign has concluded and final standings are locked.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
              <div className="bg-[#101426] border border-[#1e2544] rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 block">FINAL RANK</span>
                <span className="text-base font-black text-amber-400 tabular-nums mt-0.5 block">
                  #{sectorRank}
                </span>
              </div>
              <div className="bg-[#101426] border border-[#1e2544] rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 block">GIFTS SENT</span>
                <span className="text-base font-black text-white tabular-nums mt-0.5 block">
                  {figure.fanCount.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#101426] border border-[#1e2544] rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 block">POOL SHARE</span>
                <span className="text-base font-black text-amber-300 tabular-nums mt-0.5 block">
                  {poolShare}%
                </span>
              </div>
            </div>

            <div className="bg-[#070914] border border-[#181d33] rounded-2xl p-3.5 flex items-center gap-2.5 mt-4 text-xs font-normal text-slate-300">
              <CalendarCheck className="w-5 h-5 text-[#f59e0b] shrink-0" />
              <p className="text-xs text-slate-300 leading-snug">
                <strong className="text-white font-bold">{figure.name}</strong> closed the 7-day battle with{' '}
                <strong className="text-[#f59e0b] font-bold tabular-nums">
                  ₦{figure.totalBalance.toLocaleString()}
                </strong>{' '}
                across {figure.fanCount.toLocaleString()} verified fan gifts.
              </p>
            </div>

            <button
              type="button"
              onClick={handleShareClick}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-black" />
              <span>Share Final Result ({shareDisplayLink})</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
