import React, {useState, useRef} from 'react';
import {TimelineItem} from '../types';
import {APP_ASSETS} from '../data/initialData';

interface MoodCardModalProps {
  item: TimelineItem | null;
  onClose: () => void;
}

export const MoodCardModal: React.FC<MoodCardModalProps> = ({item, onClose}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  const handleDownloadCard = () => {
    setIsSaved(true);

    try {
      // Create high-res canvas to render postcard
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const width = 800;
        const height = item.imageUrl ? 1100 : 860;
        canvas.width = width;
        canvas.height = height;

        // Background parchment
        ctx.fillStyle = '#fcfbf7';
        ctx.fillRect(0, 0, width, height);

        // Outer borders
        ctx.strokeStyle = '#e5e2dc';
        ctx.lineWidth = 4;
        ctx.strokeRect(24, 24, width - 48, height - 48);

        ctx.strokeStyle = '#98b0a9';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(36, 36, width - 72, height - 72);
        ctx.setLineDash([]);

        // Header Title
        ctx.fillStyle = '#4c635d';
        ctx.font = 'bold 26px serif';
        ctx.fillText('喃喃 · 心绪珍藏卡', 60, 90);

        ctx.fillStyle = '#727876';
        ctx.font = '16px sans-serif';
        ctx.fillText('把心事轻轻放在这里', 60, 120);

        // Vintage Circular Stamp (日期戳)
        ctx.save();
        ctx.strokeStyle = '#845144';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(width - 120, 100, 48, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width - 120, 100, 42, 0, Math.PI * 2);
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#845144';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('立秋 · 拾忆', width - 120, 92);
        ctx.font = '11px sans-serif';
        ctx.fillText('2026.10.17', width - 120, 110);
        ctx.fillText('心晴温润', width - 120, 126);
        ctx.restore();

        // Divider
        ctx.strokeStyle = '#ebe8e2';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, 160);
        ctx.lineTo(width - 60, 160);
        ctx.stroke();

        let currentY = 210;

        // Mood Badge
        ctx.fillStyle = '#ffbcac';
        ctx.beginPath();
        ctx.roundRect(60, currentY - 26, 140, 34, 17);
        ctx.fill();
        ctx.fillStyle = '#7a493d';
        ctx.font = '15px sans-serif';
        ctx.fillText(`${item.moodEmoji} ${item.moodBadge}`, 75, currentY - 4);

        // Date timestamp
        ctx.fillStyle = '#727876';
        ctx.font = '14px sans-serif';
        ctx.fillText(`${item.timestamp} · ${item.weatherCondition}`, 220, currentY - 4);

        currentY += 50;

        // Multi-line body text wrapping
        ctx.fillStyle = '#1c1c18';
        ctx.font = '22px serif';
        const maxWidth = width - 120;
        const lineHeight = 38;
        const words = item.text.split('');
        let line = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 60, currentY);
            line = words[n];
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 60, currentY);
        currentY += lineHeight + 30;

        // Footer Brand Note
        ctx.fillStyle = '#a59e99';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('喃喃 · 陪伴你的第 128 个夜晚 · 岁月自愈档案', width / 2, height - 60);

        // Convert canvas to image download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `喃喃心绪卡片-${item.timestamp.replace(/[^0-9a-zA-Z]/g, '')}.png`;
        link.click();
      }
    } catch (e) {
      console.warn('Canvas export fallback:', e);
    }

    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(
      `【喃喃心绪卡片】\n时间：${item.timestamp} (${item.weatherCondition})\n心情：${item.moodEmoji} ${item.moodBadge}\n\n“${item.text}”\n\n—— 来自「喃喃」把心事轻轻放在这里`,
    );
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm max-h-[92vh] flex flex-col items-center">
        {/* Printable / Visual Postcard Card */}
        <div
          ref={cardRef}
          className="w-full bg-[#fcfbf7] rounded-3xl p-6 shadow-2xl border-4 border-[#e5e2dc] relative overflow-hidden flex flex-col space-y-4 text-left select-none"
        >
          {/* Inner Botanical Dashed Border */}
          <div className="absolute inset-2.5 rounded-2xl border border-dashed border-[#98b0a9]/60 pointer-events-none" />

          {/* Card Top Stamp Header */}
          <div className="relative z-10 flex items-start justify-between pb-3 border-b border-[#ebe8e2]">
            <div className="flex items-center space-x-2">
              <img
                src={APP_ASSETS.logo}
                alt="Logo"
                className="w-7 h-7 object-contain opacity-90"
              />
              <div className="flex flex-col">
                <span className="font-serif text-sm font-semibold text-[#4c635d] tracking-tight">
                  喃喃 · 心绪明信片
                </span>
                <span className="text-[10px] text-[#727876] font-mono">
                  MEMOIR CARD · № MM-{item.id.slice(-4).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Vintage Postmark Seal (日期戳) */}
            <div className="relative w-16 h-16 rounded-full border-2 border-[#845144]/70 flex flex-col items-center justify-center text-[#845144] p-1 shadow-inner rotate-[-6deg] bg-[#ffdbd2]/20">
              <div className="w-13 h-13 rounded-full border border-dashed border-[#845144]/50 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-semibold tracking-wider">立秋·拾忆</span>
                <span className="text-[8px] font-mono leading-none py-0.5">2026.10</span>
                <span className="text-[8px] tracking-tight">心晴温润</span>
              </div>
            </div>
          </div>

          {/* Time & Mood Pill */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ffbcac]/40 text-[#7a493d] font-medium text-[11px] shadow-xs">
              {item.moodEmoji} {item.moodBadge}
            </span>
            <span className="text-[#727876] text-[11px]">
              {item.timestamp} · {item.weatherCondition}
            </span>
          </div>

          {/* Optional Photo Fragment */}
          {item.imageUrl && (
            <div className="relative z-10 w-full h-36 rounded-xl overflow-hidden shadow-xs border-2 border-white bg-[#ebe8e2]">
              <img
                src={item.imageUrl}
                alt="心情剪影"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Main Thought Body (Calligraphic / Literata Serif) */}
          <div className="relative z-10 py-1">
            <p className="font-serif text-base text-[#1c1c18] leading-relaxed italic">
              “{item.text}”
            </p>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="relative z-10 flex flex-wrap gap-1.5 pt-1">
              {item.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-[#f0eee8] text-[#727876] text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Card Footer Stamp */}
          <div className="relative z-10 pt-3 border-t border-[#ebe8e2] flex items-center justify-between text-[11px] text-[#727876]">
            <span>喃喃 · 陪伴第 128 个夜晚</span>
            <span className="text-[#4c635d] font-serif font-medium">心安即归处</span>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="w-full mt-4 flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCard}
            className={`flex-1 py-3 rounded-full text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all text-white ${
              isSaved
                ? 'bg-[#98b0a9]'
                : 'bg-[#4c635d] hover:bg-[#354b46]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isSaved ? 'done' : 'download'}
            </span>
            <span>{isSaved ? '已保存为图片' : '保存卡片到相册'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className={`px-3.5 py-3 rounded-full text-xs font-medium flex items-center space-x-1 transition-all active:scale-95 bg-white/90 text-[#424846] hover:bg-white shadow-xs`}
            title="复制图卡文本"
            aria-label="复制图卡文本"
          >
            <span className="material-symbols-outlined text-[17px]">
              {isCopied ? 'check' : 'content_copy'}
            </span>
            <span>{isCopied ? '已复制' : '复制文案'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#727876] hover:text-[#1c1c18] flex items-center justify-center shadow-xs transition-all active:scale-95 shrink-0"
            aria-label="关闭预览"
            title="关闭"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
