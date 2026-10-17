import React from 'react';
import {TabType} from '../types';
import {APP_ASSETS} from '../data/initialData';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onSaveDraft?: () => void;
  draftSavedToast?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onSaveDraft,
  draftSavedToast,
}) => {
  const tabTitles: Record<TabType, {en: string; cn: string}> = {
    timeline: {en: 'Timeline', cn: '流淌'},
    galaxy: {en: 'Galaxy', cn: '星河'},
    compose: {en: 'Compose', cn: '轻语'},
    echoes: {en: 'Echoes', cn: '回响'},
    sanctuary: {en: 'Sanctuary', cn: '自留地'},
  };

  const isCompose = currentTab === 'compose';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcf9f3]/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(62,59,58,0.03)] border-b border-[#e5e2dc]/50 transition-all">
      <div className="max-w-md mx-auto h-16 px-5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {isCompose && (
            <button
              onClick={() => onSelectTab('timeline')}
              aria-label="返回"
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#1c1c18] active:bg-[#ebe8e2]/60 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_back_ios_new
              </span>
            </button>
          )}

          <div
            className="flex items-center space-x-2.5 cursor-pointer"
            onClick={() => onSelectTab('timeline')}
          >
            <img
              alt="喃喃 Logo"
              className="h-8 w-auto object-contain select-none"
              src={APP_ASSETS.logo}
            />
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1.5">
                <span className="font-headline-sm text-lg text-[#1c1c18] tracking-tight font-serif font-medium">
                  喃喃
                </span>
                <span className="font-label-sm text-xs text-[#424846] font-medium tracking-wide">
                  {tabTitles[currentTab].en}
                </span>
              </div>
              <span className="font-label-sm text-[#727876] tracking-wider text-[10px] leading-none opacity-80">
                把心事轻轻放在这里
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isCompose && onSaveDraft && (
            <button
              onClick={onSaveDraft}
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-[#ebe8e2]/80 hover:bg-[#e5e2dc] transition-all text-[#424846] text-xs font-medium active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px] text-[#4c635d]">
                {draftSavedToast ? 'done' : 'bookmark_border'}
              </span>
              <span>{draftSavedToast ? '已存入心盒' : '存入心盒'}</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('sanctuary')}
            aria-label="自留地资料"
            className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-transform"
          >
            <img
              alt="Profile"
              className={`w-8 h-8 rounded-full object-cover shadow-[0_2px_8px_rgba(76,99,93,0.12)] border transition-all ${
                currentTab === 'sanctuary'
                  ? 'border-[#4c635d] ring-2 ring-[#cfe8e0]'
                  : 'border-transparent'
              }`}
              src={APP_ASSETS.avatar}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
