import React, { useState } from 'react';
import { X, Plus, Sparkles, Shield, Users } from 'lucide-react';
import { Team, Player } from '../types/game';
import { soundManager } from '../utils/audio';

interface CreateTeamModalProps {
  onClose: () => void;
  onCreateTeam: (newTeam: Team) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  onClose,
  onCreateTeam
}) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [slogan, setSlogan] = useState('');
  const [bio, setBio] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [player1Name, setPlayer1Name] = useState('');
  const [player1Handle, setPlayer1Handle] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player2Handle, setPlayer2Handle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag.trim()) return;

    const teamId = `team-${Date.now()}`;
    const p1Id = `p1-${Date.now()}`;
    const p2Id = `p2-${Date.now()}`;

    const players: Player[] = [
      {
        id: p1Id,
        name: player1Name.trim() || 'Alex Mercer',
        handle: player1Handle.trim() || 'NovaStar',
        teamId: teamId,
        role: 'Captain',
        personalBalance: 50000,
        cheerCount: 1200,
        winRate: 70.0,
        mvpPoints: 1200,
        perks: ['Founders Spark'],
        fanTier: 'All-Star',
        previousRank: 9,
        currentRank: 9
      },
      {
        id: p2Id,
        name: player2Name.trim() || 'Jordan Lee',
        handle: player2Handle.trim() || 'ApexViper',
        teamId: teamId,
        role: 'Striker',
        personalBalance: 40000,
        cheerCount: 950,
        winRate: 65.5,
        mvpPoints: 980,
        perks: ['Quick Surge'],
        fanTier: 'Rookie',
        previousRank: 10,
        currentRank: 10
      }
    ];

    const newTeam: Team = {
      id: teamId,
      name: name.trim(),
      tag: tag.trim().toUpperCase().slice(0, 4),
      slogan: slogan.trim() || 'Forged in Fire and Glory',
      bio: bio.trim() || 'A new challenger syndicate entering the Apex Championship League backed by grassroots fans.',
      primaryColor: primaryColor,
      accentColor: '#F59E0B',
      bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      totalBalance: 120000,
      previousRank: 9,
      currentRank: 9,
      fanCount: 15400,
      boostMultiplier: 1.15,
      passiveIncomePerSec: 15,
      championshipWins: 0,
      players: players,
      isUserFavored: true
    };

    onCreateTeam(newTeam);
    soundManager.playLevelUp();
    onClose();
  };

  const presetColors = ['#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#64748B'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Franchise Expansion Office</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white font-display">
            Create Custom Championship Team
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Register your custom franchise in the league standings. Backers around the world can immediately begin crowdfunding your vault!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Franchise Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zenith Vanguard"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tag (3-4 chars)</label>
              <input
                type="text"
                required
                maxLength={4}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. ZNV"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Franchise Motto / Slogan</label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="e.g. No Heights Unconquered"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Banner Primary Color</label>
            <div className="flex items-center gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPrimaryColor(color)}
                  className={`w-8 h-8 rounded-lg transition-transform cursor-pointer ${
                    primaryColor === color ? 'scale-110 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Captain & Star Player Setup */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Founding Star Players (Captain & Striker)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Captain Name & Handle</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="Full Name (e.g. Alex Mercer)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={player1Handle}
                    onChange={(e) => setPlayer1Handle(e.target.value)}
                    placeholder="In-Game Handle (e.g. NovaStar)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Striker Name & Handle</label>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="Full Name (e.g. Jordan Lee)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={player2Handle}
                    onChange={(e) => setPlayer2Handle(e.target.value)}
                    placeholder="In-Game Handle (e.g. ApexViper)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>REGISTER FRANCHISE TO LEADERBOARD</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
