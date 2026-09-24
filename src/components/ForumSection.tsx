import React, { useState } from 'react';
import { ForumTopic, Language } from '../types';
import { translations } from '../i18n/translations';
import { 
  MessageSquare, 
  Swords, 
  Heart, 
  Share2, 
  Plus, 
  Flame, 
  Trophy, 
  Lightbulb, 
  Newspaper,
  Gamepad2,
  X,
  Send
} from 'lucide-react';

interface ForumSectionProps {
  topics: ForumTopic[];
  language: Language;
  onChallengeTopic: (gameId: string, betAmount: number, opponentName: string) => void;
  onAddTopic: (newTopic: Partial<ForumTopic>) => void;
}

export const ForumSection: React.FC<ForumSectionProps> = ({
  topics,
  language,
  onChallengeTopic,
  onAddTopic,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newBet, setNewBet] = useState(500);
  const [isChallengePost, setIsChallengePost] = useState(false);
  const [likedTopics, setLikedTopics] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'all', label: t.allTopics, icon: Flame },
    { id: 'challenges', label: '⚔️ Desafios PvP', icon: Swords },
    { id: 'games', label: '🎮 Jogos', icon: Gamepad2 },
    { id: 'tournaments', label: '🏆 Torneios', icon: Trophy },
    { id: 'strategies', label: '💬 Estratégias', icon: Lightbulb },
    { id: 'news', label: '📰 Novidades', icon: Newspaper },
  ];

  const filteredTopics = selectedCategory === 'all'
    ? topics
    : topics.filter(top => top.category === selectedCategory);

  const handleToggleLike = (id: string) => {
    setLikedTopics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmitNewTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddTopic({
      title: newTitle,
      content: newContent,
      category: isChallengePost ? 'challenges' : 'general',
      challengeBet: isChallengePost ? newBet : undefined,
      challengeGameId: isChallengePost ? 'chess' : undefined,
    });

    setNewTitle('');
    setNewContent('');
    setIsChallengePost(false);
    setModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header & New Topic Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-[#FF6A00]" />
            {t.forumTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            {t.forumSubtitle}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#FF8A1F] active:scale-95 text-black font-black text-xs uppercase rounded-xl transition-all shadow-lg glow-orange-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t.newTopic}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF6A00] text-black shadow-md'
                  : 'bg-[#151515] text-neutral-400 hover:text-white hover:bg-[#202020] border border-[#262626]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Topic List */}
      <div className="space-y-3">
        {filteredTopics.map(topic => {
          const isLiked = !!likedTopics[topic.id];
          return (
            <div
              key={topic.id}
              className="bg-[#141414] border border-[#222] hover:border-[#333] rounded-2xl p-4 sm:p-5 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Author info */}
                <div className="flex items-center gap-3">
                  <img
                    src={topic.author.avatar}
                    alt={topic.author.username}
                    className="w-10 h-10 rounded-xl object-cover border border-[#333]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white">{topic.author.username}</span>
                      <span className="text-[10px] font-mono text-[#FF6A00] bg-[#FF6A00]/10 px-1.5 py-0.2 rounded border border-[#FF6A00]/30 font-bold">
                        Lv.{topic.author.level}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">{topic.timestamp}</span>
                  </div>
                </div>

                {/* Challenge Badge if direct PvP wager */}
                {topic.challengeBet && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#FF6A00] bg-[#FF6A00]/15 px-2.5 py-1 rounded-lg border border-[#FF6A00]/30 hidden sm:inline">
                      Valendo {topic.challengeBet} RC
                    </span>
                    <button
                      onClick={() => onChallengeTopic(topic.challengeGameId || 'chess', topic.challengeBet!, topic.author.username)}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#FF6A00] to-[#FF8A1F] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer glow-orange-sm"
                    >
                      <Swords className="w-3.5 h-3.5 fill-black" />
                      <span>{t.challengeNow}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Body */}
              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-bold text-white hover:text-[#FF6A00] transition-colors cursor-pointer">
                  {topic.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1.5 leading-relaxed">
                  {topic.content}
                </p>
              </div>

              {/* Mobile Challenge button if wager */}
              {topic.challengeBet && (
                <div className="sm:hidden mt-3 pt-3 border-t border-[#222] flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FF6A00]">
                    Aposta: {topic.challengeBet} RC
                  </span>
                  <button
                    onClick={() => onChallengeTopic(topic.challengeGameId || 'chess', topic.challengeBet!, topic.author.username)}
                    className="px-3 py-1 bg-[#FF6A00] text-black font-black text-xs uppercase rounded-lg flex items-center gap-1"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    DESAFIAR
                  </button>
                </div>
              )}

              {/* Topic Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[#1f1f1f] flex items-center gap-6 text-xs text-neutral-400">
                <button
                  onClick={() => handleToggleLike(topic.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLiked ? 'text-red-500 font-bold' : 'hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                  <span>{topic.likes + (isLiked ? 1 : 0)}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{topic.repliesCount} respostas</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Topic Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2b2b2b] rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <h2 className="font-bold text-white text-base">Criar Novo Tópico na Comunidade</h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewTopic} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Título:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Alguém para uma partida de Xadrez agora?"
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6A00]"
                  required
                />
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-bold">Mensagem:</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Escreva sua pergunta, análise ou lance um desafio aberto..."
                  className="w-full bg-[#1c1c1c] border border-[#333] rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6A00] resize-none"
                  required
                />
              </div>

              <div className="bg-[#1c1c1c] p-3 rounded-xl border border-[#333] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChallengePost}
                    onChange={e => setIsChallengePost(e.target.checked)}
                    className="accent-[#FF6A00] w-4 h-4"
                  />
                  <span className="font-bold text-white">Anexar Desafio PvP Instantâneo (⚔️ Botão Desafiar)</span>
                </label>

                {isChallengePost && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-neutral-400">Valor da aposta:</span>
                    <select
                      value={newBet}
                      onChange={e => setNewBet(parseInt(e.target.value))}
                      className="bg-[#111] border border-[#444] rounded-lg px-2.5 py-1 text-white font-mono"
                    >
                      <option value={100}>100 RC</option>
                      <option value={250}>250 RC</option>
                      <option value={500}>500 RC</option>
                      <option value={1000}>1.000 RC</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#222] text-neutral-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6A00] hover:bg-[#FF8A1F] text-black font-black uppercase rounded-xl"
                >
                  Publicar Tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
