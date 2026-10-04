import React, { useState } from 'react';
import { 
  Coins, 
  Flame, 
  Sparkles, 
  Zap, 
  Send, 
  Heart, 
  Crown, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { FanProfile, Player, Team } from '../types/game';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { ARENA_IMAGE_URL } from '../data/initialLeagueData';

interface FanContributionStationProps {
  teams: Team[];
  fanProfile: FanProfile;
  selectedTeamId: string;
  onSelectTeamId: (teamId: string) => void;
  onDonate: (teamId: string, amount: number, playerId?: string, customNote?: string) => void;
  onSetFavoredTeam: (teamId: string) => void;
}

export const FanContributionStation: React.FC<FanContributionStationProps> = ({
  teams,
  fanProfile,
  selectedTeamId,
  onSelectTeamId,
  onDonate,
  onSetFavoredTeam
}) => {
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('team_vault');
  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [customInput, setCustomInput] = useState<string>('100');
  const [customNote, setCustomNote] = useState<string>('');
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(false);

  const presets = [10, 50, 250, 1000, 5000, 25000];

  // Active booster multiplier calculation
  const totalMultiplier = fanProfile.activeBoosters.reduce((acc, b) => acc * b.multiplier, 1.0);

  const handleSelectPreset = (amount: number) => {
    setDonationAmount(amount);
    setCustomInput(amount.toString());
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomInput(val);
    const num = parseInt(val, 10) || 0;
    setDonationAmount(num);
  };

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (donationAmount <= 0) return;

    if (fanProfile.coins < donationAmount) {
      alert("Insufficient Fan Wallet coins! Earn more in Frenzy Rush or Quests!");
      return;
    }

    const playerId = selectedPlayerId === 'team_vault' ? undefined : selectedPlayerId;
    onDonate(selectedTeam.id, donationAmount, playerId, customNote);

    if (donationAmount >= 5000) {
      soundManager.playWhaleDrop();
      triggerConfetti(['#F59E0B', '#FCD34D', '#10B981', '#6366F1']);
    } else if (donationAmount >= 250) {
      soundManager.playCheer();
    } else {
      soundManager.playCoin();
    }

    setIsSuccessFeedback(true);
    setTimeout(() => setIsSuccessFeedback(false), 2500);
    setCustomNote('');
  };

  const selectedPlayer = selectedTeam?.players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="space-y-6">
      {/* Stadium Hero Context Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-xl">
        <img
          src={ARENA_IMAGE_URL}
          alt="Apex Arena Crowd"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4" />
            <span>Grand Fan Contribution Station</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight font-display">
            Fuel Your Franchise to the Championship
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Every dollar contributed from your fan balance directly pushes your team's vault and player MVP standing up the global championship leaderboard!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Team Selector & Franchise Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              1. Choose Franchise to Support
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {teams.map((team) => {
                const isSelected = team.id === selectedTeam.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => {
                      onSelectTeamId(team.id);
                      setSelectedPlayerId('team_vault');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400/80 text-white ring-1 ring-amber-400/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        {team.tag}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{team.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ${team.totalBalance.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Team Profile Card */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {selectedTeam.logoUrl ? (
                    <img
                      src={selectedTeam.logoUrl}
                      alt={selectedTeam.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                      style={{ backgroundColor: selectedTeam.primaryColor }}
                    >
                      {selectedTeam.tag}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-base">
                        {selectedTeam.name}
                      </h4>
                      <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        Rank #{selectedTeam.currentRank}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{selectedTeam.slogan}</div>
                  </div>
                </div>

                <button
                  onClick={() => onSetFavoredTeam(selectedTeam.id)}
                  title="Make this your primary favored team"
                  className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                    fanProfile.favoredTeamId === selectedTeam.id
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${fanProfile.favoredTeamId === selectedTeam.id ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-400">Total Vault:</span>
                  <div className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                    ${selectedTeam.totalBalance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Passive Income:</span>
                  <div className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                    +${selectedTeam.passiveIncomePerSec}/sec
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Donation Form & Target Selection (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmitDonation}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5"
          >
            {/* Target Option: Team Vault vs Star Player */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                2. Target Contribution Destination
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlayerId('team_vault')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedPlayerId === 'team_vault'
                      ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Crown className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <div className="text-xs">Team Vault</div>
                  <div className="text-[10px] text-slate-400">Shared Pool</div>
                </button>

                {selectedTeam.players.map((player) => {
                  const isSelected = selectedPlayerId === player.id;
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">"{player.handle}"</div>
                      <div className="text-[10px] text-slate-400">{player.role}</div>
                      <div className="text-[10px] font-mono text-emerald-400">
                        ${player.personalBalance.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Donation Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  3. Select Cheer Balance Amount
                </label>
                {totalMultiplier > 1.0 && (
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded">
                    <Zap className="w-3.5 h-3.5" />
                    Active Boost: {totalMultiplier.toFixed(1)}x Multiplier!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presets.map((preset) => {
                  const isSelected = donationAmount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-500 to-yellow-400 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 font-mono font-medium'
                      }`}
                    >
                      <div className="text-xs">${preset.toLocaleString()}</div>
                      {preset >= 5000 && (
                        <div className="text-[9px] uppercase tracking-wider font-sans opacity-90">
                          Whale
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input */}
              <div className="mt-3 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="text"
                  value={customInput}
                  onChange={handleCustomInputChange}
                  placeholder="Custom amount..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Custom Fan Note / Cheer Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                4. Fan Cheer Message (Broadcast to Live Feed)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Taking the championship all the way! Let's go Titans!"
                maxLength={80}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={donationAmount <= 0 || fanProfile.coins < donationAmount}
                className={`w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  fanProfile.coins < donationAmount
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  CONTRIBUTE ${donationAmount.toLocaleString()} TO {selectedPlayerId === 'team_vault' ? selectedTeam.name.toUpperCase() : `"${selectedPlayer?.handle.toUpperCase()}"`}
                </span>
                {totalMultiplier > 1.0 && (
                  <span className="bg-slate-950 text-amber-300 text-xs px-2 py-0.5 rounded-full font-mono">
                    +{Math.round(donationAmount * totalMultiplier).toLocaleString()} Valued
                  </span>
                )}
              </button>

              {fanProfile.coins < donationAmount && (
                <div className="text-xs text-rose-400 flex items-center justify-center gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Insufficient Fan Wallet balance (${fanProfile.coins.toLocaleString()} available). Play Frenzy Rush or claim quests to earn more coins!</span>
                </div>
              )}

              {isSuccessFeedback && (
                <div className="text-xs text-emerald-400 flex items-center justify-center gap-1.5 mt-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Contribution successfully sent to the vault & live ticker!</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
