import React, {useState} from 'react';
import {GALAXY_PLANETS, APP_ASSETS} from '../data/initialData';
import {GalaxyPlanet} from '../types';

export const GalaxyScreen: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<GalaxyPlanet>(
    GALAXY_PLANETS[0],
  );
  const [isSavedWallpaper, setIsSavedWallpaper] = useState(false);
  const [isSparkFavorited, setIsSparkFavorited] = useState(false);
  const [isCopiedSpark, setIsCopiedSpark] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleSparkFavorite = () => {
    setIsSparkFavorited((prev) => {
      const next = !prev;
      showToast(next ? '已加入最深珍藏 ❤️ 暖意 +1' : '已取消收藏');
      return next;
    });
  };

  const handleCopySpark = () => {
    navigator.clipboard?.writeText('“在便利店买到了最后一只热腾腾的烤红薯。”');
    setIsCopiedSpark(true);
    showToast('高光小确幸句子已复制 📋');
    setTimeout(() => setIsCopiedSpark(false), 2000);
  };

  const handleSaveWallpaper = () => {
    setIsSavedWallpaper(true);
    showToast('✨ 已生成高画质自愈壁纸并存入相册');

    // Create client-side download link for the lockscreen wallpaper image
    try {
      const link = document.createElement('a');
      link.href = APP_ASSETS.wallpaper;
      link.download = '秋日放晴简帖-喃喃壁纸.jpg';
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.click();
    } catch {
      // ignore
    }

    setTimeout(() => {
      setIsSavedWallpaper(false);
    }, 2800);
  };

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

      {/* Weekly Letter / Poetic Envelope Card */}
      <div className="relative w-full rounded-2xl bg-[#f6f3ed] p-5 shadow-sm border border-white/80 overflow-hidden transition-all duration-300">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#ffdbd2]/30 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-[#cfe8e0]/40 blur-xl pointer-events-none" />

        <div className="relative flex items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#4c635d] text-[20px] material-symbols-fill">
              mail
            </span>
            <span className="font-label-sm text-xs text-[#727876] tracking-widest uppercase">
              WEEKLY INSIGHT · 第 42 期
            </span>
          </div>
          <span className="text-xs text-[#424846] bg-white/90 px-2.5 py-1 rounded-full shadow-xs">
            10.14 - 10.20
          </span>
        </div>

        <div className="relative pt-1 space-y-2">
          <p className="font-serif text-base text-[#1c1c18] leading-relaxed">
            “亲爱的，这周你记录了{' '}
            <span className="text-[#4c635d] font-semibold underline decoration-[#98b0a9]/60 underline-offset-4">
              14 缕
            </span>
            心绪。经历了两场小雨，但周五起天色就放晴了。”
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-[#4c635d] px-3 py-1 rounded-full bg-white shadow-xs">
              🌿 松弛
            </span>
            <span className="text-xs text-[#845144] px-3 py-1 rounded-full bg-[#ffdbd2]/60 shadow-xs">
              ✨ 微小喜悦
            </span>
            <span className="text-xs text-[#51606e] px-3 py-1 rounded-full bg-white shadow-xs">
              ☁️ 偶尔渴望放空
            </span>
          </div>
        </div>
      </div>

      {/* Mood Galaxy Visual Canopy */}
      <div className="relative w-full rounded-3xl bg-[#f0eee8] p-5 shadow-[0_8px_30px_rgba(76,99,93,0.06)] border border-white/60 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#845144] text-[22px] material-symbols-fill">
              bubble_chart
            </span>
            <h3 className="font-serif text-lg font-medium text-[#1c1c18]">
              情绪星丛岛屿
            </h3>
          </div>
          <span className="text-xs text-[#727876] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4c635d] animate-ping" />
            轻触星辰
          </span>
        </div>

        {/* Interactive Galaxy Canvas */}
        <div className="relative w-full h-72 rounded-2xl bg-gradient-to-b from-[#ebe8e2]/70 via-[#f6f3ed] to-[#ebe8e2]/50 p-4 overflow-hidden select-none border border-white/60">
          {/* Faint Ambient Constellation SVG Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 60 75 Q 150 120 250 65 T 310 180"
              fill="none"
              stroke="#98b0a9"
              strokeDasharray="3 4"
              strokeWidth="1.5"
            />
            <path
              d="M 60 210 Q 140 170 210 225"
              fill="none"
              stroke="#ffbcac"
              strokeDasharray="2 3"
              strokeWidth="1.2"
            />
          </svg>

          {/* Planet 1: Calm (42%) */}
          <div
            onClick={() => setSelectedPlanet(GALAXY_PLANETS[0])}
            className={`absolute top-6 left-5 flex flex-col items-center cursor-pointer active:scale-95 transition-all ${
              selectedPlanet.id === 'planet-calm'
                ? 'scale-105 z-20 drop-shadow-md'
                : 'opacity-85'
            }`}
          >
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#4c635d]/30 via-[#98b0a9]/40 to-white flex items-center justify-center shadow-[0_8px_24px_rgba(76,99,93,0.22)] backdrop-blur-md border-t border-white">
              <div className="w-16 h-16 rounded-full bg-[#4c635d]/20 flex flex-col items-center justify-center text-center animate-pulse">
                <span className="text-xs text-[#2e433e] font-semibold">42%</span>
                <span className="text-[10px] text-[#4c635d]">释然</span>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#cfe8e0] shadow-xs" />
            </div>
            <span className="text-xs text-[#424846] font-medium mt-1.5">
              平静与释然
            </span>
          </div>

          {/* Planet 2: Joy (28%) */}
          <div
            onClick={() => setSelectedPlanet(GALAXY_PLANETS[1])}
            className={`absolute top-4 right-7 flex flex-col items-center cursor-pointer active:scale-95 transition-all ${
              selectedPlanet.id === 'planet-joy'
                ? 'scale-105 z-20 drop-shadow-md'
                : 'opacity-85'
            }`}
          >
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#ffbcac]/50 via-[#ffdbd2] to-white flex items-center justify-center shadow-[0_8px_20px_rgba(132,81,68,0.2)] backdrop-blur-md border-t border-white">
              <div className="w-13 h-13 rounded-full bg-[#f9b7a6]/40 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[#7a493d] font-semibold">28%</span>
                <span className="text-[10px] text-[#845144]">闪光</span>
              </div>
              <span className="absolute -bottom-1 left-2 w-2.5 h-2.5 rounded-full bg-[#f9b7a6]" />
            </div>
            <span className="text-xs text-[#424846] font-medium mt-1.5">
              生活闪光
            </span>
          </div>

          {/* Planet 3: Tiredness (18%) */}
          <div
            onClick={() => setSelectedPlanet(GALAXY_PLANETS[2])}
            className={`absolute bottom-5 left-10 flex flex-col items-center cursor-pointer active:scale-95 transition-all ${
              selectedPlanet.id === 'planet-tired'
                ? 'scale-105 z-20 drop-shadow-md'
                : 'opacity-85'
            }`}
          >
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#d4e4f5] via-[#b8c8d8] to-white flex items-center justify-center shadow-[0_6px_16px_rgba(81,96,110,0.18)] backdrop-blur-md border-t border-white">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[#32414e] font-semibold">18%</span>
                <span className="text-[9px] text-[#51606e]">微倦</span>
              </div>
            </div>
            <span className="text-xs text-[#424846] font-medium mt-1">小疲惫</span>
          </div>

          {/* Planet 4: Yearning (12%) */}
          <div
            onClick={() => setSelectedPlanet(GALAXY_PLANETS[3])}
            className={`absolute bottom-6 right-10 flex flex-col items-center cursor-pointer active:scale-95 transition-all ${
              selectedPlanet.id === 'planet-hope'
                ? 'scale-105 z-20 drop-shadow-md'
                : 'opacity-85'
            }`}
          >
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#ffdbd2]/70 via-white to-[#fcf9f3] flex items-center justify-center shadow-[0_4px_14px_rgba(255,188,172,0.3)] backdrop-blur-md border-t border-white">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[#7a493d] font-semibold">12%</span>
                <span className="text-[9px] text-[#727876]">向往</span>
              </div>
            </div>
            <span className="text-xs text-[#424846] font-medium mt-1">期待</span>
          </div>

          {/* Tiny Stardust Floating Dots */}
          <span className="absolute top-1/2 left-1/3 w-1.5 h-1.5 rounded-full bg-white opacity-75 animate-ping" />
          <span className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-[#cfe8e0] opacity-90" />
          <span className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-[#ffdbd2] opacity-60" />
        </div>

        {/* Active Mood Dialogue Card */}
        <div className="mt-4 p-4 rounded-2xl bg-white shadow-sm flex items-start space-x-3 transition-all duration-300 border border-white/80">
          <div className="w-10 h-10 rounded-full bg-[#f0eee8] flex items-center justify-center text-lg shrink-0">
            {selectedPlanet.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#1c1c18]">
                {selectedPlanet.name} · {selectedPlanet.percentage}
              </h4>
              <span className="text-xs text-[#4c635d] font-medium">
                {selectedPlanet.badgeLabel}
              </span>
            </div>
            <p className="text-xs text-[#424846] mt-1 leading-relaxed">
              {selectedPlanet.description}
            </p>
          </div>
        </div>
      </div>

      {/* Mood Wave Thermal Chart */}
      <div className="w-full rounded-3xl bg-[#f6f3ed] p-5 shadow-sm space-y-4 border border-white/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#4c635d] text-[20px]">
              water
            </span>
            <h3 className="font-serif text-lg font-medium text-[#1c1c18]">
              情绪温度波动
            </h3>
          </div>
          <span className="text-xs text-[#727876]">波澜起伏即生活</span>
        </div>

        {/* SVG Soft Wave Line Chart */}
        <div className="w-full bg-white rounded-2xl p-4 shadow-xs border border-white/80">
          <div className="relative w-full h-32">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 320 120"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#98b0a9" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#98b0a9" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Smooth Area Fill */}
              <path
                d="M 0 85 C 40 85, 55 95, 80 90 C 120 85, 140 35, 180 40 C 220 45, 250 20, 280 25 C 300 28, 310 20, 320 15 L 320 120 L 0 120 Z"
                fill="url(#waveGradient)"
              />
              {/* Flow Line */}
              <path
                d="M 0 85 C 40 85, 55 95, 80 90 C 120 85, 140 35, 180 40 C 220 45, 250 20, 280 25 C 300 28, 310 20, 320 15"
                fill="none"
                stroke="#4c635d"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              {/* Key Milestone Nodes */}
              <circle
                cx="80"
                cy="90"
                fill="#fcf9f3"
                r="4.5"
                stroke="#845144"
                strokeWidth="2.5"
              />
              <circle
                cx="180"
                cy="40"
                fill="#fcf9f3"
                r="4.5"
                stroke="#4c635d"
                strokeWidth="2.5"
              />
              <circle
                cx="280"
                cy="25"
                fill="#fcf9f3"
                r="4.5"
                stroke="#98b0a9"
                strokeWidth="2.5"
              />
            </svg>

            {/* Floating Annotation Pills inside chart */}
            <div className="absolute bottom-2 left-6 bg-[#f0eee8]/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-xs">
              <span className="text-[10px] text-[#845144] font-medium">
                周一：微雨有些累
              </span>
            </div>
            <div className="absolute top-6 left-1/3 bg-[#f0eee8]/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-xs">
              <span className="text-[10px] text-[#4c635d] font-medium">
                周三：被夕阳治愈了
              </span>
            </div>
            <div className="absolute top-1 right-2 bg-[#f0eee8]/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-xs">
              <span className="text-[10px] text-[#2e433e] font-medium">
                周六：彻底睡到自然醒
              </span>
            </div>
          </div>

          {/* Days Axis */}
          <div className="flex justify-between items-center pt-3 text-center border-t border-[#ebe8e2]">
            <span className="text-[11px] text-[#727876]">周一</span>
            <span className="text-[11px] text-[#727876]">周二</span>
            <span className="text-[11px] text-[#4c635d] font-semibold">周三</span>
            <span className="text-[11px] text-[#727876]">周四</span>
            <span className="text-[11px] text-[#727876]">周五</span>
            <span className="text-[11px] text-[#4c635d] font-semibold">周六</span>
            <span className="text-[11px] text-[#727876]">周日</span>
          </div>
        </div>
      </div>

      {/* Weekly Golden Spark Note (Handwritten Journal Aesthetic) */}
      <div className="w-full rounded-3xl bg-[#ffdbd2]/30 p-5 shadow-sm space-y-2 relative overflow-hidden border border-[#ffbcac]/40">
        <div className="absolute top-3 right-4 opacity-15 pointer-events-none">
          <span className="material-symbols-outlined text-6xl text-[#845144]">
            bookmark_heart
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-[#845144] text-[20px] material-symbols-fill">
            auto_awesome
          </span>
          <h3 className="font-serif text-lg font-medium text-[#1c1c18]">
            本周高光小确幸
          </h3>
        </div>
        <div className="p-5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xs space-y-3 relative">
          <div className="flex items-center space-x-2 text-[#727876]">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span className="text-xs">周五 21:14 · 暮色路口</span>
          </div>
          <p className="font-serif text-lg text-[#1c1c18] italic leading-relaxed">
            “在便利店买到了最后一只热腾腾的烤红薯。”
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-[#f0eee8]">
            <span className="text-xs text-[#7a493d] bg-[#ffdbd2]/60 px-2.5 py-0.5 rounded-full font-medium transition-all">
              暖意指数 +{isSparkFavorited ? 101 : 100}
            </span>

            <div className="flex items-center space-x-1.5">
              {/* Copy Quote Button */}
              <button
                onClick={handleCopySpark}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isCopiedSpark
                    ? 'text-[#4c635d] bg-[#cfe8e0]'
                    : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                }`}
                aria-label="复制高光句子"
                title="复制"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isCopiedSpark ? 'check' : 'content_copy'}
                </span>
              </button>

              {/* Favorite Toggle Button */}
              <button
                onClick={handleToggleSparkFavorite}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  isSparkFavorited
                    ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                    : 'bg-[#cfe8e0]/60 hover:bg-[#cfe8e0] text-[#4c635d]'
                }`}
                aria-label={isSparkFavorited ? '已珍藏此瞬间' : '珍藏此瞬间'}
              >
                <span
                  className={`material-symbols-outlined text-[16px] transition-transform ${
                    isSparkFavorited ? 'material-symbols-fill scale-110 text-[#ba1a1a]' : 'text-[#4c635d]'
                  }`}
                >
                  {isSparkFavorited ? 'favorite' : 'favorite_border'}
                </span>
                <span>{isSparkFavorited ? '已反复品味' : '最想反复品味的一刻'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Healing Gift & Wallpaper Card */}
      <div className="w-full rounded-3xl bg-[#f0eee8] p-5 shadow-sm space-y-4 border border-white/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#4c635d] text-[20px] material-symbols-fill">
              spa
            </span>
            <h3 className="font-serif text-lg font-medium text-[#1c1c18]">
              喃喃周愈礼赠
            </h3>
          </div>
          <span className="text-xs text-[#727876]">专属定制自愈壁纸</span>
        </div>

        {/* Generated Artwork Card */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-white/80 group">
          {/* Atmospheric Generative Background */}
          <div
            className="w-full h-80 bg-cover bg-center flex flex-col justify-between p-5 relative"
            style={{backgroundImage: `url('${APP_ASSETS.wallpaper}')`}}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 pointer-events-none" />

            {/* Wallpaper Header Quote Stamp */}
            <div className="relative z-10 flex items-center justify-between text-white">
              <span className="text-xs tracking-widest uppercase opacity-90 font-medium">
                Murmur Healing Capsule
              </span>
              <span className="material-symbols-outlined text-xl opacity-80">
                flare
              </span>
            </div>

            {/* Warm Literary Blessing */}
            <div className="relative z-10 space-y-1.5 text-white">
              <p className="text-[10px] opacity-80 tracking-widest font-mono">
                GENTLE REMINDER
              </p>
              <h3 className="font-serif text-2xl font-light leading-snug drop-shadow-md">
                “允许一切发生，
                <br />
                你比想象中更可爱。”
              </h3>
              <p className="text-xs opacity-90 pt-1 font-light">
                喃喃 · 陪伴你的第 128 个夜晚
              </p>
            </div>
          </div>

          {/* Action Panel Underneath */}
          <div className="p-4 bg-white flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#1c1c18]">
                《秋日放晴简帖》
              </span>
              <span className="text-xs text-[#727876]">
                4K 清晰度 · 适合设为锁屏
              </span>
            </div>
            <button
              onClick={handleSaveWallpaper}
              className={`h-11 px-4 rounded-xl font-medium text-xs flex items-center space-x-1.5 shadow-xs active:scale-95 transition-all text-white ${
                isSavedWallpaper ? 'bg-[#98b0a9]' : 'bg-[#4c635d] hover:bg-[#354b46]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSavedWallpaper ? 'done' : 'download'}
              </span>
              <span>{isSavedWallpaper ? '已存入相册' : '保存壁纸'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Gentle Sign-off Message */}
      <div className="w-full text-center py-2 space-y-1">
        <p className="text-xs text-[#727876]">
          下周继续把你的心绪，轻轻安放在这里
        </p>
        <div className="flex justify-center items-center space-x-1.5 text-[#4c635d] pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#98b0a9]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffbcac]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#cfe8e0]" />
        </div>
      </div>
    </div>
  );
};
