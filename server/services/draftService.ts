import {supabase} from '../db/supabaseClient';

let memoryDraft = '';

export const draftService = {
  /** 获取当前存入心盒的草稿内容 */
  async getDraft(): Promise<string> {
    if (supabase) {
      try {
        const {data, error} = await supabase
          .from('user_drafts')
          .select('draft_text')
          .eq('id', 'current')
          .single();

        if (!error && data) {
          return data.draft_text || '';
        }
      } catch (err) {
        console.warn('[DraftService] Supabase 查询草稿失败:', err);
      }
    }
    return memoryDraft;
  },

  /** 存入草稿至心盒 */
  async saveDraft(draftText: string): Promise<string> {
    memoryDraft = draftText;

    if (supabase) {
      try {
        await supabase
          .from('user_drafts')
          .upsert({
            id: 'current',
            draft_text: draftText,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('[DraftService] Supabase 保存草稿失败:', err);
      }
    }

    return memoryDraft;
  },

  /** 清空心盒草稿 */
  async clearDraft(): Promise<void> {
    memoryDraft = '';

    if (supabase) {
      try {
        await supabase
          .from('user_drafts')
          .upsert({
            id: 'current',
            draft_text: '',
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('[DraftService] Supabase 清空草稿失败:', err);
      }
    }
  },
};
