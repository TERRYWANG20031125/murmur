import React, {useState, useEffect} from 'react';
import {checkBackendHealth, HealthStatus} from '../api';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshHealth = async () => {
    setLoading(true);
    const data = await checkBackendHealth();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      refreshHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConnected = health?.database?.connected;
  const isConfigured = health?.database?.configured;

  const sampleEnvText = `# Supabase 数据库配置 (写入 .env 文件)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
PORT=3001`;

  const copyEnvSample = () => {
    navigator.clipboard?.writeText(sampleEnvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fcf9f3] text-[#1c1c18] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-white/80 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e5e2dc] pb-3">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#4c635d] text-[22px]">
              database
            </span>
            <h3 className="font-serif font-medium text-base text-[#1c1c18]">
              Supabase 数据库存储状态
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#727876] hover:bg-[#ebe8e2] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Status Box */}
        <div
          className={`p-4 rounded-2xl border flex flex-col space-y-2 ${
            isConnected
              ? 'bg-[#e2f1ec] border-[#b3ccc4] text-[#091f1b]'
              : isConfigured
                ? 'bg-[#fff5e5] border-[#f2d29b] text-[#5c4114]'
                : 'bg-[#f4f2ee] border-[#e0ddd5] text-[#424846]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isConnected
                    ? 'bg-[#3b8c6e] animate-pulse'
                    : isConfigured
                      ? 'bg-[#d97706]'
                      : 'bg-[#8c9491]'
                }`}
              />
              <span className="font-semibold text-sm">
                {isConnected
                  ? 'Supabase 数据库已成功连通'
                  : isConfigured
                    ? '已配置凭证，但表未初始化或网络受限'
                    : '当前运行在本地/内存降级持久化模式'}
              </span>
            </div>
            <button
              onClick={refreshHealth}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-[#4c635d] shadow-2xs font-medium active:scale-95 transition-transform"
            >
              {loading ? '检测中...' : '刷新状态'}
            </button>
          </div>

          <p className="text-xs opacity-90 leading-relaxed">
            {health?.database?.message ||
              '后端服务响应正常，当前所有写操作均双向备份于浏览器缓存与后端缓存中。'}
          </p>

          {health?.database?.url && (
            <div className="text-[11px] font-mono text-[#727876] break-all pt-1">
              项目地址: {health.database.url}
            </div>
          )}
        </div>

        {/* Database Stats */}
        {health?.database?.counts && (
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-white/80 border border-[#ebe8e2] text-center">
              <span className="text-sm font-semibold text-[#1c1c18] block">
                {health.database.counts.timeline}
              </span>
              <span className="text-[10px] text-[#727876]">心绪漫游</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-[#ebe8e2] text-center">
              <span className="text-sm font-semibold text-[#4c635d] block">
                {health.database.counts.echoes}
              </span>
              <span className="text-[10px] text-[#727876]">回音纸飞机</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-[#ebe8e2] text-center">
              <span className="text-sm font-semibold text-[#845144] block">
                {health.database.counts.capsules}
              </span>
              <span className="text-[10px] text-[#727876]">时间盲盒</span>
            </div>
          </div>
        )}

        {/* Setup Guide */}
        <div className="flex flex-col space-y-2 pt-1">
          <h4 className="text-xs font-semibold text-[#1c1c18] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#4c635d]">
              menu_book
            </span>
            Supabase 3步快速连通指南
          </h4>
          <ol className="text-xs text-[#555e5b] space-y-2 bg-white/70 p-3.5 rounded-2xl border border-[#ebe8e2]">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#4c635d] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span>
                前往 <strong>Supabase.com</strong> 免费新建一个项目。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#4c635d] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span>
                在 Supabase 左侧菜单打开 <strong>SQL Editor</strong>，将项目中的{' '}
                <code className="text-[#845144] bg-[#ffdbd2]/40 px-1 py-0.5 rounded">
                  supabase/schema.sql
                </code>{' '}
                代码全部粘贴并点击 <strong>Run</strong> 执行。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#4c635d] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span>
                在项目根目录的 <code className="text-[#845144]">.env</code> 文件中填入{' '}
                <strong>SUPABASE_URL</strong> 与 <strong>SUPABASE_ANON_KEY</strong>。
              </span>
            </li>
          </ol>
        </div>

        {/* Copy config sample */}
        <button
          onClick={copyEnvSample}
          className="w-full py-2.5 px-3 rounded-xl bg-[#ebe8e2] hover:bg-[#e0ddd5] text-[#1c1c18] text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? '已复制环境变量模板' : '复制 .env 配置模板'}</span>
        </button>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-full bg-[#4c635d] text-white text-xs font-medium hover:bg-[#3d524d] transition-colors shadow-xs"
        >
          知道了
        </button>
      </div>
    </div>
  );
};
