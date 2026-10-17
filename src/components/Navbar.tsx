import React from 'react';
import {TabType} from '../types';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({currentTab, onSelectTab}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-2 sm:pb-4">
      <div className="max-w-md mx-auto px-5">
        <div className="pointer-events-auto h-16 rounded-full bg-white/90 backdrop-blur-xl shadow-[0_12px_36px_-6px_rgba(76,99,93,0.18),0_4px_16px_rgba(62,59,58,0.06)] border border-white/60 px-4 flex items-center justify-between relative">
          {/* Tab 1: 流淌 (Timeline) */}
          <button
            onClick={() => onSelectTab('timeline')}
            aria-label="流淌时间轴"
            className={`flex-1 flex flex-col items-center justify-center py-1 min-w-[44px] min-h-[44px] transition-all ${
              currentTab === 'timeline'
                ? 'text-[#4c635d] font-semibold'
                : 'text-[#424846] hover:text-[#4c635d]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-transform ${
                currentTab === 'timeline'
                  ? 'scale-110 material-symbols-fill'
                  : ''
              }`}
            >
              water_drop
            </span>
            <span className="font-label-sm text-[11px] mt-0.5 tracking-tight">
              流淌
            </span>
          </button>

          {/* Tab 2: 星河 (Galaxy) */}
          <button
            onClick={() => onSelectTab('galaxy')}
            aria-label="星河分析"
            className={`flex-1 flex flex-col items-center justify-center py-1 min-w-[44px] min-h-[44px] transition-all ${
              currentTab === 'galaxy'
                ? 'text-[#4c635d] font-semibold'
                : 'text-[#424846] hover:text-[#4c635d]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-transform ${
                currentTab === 'galaxy' ? 'scale-110 material-symbols-fill' : ''
              }`}
            >
              auto_awesome
            </span>
            <span className="font-label-sm text-[11px] mt-0.5 tracking-tight">
              星河
            </span>
          </button>

          {/* Central Elevated Compose Button: 轻语 */}
          <div className="relative -top-5 flex flex-col items-center justify-center px-1">
            <button
              onClick={() => onSelectTab('compose')}
              aria-label="写下轻语"
              className={`w-[52px] h-[52px] rounded-full text-white flex items-center justify-center shadow-[0_8px_20px_rgba(76,99,93,0.32)] active:scale-95 transition-all hover:shadow-[0_10px_24px_rgba(76,99,93,0.4)] ${
                currentTab === 'compose'
                  ? 'bg-gradient-to-tr from-[#354b46] to-[#4c635d] ring-4 ring-[#cfe8e0]'
                  : 'bg-gradient-to-tr from-[#4c635d] to-[#98b0a9]'
              }`}
            >
              <span className="material-symbols-outlined text-[26px]">
                edit_note
              </span>
            </button>
            <span
              className={`font-label-sm text-[11px] font-medium mt-1 tracking-tight ${
                currentTab === 'compose'
                  ? 'text-[#4c635d] font-bold'
                  : 'text-[#4c635d]'
              }`}
            >
              轻语
            </span>
          </div>

          {/* Tab 4: 回响 (Echoes) */}
          <button
            onClick={() => onSelectTab('echoes')}
            aria-label="回响社区"
            className={`flex-1 flex flex-col items-center justify-center py-1 min-w-[44px] min-h-[44px] transition-all ${
              currentTab === 'echoes'
                ? 'text-[#4c635d] font-semibold'
                : 'text-[#424846] hover:text-[#4c635d]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-transform ${
                currentTab === 'echoes' ? 'scale-110 material-symbols-fill' : ''
              }`}
            >
              nature_people
            </span>
            <span className="font-label-sm text-[11px] mt-0.5 tracking-tight">
              回响
            </span>
          </button>

          {/* Tab 5: 自留地 (Sanctuary / Profile) */}
          <button
            onClick={() => onSelectTab('sanctuary')}
            aria-label="自留地"
            className={`flex-1 flex flex-col items-center justify-center py-1 min-w-[44px] min-h-[44px] transition-all ${
              currentTab === 'sanctuary'
                ? 'text-[#4c635d] font-semibold'
                : 'text-[#424846] hover:text-[#4c635d]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-transform ${
                currentTab === 'sanctuary'
                  ? 'scale-110 material-symbols-fill'
                  : ''
              }`}
            >
              spa
            </span>
            <span className="font-label-sm text-[11px] mt-0.5 tracking-tight">
              自留地
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
