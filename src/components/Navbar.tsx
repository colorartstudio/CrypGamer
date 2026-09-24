import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../i18n/translations';
import { 
  Gamepad2, 
  Wallet, 
  Globe, 
  Bell, 
  Menu, 
  X, 
  Shield, 
  Users, 
  Trophy, 
  MessageSquare, 
  Swords, 
  ChevronDown,
  Sparkles,
  Plus
} from 'lucide-react';

interface NavbarProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  user: UserProfile;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenWallet: () => void;
  onOpenProfile: () => void;
  jackpotAmount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onSelectLanguage,
  user,
  activeTab,
  onSelectTab,
  onOpenWallet,
  onOpenProfile,
  jackpotAmount,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const t = translations[language];

  const languages = [
    { code: 'pt' as Language, label: 'PT-BR', flag: '🇧🇷', name: 'Português' },
    { code: 'en' as Language, label: 'EN', flag: '🇺🇸', name: 'English' },
    { code: 'es' as Language, label: 'ES', flag: '🇪🇸', name: 'Español' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const navLinks = [
    { id: 'home', label: t.navHome, icon: Gamepad2 },
    { id: 'games', label: t.navGames, icon: Gamepad2 },
    { id: 'multiplayer', label: t.navMultiplayer, icon: Swords },
    { id: 'forum', label: t.navForum, icon: MessageSquare },
    { id: 'ranking', label: t.navRanking, icon: Trophy },
    { id: 'network', label: t.navNetwork, icon: Users },
    { id: 'admin', label: t.navAdmin, icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/95 backdrop-blur-md border-b border-[#1c1c1c]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Brand Logo */}
        <div className="flex items-center min-w-0">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center group cursor-pointer select-none min-w-0"
            aria-label="CrypGamer — Home"
          >
            <img
              src="/assets/logo/logo_CrypG.png"
              alt="CrypGamer"
              className="h-8 w-auto max-w-[130px] sm:h-9 sm:max-w-[180px] md:h-10 md:max-w-[220px] lg:h-11 lg:max-w-[240px] object-contain object-left group-hover:opacity-90 transition-opacity"
              decoding="async"
            />
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#FF6A00] bg-[#171717] border border-[#FF6A00]/40 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Language Icon Selector + Wallet Pill + Profile (compact & visible on all screens) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* LANGUAGE SELECTOR (EN, ES, PT-BR) */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] text-xs font-semibold text-neutral-300 transition-colors"
              title="Mudar idioma / Change language"
            >
              <span className="text-xs sm:text-sm leading-none">{currentLangObj.flag}</span>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold">
                {currentLangObj.label.replace('PT-', '')}
              </span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400" />
            </button>

            {langDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-36 bg-[#141414] border border-[#2b2b2b] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] uppercase font-bold text-neutral-500 px-2 py-1">
                    Idioma / Language
                  </div>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                        language === lang.code
                          ? 'bg-[#FF6A00] text-black font-bold'
                          : 'text-neutral-300 hover:bg-[#202020]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      <span className="text-[10px] opacity-75 font-mono">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RC WALLET BALANCE PILL */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#171717] to-[#141414] hover:from-[#202020] hover:to-[#1c1c1c] border border-[#2a2a2a] hover:border-[#FF6A00]/50 transition-all cursor-pointer shadow-sm group shrink-0"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#FF6A00]/15 flex items-center justify-center text-[#FF6A00] shrink-0">
              <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] text-neutral-400 leading-none hidden xs:inline">Saldo</span>
              <span className="text-[11px] sm:text-xs font-black font-mono text-white group-hover:text-[#FF6A00] transition-colors leading-tight">
                {user.balance.toLocaleString()} <span className="text-[#FF6A00] text-[9px] sm:text-[10px]">RC</span>
              </span>
            </div>
            <Plus className="w-3 h-3 text-neutral-500 group-hover:text-white ml-0.5 hidden sm:block" />
          </button>

          {/* User Profile Avatar (remains in the top right corner as requested) */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 p-0.5 sm:px-2 sm:py-1 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] transition-colors cursor-pointer shrink-0"
            title="Abrir Perfil"
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#333]"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#FF6A00] text-black text-[8px] sm:text-[9px] font-mono font-black px-1 rounded-full leading-tight">
                {user.level}
              </span>
            </div>
            <span className="text-xs font-bold text-neutral-200 hidden md:inline">
              {user.username}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
