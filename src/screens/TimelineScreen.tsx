import React, {useState} from 'react';
import {TimelineItem} from '../types';
import {playGentleWindChime, stopCurrentAudio} from '../utils/audioPlayer';

interface TimelineScreenProps {
  timeline: TimelineItem[];
  onOpenCompose: (defaultText?: string, defaultMood?: string) => void;
  onUpdateTimelineItem: (updated: TimelineItem) => void;
}

interface MoodAuraConfig {
  name: string;
  gradientBorder: string;
  ambientOrb: string;
  bottomGlow: string;
  bottomHalo: string;
  badgeBg: string;
  badgeText: string;
  shadowHover: string;
}

function getMoodAuraConfig(badge: string = '', text: string = ''): MoodAuraConfig {
  const combined = (badge + ' ' + text).toLowerCase();
  if (
    combined.includes('确幸') ||
    combined.includes('温暖') ||
    combined.includes('杏粉') ||
    combined.includes('闪光') ||
    combined.includes('喜悦') ||
    combined.includes('阳光') ||
    combined.includes('红薯')
  ) {
    return {
      name: 'warm',
      gradientBorder: 'border-[#ffbcac]/70 hover:border-[#ffbcac]',
      ambientOrb:
        'radial-gradient(circle at top right, rgba(255, 188, 172, 0.35) 0%, rgba(255, 219, 210, 0.12) 40%, transparent 75%)',
      bottomGlow:
        'bg-gradient-to-r from-transparent via-[#ffbcac] to-transparent shadow-[0_4px_16px_rgba(255,188,172,0.6)]',
      bottomHalo: 'rgba(255, 188, 172, 0.4)',
      badgeBg: 'bg-[#ffbcac]/40',
      badgeText: 'text-[#7a493d]',
      shadowHover: 'hover:shadow-[0_12px_32px_-4px_rgba(255,188,172,0.35)]',
    };
  }
  if (
    combined.includes('雨') ||
    combined.includes('黛蓝') ||
    combined.includes('放空') ||
    combined.includes('小疲惫') ||
    combined.includes('微凉') ||
    combined.includes('微倦') ||
    combined.includes('湿漉漉')
  ) {
    return {
      name: 'twilight',
      gradientBorder: 'border-[#b8c8d8]/75 hover:border-[#8c9cab]',
      ambientOrb:
        'radial-gradient(circle at top right, rgba(184, 200, 216, 0.38) 0%, rgba(212, 228, 245, 0.12) 45%, transparent 75%)',
      bottomGlow:
        'bg-gradient-to-r from-transparent via-[#b8c8d8] to-transparent shadow-[0_4px_16px_rgba(184,200,216,0.6)]',
      bottomHalo: 'rgba(184, 200, 216, 0.4)',
      badgeBg: 'bg-[#d4e4f5]/60',
      badgeText: 'text-[#0d1d29]',
      shadowHover: 'hover:shadow-[0_12px_32px_-4px_rgba(81,96,110,0.25)]',
    };
  }
  if (
    combined.includes('嫩芽') ||
    combined.includes('薄荷') ||
    combined.includes('清爽') ||
    combined.includes('释然') ||
    combined.includes('松弛') ||
    combined.includes('放晴') ||
    combined.includes('舒展')
  ) {
    return {
      name: 'mint',
      gradientBorder: 'border-[#b3ccc4]/75 hover:border-[#98b0a9]',
      ambientOrb:
        'radial-gradient(circle at top right, rgba(207, 232, 224, 0.4) 0%, rgba(179, 204, 196, 0.12) 45%, transparent 75%)',
      bottomGlow:
        'bg-gradient-to-r from-transparent via-[#98b0a9] to-transparent shadow-[0_4px_16px_rgba(152,176,169,0.6)]',
      bottomHalo: 'rgba(152, 176, 169, 0.4)',
      badgeBg: 'bg-[#cfe8e0]/60',
      badgeText: 'text-[#091f1b]',
      shadowHover: 'hover:shadow-[0_12px_32px_-4px_rgba(76,99,93,0.22)]',
    };
  }
  if (
    combined.includes('浅紫') ||
    combined.includes('感性') ||
    combined.includes('期待') ||
    combined.includes('星尘') ||
    combined.includes('向往')
  ) {
    return {
      name: 'violet',
      gradientBorder: 'border-[#e5d4e8]/85 hover:border-[#d4c0d9]',
      ambientOrb:
        'radial-gradient(circle at top right, rgba(229, 212, 232, 0.38) 0%, rgba(240, 230, 245, 0.12) 45%, transparent 75%)',
      bottomGlow:
        'bg-gradient-to-r from-transparent via-[#e5d4e8] to-transparent shadow-[0_4px_16px_rgba(229,212,232,0.6)]',
      bottomHalo: 'rgba(229, 212, 232, 0.4)',
      badgeBg: 'bg-[#e5d4e8]/60',
      badgeText: 'text-[#394855]',
      shadowHover: 'hover:shadow-[0_12px_32px_-4px_rgba(157,173,188,0.25)]',
    };
  }
  // Default warm golden parchment aura
  return {
    name: 'default',
    gradientBorder: 'border-[#ffdbd2]/70 hover:border-[#ffbcac]',
    ambientOrb:
      'radial-gradient(circle at top right, rgba(255, 219, 210, 0.32) 0%, transparent 65%)',
    bottomGlow:
      'bg-gradient-to-r from-transparent via-[#ffdbd2] to-transparent shadow-[0_4px_16px_rgba(255,219,210,0.5)]',
    bottomHalo: 'rgba(255, 219, 210, 0.35)',
    badgeBg: 'bg-[#f0eee8]',
    badgeText: 'text-[#424846]',
    shadowHover: 'hover:shadow-[0_12px_32px_-4px_rgba(76,99,93,0.18)]',
  };
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({
  timeline,
  onOpenCompose,
  onUpdateTimelineItem,
}) => {
  const [selectedPebble, setSelectedPebble] = useState<string>('sparkle');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({
    'timeline-2': true,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pebbles = [
    {id: 'cloud', emoji: '☁️', label: '轻飘飘的云'},
    {id: 'sparkle', emoji: '🫧', label: '起泡的汽水'},
    {id: 'rain', emoji: '🌧️', label: '湿漉漉的雨'},
    {id: 'sprout', emoji: '🌿', label: '舒展的嫩芽'},
    {id: 'leaf', emoji: '🍂', label: '蜷缩的落叶'},
  ];

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['timeline-3']));
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [sharedItemId, setSharedItemId] = useState<string | null>(null);
  const [calendarActive, setCalendarActive] = useState<boolean>(false);

  // Mood Card Export States
  const [cardModalItem, setCardModalItem] = useState<TimelineItem | null>(null);
  const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);
  const [isCardExporting, setIsCardExporting] = useState<boolean>(false);
  const [isCardCopied, setIsCardCopied] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyItem = (id: string, text: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedItemId(id);
      showToast('已复制文字到剪贴板 📋');
      setTimeout(() => {
        setCopiedItemId((current) => (current === id ? null : current));
      }, 2000);
    } catch {
      showToast('复制失败，请手动选取');
    }
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('已从心绪藏册中移出');
      } else {
        next.add(id);
        showToast('已收录至私人心绪藏册 🔖');
      }
      return next;
    });
  };

  const handleShareItem = async (id: string, text: string) => {
    setSharedItemId(id);
    setTimeout(() => {
      setSharedItemId((curr) => (curr === id ? null : curr));
    }, 2000);

    if (navigator.share) {
      try {
        await navigator.share({
          title: '喃喃心绪',
          text,
        });
        showToast('分享成功 ✨');
        return;
      } catch {
        // user cancelled or failed
      }
    }
    navigator.clipboard?.writeText(text);
    showToast('已生成分享文本并复制到剪贴板 📋');
  };

  const handleOpenMoodCardModal = (item: TimelineItem) => {
    setGeneratingCardId(item.id);
    setTimeout(() => {
      setCardModalItem(item);
      setGeneratingCardId(null);
    }, 200);
  };

  const handleExportMoodCardPng = () => {
    if (!cardModalItem) return;
    setIsCardExporting(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCardExporting(false);
      return;
    }

    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;

    // Background fine cream paper
    ctx.fillStyle = '#faf7f2';
    ctx.fillRect(0, 0, width, height);

    // Warm radial glow
    const grad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, 580);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f3ede2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Outer refined border
    ctx.strokeStyle = '#dcd5c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Inner poetic double line
    ctx.strokeStyle = 'rgba(76, 99, 93, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Four corner filigree ✦
    ctx.font = 'bold 16px serif';
    ctx.fillStyle = '#845144';
    ctx.fillText('✦', 58, 70);
    ctx.fillText('✦', width - 74, 70);
    ctx.fillText('✦', 58, height - 58);
    ctx.fillText('✦', width - 74, height - 58);

    // Header seal box: 喃喃 · 心绪日笺
    ctx.strokeStyle = '#845144';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(80, 80, 150, 34);
    ctx.font = 'bold 16px "Literata", "Songti SC", "SimSun", serif';
    ctx.fillStyle = '#845144';
    ctx.fillText('喃喃 · 心绪日笺', 95, 103);

    // Right date stamp
    ctx.font = '14px "Manrope", sans-serif';
    ctx.fillStyle = '#727876';
    ctx.textAlign = 'right';
    ctx.fillText(`${cardModalItem.timestamp} · ${cardModalItem.weatherCondition || '晴空心绪'}`, width - 80, 103);
    ctx.textAlign = 'left';

    // Divider line
    ctx.strokeStyle = 'rgba(215, 209, 198, 0.7)';
    ctx.beginPath();
    ctx.moveTo(80, 138);
    ctx.lineTo(width - 80, 138);
    ctx.stroke();

    // Mood Badge pill
    ctx.fillStyle = 'rgba(255, 188, 172, 0.45)';
    ctx.fillRect(80, 160, 180, 32);
    ctx.fillStyle = '#7a493d';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${cardModalItem.moodEmoji || '🌿'} ${cardModalItem.moodBadge || '当下微光'}`, 96, 181);

    // Quotation Mark
    ctx.font = '72px "Literata", Georgia, serif';
    ctx.fillStyle = 'rgba(132, 81, 68, 0.22)';
    ctx.fillText('“', 80, 255);

    // Main thought text wrapping
    ctx.font = '24px "Literata", "Songti SC", "SimSun", serif';
    ctx.fillStyle = '#1c1c18';
    const text = cardModalItem.text;
    const maxLineWidth = width - 170;
    let line = '';
    let y = 295;
    const lineHeight = 44;

    for (let i = 0; i < text.length; i++) {
      const testLine = line + text[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && i > 0) {
        ctx.fillText(line, 95, y);
        line = text[i];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 95, y);

    // Closing quotation mark
    ctx.font = '72px "Literata", Georgia, serif';
    ctx.fillStyle = 'rgba(132, 81, 68, 0.22)';
    ctx.fillText('”', width - 125, y + 42);

    // Tags
    if (cardModalItem.tags && cardModalItem.tags.length > 0) {
      let tagX = 95;
      const tagY = y + 70;
      ctx.font = '13px sans-serif';
      cardModalItem.tags.forEach((tag) => {
        const tagText = `#${tag}`;
        const tWidth = ctx.measureText(tagText).width + 16;
        ctx.fillStyle = '#ebe6dc';
        ctx.fillRect(tagX, tagY - 16, tWidth, 24);
        ctx.fillStyle = '#5c6461';
        ctx.fillText(tagText, tagX + 8, tagY);
        tagX += tWidth + 8;
      });
    }

    // Bottom poetic footer
    const footerY = height - 120;
    ctx.strokeStyle = 'rgba(76, 99, 93, 0.25)';
    ctx.beginPath();
    ctx.moveTo(100, footerY);
    ctx.lineTo(width - 100, footerY);
    ctx.stroke();

    ctx.font = 'italic 16px "Literata", "Songti SC", serif';
    ctx.fillStyle = '#555e5b';
    ctx.textAlign = 'center';
    ctx.fillText('“生活原是一场漫长低语，每一瞬微光都值得妥善封存。”', width / 2, footerY + 36);

    ctx.font = '13px "Manrope", sans-serif';
    ctx.fillStyle = '#8c9491';
    ctx.fillText('✦ 喃喃 Murmur · 留存在岁月褶皱里的心音 ✦', width / 2, footerY + 64);
    ctx.textAlign = 'left';

    try {
      const link = document.createElement('a');
      link.download = `喃喃心绪卡片-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('✨ 已生成高清心情卡片并保存到相册');
    } catch {
      showToast('导出卡片完成');
    }

    setTimeout(() => {
      setIsCardExporting(false);
    }, 2000);
  };

  const handleCopyCardPoeticText = () => {
    if (!cardModalItem) return;
    const poeticText = `┏━━━━━━━━━━━━━━━━━━━━┓\n  ✦ 喃喃 · 心绪日笺 ✦\n  ${cardModalItem.timestamp} · ${cardModalItem.weatherCondition || '晴空心绪'}\n  情绪：${cardModalItem.moodBadge || '当下微光'}\n\n  “${cardModalItem.text}”\n\n  “生活原是一场漫长低语，\n   每一瞬微光都值得妥善封存。”\n┗━━━━━━━━━━━━━━━━━━━━┛`;
    navigator.clipboard?.writeText(poeticText);
    setIsCardCopied(true);
    showToast('已复制精美诗意卡片文案 📋');
    setTimeout(() => setIsCardCopied(false), 2000);
  };

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      stopCurrentAudio();
      setPlayingAudioId(null);
      setAudioProgress(0);
    } else {
      setPlayingAudioId(id);
      playGentleWindChime(
        (progress) => setAudioProgress(progress),
        () => {
          setPlayingAudioId(null);
          setAudioProgress(0);
        },
        12,
      );
    }
  };

  const handleFlareReaction = (item: TimelineItem) => {
    const hasFlared = !item.reactions.hasFlared;
    const newCount = hasFlared
      ? item.reactions.flares + 1
      : Math.max(0, item.reactions.flares - 1);
    onUpdateTimelineItem({
      ...item,
      reactions: {
        ...item.reactions,
        flares: newCount,
        hasFlared,
      },
    });
    if (hasFlared) {
      showToast('已送上一抹微光 ✨');
    }
  };

  const handleWarmBlanket = (item: TimelineItem) => {
    const blanket = !item.reactions.warmBlanket;
    onUpdateTimelineItem({
      ...item,
      reactions: {
        ...item.reactions,
        warmBlanket: blanket,
      },
    });
    showToast(blanket ? '为你披上一层温热毛毯 🍵' : '已收起毛毯');
  };

  const filteredTimeline = timeline.filter((item) => {
    if (!selectedPebble) return true;
    if (selectedPebble === 'sparkle') return true; // show all by default
    if (selectedPebble === 'rain' && item.moodBadge.includes('雨')) return true;
    if (selectedPebble === 'sprout' && item.moodBadge.includes('芽')) return true;
    if (selectedPebble === 'cloud' && item.moodBadge.includes('云')) return true;
    return true;
  });

  return (
    <div className="flex flex-col w-full px-5 space-y-6 pb-28 pt-2">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1c1c18]/90 text-white text-xs backdrop-blur-md shadow-lg transition-all animate-fade-in flex items-center space-x-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#ffbcac]">
            auto_awesome
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 顶部温润心境问候区 */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f6f3ed] via-[#fcf9f3] to-[#ffbcac]/20 p-5 shadow-[0_4px_20px_-2px_rgba(62,59,58,0.04)] border border-white/60">
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#ffdbd2]/50 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#cfe8e0]/40 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#424846] text-xs font-medium shadow-[0_2px_8px_rgba(76,99,93,0.06)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#98b0a9] mr-1.5 animate-pulse" />
              立秋第七日 · 闲适午后
            </span>
            <button
              onClick={() => {
                setCalendarActive(true);
                showToast('此刻是立秋第七日，心湖清朗，天高云阔 🍂');
                setTimeout(() => setCalendarActive(false), 2000);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs active:scale-95 ${
                calendarActive
                  ? 'bg-[#4c635d] text-white rotate-12 scale-105'
                  : 'bg-white/70 text-[#424846] hover:text-[#4c635d] hover:bg-white'
              }`}
              aria-label="节气日历"
              title="节气日历"
            >
              <span className="material-symbols-outlined text-[18px]">
                {calendarActive ? 'event_available' : 'calendar_today'}
              </span>
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-serif text-[#1c1c18] tracking-tight leading-snug">
              今天下午的风很软，
              <br />
              <span className="text-[#845144] italic font-serif">
                你心里是什么天气？
              </span>
            </h2>
            <p className="text-xs text-[#424846]/80 font-normal">
              轻触小石头，让当下的思绪自然沉淀。
            </p>
          </div>

          {/* 情绪天气鹅卵石交互组 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar -mx-1 px-1">
            {pebbles.map((peb) => {
              const active = selectedPebble === peb.id;
              return (
                <button
                  key={peb.id}
                  onClick={() => {
                    setSelectedPebble(active ? '' : peb.id);
                    showToast(`心里天气：${peb.label}`);
                  }}
                  className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 text-xs ${
                    active
                      ? 'bg-[#ffbcac]/60 text-[#7a493d] font-medium shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)]'
                      : 'bg-white/90 backdrop-blur-sm text-[#424846] hover:bg-[#ebe8e2] shadow-[0_2px_6px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <span className="text-[14px]">{peb.emoji}</span>
                  <span className="font-label-sm">{peb.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 碎碎念速记快速唤起条 */}
      <section className="w-full">
        <div
          onClick={() => onOpenCompose()}
          className="relative flex items-center justify-between p-3.5 pl-4 rounded-xl bg-white/85 backdrop-blur-md shadow-[0_4px_16px_rgba(76,99,93,0.05)] border border-white/60 cursor-pointer active:scale-[0.99] transition-transform hover:shadow-md"
        >
          <div className="flex items-center space-x-2.5 text-[#727876]">
            <span className="material-symbols-outlined text-[20px] text-[#4c635d]/80">
              edit_note
            </span>
            <span className="text-sm text-[#727876]/90 italic font-serif">
              想说什么都可以，不用很工整...
            </span>
          </div>
          <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onOpenCompose('', '录下一段轻语')}
              aria-label="语音记录"
              className="w-9 h-9 rounded-full bg-[#f0eee8] hover:bg-[#cfe8e0]/40 flex items-center justify-center text-[#4c635d] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">mic</span>
            </button>
            <button
              onClick={() => onOpenCompose('此刻在窗边，看着微风吹过……')}
              aria-label="灵感提示"
              className="w-9 h-9 rounded-full bg-[#f0eee8] hover:bg-[#cfe8e0]/40 flex items-center justify-center text-[#4c635d] transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">spa</span>
            </button>
          </div>
        </div>
      </section>

      {/* 核心碎碎念流 (Timeline Feed) */}
      <section className="flex flex-col space-y-4">
        {/* 时间轴连接标头 */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#4c635d] text-[18px]">
              stream
            </span>
            <h3 className="text-base font-serif font-medium text-[#1c1c18]">
              此刻流淌
            </h3>
          </div>
          <span className="text-xs text-[#424846]">
            共 {filteredTimeline.length} 篇心绪
          </span>
        </div>

        {filteredTimeline.map((item) => {
          const aura = getMoodAuraConfig(item.moodBadge, item.text);

          if (item.isQuoteCard) {
            return (
              <article
                key={item.id}
                className={`group relative flex flex-col rounded-2xl bg-white/95 backdrop-blur-md p-5 shadow-[0_4px_20px_-2px_rgba(62,59,58,0.04)] border ${aura.gradientBorder} ${aura.shadowHover} space-y-3.5 transition-all duration-500 overflow-hidden`}
              >
                {/* Atmospheric Mood Aura Fluid Glow */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl animate-aura-breathe transition-opacity duration-700"
                  style={{ background: aura.ambientOrb }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-[#424846] font-medium">
                      {item.timestamp}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#c2c8c5]" />
                    <span className="text-xs text-[#727876]">
                      {item.weatherCondition}
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center px-2 py-0.5 rounded-full ${aura.badgeBg} ${aura.badgeText} text-xs font-medium shadow-xs transition-colors`}
                  >
                    <span>
                      {item.moodEmoji} {item.moodBadge}
                    </span>
                  </div>
                </div>

                <div className="relative z-10 py-3 px-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80">
                  <p className="text-lg text-[#1c1c18] font-serif leading-relaxed text-center tracking-wide">
                    {item.text}
                  </p>
                </div>

                <div className="relative z-10 pt-1 flex items-center justify-between">
                  <span className="text-xs text-[#727876] flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">
                      lock
                    </span>
                    <span>仅自己可见</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {/* Bookmark action */}
                    <button
                      onClick={() => handleToggleBookmark(item.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        bookmarkedIds.has(item.id)
                          ? 'text-[#4c635d] bg-[#cfe8e0]/70'
                          : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                      }`}
                      aria-label={bookmarkedIds.has(item.id) ? '已收藏格言' : '收藏格言'}
                      title={bookmarkedIds.has(item.id) ? '已收藏' : '收藏'}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform ${
                          bookmarkedIds.has(item.id) ? 'material-symbols-fill scale-110' : ''
                        }`}
                      >
                        {bookmarkedIds.has(item.id) ? 'bookmark' : 'bookmark_border'}
                      </span>
                    </button>

                    {/* Copy action */}
                    <button
                      onClick={() => handleCopyItem(item.id, item.text)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        copiedItemId === item.id
                          ? 'text-[#4c635d] bg-[#cfe8e0]/70'
                          : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                      }`}
                      aria-label="复制格言"
                      title="复制"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedItemId === item.id ? 'check' : 'content_copy'}
                      </span>
                    </button>

                    {/* Share action */}
                    <button
                      onClick={() => handleShareItem(item.id, item.text)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        sharedItemId === item.id
                          ? 'text-[#4c635d] bg-[#cfe8e0]/70 scale-105'
                          : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                      }`}
                      aria-label="分享"
                      title={sharedItemId === item.id ? '已唤起分享' : '分享'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {sharedItemId === item.id ? 'check' : 'ios_share'}
                      </span>
                    </button>

                    {/* Export as Mood Card Button */}
                    <button
                      onClick={() => handleOpenMoodCardModal(item)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        generatingCardId === item.id
                          ? 'text-[#845144] bg-[#ffdbd2] scale-105 shadow-xs'
                          : 'text-[#727876] hover:text-[#845144] hover:bg-[#ffdbd2]/30'
                      }`}
                      aria-label="导出为心情卡片"
                      title="导出为心情卡片"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] transition-transform ${
                          generatingCardId === item.id ? 'rotate-12 scale-110 text-[#845144]' : ''
                        }`}
                      >
                        {generatingCardId === item.id ? 'auto_awesome' : 'style'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bottom Luminous Accent Beam */}
                <div
                  className={`absolute -bottom-[1px] left-6 right-6 h-[2px] rounded-full pointer-events-none transition-all duration-500 opacity-75 group-hover:opacity-100 ${aura.bottomGlow}`}
                />
                {/* Bottom diffuse glowing halo reflection */}
                <div
                  className="absolute -bottom-2.5 left-10 right-10 h-3 rounded-full blur-md opacity-35 pointer-events-none transition-opacity duration-500"
                  style={{ background: aura.bottomHalo }}
                />
              </article>
            );
          }

          const isAudioPlaying = playingAudioId === item.id;

          return (
            <article
              key={item.id}
              className={`group relative flex flex-col rounded-2xl bg-white/95 backdrop-blur-md p-5 shadow-[0_4px_20px_-2px_rgba(62,59,58,0.04)] border ${aura.gradientBorder} ${aura.shadowHover} space-y-3.5 transition-all duration-500 overflow-hidden`}
            >
              {/* Atmospheric Mood Aura Fluid Glow */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl animate-aura-breathe transition-opacity duration-700"
                style={{ background: aura.ambientOrb }}
              />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#424846] font-medium">
                    {item.timestamp}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#c2c8c5]" />
                  <span className="text-xs text-[#727876]">
                    {item.weatherCondition}
                  </span>
                </div>
                <div
                  className={`inline-flex items-center px-2 py-0.5 rounded-full ${aura.badgeBg} ${aura.badgeText} text-xs font-medium shadow-xs transition-colors`}
                >
                  <span>
                    {item.moodEmoji} {item.moodBadge}
                  </span>
                </div>
              </div>

              {/* Text */}
              <p className="relative z-10 text-sm text-[#1c1c18] leading-relaxed">
                {item.text}
              </p>

              {/* Optional Photo */}
              {item.imageUrl && (
                <div className="relative z-10 w-full h-44 rounded-xl overflow-hidden bg-[#ebe8e2] group">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={item.imageCaption || '随手留存'}
                    src={item.imageUrl}
                  />
                  {item.imageCaption && (
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[11px] flex items-center space-x-1">
                      <span className="material-symbols-outlined text-[13px]">
                        photo_camera
                      </span>
                      <span>{item.imageCaption}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Playable Audio Memo */}
              {item.audioMemo && (
                <div
                  onClick={() => toggleAudio(item.id)}
                  className={`relative z-10 flex items-center justify-between p-2.5 px-3.5 rounded-full cursor-pointer active:scale-[0.98] transition-all border ${
                    isAudioPlaying
                      ? 'bg-gradient-to-r from-[#ffdbd2]/70 via-[#f6f3ed] to-[#cfe8e0]/60 border-[#ffbcac]'
                      : 'bg-gradient-to-r from-[#ffdbd2]/40 via-[#f6f3ed] to-[#cfe8e0]/30 border-transparent hover:border-[#cfe8e0]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <button
                      className="w-7 h-7 rounded-full bg-[#4c635d] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
                      aria-label={isAudioPlaying ? '暂停' : '播放'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isAudioPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    {/* Rhythmic Pulsating Waveform Bars */}
                    <div className="flex items-end space-x-1 h-5 pb-0.5">
                      {[10, 20, 14, 26, 12, 22, 16, 24].map((h, idx) => (
                        <span
                          key={idx}
                          className={`w-0.5 rounded-full transition-all duration-300 ${
                            isAudioPlaying
                              ? 'bg-[#4c635d] animate-wave-bar'
                              : 'bg-[#4c635d]/50'
                          }`}
                          style={{
                            height: `${h * 0.65}px`,
                            animationDelay: isAudioPlaying
                              ? `${(idx * 0.11).toFixed(2)}s`
                              : undefined,
                            animationDuration: `${0.75 + (idx % 3) * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#4c635d] font-medium">
                      {item.audioMemo.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#424846] font-mono">
                    {isAudioPlaying
                      ? `0:${Math.floor((1 - audioProgress) * 12).toString().padStart(2, '0')}`
                      : item.audioMemo.duration}
                  </span>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="relative z-10 flex flex-wrap gap-1.5 pt-0.5">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-full bg-[#f0eee8] text-[#424846] text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Echo Reply Box */}
              {item.echoReply && (
                <div className="relative z-10 flex items-start space-x-2.5 p-3 rounded-xl bg-[#f6f3ed]/90 border border-white/60">
                  <div className="w-6 h-6 rounded-full bg-[#ffdbd2] flex items-center justify-center text-[#341108] shrink-0 mt-0.5 shadow-xs">
                    <span className="material-symbols-outlined text-[14px]">
                      volunteer_activism
                    </span>
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#845144] font-medium">
                        {item.echoReply.author}
                      </span>
                      <span className="text-[10px] text-[#727876]">
                        {item.echoReply.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#424846] italic leading-relaxed">
                      {item.echoReply.text}
                    </p>
                  </div>
                </div>
              )}

              {/* Card Bottom Actions */}
              <div className="relative z-10 pt-1 flex items-center justify-between border-t border-[#f0eee8]">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFlareReaction(item)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs transition-all active:scale-95 ${
                      item.reactions.hasFlared
                        ? 'bg-[#ffbcac]/40 text-[#845144] font-medium shadow-xs'
                        : 'bg-[#f6f3ed] hover:bg-[#ffdbd2]/40 text-[#424846]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] text-[#845144] transition-transform ${
                        item.reactions.hasFlared ? 'material-symbols-fill scale-110' : ''
                      }`}
                    >
                      flare
                    </span>
                    <span className="font-medium">{item.reactions.flares}</span>
                  </button>

                  <button
                    onClick={() => handleWarmBlanket(item)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs transition-all active:scale-95 ${
                      item.reactions.warmBlanket
                        ? 'bg-[#cfe8e0] text-[#091f1b] font-medium shadow-xs'
                        : 'bg-[#f6f3ed] hover:bg-[#cfe8e0]/50 text-[#424846]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] text-[#4c635d] transition-transform ${
                        item.reactions.warmBlanket ? 'material-symbols-fill scale-110' : ''
                      }`}
                    >
                      favorite
                    </span>
                    <span>温热毛毯</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleToggleBookmark(item.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                      bookmarkedIds.has(item.id)
                        ? 'text-[#4c635d] bg-[#cfe8e0]/70'
                        : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                    }`}
                    aria-label={bookmarkedIds.has(item.id) ? '已收藏心绪' : '收藏心绪'}
                    title={bookmarkedIds.has(item.id) ? '已收藏' : '收藏'}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] transition-transform ${
                        bookmarkedIds.has(item.id) ? 'material-symbols-fill scale-110' : ''
                      }`}
                    >
                      {bookmarkedIds.has(item.id) ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyItem(item.id, item.text)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                      copiedItemId === item.id
                        ? 'text-[#4c635d] bg-[#cfe8e0]/70'
                        : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                    }`}
                    aria-label="复制心绪"
                    title="复制"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {copiedItemId === item.id ? 'check' : 'content_copy'}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShareItem(item.id, item.text)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                      sharedItemId === item.id
                        ? 'text-[#4c635d] bg-[#cfe8e0]/70 scale-105'
                        : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                    }`}
                    aria-label="分享心绪"
                    title={sharedItemId === item.id ? '已唤起分享' : '分享'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {sharedItemId === item.id ? 'check' : 'ios_share'}
                    </span>
                  </button>

                  {/* Export as Mood Card Button */}
                  <button
                    onClick={() => handleOpenMoodCardModal(item)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                      generatingCardId === item.id
                        ? 'text-[#845144] bg-[#ffdbd2] scale-105 shadow-xs'
                        : 'text-[#727876] hover:text-[#845144] hover:bg-[#ffdbd2]/30'
                    }`}
                    aria-label="导出为心情卡片"
                    title="导出为心情卡片"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] transition-transform ${
                        generatingCardId === item.id ? 'rotate-12 scale-110 text-[#845144]' : ''
                      }`}
                    >
                      {generatingCardId === item.id ? 'auto_awesome' : 'style'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom Luminous Accent Beam */}
              <div
                className={`absolute -bottom-[1px] left-6 right-6 h-[2px] rounded-full pointer-events-none transition-all duration-500 opacity-75 group-hover:opacity-100 ${aura.bottomGlow}`}
              />
              {/* Bottom diffuse glowing halo reflection */}
              <div
                className="absolute -bottom-2.5 left-10 right-10 h-3 rounded-full blur-md opacity-35 pointer-events-none transition-opacity duration-500"
                style={{ background: aura.bottomHalo }}
              />
            </article>
          );
        })}
      </section>

      {/* 底部余韵留白提醒 */}
      <div className="py-4 text-center">
        <div className="inline-flex items-center space-x-2 text-[#727876]/70 text-xs">
          <span className="w-6 h-[1px] bg-[#c2c8c5]/60" />
          <span>在这里，所有的情绪都可以慢慢着陆</span>
          <span className="w-6 h-[1px] bg-[#c2c8c5]/60" />
        </div>
      </div>

      {/* 导出心情卡片精美弹出层 (Mood Card Export Modal) */}
      {cardModalItem && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-sm my-auto flex flex-col items-center">
            {/* Top Close Button */}
            <button
              onClick={() => setCardModalItem(null)}
              className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors shadow-lg active:scale-95"
              aria-label="关闭卡片预览"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* The Poetic Mood Card */}
            <div className="w-full rounded-3xl bg-[#faf7f2] shadow-2xl p-5 sm:p-6 border-2 border-[#e6e2d8] relative overflow-hidden text-[#1c1c18]">
              {/* Outer double line border framing */}
              <div className="border border-[#4c635d]/25 rounded-2xl p-5 relative bg-[#fdfcf9] shadow-inner">
                {/* Four Corner Filigree ✦ */}
                <span className="absolute top-2 left-2 text-[#845144]/40 text-xs font-serif select-none">✦</span>
                <span className="absolute top-2 right-2 text-[#845144]/40 text-xs font-serif select-none">✦</span>
                <span className="absolute bottom-2 left-2 text-[#845144]/40 text-xs font-serif select-none">✦</span>
                <span className="absolute bottom-2 right-2 text-[#845144]/40 text-xs font-serif select-none">✦</span>

                {/* Card Top Stamp & Date */}
                <div className="flex items-center justify-between pb-3 border-b border-[#ebe6dc]">
                  <div className="px-2 py-0.5 rounded border border-[#845144]/40 bg-[#ffdbd2]/30 flex items-center space-x-1">
                    <span className="text-[10px] text-[#845144] font-serif font-bold tracking-widest">
                      喃喃 · 心绪日笺
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-[#727876] block leading-none">
                      {cardModalItem.timestamp}
                    </span>
                    <span className="text-[9px] text-[#98b0a9] block mt-0.5">
                      {cardModalItem.weatherCondition || '晴空心绪'}
                    </span>
                  </div>
                </div>

                {/* Mood Ribbon */}
                <div className="pt-3 pb-1 flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#ffbcac]/35 text-[#7a493d] text-xs font-medium shadow-xs">
                    <span>{cardModalItem.moodEmoji || '🌿'}</span>
                    <span>{cardModalItem.moodBadge || '当下微光'}</span>
                  </span>
                  <span className="text-[10px] text-[#727876] font-mono tracking-widest uppercase">
                    NO. {cardModalItem.id.slice(-6)}
                  </span>
                </div>

                {/* Card Body Thought */}
                <div className="py-3 relative">
                  <span className="text-3xl font-serif text-[#845144]/25 select-none leading-none -mb-1 block">
                    “
                  </span>
                  <p className="font-serif text-[15px] sm:text-base text-[#1c1c18] leading-relaxed tracking-wide px-1.5 font-normal">
                    {cardModalItem.text}
                  </p>
                  <span className="text-3xl font-serif text-[#845144]/25 select-none leading-none float-right -mt-2 block">
                    ”
                  </span>
                  <div className="clear-both" />
                </div>

                {/* Optional Polaroid Attached Image */}
                {cardModalItem.imageUrl && (
                  <div className="my-2 p-2 rounded-xl bg-white shadow-sm border border-[#ebe6dc] overflow-hidden">
                    <div className="h-40 w-full rounded-lg overflow-hidden bg-[#f0eee8]">
                      <img
                        src={cardModalItem.imageUrl}
                        alt="心绪瞬间"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {cardModalItem.imageCaption && (
                      <p className="text-[10px] text-[#727876] font-serif italic text-center mt-1.5">
                        {cardModalItem.imageCaption}
                      </p>
                    )}
                  </div>
                )}

                {/* Optional Voice Memo Waveform Stamp */}
                {cardModalItem.audioMemo && (
                  <div className="my-2 p-2 rounded-xl bg-[#f6f3ed] border border-[#e5e0d4] flex items-center justify-between text-xs text-[#4c635d]">
                    <div className="flex items-center space-x-1.5">
                      <span className="material-symbols-outlined text-[16px]">graphic_eq</span>
                      <span className="font-serif italic text-[11px]">{cardModalItem.audioMemo.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#727876]">{cardModalItem.audioMemo.duration}</span>
                  </div>
                )}

                {/* Attached Tags */}
                {cardModalItem.tags && cardModalItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {cardModalItem.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-[#727876] bg-[#f0eee8] px-2 py-0.5 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Divider & Literary Inscription */}
                <div className="mt-4 pt-3 border-t border-[#ebe6dc] text-center space-y-1">
                  <p className="text-[11px] text-[#727876] font-serif italic leading-relaxed">
                    “生活原是一场漫长低语，每一瞬微光都值得妥善封存。”
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-[9px] text-[#98b0a9] tracking-widest uppercase pt-0.5">
                    <span>✦ 喃喃 MURMUR</span>
                    <span>·</span>
                    <span>心音独白 ✦</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions for Mood Card */}
            <div className="w-full mt-3 flex items-center space-x-2.5">
              <button
                onClick={handleExportMoodCardPng}
                disabled={isCardExporting}
                className="flex-1 py-3 px-4 rounded-2xl bg-[#4c635d] hover:bg-[#354b46] active:scale-95 text-white text-xs font-semibold shadow-lg flex items-center justify-center space-x-1.5 transition-all disabled:opacity-75"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCardExporting ? 'done' : 'download'}
                </span>
                <span>{isCardExporting ? '已保存到相册 ✨' : '保存到相册 (下载图片)'}</span>
              </button>

              <button
                onClick={handleCopyCardPoeticText}
                className={`py-3 px-3.5 rounded-2xl text-xs font-medium shadow-md flex items-center space-x-1 transition-all active:scale-95 ${
                  isCardCopied
                    ? 'bg-[#cfe8e0] text-[#091f1b]'
                    : 'bg-white text-[#424846] hover:bg-[#f6f3ed]'
                }`}
                title="复制文案"
                aria-label="复制文案"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCardCopied ? 'check' : 'content_copy'}
                </span>
                <span>{isCardCopied ? '已复制' : '复制文案'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
