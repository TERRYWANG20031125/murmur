import {EchoItem, EchoWarmNote} from '../../src/types';
import {supabase} from '../db/supabaseClient';
import {SEED_ECHOES} from '../db/seedData';

// 内存降级存储
let memoryStore: EchoItem[] = [...SEED_ECHOES];

function rowToEcho(row: any): EchoItem {
  return {
    id: row.id,
    author: row.author || '心海放舟的旅人',
    locationAndTime: row.location_and_time || '星海某处 · 刚刚',
    tag: row.tag || '寻找光亮',
    tagEmoji: row.tag_emoji || '✨',
    category: row.category || 'daily',
    text: row.text,
    imageUrl: row.image_url || undefined,
    ambientSoundTitle: row.ambient_sound_title || undefined,
    reactions: row.reactions || {hugs: 0, lights: 0, tea: 0},
    userReactions: row.user_reactions || {},
    warmNotes: Array.isArray(row.warm_notes) ? row.warm_notes : [],
    caressedCount: row.caressed_count || 0,
  };
}

function echoToRow(echo: Partial<EchoItem>): any {
  const row: any = {};
  if (echo.id !== undefined) row.id = echo.id;
  if (echo.author !== undefined) row.author = echo.author;
  if (echo.locationAndTime !== undefined) row.location_and_time = echo.locationAndTime;
  if (echo.tag !== undefined) row.tag = echo.tag;
  if (echo.tagEmoji !== undefined) row.tag_emoji = echo.tagEmoji;
  if (echo.category !== undefined) row.category = echo.category;
  if (echo.text !== undefined) row.text = echo.text;
  if (echo.imageUrl !== undefined) row.image_url = echo.imageUrl;
  if (echo.ambientSoundTitle !== undefined) row.ambient_sound_title = echo.ambientSoundTitle;
  if (echo.reactions !== undefined) row.reactions = echo.reactions;
  if (echo.userReactions !== undefined) row.user_reactions = echo.userReactions;
  if (echo.warmNotes !== undefined) row.warm_notes = echo.warmNotes;
  if (echo.caressedCount !== undefined) row.caressed_count = echo.caressedCount;
  return row;
}

export const echoesService = {
  /** 获取所有回音低语列表（支持按 category 分类筛选） */
  async getAll(category?: string): Promise<EchoItem[]> {
    if (supabase) {
      try {
        let query = supabase
          .from('echo_items')
          .select('*')
          .order('created_at', {ascending: false});

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        const {data, error} = await query;
        if (!error && data) {
          return data.map(rowToEcho);
        }
        console.warn('[EchoesService] Supabase 查询失败，使用内存缓存:', error?.message);
      } catch (err) {
        console.warn('[EchoesService] Supabase 异常，使用内存缓存:', err);
      }
    }

    if (category && category !== 'all') {
      return memoryStore.filter((e) => e.category === category);
    }
    return memoryStore;
  },

  /** 根据 ID 查询 */
  async getById(id: string): Promise<EchoItem | null> {
    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('echo_items')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) {
          return rowToEcho(data);
        }
      } catch (err) {
        console.warn('[EchoesService] getById 失败:', err);
      }
    }
    return memoryStore.find((e) => e.id === id) || null;
  },

  /** 放飞纸飞机 / 发布新回音 */
  async create(echo: EchoItem): Promise<EchoItem> {
    const row = echoToRow(echo);

    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('echo_items')
          .insert(row)
          .select()
          .single();

        if (!error && data) {
          const created = rowToEcho(data);
          memoryStore = [created, ...memoryStore.filter((m) => m.id !== created.id)];
          return created;
        }
        console.warn('[EchoesService] Supabase 插入失败，写入内存:', error?.message);
      } catch (err) {
        console.warn('[EchoesService] Supabase 插入异常:', err);
      }
    }

    memoryStore = [echo, ...memoryStore.filter((m) => m.id !== echo.id)];
    return echo;
  },

  /** 更新回音（更新点赞、抚慰等） */
  async update(id: string, updates: Partial<EchoItem>): Promise<EchoItem | null> {
    const rowUpdates = echoToRow(updates);

    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('echo_items')
          .update(rowUpdates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updated = rowToEcho(data);
          memoryStore = memoryStore.map((m) => (m.id === id ? updated : m));
          return updated;
        }
        console.warn('[EchoesService] Supabase 更新失败，更新内存:', error?.message);
      } catch (err) {
        console.warn('[EchoesService] Supabase 更新异常:', err);
      }
    }

    const idx = memoryStore.findIndex((e) => e.id === id);
    if (idx !== -1) {
      memoryStore[idx] = {...memoryStore[idx], ...updates};
      return memoryStore[idx];
    }
    return null;
  },

  /** 添加温暖小纸条 (Warm Note) */
  async addWarmNote(echoId: string, note: EchoWarmNote): Promise<EchoItem | null> {
    const echo = await this.getById(echoId);
    if (!echo) return null;

    const newNotes = [...echo.warmNotes, note];
    return this.update(echoId, {warmNotes: newNotes});
  },

  /** 删除回音 */
  async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const {error} = await supabase.from('echo_items').delete().eq('id', id);
        if (!error) {
          memoryStore = memoryStore.filter((e) => e.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('[EchoesService] Supabase 删除异常:', err);
      }
    }

    memoryStore = memoryStore.filter((e) => e.id !== id);
    return true;
  },

  /** 重置数据为初始默认值 */
  async reset(): Promise<EchoItem[]> {
    if (supabase) {
      try {
        await supabase.from('echo_items').delete().neq('id', '___none___');
        const rows = SEED_ECHOES.map(echoToRow);
        await supabase.from('echo_items').insert(rows);
      } catch (err) {
        console.warn('[EchoesService] Supabase 重置异常:', err);
      }
    }
    memoryStore = [...SEED_ECHOES];
    return memoryStore;
  },
};
