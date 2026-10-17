import React, {useState, useRef, useEffect} from 'react';
import {TimelineItem, EchoItem} from '../types';

interface ComposeScreenProps {
  initialText?: string;
  initialMoodPrompt?: string;
  onReleaseThought: (entry: {
    text: string;
    destination: 'private' | 'ocean' | 'future';
    moodAura: string;
    tags: string[];
    imageUrl?: string;
    hasVoiceMemo?: boolean;
    futureDays?: number;
  }) => void;
  onSaveDraftToBox: (draftText: string) => void;
  onReturnToTimeline: () => void;
}

type MoodThemeKey = 'warm' | 'mint' | 'twilight' | 'violet';

interface MoodThemeInfo {
  name: string;
  desc: string;
  primaryOrb: string;
  secondaryOrb: string;
  gradient: string;
  icon: string;
}

const MOOD_THEMES: Record<MoodThemeKey, MoodThemeInfo> = {
  warm: {
    name: '杏粉微光',
    desc: '温暖',
    primaryOrb: 'radial-gradient(circle, #ffbcac 0%, rgba(255,188,172,0) 70%)',
    secondaryOrb: 'radial-gradient(circle, #f9b7a6 0%, rgba(249,183,166,0) 70%)',
    gradient: 'from-[#ffbcac] to-[#f9b7a6]',
    icon: 'sunny',
  },
  mint: {
    name: '薄荷薄雾',
    desc: '清爽',
    primaryOrb: 'radial-gradient(circle, #cfe8e0 0%, rgba(207,232,224,0) 70%)',
    secondaryOrb: 'radial-gradient(circle, #98b0a9 0%, rgba(152,176,169,0) 70%)',
    gradient: 'from-[#cfe8e0] to-[#98b0a9]',
    icon: 'spa',
  },
  twilight: {
    name: '暮色黛蓝',
    desc: '放空',
    primaryOrb: 'radial-gradient(circle, #b8c8d8 0%, rgba(184,200,216,0) 70%)',
    secondaryOrb: 'radial-gradient(circle, #51606e 0%, rgba(81,96,110,0) 70%)',
    gradient: 'from-[#b8c8d8] to-[#51606e]',
    icon: 'nightlight',
  },
  violet: {
    name: '星尘浅紫',
    desc: '感性',
    primaryOrb: 'radial-gradient(circle, #e5d4e8 0%, rgba(229,212,232,0) 70%)',
    secondaryOrb: 'radial-gradient(circle, #d4e4f5 0%, rgba(212,228,245,0) 70%)',
    gradient: 'from-[#e5d4e8] to-[#9dadbc]',
    icon: 'auto_awesome',
  },
};

export const ComposeScreen: React.FC<ComposeScreenProps> = ({
  initialText = '',
  initialMoodPrompt,
  onReleaseThought,
  onSaveDraftToBox,
  onReturnToTimeline,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<MoodThemeKey>('warm');
  const [text, setText] = useState<string>(initialText);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagsShelf, setShowTagsShelf] = useState<boolean>(true);
  const [destination, setDestination] = useState<'private' | 'ocean' | 'future'>('private');
  const [futureTimeOption, setFutureTimeOption] = useState<number>(30);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVoice, setRecordedVoice] = useState<boolean>(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [draftToast, setDraftToast] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTags = [
    '#想念',
    '#放空',
    '#疲倦自愈',
    '#今日闪光',
    '#窗外微风',
    '#心事微光',
  ];

  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  // Voice recording simulation
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedVoice(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    onSaveDraftToBox(text);
    setDraftToast(true);
    setTimeout(() => setDraftToast(false), 2000);
  };

  const handleRelease = () => {
    if (!text.trim() && !uploadedImage && !recordedVoice) {
      alert('请写下哪怕一句话，或留下一段轻声耳语。');
      return;
    }
    setShowSuccessModal(true);
  };

  const confirmModalDismiss = () => {
    setShowSuccessModal(false);
    onReleaseThought({
      text: text || '在深秋的下午，静静地呼出一口气……',
      destination,
      moodAura: MOOD_THEMES[selectedTheme].name,
      tags: selectedTags,
      imageUrl: uploadedImage || undefined,
      hasVoiceMemo: recordedVoice,
      futureDays: destination === 'future' ? futureTimeOption : undefined,
    });
  };

  const currentThemeConfig = MOOD_THEMES[selectedTheme];

  return (
    <div className="flex flex-col w-full relative overflow-hidden transition-colors duration-700 min-h-[calc(100vh-4rem)] pb-36 pt-2">
      {/* Dynamic Atmospheric Glow Orbs */}
      <div
        className="pointer-events-none fixed -top-12 -left-16 w-80 h-80 rounded-full blur-3xl opacity-40 transition-all duration-1000 z-0"
        style={{background: currentThemeConfig.primaryOrb}}
      />
      <div
        className="pointer-events-none fixed top-48 -right-20 w-72 h-72 rounded-full blur-3xl opacity-35 transition-all duration-1000 z-0"
        style={{background: currentThemeConfig.secondaryOrb}}
      />

      {/* Intimate Sanctuary Intro Header */}
      <div className="px-5 pt-2 pb-2 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <span className="inline-flex w-2 h-2 rounded-full bg-[#ffbcac] animate-pulse" />
          <p className="text-xs text-[#424846] italic font-serif">
            在这里，每一种情绪都被温柔接纳
          </p>
        </div>
        <button
          onClick={handleSaveDraft}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#ebe8e2]/70 hover:bg-[#e5e2dc] transition-all text-[#424846] text-xs font-medium active:scale-95 shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px] text-[#4c635d]">
            {draftToast ? 'done' : 'bookmark_border'}
          </span>
          <span>{draftToast ? '已安放' : '存入心盒'}</span>
        </button>
      </div>

      <div className="px-5 flex flex-col space-y-5 relative z-10">
        {/* Mood Aura Selector */}
        {!isFocusMode && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-[0_4px_20px_-2px_rgba(62,59,58,0.04)] border border-white/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#424846] font-medium tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#845144]">
                  palette
                </span>
                情绪色调与微光脉冲
              </span>
              <span className="text-xs text-[#727876]">
                {currentThemeConfig.name} · {currentThemeConfig.desc}
              </span>
            </div>

            {/* Mood Pebble Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(MOOD_THEMES) as MoodThemeKey[]).map((key) => {
                const theme = MOOD_THEMES[key];
                const active = selectedTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTheme(key)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all active:scale-95 ${
                      active
                        ? 'bg-[#e5e2dc]/80 ring-2 ring-[#4c635d]/40 shadow-xs'
                        : 'bg-[#f0eee8]/60 hover:bg-[#e5e2dc]/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center bg-gradient-to-tr ${theme.gradient} transition-transform hover:scale-105`}
                    >
                      <span className="material-symbols-outlined text-[15px] text-white">
                        {theme.icon}
                      </span>
                    </div>
                    <span className="text-xs mt-1.5 text-[#1c1c18] font-medium text-center">
                      {theme.name}
                    </span>
                    <span className="text-[10px] text-[#727876]">{theme.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Editorial Composition Desk */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(62,59,58,0.04)] border border-white/60 relative">
          <div className="flex items-center justify-between mb-3 text-[#727876]">
            <div className="flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#4c635d]">
                edit_note
              </span>
              <span className="text-xs">
                {text.length === 0
                  ? '0 字 · 静静倾听中'
                  : `${text.length} 字 · 正在梳理思绪`}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`px-2.5 py-1 rounded-full text-xs flex items-center space-x-1 transition-all active:scale-95 ${
                  isFocusMode
                    ? 'bg-[#4c635d] text-white shadow-xs font-medium'
                    : 'bg-[#f0eee8] hover:bg-[#ebe8e2] text-[#424846]'
                }`}
                title={isFocusMode ? '退出全神模式' : '全神专注模式'}
                aria-label={isFocusMode ? '退出全神模式' : '全神专注模式'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isFocusMode ? 'fullscreen_exit' : 'fullscreen'}
                </span>
                <span>{isFocusMode ? '退出专注' : '全神专注'}</span>
              </button>
            </div>
          </div>

          {/* Thought Canvas */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={isFocusMode ? 12 : 7}
            placeholder={
              initialMoodPrompt ||
              '深呼吸……今天有什么触动了你？哪怕只是一阵风、一句歌词、或者一个不想说话的瞬间……'
            }
            className="w-full bg-transparent font-serif text-base text-[#1c1c18] placeholder:text-[#727876]/60 placeholder:font-serif placeholder:italic focus:outline-none resize-none leading-relaxed selection:bg-[#ffdbd2]"
          />

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <div className="relative mt-2 mb-3 rounded-xl overflow-hidden max-h-48 border border-[#e5e2dc]">
              <img
                src={uploadedImage}
                alt="上传剪影"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all active:scale-90"
                aria-label="删除图片"
                title="删除图片"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
          )}

          {/* Voice Memo Recording Box */}
          {(isRecording || recordedVoice) && (
            <div className="mt-3 p-3 rounded-xl bg-[#f6f3ed] flex items-center justify-between border border-white/60">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isRecording ? 'bg-[#ba1a1a] animate-ping' : 'bg-[#4c635d]'
                  }`}
                />
                <span className="text-xs text-[#424846] font-medium">
                  {isRecording
                    ? `正在聆听轻语 00:${recordingSeconds.toString().padStart(2, '0')}...`
                    : `已录入轻声耳语 (00:${Math.max(5, recordingSeconds)})`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-end space-x-1 h-5 pb-0.5">
                  {[12, 20, 10, 16].map((h, idx) => (
                    <div
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        idx % 2 === 0 ? 'bg-[#4c635d]' : 'bg-[#98b0a9]'
                      } ${isRecording ? 'animate-wave-bar' : ''}`}
                      style={{
                        height: `${h}px`,
                        animationDelay: isRecording ? `${(idx * 0.15).toFixed(2)}s` : undefined,
                        animationDuration: '0.8s',
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    setIsRecording(false);
                    setRecordedVoice(false);
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#727876] hover:text-[#1c1c18] transition-all active:scale-90"
                  aria-label="移除录音"
                  title="移除录音"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Multimodal Input Pill Toolbar */}
          <div className="mt-4 pt-2 flex items-center justify-between border-t border-[#f0eee8]">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleRecording}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-95 ${
                  isRecording
                    ? 'bg-[#ba1a1a] text-white shadow-xs'
                    : recordedVoice
                      ? 'bg-[#cfe8e0] text-[#091f1b] font-medium shadow-xs'
                      : 'bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#424846]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {isRecording ? 'stop_circle' : recordedVoice ? 'mic' : 'mic_none'}
                </span>
                <span>{isRecording ? '停止录音' : recordedVoice ? '已录制耳语' : '轻声耳语'}</span>
              </button>

              <label className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 ${
                uploadedImage ? 'bg-[#cfe8e0] text-[#091f1b] font-medium shadow-xs' : 'bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#424846]'
              }`}>
                <span className="material-symbols-outlined text-[17px] text-[#845144]">
                  {uploadedImage ? 'photo' : 'image'}
                </span>
                <span>{uploadedImage ? '已附剪影' : '剪影瞬间'}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={() => setShowTagsShelf(!showTagsShelf)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1 transition-all active:scale-95 ${
                showTagsShelf
                  ? 'bg-[#cfe8e0] text-[#091f1b] font-medium shadow-xs'
                  : 'bg-[#f6f3ed] hover:bg-[#ebe8e2] text-[#424846]'
              }`}
              aria-label="切换心绪标签抽屉"
            >
              <span className={`material-symbols-outlined text-[16px] text-[#4c635d] ${showTagsShelf ? 'material-symbols-fill' : ''}`}>
                label
              </span>
              <span>心绪标签</span>
            </button>
          </div>

          {/* Expandable Tags Shelf */}
          {showTagsShelf && (
            <div className="mt-3 pt-2 flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#98b0a9] text-white font-medium shadow-xs'
                        : 'bg-[#ebe8e2]/70 text-[#727876] hover:text-[#1c1c18]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Soft Privacy Horizons */}
        {!isFocusMode && (
          <div className="space-y-3">
            <div className="flex items-center space-x-1.5 px-1">
              <span className="material-symbols-outlined text-[15px] text-[#727876]">
                alt_route
              </span>
              <h2 className="text-xs text-[#424846] uppercase font-semibold tracking-wider">
                心事的去向与归宿
              </h2>
            </div>

            <div className="space-y-2">
              {/* Option 1: Private Tree Hole */}
              <label
                onClick={() => setDestination('private')}
                className={`flex items-start space-x-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                  destination === 'private'
                    ? 'bg-white shadow-[0_4px_16px_rgba(76,99,93,0.08)] border-[#98b0a9]'
                    : 'bg-white/70 hover:bg-white/90 border-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="destination"
                  value="private"
                  checked={destination === 'private'}
                  onChange={() => setDestination('private')}
                  className="mt-1 accent-[#4c635d] w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#4c635d]">
                      lock
                    </span>
                    <span className="text-sm font-semibold text-[#1c1c18]">
                      锁在私人树洞
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f0eee8] text-[10px] text-[#727876]">
                      端到端加密
                    </span>
                  </div>
                  <p className="text-xs text-[#424846] mt-1 leading-relaxed">
                    仅自己可见。像把一页字迹锁入深木盒，只属于你与这一刻的坦诚。
                  </p>
                </div>
              </label>

              {/* Option 2: Ocean of Echoes */}
              <label
                onClick={() => setDestination('ocean')}
                className={`flex items-start space-x-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                  destination === 'ocean'
                    ? 'bg-white shadow-[0_4px_16px_rgba(76,99,93,0.08)] border-[#98b0a9]'
                    : 'bg-white/70 hover:bg-white/90 border-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="destination"
                  value="ocean"
                  checked={destination === 'ocean'}
                  onChange={() => setDestination('ocean')}
                  className="mt-1 accent-[#4c635d] w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#51606e]">
                      nights_stay
                    </span>
                    <span className="text-sm font-semibold text-[#1c1c18]">
                      投向心绪星海
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#d4e4f5] text-[10px] text-[#0d1d29]">
                      完全匿名
                    </span>
                  </div>
                  <p className="text-xs text-[#424846] mt-1 leading-relaxed">
                    随潮水飘向另一个深夜未眠的灵魂，只接受微光与拥抱，不显示主页。
                  </p>
                </div>
              </label>

              {/* Option 3: Future Self Capsule */}
              <label
                onClick={() => setDestination('future')}
                className={`flex items-start space-x-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                  destination === 'future'
                    ? 'bg-white shadow-[0_4px_16px_rgba(76,99,93,0.08)] border-[#98b0a9]'
                    : 'bg-white/70 hover:bg-white/90 border-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="destination"
                  value="future"
                  checked={destination === 'future'}
                  onChange={() => setDestination('future')}
                  className="mt-1 accent-[#4c635d] w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#845144]">
                      mark_email_read
                    </span>
                    <span className="text-sm font-semibold text-[#1c1c18]">
                      寄给未来的自己
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdbd2] text-[10px] text-[#341108]">
                      时间盲盒
                    </span>
                  </div>
                  <p className="text-xs text-[#424846] mt-1 leading-relaxed">
                    封存一段时间后开启，给未来的自己送去当下的温热注脚。
                  </p>

                  {/* Future Delivery Time Selector */}
                  <div
                    className="mt-2.5 pt-2 flex items-center space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs text-[#727876]">启封时间：</span>
                    {[30, 100, 365].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFutureTimeOption(days)}
                        className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
                          futureTimeOption === days
                            ? 'bg-[#98b0a9] text-white font-medium'
                            : 'bg-[#f0eee8] text-[#424846] hover:bg-[#ebe8e2]'
                        }`}
                      >
                        {days === 365 ? '1 年后' : `${days} 天后`}
                      </button>
                    ))}
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tactile Release Action Button */}
        <div className="pt-3 flex flex-col items-center justify-center space-y-2">
          <button
            onClick={handleRelease}
            className="w-full relative overflow-hidden group h-14 rounded-full shadow-[0_10px_28px_-4px_rgba(152,176,169,0.35)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center space-x-2.5"
            style={{
              background:
                'linear-gradient(135deg, #98b0a9 0%, #87a099 50%, #ffbcac 100%)',
            }}
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="material-symbols-outlined text-[20px] text-white animate-pulse">
              air
            </span>
            <span className="text-sm font-semibold text-white tracking-wide">
              化作一缕心绪，轻轻放下
            </span>
          </button>

          <div className="flex items-center space-x-1.5 text-[#727876]">
            <span className="material-symbols-outlined text-[15px] text-[#845144]">
              favorite
            </span>
            <p className="text-xs tracking-wide">写完啦，抱抱你。</p>
          </div>
        </div>
      </div>

      {/* Release Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 flex flex-col items-center text-center shadow-2xl transform scale-100 transition-transform border border-white">
            <div className="w-16 h-16 rounded-full bg-[#ffdbd2] flex items-center justify-center mb-4 shadow-inner">
              <span className="material-symbols-outlined text-[32px] text-[#845144]">
                spa
              </span>
            </div>
            <h3 className="font-serif text-xl font-medium text-[#1c1c18]">
              心事已随风飘远
            </h3>
            <p className="text-xs text-[#424846] mt-2 leading-relaxed">
              它已被温柔地收进岁月的褶皱里。卸下重负，今晚好好睡个安稳觉吧。
            </p>
            <button
              onClick={confirmModalDismiss}
              className="mt-6 w-full py-3 rounded-full bg-[#4c635d] text-white text-sm font-medium shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              静心返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
