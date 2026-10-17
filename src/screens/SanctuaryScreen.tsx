import React, {useState} from 'react';
import {TimelineItem, TimeCapsuleItem} from '../types';
import {APP_ASSETS} from '../data/initialData';

interface SanctuaryScreenProps {
  timeline: TimelineItem[];
  timeCapsules: TimeCapsuleItem[];
  savedDraft: string;
  onRestoreDraft: (draft: string) => void;
  onClearDraft: () => void;
  onResetData: () => void;
  onUnsealCapsule: (id: string) => void;
  onOpenDbModal?: () => void;
  dbConnected?: boolean;
}

export const SanctuaryScreen: React.FC<SanctuaryScreenProps> = ({
  timeline,
  timeCapsules,
  savedDraft,
  onRestoreDraft,
  onClearDraft,
  onResetData,
  onUnsealCapsule,
  onOpenDbModal,
  dbConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'treehole' | 'capsule' | 'wallpapers'>(
    'treehole',
  );
  const [copiedPrivateId, setCopiedPrivateId] = useState<string | null>(null);
  const [isDownloadedWallpaper, setIsDownloadedWallpaper] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyPrivate = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedPrivateId(id);
    showToast('树洞密语已复制到剪贴板 📋');
    setTimeout(() => setCopiedPrivateId(null), 2000);
  };

  const handleDownloadWallpaper = () => {
    setIsDownloadedWallpaper(true);
    showToast('壁纸已存入相册 ✨');
    try {
      const link = document.createElement('a');
      link.href = APP_ASSETS.wallpaper;
      link.download = '秋日放晴简帖.jpg';
      link.target = '_blank';
      link.click();
    } catch {
      // ignore
    }
    setTimeout(() => setIsDownloadedWallpaper(false), 2500);
  };

  const privateItems = timeline.filter((item) => item.visibility === 'private');

  return (
    <div className="flex flex-col w-full px-5 space-y-5 pb-28 pt-2">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1c1c18]/90 text-white text-xs backdrop-blur-md shadow-lg transition-all animate-fade-in flex items-center space-x-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#ffbcac]">
            auto_awesome
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile & Sanctuary Overview */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f6f3ed] via-[#fcf9f3] to-[#cfe8e0]/25 p-5 shadow-[0_4px_24px_-4px_rgba(76,99,93,0.06)] border border-white/80">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={APP_ASSETS.avatar}
              alt="用户头像"
              className="w-16 h-16 rounded-full object-cover shadow-[0_4px_16px_rgba(76,99,93,0.18)] border-2 border-white"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#4c635d] border-2 border-white flex items-center justify-center text-white text-[9px]">
              ✓
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-serif font-medium text-[#1c1c18]">
                林间漫步的旅人
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#cfe8e0] text-[#091f1b] text-[10px] font-medium">
                第 128 个夜晚
              </span>
            </div>
            <p className="text-xs text-[#727876] mt-0.5 font-serif italic">
              “心湖无风，自成琉璃。”
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#ebe8e2] text-center">
          <div className="p-2 rounded-xl bg-white/70">
            <span className="text-base font-semibold text-[#1c1c18] block">
              {timeline.length}
            </span>
            <span className="text-[10px] text-[#727876]">心绪篇数</span>
          </div>
          <div className="p-2 rounded-xl bg-white/70">
            <span className="text-base font-semibold text-[#4c635d] block">
              {privateItems.length}
            </span>
            <span className="text-[10px] text-[#727876]">树洞封存</span>
          </div>
          <div className="p-2 rounded-xl bg-white/70">
            <span className="text-base font-semibold text-[#845144] block">
              {timeCapsules.length}
            </span>
            <span className="text-[10px] text-[#727876]">时间盲盒</span>
          </div>
        </div>

        {/* Database Storage Status Indicator */}
        <div className="mt-3 pt-3 border-t border-[#ebe8e2] flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                dbConnected ? 'bg-[#3b8c6e] animate-pulse' : 'bg-[#d97706]'
              }`}
            />
            <span className="text-[11px] text-[#555e5b]">
              {dbConnected ? 'Supabase 云端数据库已连通' : '存储模式: 本地双向同步'}
            </span>
          </div>
          {onOpenDbModal && (
            <button
              onClick={onOpenDbModal}
              className="text-[11px] text-[#4c635d] font-medium hover:underline flex items-center gap-0.5"
            >
              <span>配置/状态</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward_ios</span>
            </button>
          )}
        </div>
      </section>

      {/* Heart Box Draft Alert (if user stored a draft) */}
      {savedDraft && (
        <section className="p-4 rounded-2xl bg-[#ffdbd2]/40 border border-[#ffbcac] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="material-symbols-outlined text-[#845144] text-[20px]">
              bookmark
            </span>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[#1c1c18] block">
                心盒中有暂存草稿
              </span>
              <p className="text-[11px] text-[#424846] truncate">
                {savedDraft}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => onRestoreDraft(savedDraft)}
              className="px-2.5 py-1 rounded-full bg-[#4c635d] text-white text-[11px] font-medium hover:bg-[#354b46]"
            >
              取出编辑
            </button>
            <button
              onClick={onClearDraft}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#727876] hover:text-[#1c1c18]"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </section>
      )}

      {/* Segmented Tab Navigation */}
      <div className="flex items-center space-x-2 bg-[#f0eee8] p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('treehole')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTab === 'treehole'
              ? 'bg-white text-[#1c1c18] shadow-xs'
              : 'text-[#727876] hover:text-[#1c1c18]'
          }`}
        >
          🔒 私人树洞 ({privateItems.length})
        </button>
        <button
          onClick={() => setActiveTab('capsule')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTab === 'capsule'
              ? 'bg-white text-[#1c1c18] shadow-xs'
              : 'text-[#727876] hover:text-[#1c1c18]'
          }`}
        >
          💌 时间盲盒 ({timeCapsules.length})
        </button>
        <button
          onClick={() => setActiveTab('wallpapers')}
          className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all ${
            activeTab === 'wallpapers'
              ? 'bg-white text-[#1c1c18] shadow-xs'
              : 'text-[#727876] hover:text-[#1c1c18]'
          }`}
        >
          🖼️ 自愈壁纸 (1)
        </button>
      </div>

      {/* Tab 1: Private Tree Hole */}
      {activeTab === 'treehole' && (
        <section className="space-y-3">
          {privateItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#727876] bg-white rounded-2xl border border-white">
              树洞里空空如也，你在“轻语”中选择“锁在私人树洞”的心事会安放在这里。
            </div>
          ) : (
            privateItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white shadow-xs border border-white/80 space-y-2"
              >
                <div className="flex items-center justify-between text-[#727876] text-xs">
                  <span>{item.timestamp}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyPrivate(item.id, item.text)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        copiedPrivateId === item.id
                          ? 'text-[#4c635d] bg-[#cfe8e0]'
                          : 'text-[#727876] hover:text-[#4c635d] hover:bg-[#f0eee8]'
                      }`}
                      title="复制密语"
                      aria-label="复制密语"
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {copiedPrivateId === item.id ? 'check' : 'content_copy'}
                      </span>
                    </button>
                    <span className="flex items-center space-x-1 text-[#4c635d]">
                      <span className="material-symbols-outlined text-[13px]">
                        lock
                      </span>
                      <span>私密印记</span>
                    </span>
                  </div>
                </div>
                <p className="font-serif text-sm text-[#1c1c18] leading-relaxed">
                  {item.text}
                </p>
                {item.tags && (
                  <div className="flex gap-1 pt-1">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-[#727876] bg-[#f0eee8] px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {/* Tab 2: Time Capsules */}
      {activeTab === 'capsule' && (
        <section className="space-y-3">
          {timeCapsules.map((capsule) => (
            <div
              key={capsule.id}
              className="p-4 rounded-2xl bg-white shadow-xs border border-white/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#845144] font-medium flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[16px]">
                    mark_email_read
                  </span>
                  <span>封存于：{capsule.sealedDate}</span>
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdbd2] text-[#341108] font-semibold">
                  {capsule.unsealed
                    ? '已启封'
                    : `距启封还有 ${capsule.daysRemaining} 天`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f3ed] border border-[#e5e2dc]/60">
                {capsule.unsealed ? (
                  <p className="font-serif text-xs text-[#1c1c18] leading-relaxed italic">
                    “{capsule.content}”
                  </p>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#727876] italic font-serif">
                      🔒 岁月封存中，等待未来的重逢……
                    </span>
                    <button
                      onClick={() => {
                        onUnsealCapsule(capsule.id);
                        showToast('提前拆开信件，温热扑面而来 ✨');
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#4c635d] text-white text-[11px] hover:bg-[#354b46]"
                    >
                      提前启封
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Tab 3: Saved Wallpapers */}
      {activeTab === 'wallpapers' && (
        <section className="space-y-3">
          <div className="rounded-2xl overflow-hidden bg-white shadow-xs border border-white/80 p-3 flex items-center space-x-3">
            <img
              src={APP_ASSETS.wallpaper}
              alt="秋日放晴简帖"
              className="w-16 h-24 object-cover rounded-xl shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#1c1c18]">
                《秋日放晴简帖》
              </h4>
              <p className="text-xs text-[#727876] mt-0.5 font-serif italic">
                “允许一切发生，你比想象中更可爱。”
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={handleDownloadWallpaper}
                  className={`px-3 py-1 rounded-full text-white text-[11px] font-medium flex items-center space-x-1 transition-all active:scale-95 shadow-xs ${
                    isDownloadedWallpaper
                      ? 'bg-[#98b0a9]'
                      : 'bg-[#4c635d] hover:bg-[#354b46]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {isDownloadedWallpaper ? 'done' : 'download'}
                  </span>
                  <span>
                    {isDownloadedWallpaper ? '已存入相册' : '下载 4K 壁纸'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Data Management & Restoring */}
      <section className="pt-4 border-t border-[#ebe8e2] flex items-center justify-between text-xs text-[#727876]">
        <span>喃喃 v1.2.0 · 陪伴每个静谧夜晚</span>
        <button
          onClick={() => {
            if (confirm('是否重置为最初的温润示例数据？')) {
              onResetData();
              showToast('已恢复为初始数据');
            }
          }}
          className="text-[#845144] hover:underline"
        >
          恢复示例数据
        </button>
      </section>
    </div>
  );
};
