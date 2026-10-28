import React, { useState, useMemo } from 'react';
import {
  Crown,
  Share2,
  MoreHorizontal,
  X,
  Trophy,
  Gift,
  Flame,
  ChevronRight,
  Check,
  Copy,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Twitter
} from 'lucide-react';
import { TwitterVerifiedBadge } from './TwitterVerifiedBadge';
import { CelebrityAvatar } from './CelebrityAvatar';
import { LeaderboardFigure } from '../types/leaderboard';
import { initiateFlutterwavePayment, MIN_GIFT_AMOUNT, MAX_GIFT_AMOUNT } from '../utils/flutterwave';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface GiftingModalProps {
  figure: LeaderboardFigure | null;
  allFigures?: LeaderboardFigure[];
  onClose: () => void;
  onGiftSuccess: (figureId: string, amount: number) => void;
}

const PRESET_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

// Detailed metadata profiles for creators
const CREATOR_METADATA_REGISTRY: Record<string, { handle: string; slogan?: string; bio: string }> = {
  sir_leo_dasilva: {
    handle: '@SirLeoBDasilva',
    slogan: 'Duke of Surulere',
    bio: 'BBNaija star, entrepreneur, football enthusiast and content creator. Building communities and conversations that matter.'
  },
  davido: {
    handle: '@davido',
    slogan: '001 / Timeless OBO',
    bio: 'Global Afrobeats icon, philanthropist and 30BG leader. Delivering timeless melodies, sold-out stadiums, and unmatched energy worldwide.'
  },
  burna_boy: {
    handle: '@burnaboy',
    slogan: 'African Giant / City Boy',
    bio: 'Grammy-winning African Giant. Pioneer of Afro-fusion, filling global arenas and redefining African music on the highest international stages.'
  },
  wizkid: {
    handle: '@wizkidayo',
    slogan: 'Big Wiz / Machala',
    bio: 'Grammy-winning global pioneer and Starboy leader. Setting international milestones and crafting effortless Afrobeats perfection.'
  },
  asake: {
    handle: '@asakemusik',
    slogan: 'Mr Money With The Vibe',
    bio: 'Chart-topping powerhouse fusing Fuji, Amapiano, and street anthems into an unstoppable wave of cultural dominance.'
  },
  rema: {
    handle: '@heisrema',
    slogan: 'Afrorave Pioneer / Calm Down',
    bio: 'Global streaming phenomenon and Afrorave pioneer. Breaking international records and taking Nigerian music to the stratosphere.'
  },
  tiwa_savage: {
    handle: '@tiwasavage',
    slogan: 'Queen of Afrobeats',
    bio: 'The Number One African Bad Girl. Celebrated vocalist, style icon, and groundbreaking songwriter leading the global sound.'
  },
  funke_akindele: {
    handle: '@funkejenifaakindele',
    slogan: 'Box Office Queen',
    bio: 'Record-shattering Nollywood director, producer, and icon behind Nigeria’s highest-grossing cinematic blockbusters.'
  },
  basketmouth: {
    handle: '@basketmouth',
    slogan: 'Baron of African Comedy',
    bio: 'Lord of the Ribs. Multi-award-winning stand-up comedy legend, show runner, and creative visionary entertaining millions.'
  },
  ay_makun: {
    handle: '@aycomedian',
    slogan: 'King of Live Comedy Shows',
    bio: 'Mastermind behind AY Live and acclaimed blockbuster producer. Trailblazer of premium comedy concerts across Africa.'
  },
  bovi: {
    handle: '@officialbovi',
    slogan: 'Man on Fire / Punchline General',
    bio: 'Man on Fire. Elite stand-up comedian, screenwriter, and actor celebrated for razor-sharp wit and unforgettable punchlines.'
  },
  mr_macaroni: {
    handle: '@mrmacaronii',
    slogan: 'Ooin / You Are Doing Well',
    bio: 'Beloved comedy creator, activist, and actor. Championing societal consciousness, youth empowerment, and joyful humor.'
  },
  sabinus: {
    handle: '@mrfunny1_',
    slogan: 'Investor Sabinus / Something Hooge',
    bio: 'AMVCA-winning comedy genius and digital creator. Loved across Africa for hilarious facial expressions and iconic investor skits.'
  },
  taaooma: {
    handle: '@taaooma',
    slogan: 'Queen of Multi-Character Skits',
    bio: 'Prolific content creator, filmmaker, and comedian. Master of relatable family dynamics and lightning-fast multi-character acting.'
  },
  broda_shaggi: {
    handle: '@brodashaggi',
    slogan: 'Number 1 Fine Agbero',
    bio: 'High-octane comic actor, singer, and performer. Bringing electrifying laughter and versatility across screen and stage.'
  },
  brain_jotter: {
    handle: '@brainjotter',
    slogan: 'Deadpan Comedy Virtuoso',
    bio: 'Deadpan comedy maestro and viral phenomenon. Setting global dance trends and delivering unmatched comedic timing.'
  },
  cute_abiola: {
    handle: '@thecuteabiola',
    slogan: 'World Famous Lawyer Kunle',
    bio: 'Dynamic comedy actor, digital star, and creator. Known for high-spirited sketches and boundless community engagement.'
  },
  laycon: {
    handle: '@itslaycon',
    slogan: 'Lockdown Champion & Hip-Hop Icon',
    bio: 'BBNaija Lockdown winner, lyrical rapper, and youth advocate. Inspiring millions with authenticity, music, and determination.'
  },
  mercy_eke: {
    handle: '@official_mercyeke',
    slogan: 'Lambo / Queen of Highlights',
    bio: 'BBNaija Pepper Dem winner and serial entrepreneur. Trendsetting fashion mogul, media star, and lifestyle icon.'
  },
  tacha: {
    handle: '@symply_tacha',
    slogan: 'No Leave, No Transfer',
    bio: 'Fierce media personality, entrepreneur, and CEO. Inspiring the loyal Titan movement with boldness, beauty, and business grit.'
  },
  cee_c: {
    handle: '@ceec_official',
    slogan: 'King Cee-C / Spartan Leader',
    bio: 'Legal practitioner, fitness founder, and television star. A beacon of confidence, elegance, and unshakeable resilience.'
  },
  phyna: {
    handle: '@unusualphyna',
    slogan: 'Level Up Champion / Hype Priestess',
    bio: 'BBNaija Level Up champion, hype artist, and actress. A powerhouse of street charisma, grit, and viral energy.'
  },
  whitemoney: {
    handle: '@whitemoney__',
    slogan: 'Shine Ya Eye Champion',
    bio: 'BBNaija winner, culinary entrepreneur, and musician. Bringing warmth, authentic hustle, and good vibes to every table.'
  },
  daniel_regha: {
    handle: '@DanielRegha',
    slogan: 'No Offense / Constructive Advice',
    bio: 'Social critic and influential voice on X. Known for constructive advice, unvarnished reviews, and viral cultural commentary.'
  },
  asiwaju_lerry: {
    handle: '@AsiwajuLerry',
    slogan: 'Twitter Engagement Don',
    bio: 'Leading sports commentator, digital influencer, and social engagement king connecting fans across global sports culture.'
  },
  pooja: {
    handle: '@PoojaMedia',
    slogan: 'Nigeria’s Photojournalist & Sports King',
    bio: 'Award-winning sports photojournalist and analyst covering Nigerian football, global tournaments, and athletics.'
  },
  morris_monye: {
    handle: '@Morris_Monye',
    slogan: 'Governance & Tech Commentator',
    bio: 'Strategic thinker, tech entrepreneur, and public policy advocate sparking essential conversations on Nigeria’s future.'
  },
  aproko_doctor: {
    handle: '@aproko_doctor',
    slogan: 'Drink Water / Health Advocate',
    bio: 'Medical doctor, public health educator, and health advocate. Making medical awareness engaging and accessible to millions.'
  },
  hilda_baci: {
    handle: '@hildabaci',
    slogan: 'Record-Breaking Culinary Queen',
    bio: 'Guinness World Record holder, chef, and entrepreneur. Inspiring culinary innovation, discipline, and African excellence.'
  },
  kiekie: {
    handle: '@kie_kie__',
    slogan: 'KieKie / Fashion & Comic Dynamo',
    bio: 'Fashion designer, TV host, and comedy sensation. Combining effortless glamour with showstopping comedic flair.'
  },
  peller: {
    handle: '@peller_080',
    slogan: 'Gen-Z Streaming Sensation',
    bio: 'Energetic livestream star, digital entertainer, and cultural phenomenon captivating a new generation of online fans.'
  },
  jarvis_jadrolita: {
    handle: '@jadrolita_',
    slogan: 'Africa’s Premier AI Robot Girl',
    bio: 'Viral sensation and creator pioneering creative robotic performance art and high-engagement digital content.'
  }
};

export const GiftingModal: React.FC<GiftingModalProps> = ({
  figure,
  allFigures,
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
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Dynamic ranking within sector
  const sectorRank = useMemo(() => {
    if (!allFigures || allFigures.length === 0) return 1;
    const sectorFigures = allFigures
      .filter((f) => f.sector === figure.sector)
      .sort((a, b) => b.totalBalance - a.totalBalance);
    const idx = sectorFigures.findIndex((f) => f.id === figure.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [allFigures, figure]);

  // Registry metadata or clean defaults
  const profileMeta = useMemo(() => {
    const fromRegistry = CREATOR_METADATA_REGISTRY[figure.id];
    if (fromRegistry) {
      return {
        handle: figure.handle || fromRegistry.handle,
        slogan: figure.slogan || fromRegistry.slogan,
        bio: figure.bio || fromRegistry.bio
      };
    }

    const cleanHandle = figure.handle || `@${figure.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    const cleanBio =
      figure.bio ||
      `${figure.slogan || figure.fandomName}. Acclaimed ${figure.sectorLabel} star on FanBrawl. Building community and leading the charge with fans worldwide.`;

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

  // Functional Share Handler
  const handleShareClick = async () => {
    soundManager.playButtonClick();
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareFullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3500);
    }

    // Attempt native Web Share API on mobile
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${figure.name} on FANWARS`,
          text: `Send a gift and boost ${figure.name} on the FANWARS Leaderboard!`,
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

  // Initiate Flutterwave Payment Gateway
  const handleInitiateGift = () => {
    if (activeAmount < MIN_GIFT_AMOUNT || activeAmount > MAX_GIFT_AMOUNT) {
      setErrorMessage(
        `Gift amount must be between ₦${MIN_GIFT_AMOUNT.toLocaleString()} and ₦${MAX_GIFT_AMOUNT.toLocaleString()}`
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Opening Flutterwave Gateway...');
    soundManager.playButtonClick();

    initiateFlutterwavePayment({
      amount: activeAmount,
      teamId: figure.id,
      teamName: figure.name,
      teamTag: figure.tag,
      fandomName: figure.fandomName,
      sectorLabel: figure.sectorLabel,
      customerName: 'Fan Supporter',
      customerEmail: `fan_${Date.now()}@fanwarsng.com`,
      onSuccess: async (paymentResp) => {
        setStatusMessage('Verifying payment & crediting leaderboard...');

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
              gift_description: `Gift to ${figure.name}`,
              supporter_name: 'Fan Supporter'
            })
          });

          const data = await response.json();

          if (response.ok && data.verified) {
            setIsSuccess(true);
            setStatusMessage('PAYMENT VERIFIED & CREDITED TO LEADERBOARD!');
            soundManager.playLevelUp();
            triggerConfetti();
            onGiftSuccess(figure.id, activeAmount);

            setTimeout(() => {
              onClose();
            }, 1400);
          } else {
            setIsProcessing(false);
            setErrorMessage(data.error || 'Payment verification failed.');
          }
        } catch (err) {
          console.error('[FanBrawl Gifting] Verification error:', err);
          setIsProcessing(false);
          setErrorMessage('Network error while verifying payment.');
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

          {/* "Send a Gift" Action Card */}
          <div className="bg-[#0a0d1b] border border-[#1b223c] rounded-3xl p-4 sm:p-5 mt-5 shadow-xl">
            
            {/* Section Header */}
            <div>
              <h3 className="text-lg font-black text-white tracking-wide">
                Send a Gift
              </h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Show your support. Every gift counts!
              </p>
            </div>

            {/* 6 Preset Buttons (2 rows of 3) */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {PRESET_AMOUNTS.map((amt) => {
                const isSelected = !customAmount && selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSelectPreset(amt)}
                    className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer border tracking-wider disabled:opacity-60 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]'
                        : 'bg-[#101426] hover:bg-[#181d36] text-white border-[#1e2544]'
                    }`}
                  >
                    ₦{amt.toLocaleString()}
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Input */}
            <div className="relative mt-3">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
                ₦
              </span>
              <input
                type="text"
                disabled={isProcessing}
                value={customAmount}
                onChange={handleCustomChange}
                placeholder="Custom amount (₦100 min)"
                className="w-full bg-[#101426] border border-[#1e2544] focus:border-amber-400 rounded-xl pl-8 pr-4 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-500 outline-none transition-colors disabled:opacity-60"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 p-3 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Processing / Success Banner */}
            {isProcessing && (
              <div
                className={`mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  isSuccess
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Send Gift CTA Button */}
            <button
              type="button"
              disabled={isProcessing || activeAmount < MIN_GIFT_AMOUNT}
              onClick={handleInitiateGift}
              aria-label={`Send Gift of ₦${activeAmount.toLocaleString()}`}
              title={`Send Gift of ₦${activeAmount.toLocaleString()}`}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 text-black" />
                  <span>Send Gift</span>
                </>
              )}
            </button>

            {/* Gifting Boost Impact Banner */}
            <div className="bg-[#070914] border border-[#181d33] rounded-2xl p-3.5 flex items-center justify-between mt-4 text-xs font-normal text-slate-300">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Flame className="w-5 h-5 text-[#f59e0b] shrink-0" />
                <p className="text-xs text-slate-300 leading-snug">
                  Gifting directly boosts <strong className="text-white font-bold">{figure.name}</strong> on both their <strong className="text-[#f59e0b] font-bold">{figure.sectorLabel}</strong> and the <strong className="text-[#f59e0b] font-bold">Master Leaderboard!</strong>
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
