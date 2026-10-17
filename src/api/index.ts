import {TimelineItem, EchoItem, TimeCapsuleItem} from '../types';
import {
  INITIAL_TIMELINE,
  INITIAL_ECHOES,
  INITIAL_TIME_CAPSULES,
} from '../data/initialData';

const BASE_URL = '/api';

/** 安全请求工具，遇到网络或后端未启动时优雅降级 */
async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  fallbackValue?: T,
): Promise<{data: T; isFallback: boolean; error?: string}> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {'Content-Type': 'application/json', ...options?.headers},
      ...options,
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success !== false) {
        return {data: (json.data ?? json) as T, isFallback: false};
      }
    }
  } catch (err: any) {
    // 后端连接异常或网络不可达
    console.debug(`[API] 请求 ${url} 降级至本地缓存:`, err?.message);
  }

  return {
    data: fallbackValue as T,
    isFallback: true,
  };
}

// -------------------------------------------------------------
// Timeline API
// -------------------------------------------------------------
export const timelineApi = {
  async getAll(): Promise<TimelineItem[]> {
    const saved = localStorage.getItem('murmur_timeline');
    const localFallback: TimelineItem[] = saved ? JSON.parse(saved) : INITIAL_TIMELINE;

    const res = await safeFetch<TimelineItem[]>('/timeline', {method: 'GET'}, localFallback);
    if (!res.isFallback && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem('murmur_timeline', JSON.stringify(res.data));
      return res.data;
    }
    return localFallback;
  },

  async create(item: TimelineItem): Promise<TimelineItem> {
    const res = await safeFetch<TimelineItem>(
      '/timeline',
      {
        method: 'POST',
        body: JSON.stringify(item),
      },
      item,
    );
    return res.data;
  },

  async update(item: TimelineItem): Promise<TimelineItem> {
    const res = await safeFetch<TimelineItem>(
      `/timeline/${item.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(item),
      },
      item,
    );
    return res.data;
  },

  async delete(id: string): Promise<boolean> {
    const res = await safeFetch<{success: boolean}>(
      `/timeline/${id}`,
      {method: 'DELETE'},
      {success: true},
    );
    return res.data.success;
  },

  async reset(): Promise<TimelineItem[]> {
    const res = await safeFetch<TimelineItem[]>(
      '/timeline/reset',
      {method: 'POST'},
      INITIAL_TIMELINE,
    );
    localStorage.setItem('murmur_timeline', JSON.stringify(res.data));
    return res.data;
  },
};

// -------------------------------------------------------------
// Echoes API
// -------------------------------------------------------------
export const echoesApi = {
  async getAll(category?: string): Promise<EchoItem[]> {
    const saved = localStorage.getItem('murmur_echoes');
    const localFallback: EchoItem[] = saved ? JSON.parse(saved) : INITIAL_ECHOES;
    const query = category && category !== 'all' ? `?category=${category}` : '';

    const res = await safeFetch<EchoItem[]>(`/echoes${query}`, {method: 'GET'}, localFallback);
    if (!res.isFallback && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem('murmur_echoes', JSON.stringify(res.data));
      return res.data;
    }
    return localFallback;
  },

  async create(echo: EchoItem): Promise<EchoItem> {
    const res = await safeFetch<EchoItem>(
      '/echoes',
      {
        method: 'POST',
        body: JSON.stringify(echo),
      },
      echo,
    );
    return res.data;
  },

  async update(echo: EchoItem): Promise<EchoItem> {
    const res = await safeFetch<EchoItem>(
      `/echoes/${echo.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(echo),
      },
      echo,
    );
    return res.data;
  },

  async addWarmNote(echoId: string, text: string, author?: string): Promise<EchoItem | null> {
    const res = await safeFetch<EchoItem>(
      `/echoes/${echoId}/notes`,
      {
        method: 'POST',
        body: JSON.stringify({text, author}),
      },
      null as any,
    );
    return res.data;
  },

  async reset(): Promise<EchoItem[]> {
    const res = await safeFetch<EchoItem[]>(
      '/echoes/reset',
      {method: 'POST'},
      INITIAL_ECHOES,
    );
    localStorage.setItem('murmur_echoes', JSON.stringify(res.data));
    return res.data;
  },
};

// -------------------------------------------------------------
// Time Capsules API
// -------------------------------------------------------------
export const capsulesApi = {
  async getAll(): Promise<TimeCapsuleItem[]> {
    const saved = localStorage.getItem('murmur_capsules');
    const localFallback: TimeCapsuleItem[] = saved
      ? JSON.parse(saved)
      : INITIAL_TIME_CAPSULES;

    const res = await safeFetch<TimeCapsuleItem[]>('/capsules', {method: 'GET'}, localFallback);
    if (!res.isFallback && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem('murmur_capsules', JSON.stringify(res.data));
      return res.data;
    }
    return localFallback;
  },

  async create(capsule: TimeCapsuleItem): Promise<TimeCapsuleItem> {
    const res = await safeFetch<TimeCapsuleItem>(
      '/capsules',
      {
        method: 'POST',
        body: JSON.stringify(capsule),
      },
      capsule,
    );
    return res.data;
  },

  async unseal(id: string): Promise<TimeCapsuleItem | null> {
    const res = await safeFetch<TimeCapsuleItem>(
      `/capsules/${id}/unseal`,
      {method: 'PATCH'},
      null as any,
    );
    return res.data;
  },

  async reset(): Promise<TimeCapsuleItem[]> {
    const res = await safeFetch<TimeCapsuleItem[]>(
      '/capsules/reset',
      {method: 'POST'},
      INITIAL_TIME_CAPSULES,
    );
    localStorage.setItem('murmur_capsules', JSON.stringify(res.data));
    return res.data;
  },
};

// -------------------------------------------------------------
// Draft Heart Box API
// -------------------------------------------------------------
export const draftApi = {
  async get(): Promise<string> {
    const localDraft = localStorage.getItem('murmur_draft') || '';
    const res = await safeFetch<{draft: string}>(
      '/draft',
      {method: 'GET'},
      {draft: localDraft},
    );
    return res.data?.draft !== undefined ? res.data.draft : localDraft;
  },

  async save(text: string): Promise<void> {
    localStorage.setItem('murmur_draft', text);
    await safeFetch('/draft', {
      method: 'POST',
      body: JSON.stringify({text}),
    });
  },

  async clear(): Promise<void> {
    localStorage.removeItem('murmur_draft');
    await safeFetch('/draft', {method: 'DELETE'});
  },
};

// -------------------------------------------------------------
// System Health / Supabase Status
// -------------------------------------------------------------
export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  database: {
    provider: string;
    configured: boolean;
    connected: boolean;
    message: string;
    url?: string;
    counts?: {
      timeline: number;
      echoes: number;
      capsules: number;
    };
  };
  ai: {
    provider: string;
    configured: boolean;
    mode: string;
  };
}

export async function checkBackendHealth(): Promise<HealthStatus | null> {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // 后端可能尚未启动
  }
  return null;
}
