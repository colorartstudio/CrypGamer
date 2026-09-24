import React, { useState } from 'react';
import { UserProfile, ReferralTier, Language } from '../types';
import { translations } from '../i18n/translations';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  Calculator
} from 'lucide-react';

interface ReferralNetworkProps {
  user: UserProfile;
  tiers: ReferralTier[];
  language: Language;
}

export const ReferralNetwork: React.FC<ReferralNetworkProps> = ({
  user,
  tiers,
  language,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const [calcBet, setCalcBet] = useState(1000);

  const referralUrl = `https://crypgamer.com/register?ref=${user.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Commission simulation based on exact prompt math:
  // Bet 1.000 RC -> Rake 150 RC -> 50% Network = 75 RC
  // N1: 25% rake (37 RC)
  // N2: 10% rake (15 RC)
  // N3: 5% rake (7 RC)
  // N4: 5% rake (7 RC)
  // N5: 5% rake (7 RC)
  const simulatedRake = Math.floor(calcBet * 0.15);

  const mockRecentMembers = [
    { username: 'NeoGamer_88', level: 1, joinedDate: 'Hoje, 14:20', rakeGenerated: 340, status: 'Ativo' },
    { username: 'VortexSniper', level: 1, joinedDate: 'Ontem', rakeGenerated: 180, status: 'Ativo' },
    { username: 'QueenGambit', level: 2, joinedDate: '2 dias atrás', rakeGenerated: 420, status: 'Ativo' },
    { username: 'BlitzMaster', level: 3, joinedDate: '3 dias atrás', rakeGenerated: 210, status: 'Ausente' },
    { username: 'CyberTank', level: 4, joinedDate: '5 dias atrás', rakeGenerated: 95, status: 'Ativo' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-8 h-8 text-[#FF6A00]" />
            {t.networkTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            {t.networkSubtitle}
          </p>
        </div>

        {/* Global Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] border border-[#222] px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">{t.totalMembers}</span>
            <span className="text-xl font-black font-mono text-white">{user.networkCount}</span>
          </div>
          <div className="bg-[#141414] border border-[#222] px-4 py-2.5 rounded-xl text-right">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">{t.totalEarned}</span>
            <span className="text-xl font-black font-mono text-[#20D67B]">
              {user.totalNetworkEarnings.toLocaleString()} RC
            </span>
          </div>
        </div>
      </div>

      {/* Referral Link Copy Bar */}
      <div className="bg-gradient-to-r from-orange-950/40 via-[#141414] to-[#141414] border border-[#FF6A00]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center text-black font-black shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs text-neutral-400 font-bold uppercase block">{t.yourReferralLink}</span>
            <span className="text-xs sm:text-sm font-mono text-white truncate block">
              {referralUrl}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full sm:w-auto px-6 py-2.5 bg-[#FF6A00] hover:bg-[#FF8A1F] active:scale-95 text-black font-black text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg glow-orange-sm cursor-pointer shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? t.copied : t.copyLink}</span>
        </button>
      </div>

      {/* 5-Level Architecture Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF6A00]" />
            Estrutura de Comissões em 5 Níveis (50% do Rake)
          </h2>
          <span className="text-xs text-neutral-500 font-mono hidden sm:inline">Pesos [5, 2, 1, 1, 1]</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {tiers.map(tier => (
            <div
              key={tier.level}
              className="bg-[#141414] border border-[#222] hover:border-[#FF6A00]/40 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-2 py-0.5 rounded border border-[#FF6A00]/20">
                  NÍVEL {tier.level}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {tier.membersCount} {t.members}
                </span>
              </div>

              <div className="space-y-1 my-3">
                <div className="text-xl font-black font-mono text-white">
                  {tier.percentageOfRake}% <span className="text-xs font-normal text-neutral-400">do rake</span>
                </div>
                <div className="text-xs text-neutral-400 font-mono">
                  ({tier.percentageOfBet}% da aposta)
                </div>
              </div>

              <div className="pt-2 border-t border-[#222] flex justify-between text-xs">
                <span className="text-neutral-500">Rendimento:</span>
                <span className="font-mono font-bold text-[#20D67B]">
                  +{tier.totalEarned.toLocaleString()} RC
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Network Calculator */}
      <div className="bg-[#111] border border-[#222] rounded-2xl p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
          <Calculator className="w-4 h-4 text-[#FF6A00]" />
          <span>Simulador Matemático de Comissões por Partida</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Aposta do Indicado (RC):</label>
            <div className="flex gap-2">
              {[100, 500, 1000, 2500].map(val => (
                <button
                  key={val}
                  onClick={() => setCalcBet(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    calcBet === val
                      ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                      : 'bg-[#181818] text-neutral-300 border-[#282828] hover:border-[#444]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
            <span className="text-[11px] text-neutral-400 block">Rake Individual (15%)</span>
            <span className="text-base font-bold font-mono text-white">{simulatedRake} RC</span>
          </div>

          <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
            <span className="text-[11px] text-neutral-400 block">Sua Comissão Nível 1 (25% rake)</span>
            <span className="text-base font-bold font-mono text-[#20D67B]">
              +{Math.floor(simulatedRake * 0.25)} RC
            </span>
          </div>

          <div className="bg-[#171717] p-3 rounded-xl border border-[#262626]">
            <span className="text-[11px] text-neutral-400 block">Comissão Nível 2 (10% rake)</span>
            <span className="text-base font-bold font-mono text-neutral-200">
              +{Math.floor(simulatedRake * 0.10)} RC
            </span>
          </div>
        </div>
      </div>

      {/* Recent Network Activity List */}
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#222] flex justify-between items-center">
          <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
            Membros Recentes na Sua Rede
          </span>
          <span className="text-xs text-neutral-500 font-mono">148 no total</span>
        </div>

        <div className="divide-y divide-[#1c1c1c]">
          {mockRecentMembers.map((member, idx) => (
            <div key={idx} className="p-3.5 sm:px-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1c1c1c] border border-[#333] flex items-center justify-center font-bold text-[#FF6A00]">
                  L{member.level}
                </div>
                <div>
                  <span className="font-bold text-white block">{member.username}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">Entrou: {member.joinedDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right font-mono">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Rake Movimentado</span>
                  <span className="text-white font-bold">{member.rakeGenerated} RC</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-neutral-500 block text-[10px]">Status</span>
                  <span className="text-[#20D67B] font-bold">{member.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
