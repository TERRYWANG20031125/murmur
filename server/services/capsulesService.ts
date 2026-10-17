import {TimeCapsuleItem} from '../../src/types';
import {supabase} from '../db/supabaseClient';
import {SEED_CAPSULES} from '../db/seedData';

let memoryStore: TimeCapsuleItem[] = [...SEED_CAPSULES];

function rowToCapsule(row: any): TimeCapsuleItem {
  return {
    id: row.id,
    content: row.content,
    sealedDate: row.sealed_date || new Date().toISOString().slice(0, 10),
    deliverDate: row.deliver_date || new Date().toISOString().slice(0, 10),
    daysRemaining: typeof row.days_remaining === 'number' ? row.days_remaining : 0,
    unsealed: Boolean(row.unsealed),
  };
}

function capsuleToRow(c: Partial<TimeCapsuleItem>): any {
  const row: any = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.content !== undefined) row.content = c.content;
  if (c.sealedDate !== undefined) row.sealed_date = c.sealedDate;
  if (c.deliverDate !== undefined) row.deliver_date = c.deliverDate;
  if (c.daysRemaining !== undefined) row.days_remaining = c.daysRemaining;
  if (c.unsealed !== undefined) row.unsealed = c.unsealed;
  return row;
}

export const capsulesService = {
  /** 获取所有时间盲盒胶囊列表 */
  async getAll(): Promise<TimeCapsuleItem[]> {
    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('time_capsules')
          .select('*')
          .order('created_at', {ascending: false});

        if (!error && data) {
          return data.map(rowToCapsule);
        }
        console.warn('[CapsulesService] Supabase 查询失败，使用内存缓存:', error?.message);
      } catch (err) {
        console.warn('[CapsulesService] Supabase 异常:', err);
      }
    }
    return memoryStore;
  },

  /** 封装并保存时间盲盒 */
  async create(capsule: TimeCapsuleItem): Promise<TimeCapsuleItem> {
    const row = capsuleToRow(capsule);

    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('time_capsules')
          .insert(row)
          .select()
          .single();

        if (!error && data) {
          const created = rowToCapsule(data);
          memoryStore = [created, ...memoryStore.filter((m) => m.id !== created.id)];
          return created;
        }
        console.warn('[CapsulesService] Supabase 插入失败，写入内存:', error?.message);
      } catch (err) {
        console.warn('[CapsulesService] Supabase 插入异常:', err);
      }
    }

    memoryStore = [capsule, ...memoryStore.filter((m) => m.id !== capsule.id)];
    return capsule;
  },

  /** 开启/解封时间盲盒 */
  async unseal(id: string): Promise<TimeCapsuleItem | null> {
    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('time_capsules')
          .update({unsealed: true})
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const updated = rowToCapsule(data);
          memoryStore = memoryStore.map((m) => (m.id === id ? updated : m));
          return updated;
        }
      } catch (err) {
        console.warn('[CapsulesService] Supabase 解封异常:', err);
      }
    }

    const idx = memoryStore.findIndex((c) => c.id === id);
    if (idx !== -1) {
      memoryStore[idx] = {...memoryStore[idx], unsealed: true};
      return memoryStore[idx];
    }
    return null;
  },

  /** 删除时间盲盒 */
  async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const {error} = await supabase.from('time_capsules').delete().eq('id', id);
        if (!error) {
          memoryStore = memoryStore.filter((c) => c.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('[CapsulesService] Supabase 删除异常:', err);
      }
    }

    memoryStore = memoryStore.filter((c) => c.id !== id);
    return true;
  },

  /** 重置数据为初始默认值 */
  async reset(): Promise<TimeCapsuleItem[]> {
    if (supabase) {
      try {
        await supabase.from('time_capsules').delete().neq('id', '___none___');
        const rows = SEED_CAPSULES.map(capsuleToRow);
        await supabase.from('time_capsules').insert(rows);
      } catch (err) {
        console.warn('[CapsulesService] Supabase 重置异常:', err);
      }
    }
    memoryStore = [...SEED_CAPSULES];
    return memoryStore;
  },
};
