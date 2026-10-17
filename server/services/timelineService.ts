import {TimelineItem} from '../../src/types';
import {supabase} from '../db/supabaseClient';
import {SEED_TIMELINE} from '../db/seedData';

// 内存降级存储（当 Supabase 未连接或离线时使用）
let memoryStore: TimelineItem[] = [...SEED_TIMELINE];

/** 将数据库行格式转换为前端使用的 TimelineItem 驼峰格式 */
function rowToItem(row: any): TimelineItem {
  return {
    id: row.id,
    timestamp: row.timestamp,
    weatherCondition: row.weather_condition || '晴空微温',
    moodBadge: row.mood_badge || '微小确幸',
    moodEmoji: row.mood_emoji || '🫧',
    text: row.text,
    imageUrl: row.image_url || undefined,
    imageCaption: row.image_caption || undefined,
    audioMemo: row.audio_memo || undefined,
    tags: Array.isArray(row.tags) ? row.tags : [],
    reactions: row.reactions || {flares: 0, hasFlared: false, warmBlanket: false},
    echoReply: row.echo_reply || undefined,
    visibility: row.visibility || 'public',
    isQuoteCard: Boolean(row.is_quote_card),
    quoteAuthorNote: row.quote_author_note || undefined,
    createdDate: row.created_date || new Date().toISOString(),
  };
}

/** 将前端 TimelineItem 转换为数据库行 snake_case 格式 */
function itemToRow(item: Partial<TimelineItem>): any {
  const row: any = {};
  if (item.id !== undefined) row.id = item.id;
  if (item.timestamp !== undefined) row.timestamp = item.timestamp;
  if (item.weatherCondition !== undefined) row.weather_condition = item.weatherCondition;
  if (item.moodBadge !== undefined) row.mood_badge = item.moodBadge;
  if (item.moodEmoji !== undefined) row.mood_emoji = item.moodEmoji;
  if (item.text !== undefined) row.text = item.text;
  if (item.imageUrl !== undefined) row.image_url = item.imageUrl;
  if (item.imageCaption !== undefined) row.image_caption = item.imageCaption;
  if (item.audioMemo !== undefined) row.audio_memo = item.audioMemo;
  if (item.tags !== undefined) row.tags = item.tags;
  if (item.reactions !== undefined) row.reactions = item.reactions;
  if (item.echoReply !== undefined) row.echo_reply = item.echoReply;
  if (item.visibility !== undefined) row.visibility = item.visibility;
  if (item.isQuoteCard !== undefined) row.is_quote_card = item.isQuoteCard;
  if (item.quoteAuthorNote !== undefined) row.quote_author_note = item.quoteAuthorNote;
  if (item.createdDate !== undefined) row.created_date = item.createdDate;
  return row;
}

export const timelineService = {
  /** 获取所有心绪列表（可按 visibility 筛选） */
  async getAll(visibility?: 'public' | 'private'): Promise<TimelineItem[]> {
    if (supabase) {
      try {
        let query = supabase
          .from('timeline_items')
          .select('*')
          .order('created_at', {ascending: false});

        if (visibility) {
          query = query.eq('visibility', visibility);
        }

        const {data, error} = await query;
        if (!error && data) {
          return data.map(rowToItem);
        }
        console.warn('[TimelineService] Supabase 查询失败，使用内存缓存:', error?.message);
      } catch (err) {
        console.warn('[TimelineService] Supabase 异常，使用内存缓存:', err);
      }
    }

    // 内存降级
    if (visibility) {
      return memoryStore.filter((item) => item.visibility === visibility);
    }
    return memoryStore;
  },

  /** 根据 ID 获取单条心绪 */
  async getById(id: string): Promise<TimelineItem | null> {
    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('timeline_items')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) {
          return rowToItem(data);
        }
      } catch (err) {
        console.warn('[TimelineService] getById 失败:', err);
      }
    }
    return memoryStore.find((i) => i.id === id) || null;
  },

  /** 创建新心绪 */
  async create(item: TimelineItem): Promise<TimelineItem> {
    const row = itemToRow(item);

    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('timeline_items')
          .insert(row)
          .select()
          .single();

        if (!error && data) {
          const created = rowToItem(data);
          memoryStore = [created, ...memoryStore.filter((m) => m.id !== created.id)];
          return created;
        }
        console.warn('[TimelineService] Supabase 插入失败，写入内存:', error?.message);
      } catch (err) {
        console.warn('[TimelineService] Supabase 插入异常:', err);
      }
    }

    memoryStore = [item, ...memoryStore.filter((m) => m.id !== item.id)];
    return item;
  },

  /** 更新心绪（如更新 reactions 或内容） */
  async update(id: string, updates: Partial<TimelineItem>): Promise<TimelineItem | null> {
    const rowUpdates = itemToRow(updates);

    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('timeline_items')
          .update(rowUpdates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updated = rowToItem(data);
          memoryStore = memoryStore.map((m) => (m.id === id ? updated : m));
          return updated;
        }
        console.warn('[TimelineService] Supabase 更新失败，更新内存:', error?.message);
      } catch (err) {
        console.warn('[TimelineService] Supabase 更新异常:', err);
      }
    }

    const idx = memoryStore.findIndex((i) => i.id === id);
    if (idx !== -1) {
      memoryStore[idx] = {...memoryStore[idx], ...updates};
      return memoryStore[idx];
    }
    return null;
  },

  /** 删除心绪 */
  async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const {error} = await supabase.from('timeline_items').delete().eq('id', id);
        if (!error) {
          memoryStore = memoryStore.filter((i) => i.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('[TimelineService] Supabase 删除异常:', err);
      }
    }

    memoryStore = memoryStore.filter((i) => i.id !== id);
    return true;
  },

  /** 重置数据为初始默认值 */
  async reset(): Promise<TimelineItem[]> {
    if (supabase) {
      try {
        await supabase.from('timeline_items').delete().neq('id', '___none___');
        const rows = SEED_TIMELINE.map(itemToRow);
        await supabase.from('timeline_items').insert(rows);
      } catch (err) {
        console.warn('[TimelineService] Supabase 重置异常:', err);
      }
    }
    memoryStore = [...SEED_TIMELINE];
    return memoryStore;
  },
};
