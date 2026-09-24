import React, { useState } from 'react';
import { UserProfile, WalletTransaction, Language } from '../types';
import { translations } from '../i18n/translations';
import { 
  X, 
  Wallet, 
  User, 
  Trophy, 
  Flame, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  Minus, 
  ShieldCheck, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface ProfileWalletModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'wallet';
  language: Language;
  onDepositSim: (amount: number) => void;
  onWithdrawSim: (amount: number) => void;
  transactions: WalletTransaction[];
}

export const ProfileWalletModal: React.FC<ProfileWalletModalProps> = ({
  user,
  isOpen,
  onClose,
  defaultTab = 'profile',
  language,
  onDepositSim,
  onWithdrawSim,
  transactions,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>(defaultTab);
  const [amountInput, setAmountInput] = useState<number>(500);

  if (!isOpen) return null;

  const totalMatches = user.wins + user.losses + user.draws;
  const winRate = totalMatches > 0 ? ((user.wins / totalMatches) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#111111] border border-[#2b2b2b] rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#161616]">
          {/* Tab Switcher */}
          <div className="flex bg-[#0c0c0c] p-1 rounded-xl border border-[#262626]">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#FF6A00] text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Perfil Gamer</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-[#FF6A00] text-black shadow-md font-black'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Carteira RC</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-[#202020] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: PERFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* User Identity Card */}
              <div className="flex items-center gap-4 bg-[#171717] border border-[#262626] rounded-2xl p-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FF6A00]"
                  />
                  <span className="absolute -bottom-2 -right-2 bg-[#FF6A00] text-black text-xs font-black font-mono px-2 py-0.5 rounded-full shadow">
                    Lv.{user.level}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white font-display uppercase tracking-wider">
                      {user.username}
                    </h2>
                    <span className="text-xs text-[#20D67B] font-mono font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-[#20D67B]" /> {user.winStreak} Streak
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    ID: {user.id} • Membro desde {user.joinedDate}
                  </span>

                  {/* XP Bar */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono mb-1">
                      <span>XP: {user.xp} / {user.nextLevelXp}</span>
                      <span>{Math.round((user.xp / user.nextLevelXp) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-[#FF6A00] rounded-full"
                        style={{ width: `${(user.xp / user.nextLevelXp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid from Prompt Section 30 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#161616] p-3 rounded-xl border border-[#242424] text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    {t.matches}
                  </span>
                  <span className="text-2xl font-black font-mono text-white">{totalMatches}</span>
                </div>

                <div className="bg-[#161616] p-3 rounded-xl border border-[#242424] text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    {t.wins}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#20D67B]">{user.wins}</span>
                </div>

                <div className="bg-[#161616] p-3 rounded-xl border border-[#242424] text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    {t.losses}
                  </span>
                  <span className="text-2xl font-black font-mono text-red-400">{user.losses}</span>
                </div>

                <div className="bg-[#161616] p-3 rounded-xl border border-[#242424] text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    {t.winRate}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#FF6A00]">{winRate}%</span>
                </div>
              </div>

              {/* Quick Summary Pill */}
              <div className="bg-[#141414] border border-[#222] rounded-xl p-3.5 text-xs text-neutral-300 flex justify-between items-center">
                <span>Indicados na Rede:</span>
                <span className="font-bold text-white font-mono">{user.networkCount} membros</span>
              </div>
            </div>
          )}

          {/* TAB 2: CARTEIRA RC */}
          {activeTab === 'wallet' && (
            <div className="space-y-5">
              {/* Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-[#FF6A00]/40 rounded-xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    {t.availableBalance}
                  </span>
                  <span className="text-2xl font-black font-mono text-white">
                    {user.balance.toLocaleString()} <span className="text-xs text-[#FF6A00]">RC</span>
                  </span>
                </div>

                <div className="bg-[#161616] border border-[#262626] rounded-xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-neutral-500" />
                    {t.lockedBalance}
                  </span>
                  <span className="text-2xl font-black font-mono text-neutral-300">
                    {user.lockedBalance.toLocaleString()} <span className="text-xs text-neutral-500">RC</span>
                  </span>
                </div>

                <div className="bg-[#161616] border border-[#262626] rounded-xl p-3.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    {t.totalBalance}
                  </span>
                  <span className="text-2xl font-black font-mono text-[#20D67B]">
                    {(user.balance + user.lockedBalance).toLocaleString()} <span className="text-xs text-[#20D67B]">RC</span>
                  </span>
                </div>
              </div>

              {/* Simulation Deposit / Withdraw Bar */}
              <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Simulação de Saldo (Ambiente MVP)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={amountInput}
                    onChange={e => setAmountInput(Math.max(10, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-[#101010] border border-[#333] rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                  <button
                    onClick={() => onDepositSim(amountInput)}
                    className="px-4 py-2 bg-[#20D67B] hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Depositar
                  </button>
                  <button
                    onClick={() => onWithdrawSim(amountInput)}
                    disabled={user.balance < amountInput}
                    className="px-4 py-2 bg-[#262626] hover:bg-[#333] text-white font-bold text-xs uppercase rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Sacar
                  </button>
                </div>
              </div>

              {/* Transaction Ledger */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                  {t.recentTransactions}
                </span>
                <div className="bg-[#141414] border border-[#222] rounded-xl divide-y divide-[#1f1f1f] max-h-48 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <div className="p-4 text-xs text-neutral-500 text-center">Nenhuma transação registrada.</div>
                  ) : (
                    transactions.map(tx => (
                      <div key={tx.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            tx.amount >= 0 ? 'bg-[#20D67B]/15 text-[#20D67B]' : 'bg-red-500/15 text-red-400'
                          }`}>
                            {tx.amount >= 0 ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{tx.description}</span>
                            <span className="text-[10px] text-neutral-500 font-mono">{tx.date}</span>
                          </div>
                        </div>
                        <span className={`font-mono font-bold ${tx.amount >= 0 ? 'text-[#20D67B]' : 'text-red-400'}`}>
                          {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} RC
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
