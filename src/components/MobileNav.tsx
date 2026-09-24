import React, { useState } from 'react';
import { 
  Home, 
  Swords, 
  Gamepad2, 
  Trophy, 
  Menu, 
  X, 
  User, 
  Wallet, 
  Users, 
  MessageSquare, 
  Shield, 
  Globe, 
  ChevronRight,
  Flame,
  Plus
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';

interface MobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenWallet: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  language,
  onSelectLanguage,
  user,
  onOpenProfile,
  onOpenWallet,
}) => {
  const t = translations[language];
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);

  // The 5 bottom navigation items: Home, PvP, Jogos, Ranking, and MENU (replaces profile)
  const items = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'multiplayer', label: 'PvP', icon: Swords },
    { id: 'games', label: t.navGames, icon: Gamepad2 },
    { id: 'ranking', label: t.navRanking, icon: Trophy },
    { id: 'menu', label: 'Menu', icon: Menu },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'menu') {
      setMenuDrawerOpen(true);
    } else {
      setMenuDrawerOpen(false);
      onSelectTab(id);
    }
  };

  const handleNavigateFromDrawer = (tab: string) => {
    setMenuDrawerOpen(false);
    onSelectTab(tab);
  };

  const totalMatches = user.wins + user.losses + user.draws;
  const winRate = totalMatches > 0 ? ((user.wins / totalMatches) * 100).toFixed(1) : '0.0';

  const languages = [
    { code: 'pt' as Language, label: 'PT-BR', flag: '🇧🇷' },
    { code: 'en' as Language, label: 'EN', flag: '🇺🇸' },
    { code: 'es' as Language, label: 'ES', flag: '🇪🇸' },
  ];

  return (
    <>
      {/* 1. Mobile Bottom Bar: Home | PvP | Jogos | Ranking | Menu */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-md border-t border-[#1f1f1f] px-2 py-1 pb-safe select-none">
        <div className="grid grid-cols-5 gap-1">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = item.id === 'menu' ? menuDrawerOpen : (activeTab === item.id && !menuDrawerOpen);
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#FF6A00] font-black'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-[#FF6A00]/15 scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 2. Mobile Menu Bottom Sheet / Drawer */}
      {menuDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="flex-1"
            onClick={() => setMenuDrawerOpen(false)}
          />

          <div className="bg-[#121212] border-t border-[#262626] rounded-t-3xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl p-4 space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Header of Menu Drawer */}
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <div className="flex items-center gap-2">
                <Menu className="w-5 h-5 text-[#FF6A00]" />
                <span className="font-display text-xl font-black text-white uppercase tracking-wider">
                  Menu CrypGamer
                </span>
              </div>
              <button
                onClick={() => setMenuDrawerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-[#1c1c1c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prominent Profile Section inside the Menu (Requested by User) */}
            <div
              onClick={() => {
                setMenuDrawerOpen(false);
                onOpenProfile();
              }}
              className="bg-gradient-to-r from-[#1c1c1c] via-[#171717] to-orange-950/30 border border-[#2b2b2b] hover:border-[#FF6A00]/60 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#FF6A00]"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-[#FF6A00] text-black text-[9px] font-mono font-black px-1.5 rounded-full">
                    Lv.{user.level}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{user.username}</span>
                    <span className="text-[10px] text-[#20D67B] font-mono font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-[#20D67B]" /> {user.winStreak}W
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">
                    {user.wins}V • {user.losses}D • {winRate}% Win Rate
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#FF6A00] text-xs font-bold font-mono shrink-0">
                <span>Ver Perfil</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Wallet Bar inside the Menu */}
            <div
              onClick={() => {
                setMenuDrawerOpen(false);
                onOpenWallet();
              }}
              className="bg-[#171717] border border-[#262626] rounded-2xl p-3 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/15 flex items-center justify-center text-[#FF6A00]">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block leading-none">
                    Carteira RC
                  </span>
                  <span className="text-sm font-black font-mono text-white leading-tight">
                    {user.balance.toLocaleString()} <span className="text-[#FF6A00] text-xs">RC</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#20D67B] font-bold">
                <Plus className="w-3.5 h-3.5" />
                <span>Depositar / Sacar</span>
              </div>
            </div>

            {/* Menu Links Navigation List */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => handleNavigateFromDrawer('network')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171717] hover:bg-[#1e1e1e] text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-[#FF6A00] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Minha Rede (5 Níveis de Afiliados)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                onClick={() => handleNavigateFromDrawer('forum')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171717] hover:bg-[#1e1e1e] text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span>Fórum & Desafios PvP da Comunidade</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                onClick={() => handleNavigateFromDrawer('ranking')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171717] hover:bg-[#1e1e1e] text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span>Ranking Global e Sorteio do Jackpot</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>

              <button
                onClick={() => handleNavigateFromDrawer('admin')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#171717] hover:bg-[#1e1e1e] text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span>Painel Administrativo & Novos Jogos</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Language Selector inside Menu Drawer */}
            <div className="pt-2 border-t border-[#222]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Idioma / Language
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => onSelectLanguage(lang.code)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      language === lang.code
                        ? 'bg-[#FF6A00] text-black border-[#FF6A00] font-black'
                        : 'bg-[#181818] text-neutral-300 border-[#2b2b2b]'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setMenuDrawerOpen(false)}
              className="w-full py-3 bg-[#1e1e1e] hover:bg-[#252525] text-neutral-300 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
            >
              Fechar Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
