import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {config} from '../config';
import {SEED_TIMELINE, SEED_ECHOES, SEED_CAPSULES} from './seedData';

let client: SupabaseClient | null = null;

if (config.isSupabaseConfigured) {
  try {
    const key = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    client = createClient(config.supabaseUrl, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Supabase] 客户端初始化成功:', config.supabaseUrl);
  } catch (err) {
    console.error('[Supabase] 初始化异常:', err);
    client = null;
  }
} else {
  console.log(
    '[Supabase] 未检测到有效的 SUPABASE_URL 或 KEY，后端将以内存降级模式运行（数据操作正常，但服务重启不持久化）。配置 .env 中的 SUPABASE_* 后即可无缝持久化至 Supabase。',
  );
}

export const supabase = client;

/**
 * 检查 Supabase 连通性并返回状态
 */
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
  url?: string;
}> {
  if (!config.isSupabaseConfigured || !supabase) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase 环境变量未配置，当前运行在内存/本地双向同步模式',
    };
  }

  try {
    // 尝试读取 timeline_items 表的第一条记录验证连接和表存在
    const {data, error} = await supabase
      .from('timeline_items')
      .select('id')
      .limit(1);

    if (error) {
      // 如果错误是表不存在 (PGRST204 或 42P01)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          configured: true,
          connected: false,
          url: config.supabaseUrl,
          message:
            '已连接到 Supabase 项目，但数据表尚未创建。请在 Supabase 控制台 SQL Editor 中运行 supabase/schema.sql 脚本。',
        };
      }
      return {
        configured: true,
        connected: false,
        url: config.supabaseUrl,
        message: `Supabase 查询异常: ${error.message}`,
      };
    }

    return {
      configured: true,
      connected: true,
      url: config.supabaseUrl,
      message: '已成功连通 Supabase PostgreSQL 数据库',
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      url: config.supabaseUrl,
      message: `Supabase 连接失败: ${err.message || '网络或凭证错误'}`,
    };
  }
}

/**
 * 自动填充种子数据到 Supabase（如果表为空）
 */
export async function ensureSeedData() {
  if (!supabase) return;

  try {
    // 1. 检查 timeline_items
    const {data: tCount, error: tErr} = await supabase
      .from('timeline_items')
      .select('id', {count: 'exact', head: true});

    if (!tErr && (tCount === null || (tCount as any) === 0)) {
      console.log('[Supabase] 初始化 timeline_items 种子数据...');
      const rows = SEED_TIMELINE.map((item) => ({
        id: item.id,
        timestamp: item.timestamp,
        weather_condition: item.weatherCondition,
        mood_badge: item.moodBadge,
        mood_emoji: item.moodEmoji,
        text: item.text,
        image_url: item.imageUrl,
        image_caption: item.imageCaption,
        audio_memo: item.audioMemo,
        tags: item.tags || [],
        reactions: item.reactions,
        echo_reply: item.echoReply,
        visibility: item.visibility,
        is_quote_card: item.isQuoteCard || false,
        created_date: item.createdDate,
      }));
      await supabase.from('timeline_items').upsert(rows);
    }

    // 2. 检查 echo_items
    const {data: eCount, error: eErr} = await supabase
      .from('echo_items')
      .select('id', {count: 'exact', head: true});

    if (!eErr && (eCount === null || (eCount as any) === 0)) {
      console.log('[Supabase] 初始化 echo_items 种子数据...');
      const rows = SEED_ECHOES.map((echo) => ({
        id: echo.id,
        author: echo.author,
        location_and_time: echo.locationAndTime,
        tag: echo.tag,
        tag_emoji: echo.tagEmoji,
        category: echo.category,
        text: echo.text,
        image_url: echo.imageUrl,
        ambient_sound_title: echo.ambientSoundTitle,
        reactions: echo.reactions,
        user_reactions: echo.userReactions,
        warm_notes: echo.warmNotes,
        caressed_count: echo.caressedCount || 0,
      }));
      await supabase.from('echo_items').upsert(rows);
    }

    // 3. 检查 time_capsules
    const {data: cCount, error: cErr} = await supabase
      .from('time_capsules')
      .select('id', {count: 'exact', head: true});

    if (!cErr && (cCount === null || (cCount as any) === 0)) {
      console.log('[Supabase] 初始化 time_capsules 种子数据...');
      const rows = SEED_CAPSULES.map((c) => ({
        id: c.id,
        content: c.content,
        sealed_date: c.sealedDate,
        deliver_date: c.deliverDate,
        days_remaining: c.daysRemaining,
        unsealed: c.unsealed,
      }));
      await supabase.from('time_capsules').upsert(rows);
    }
  } catch (err) {
    console.warn('[Supabase] 种子数据自动填充跳过:', err);
  }
}
