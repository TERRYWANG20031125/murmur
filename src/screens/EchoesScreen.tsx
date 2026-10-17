import React, {useState} from 'react';
import {EchoItem, EchoWarmNote} from '../types';
import {playRainWhiteNoise, stopCurrentAudio} from '../utils/audioPlayer';

interface EchoesScreenProps {
  echoes: EchoItem[];
  onAddEcho: (newEcho: EchoItem) => void;
  onUpdateEcho: (updated: EchoItem) => void;
}

export const EchoesScreen: React.FC<EchoesScreenProps> = ({
  echoes,
  onAddEcho,
  onUpdateEcho,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'light' | 'hug' | 'daily' | 'night'
  >('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [airplaneText, setAirplaneText] = useState('');
  const [airplaneMood, setAirplaneMood] = useState('✨ 寻找光亮');
  const [isSubmittingAirplane, setIsSubmittingAirplane] = useState(false);
  const [replyDrawerEchoId, setReplyDrawerEchoId] = useState<string | null>(null);
  const [newWarmNoteText, setNewWarmNoteText] = useState('');
  const [playingNoise, setPlayingNoise] = useState(false);
  const [floatingSparks, setFloatingSparks] = useState<
    {id: number; echoId: string; text: string}[]
  >([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedEchoId, setCopiedEchoId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyEcho = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedEchoId(id);
    showToast('低语内容已复制 📋');
    setTimeout(() => setCopiedEchoId((curr) => (curr === id ? null : curr)), 2000);
  };

  const filterTabs: {
    id: 'all' | 'light' | 'hug' | 'daily' | 'night';
    label: string;
    emoji?: string;
  }[] = [
    {id: 'all', label: '全部低语'},
    {id: 'light', label: '正在寻找光亮', emoji: '✨'},
    {id: 'hug', label: '需要一个抱抱', emoji: '🌧️'},
    {id: 'daily', label: '平静日常碎片', emoji: '☕'},
    {id: 'night', label: '睡不着的夜话', emoji: '💭'},
  ];

  const handleActionReaction = (
    echo: EchoItem,
    type: 'hugs' | 'lights' | 'tea',
    label: string,
  ) => {
    const isActed = echo.userReactions[type === 'hugs' ? 'hug' : type === 'lights' ? 'light' : 'tea'];
    const currentCount = echo.reactions[type];
    const newCount = isActed ? Math.max(0, currentCount - 1) : currentCount + 1;

    const updatedUserReactions = {
      ...echo.userReactions,
      [type === 'hugs' ? 'hug' : type === 'lights' ? 'light' : 'tea']: !isActed,
    };

    onUpdateEcho({
      ...echo,
      reactions: {
        ...echo.reactions,
        [type]: newCount,
      },
      userReactions: updatedUserReactions,
    });

    if (!isActed) {
      const sparkId = Date.now();
      setFloatingSparks((prev) => [
        ...prev,
        {id: sparkId, echoId: echo.id, text: `+1 ${label}`},
      ]);
      setTimeout(() => {
        setFloatingSparks((prev) => prev.filter((s) => s.id !== sparkId));
      }, 900);
      showToast(`已送去一份温暖的${label}`);
    }
  };

  const handleToggleRainNoise = () => {
    if (playingNoise) {
      stopCurrentAudio();
      setPlayingNoise(false);
    } else {
      setPlayingNoise(true);
      playRainWhiteNoise(undefined, () => setPlayingNoise(false), 20);
      showToast('正在播放深沉夜雨白噪音 🌧️');
    }
  };

  const handleSendWarmNote = (echoId: string) => {
    if (!newWarmNoteText.trim()) return;
    const targetEcho = echoes.find((e) => e.id === echoId);
    if (!targetEcho) return;

    const newNote: EchoWarmNote = {
      id: `note-${Date.now()}`,
      text: newWarmNoteText.trim(),
      author: '同频的旅人',
    };

    onUpdateEcho({
      ...targetEcho,
      warmNotes: [...targetEcho.warmNotes, newNote],
    });

    setNewWarmNoteText('');
    setReplyDrawerEchoId(null);
    showToast('已为旅人留下一缕温柔纸条 💌');
  };

  // Launching the Paper Airplane (calls Gemini server endpoint /api/echo-resonance)
  const handleSubmitAirplane = async () => {
    if (!airplaneText.trim()) {
      alert('请写下哪怕一句想说的话吧。');
      return;
    }

    setIsSubmittingAirplane(true);
    let travelerReply = '抱抱你！你已经在努力闪闪发光了，今晚好好休息，明天太阳依旧温暖。';

    try {
      const res = await fetch('/api/echo-resonance', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          thought: airplaneText,
          mood: airplaneMood,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          travelerReply = data.reply;
        }
      }
    } catch (err) {
      console.warn('Fallback response triggered:', err);
    }

    const newEchoItem: EchoItem = {
      id: `echo-${Date.now()}`,
      author: '放飞纸飞机的旅人',
      locationAndTime: '星海某处 · 刚刚',
      tag: airplaneMood.replace(/^[^\s]+\s*/, ''),
      tagEmoji: airplaneMood.slice(0, 2),
      category:
        airplaneMood.includes('抱抱')
          ? 'hug'
          : airplaneMood.includes('日常')
            ? 'daily'
            : airplaneMood.includes('夜话')
              ? 'night'
              : 'light',
      text: `“${airplaneText}”`,
      reactions: {
        hugs: 1,
        lights: 1,
        tea: 0,
      },
      userReactions: {
        hug: true,
      },
      warmNotes: [
        {
          id: `note-${Date.now()}`,
          text: travelerReply,
          author: '远方旅人的回音',
          isAi: true,
        },
      ],
    };

    onAddEcho(newEchoItem);
    setIsSubmittingAirplane(false);
    setIsDrawerOpen(false);
    setAirplaneText('');
    showToast('纸飞机已迎着微风放飞，远方旅人送来了回音 🕊️');
  };

  const filteredEchoes = echoes.filter((e) => {
    if (selectedFilter === 'all') return true;
    return e.category === selectedFilter;
  });

  return (
    <div className="flex flex-col w-full relative pb-52 pt-2">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1c1c18]/90 text-white text-xs backdrop-blur-md shadow-lg transition-all animate-fade-in flex items-center space-x-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#ffbcac]">
            auto_awesome
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subtle Ambient Glows */}
      <div className="fixed top-16 right-0 -z-10 w-72 h-72 rounded-full bg-[#ffbcac]/20 blur-3xl pointer-events-none" />
      <div className="fixed top-96 left-0 -z-10 w-64 h-64 rounded-full bg-[#cfe8e0]/25 blur-3xl pointer-events-none" />

      {/* Introspective Header Greeting */}
      <section className="px-5 pt-2 pb-2">
        <div className="p-5 rounded-2xl bg-[#f6f3ed] shadow-[0_4px_24px_-4px_rgba(76,99,93,0.06)] relative overflow-hidden border border-white/80">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-15 pointer-events-none text-[#845144]">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                fill="none"
                r="42"
                stroke="currentColor"
                strokeDasharray="140 100"
                strokeLinecap="round"
                strokeWidth="6"
              />
              <circle cx="28" cy="62" fill="currentColor" r="5" />
              <circle cx="72" cy="38" fill="currentColor" r="4" />
            </svg>
          </div>
          <div className="flex items-center space-x-2 text-[#4c635d] mb-1.5">
            <span className="material-symbols-outlined text-[18px]">
              radio_button_checked
            </span>
            <span className="text-xs font-semibold tracking-widest uppercase">
              静夜回响 · Resonance
            </span>
          </div>
          <p className="font-serif text-lg text-[#1c1c18] font-normal leading-relaxed">
            这里漂流着远方的低语，
            <br />
            我们共享同一片安静夜空。
          </p>
          <div className="mt-3 flex items-center space-x-2.5 text-[#424846] text-xs">
            <span className="inline-flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#4c635d] animate-pulse" />
              <span>当前有 2,419 颗心音同频中</span>
            </span>
            <span className="text-[#c2c8c5]">·</span>
            <span>拒绝评判 · 仅存温暖</span>
          </div>
        </div>
      </section>

      {/* Filter Pills */}
      <section className="w-full overflow-x-auto no-scrollbar px-5 py-2">
        <div className="flex items-center space-x-2 min-w-max">
          {filterTabs.map((tab) => {
            const active = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center space-x-1.5 ${
                  active
                    ? 'bg-[#4c635d] text-white shadow-xs'
                    : 'bg-[#f0eee8] text-[#424846] hover:bg-[#ebe8e2]'
                }`}
              >
                {tab.emoji && <span>{tab.emoji}</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Floating Echoes Stream */}
      <main className="px-5 space-y-4 py-2">
        {filteredEchoes.map((echo) => (
          <article
            key={echo.id}
            className="relative p-5 rounded-2xl bg-white/90 backdrop-blur-md shadow-[0_8px_24px_-4px_rgba(62,59,58,0.05)] border border-white/80 transition-all hover:shadow-[0_12px_32px_-4px_rgba(76,99,93,0.1)]"
          >
            {/* Header Meta */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#ffdbd2]/60 flex items-center justify-center text-[#845144]">
                  <span className="material-symbols-outlined text-[18px]">
                    sailing
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#1c1c18]">
                    {echo.author}
                  </span>
                  <span className="text-[10px] text-[#727876]">
                    {echo.locationAndTime}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffdbd2] text-[#341108] text-xs font-medium">
                {echo.tagEmoji} {echo.tag}
              </span>
            </div>

            {/* Thought Content */}
            <p className="font-serif text-base text-[#1c1c18] leading-relaxed my-3 font-normal">
              {echo.text}
            </p>

            {/* Optional Photo or Sound */}
            {echo.imageUrl && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden my-3 shadow-inner bg-[#f0eee8] group">
                <img
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  src={echo.imageUrl}
                  alt="回音剪影"
                />
                {echo.ambientSoundTitle && (
                  <div
                    onClick={handleToggleRainNoise}
                    className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-3 cursor-pointer"
                  >
                    <span className="text-xs text-white/95 tracking-wide flex items-center space-x-1.5 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[16px] animate-pulse">
                        {playingNoise ? 'volume_up' : 'play_circle'}
                      </span>
                      <span>
                        {echo.ambientSoundTitle}{' '}
                        {playingNoise ? '(播放中...)' : ''}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Gentle Touch Interaction Bar */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2 relative">
                {/* Floating spark toast for this card */}
                {floatingSparks
                  .filter((s) => s.echoId === echo.id)
                  .map((spark) => (
                    <span
                      key={spark.id}
                      className="absolute -top-6 left-12 text-[#845144] text-xs font-semibold pointer-events-none transition-all duration-700 animate-bounce"
                    >
                      {spark.text}
                    </span>
                  ))}

                {/* Hug Button */}
                <button
                  onClick={() =>
                    handleActionReaction(echo, 'hugs', '温暖拥抱')
                  }
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-all active:scale-95 ${
                    echo.userReactions.hug
                      ? 'bg-[#ffdbd2] text-[#341108] font-medium shadow-xs'
                      : 'bg-[#f0eee8] text-[#424846] hover:bg-[#ebe8e2]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] text-[#845144] transition-transform ${
                      echo.userReactions.hug ? 'material-symbols-fill scale-110' : ''
                    }`}
                  >
                    diversity_1
                  </span>
                  <span>
                    已收到{' '}
                    <span className="font-semibold">{echo.reactions.hugs}</span>{' '}
                    个拥抱
                  </span>
                </button>

                {/* Beam of Light Button */}
                <button
                  onClick={() =>
                    handleActionReaction(echo, 'lights', '微光')
                  }
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs transition-all active:scale-95 ${
                    echo.userReactions.light
                      ? 'bg-[#cfe8e0] text-[#091f1b] font-medium shadow-xs'
                      : 'bg-[#f0eee8] text-[#424846] hover:bg-[#ebe8e2]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] text-[#4c635d] transition-transform ${
                      echo.userReactions.light ? 'material-symbols-fill scale-110' : ''
                    }`}
                  >
                    light_mode
                  </span>
                  <span>送缕微光 {echo.reactions.lights}</span>
                </button>

                {/* Hot Tea Button */}
                <button
                  onClick={() => handleActionReaction(echo, 'tea', '热茶')}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs transition-all active:scale-95 ${
                    echo.userReactions.tea
                      ? 'bg-[#ffbcac] text-[#7a493d] font-medium shadow-xs'
                      : 'bg-[#f0eee8] text-[#424846] hover:bg-[#ebe8e2]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] text-[#845144] transition-transform ${
                      echo.userReactions.tea ? 'material-symbols-fill scale-110' : ''
                    }`}
                  >
                    emoji_food_beverage
                  </span>
                  <span>递杯热茶 {echo.reactions.tea}</span>
                </button>

                {/* Copy Whisper Button */}
                <button
                  onClick={() => handleCopyEcho(echo.id, echo.text)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ml-auto ${
                    copiedEchoId === echo.id
                      ? 'text-[#4c635d] bg-[#cfe8e0]'
                      : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#ebe8e2]'
                  }`}
                  aria-label="复制此条低语"
                  title="复制"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedEchoId === echo.id ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Gentle Notes Accordion */}
              {echo.warmNotes && echo.warmNotes.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-[#f6f3ed] space-y-2 border border-white/60">
                  <div className="flex items-center justify-between text-[#727876] text-xs px-1">
                    <span className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-[14px]">
                        mail
                      </span>
                      <span>{echo.warmNotes.length} 条匿名暖心纸条</span>
                    </span>
                    <button
                      onClick={() => setReplyDrawerEchoId(echo.id)}
                      className="text-[#4c635d] font-medium hover:underline cursor-pointer"
                    >
                      留下一缕温柔
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {echo.warmNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-xl bg-white/90 text-xs text-[#1c1c18] flex items-start space-x-2 border border-white/80"
                      >
                        <span className="text-[#845144] text-[12px] pt-0.5">
                          ✦
                        </span>
                        <div className="flex-1 min-w-0">
                          {note.author && (
                            <span className="text-[10px] text-[#845144] font-medium block mb-0.5">
                              {note.author} {note.isAi ? '· 倾听心音' : ''}
                            </span>
                          )}
                          <p className="leading-snug">{note.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Form if active for this echo */}
              {replyDrawerEchoId === echo.id && (
                <div className="mt-3 p-3 rounded-xl bg-white shadow-sm border border-[#cfe8e0] animate-fade-in">
                  <p className="text-xs text-[#424846] mb-1.5 font-medium">
                    给这位旅人留一张温暖纸条：
                  </p>
                  <input
                    type="text"
                    value={newWarmNoteText}
                    onChange={(e) => setNewWarmNoteText(e.target.value)}
                    placeholder="写一句轻声叮嘱或鼓励……"
                    className="w-full text-xs p-2 rounded-lg bg-[#f6f3ed] border border-[#e5e2dc] focus:outline-none focus:ring-1 focus:ring-[#4c635d]"
                  />
                  <div className="mt-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setReplyDrawerEchoId(null)}
                      className="px-2.5 py-1 text-xs text-[#727876]"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleSendWarmNote(echo.id)}
                      className="px-3 py-1 text-xs rounded-full bg-[#4c635d] text-white font-medium hover:bg-[#354b46]"
                    >
                      投递纸条
                    </button>
                  </div>
                </div>
              )}
            </div>
          </article>
        ))}
      </main>

      {/* Floating Paper Airplane Delivery Action Bar - Elevated safely above bottom Navbar */}
      <aside className="sticky bottom-[104px] sm:bottom-[114px] z-40 px-5 mb-3 pointer-events-none">
        <div
          onClick={() => setIsDrawerOpen(true)}
          className="pointer-events-auto mx-auto max-w-sm rounded-full bg-[#e5e2dc]/95 backdrop-blur-xl p-1.5 shadow-[0_12px_36px_-6px_rgba(76,99,93,0.26),0_6px_16px_rgba(62,59,58,0.12)] flex items-center justify-between cursor-pointer active:scale-98 transition-all hover:bg-[#ebe8e2] border border-white/90 ring-1 ring-[#4c635d]/15 hover:shadow-lg"
        >
          <div className="flex items-center space-x-2 pl-3">
            <div className="w-8 h-8 rounded-full bg-[#4c635d]/15 flex items-center justify-center text-[#4c635d] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[18px]">
                send
              </span>
            </div>
            <span className="text-xs text-[#424846] italic font-serif">
              把心事叠成纸飞机，投进回音海...
            </span>
          </div>
          <div className="px-4 py-2 rounded-full bg-[#4c635d] text-white text-xs font-semibold flex items-center space-x-1 shadow-sm hover:bg-[#354b46] active:scale-95 transition-all">
            <span>放飞</span>
            <span className="material-symbols-outlined text-[16px] transition-transform hover:translate-x-0.5">
              arrow_forward
            </span>
          </div>
        </div>
      </aside>

      {/* Interactive Modal Drawer for Confession */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end justify-center transition-opacity duration-300">
          <div className="w-full max-w-md bg-[#fcf9f3] rounded-t-3xl p-5 pb-8 sm:pb-6 shadow-2xl transform transition-transform duration-300 border-t border-white">
            <div className="w-12 h-1 rounded-full bg-[#e5e2dc] mx-auto mb-3" />
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#4c635d]">
                  sailing
                </span>
                <h3 className="font-serif text-lg font-medium text-[#1c1c18]">
                  放飞一架匿名纸飞机
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-full text-[#727876] hover:text-[#1c1c18]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-[#424846] mb-3 leading-relaxed">
              写下那句说不出口的叹息或欣喜。完全匿名，无需顾虑目光，此地只接纳柔和的微风与远方旅人的回音。
            </p>

            <div className="relative rounded-2xl bg-[#f6f3ed] p-3.5 mb-4 border border-white/80">
              <textarea
                value={airplaneText}
                onChange={(e) => setAirplaneText(e.target.value)}
                placeholder="此刻在想些什么？（例如：其实今天下班路上买的花很香，虽然加班很晚……）"
                rows={4}
                className="w-full bg-transparent border-none outline-none resize-none font-serif text-sm text-[#1c1c18] placeholder:text-[#727876]/60 placeholder:italic leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 text-[#727876] text-[11px] border-t border-[#ebe8e2]">
                <div className="flex items-center space-x-1.5">
                  <span>🏷️ 氛围：</span>
                  {['✨ 寻找光亮', '🌧️ 渴望抱抱', '☕ 平静日常'].map((vibe) => (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => setAirplaneMood(vibe)}
                      className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                        airplaneMood === vibe
                          ? 'bg-[#4c635d] text-white'
                          : 'bg-white text-[#424846]'
                      }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
                <span>{airplaneText.length}/300</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#f0eee8] text-[#1c1c18] text-xs font-medium hover:bg-[#e5e2dc]"
              >
                收起心事
              </button>
              <button
                onClick={handleSubmitAirplane}
                disabled={isSubmittingAirplane}
                className="flex-1 py-3 rounded-xl bg-[#4c635d] text-white text-xs font-semibold shadow-xs flex items-center justify-center space-x-1.5 hover:bg-[#354b46] active:scale-95 transition-all disabled:opacity-70"
              >
                <span>
                  {isSubmittingAirplane ? '正在送入夜空...' : '折叠并放飞'}
                </span>
                <span className="material-symbols-outlined text-[18px]">
                  air
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
