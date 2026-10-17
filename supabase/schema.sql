-- =========================================================
-- 喃喃 (Murmur) - Supabase 数据库结构初始化脚本
-- 适用于 Supabase SQL Editor 直接执行
-- =========================================================

-- 1. 创建心绪流淌表 (timeline_items)
CREATE TABLE IF NOT EXISTS public.timeline_items (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    weather_condition TEXT DEFAULT '晴空微温',
    mood_badge TEXT DEFAULT '微小确幸',
    mood_emoji TEXT DEFAULT '🫧',
    text TEXT NOT NULL,
    image_url TEXT,
    image_caption TEXT,
    audio_memo JSONB,
    tags JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '{"flares": 0, "hasFlared": false, "warmBlanket": false}'::jsonb,
    echo_reply JSONB,
    visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public',
    is_quote_card BOOLEAN DEFAULT false,
    quote_author_note TEXT,
    created_date TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. 创建回音海表 (echo_items)
CREATE TABLE IF NOT EXISTS public.echo_items (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL DEFAULT '心海放舟的旅人',
    location_and_time TEXT NOT NULL DEFAULT '星海某处 · 刚刚',
    tag TEXT NOT NULL DEFAULT '寻找光亮',
    tag_emoji TEXT NOT NULL DEFAULT '✨',
    category TEXT CHECK (category IN ('all', 'light', 'hug', 'daily', 'night')) DEFAULT 'daily',
    text TEXT NOT NULL,
    image_url TEXT,
    ambient_sound_title TEXT,
    reactions JSONB DEFAULT '{"hugs": 0, "lights": 0, "tea": 0}'::jsonb,
    user_reactions JSONB DEFAULT '{}'::jsonb,
    warm_notes JSONB DEFAULT '[]'::jsonb,
    caressed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 创建时间盲盒/胶囊表 (time_capsules)
CREATE TABLE IF NOT EXISTS public.time_capsules (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    sealed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deliver_date DATE NOT NULL,
    days_remaining INTEGER DEFAULT 0,
    unsealed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. 创建心盒草稿表 (user_drafts)
CREATE TABLE IF NOT EXISTS public.user_drafts (
    id TEXT PRIMARY KEY DEFAULT 'current',
    draft_text TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建查询优化索引
CREATE INDEX IF NOT EXISTS idx_timeline_visibility ON public.timeline_items(visibility);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON public.timeline_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_echoes_category ON public.echo_items(category);
CREATE INDEX IF NOT EXISTS idx_echoes_created_at ON public.echo_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_capsules_unsealed ON public.time_capsules(unsealed);

-- 开启 Row Level Security (RLS)
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_drafts ENABLE ROW LEVEL SECURITY;

-- 允许匿名和授权用户对这几张表进行读写操作（配合 Supabase Anon Key 使用）
DROP POLICY IF EXISTS "Allow anon all on timeline_items" ON public.timeline_items;
CREATE POLICY "Allow anon all on timeline_items" ON public.timeline_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on echo_items" ON public.echo_items;
CREATE POLICY "Allow anon all on echo_items" ON public.echo_items
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on time_capsules" ON public.time_capsules;
CREATE POLICY "Allow anon all on time_capsules" ON public.time_capsules
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on user_drafts" ON public.user_drafts;
CREATE POLICY "Allow anon all on user_drafts" ON public.user_drafts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =========================================================
-- 写入初始化种子数据（如果表中无数据时填充）
-- =========================================================

-- 初始化 Timeline
INSERT INTO public.timeline_items (
    id, timestamp, weather_condition, mood_badge, mood_emoji, text, image_url, image_caption, audio_memo, tags, reactions, echo_reply, visibility, is_quote_card, created_date, created_at
) VALUES
(
    'timeline-1',
    '今天 15:42',
    '晴空微温',
    '微小确幸',
    '🫧',
    '路过转角咖啡店，门前的小黄猫正把肚皮摊在日光下打盹。突然觉得哪怕生活有再多琐碎，这一刻的阳光也是真的。',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8KNmKqMEhXJJm_XJAfmUZuLsPkW3FMn3S8OPdp5TdXDMWONDyGgsdaRq7m4746ba-5IKBAQ0-EO5fOxb-tr2f1eaWKWGCkB-22Fzkm9oB1Oz2IDUJg-CzstZpWB3xMN_veW7oDJS9Nid2Nxh-oA9SZhcvMKrbGIXrJqPNqHdur-alO-JT_XlqGfkgT7vUeoxVW5zSD_ZJsa79lWLX-m8iKjNigx4JNuQ1wH3qqW5iXT30YCbX8Ao',
    '随手留存',
    '{"title": "午后风铃微语", "duration": "0:12", "waveforms": [20, 45, 80, 50, 95, 30, 70, 40]}'::jsonb,
    '[]'::jsonb,
    '{"flares": 3, "hasFlared": false, "warmBlanket": true}'::jsonb,
    NULL,
    'public',
    false,
    '2026-10-17T15:42:00',
    NOW() - INTERVAL '2 hours'
),
(
    'timeline-2',
    '昨天 22:18',
    '夜雨微凉',
    '湿漉漉的雨',
    '🌧️',
    '汇报没有想象中顺利，走在地铁通道里有一瞬间差点掉眼泪。不过在便利店买到了最后一只热腾腾的烤红薯，热气扑在手心的时候，好像原谅了全世界。',
    NULL,
    NULL,
    NULL,
    '["#放过自己", "#治愈碳水", "#晚安世界"]'::jsonb,
    '{"flares": 7, "hasFlared": true, "warmBlanket": false}'::jsonb,
    '{"author": "远方旅人的回音", "time": "昨天 23:04", "text": "“给你递一张干燥柔软的纸巾。今天辛苦啦，热气腾腾的红薯会替生活拥抱你。”"}'::jsonb,
    'public',
    false,
    '2026-10-16T22:18:00',
    NOW() - INTERVAL '1 day'
),
(
    'timeline-3',
    '10月24日',
    '散步时',
    '舒展的嫩芽',
    '🌿',
    '“允许自己做一颗偶尔停下来的齿轮，不赶路，去感受路。”',
    NULL,
    NULL,
    NULL,
    '[]'::jsonb,
    '{"flares": 12, "hasFlared": false, "warmBlanket": false}'::jsonb,
    NULL,
    'private',
    true,
    '2026-10-15T18:30:00',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- 初始化 Echoes
INSERT INTO public.echo_items (
    id, author, location_and_time, tag, tag_emoji, category, text, image_url, ambient_sound_title, reactions, user_reactions, warm_notes, caressed_count, created_at
) VALUES
(
    'echo-1',
    '一位在等红绿灯的旅人',
    '约 1.2 公里外 · 2小时前',
    '渴望抱抱',
    '🌧️',
    'hug',
    '“一个人在大城市租房的第三年，今天自己换了顶灯的灯泡，突然站在梯子上发呆了很久。希望有人能拍拍我的肩说句你已经做得很棒了。”',
    NULL,
    NULL,
    '{"hugs": 128, "lights": 42, "tea": 19}'::jsonb,
    '{}'::jsonb,
    '[{"id": "note-1", "text": "抱抱你！能在陌生的城市把属于自己的光拧亮，你已经比想象中更加独立坚强了。"}, {"id": "note-2", "text": "灯亮起来的那一刻，你也照亮了自己呀。今晚睡个暖暖的觉吧，晚安！"}]'::jsonb,
    0,
    NOW() - INTERVAL '2 hours'
),
(
    'echo-2',
    '看云的人',
    '静海某处 · 昨天夜里',
    '平静碎片',
    '☕',
    'daily',
    '“窗外下起暴雨，关掉所有大灯，只留一盏暖黄床头灯，听着雨声看小说，这一刻感觉整个世界都与我无关，真好。”',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCSwRtB1ccfQ_mbYausFKwTGy65pmidAMFD-AA1ZyVgymJaJzIEYtTA0MF4gDpR886hz_rNM9z_bKzpJfccanhY9tZ_3T_UI4X6AwiBr5zhBaDr8VYTYJy9ULWTv-O-42-Q3K8wDBIE9YJsw6oRuxZOJ6Y5gQVJ1qmSXp1CkqdDsW-YSwOFVBktvnIr9P5pYmoBWCwC2CJBRFnZZ5dI3k05aHKc83a9tB0x6NkKVf5vLxw5DadT2dI',
    '伴随白噪音：窗外深沉夜雨声',
    '{"hugs": 16, "lights": 342, "tea": 48}'::jsonb,
    '{"light": true}'::jsonb,
    '[{"id": "note-3", "text": "被暴雨隔离的世界，恰是最好的庇护所。"}]'::jsonb,
    86,
    NOW() - INTERVAL '1 day'
),
(
    'echo-3',
    '森林里的风',
    '风拂过山谷 · 3天前',
    '释怀与放晴',
    '🍃',
    'light',
    '“终于放下了那件纠结两个月的选择题。原来做决定并不是有多勇敢，只是想对自己诚实一点。”',
    NULL,
    NULL,
    '{"hugs": 89, "lights": 104, "tea": 33}'::jsonb,
    '{}'::jsonb,
    '[{"id": "note-4", "text": "对自己坦诚的瞬间，就是自由的开始。"}]'::jsonb,
    0,
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- 初始化 Time Capsules
INSERT INTO public.time_capsules (
    id, content, sealed_date, deliver_date, days_remaining, unsealed, created_at
) VALUES
(
    'capsule-1',
    '希望那个时候的你，已经去了想看的海，吃到了想念的桂花糕，心里不再慌慌张张。',
    '2026-10-01',
    '2026-10-31',
    14,
    false,
    NOW() - INTERVAL '16 days'
),
(
    'capsule-2',
    '今天写下了这句：允许一切发生。不知道未来的你看到时，是不是嘴角会扬起微笑呢？',
    '2026-07-20',
    '2026-10-20',
    3,
    false,
    NOW() - INTERVAL '88 days'
)
ON CONFLICT (id) DO NOTHING;

-- 初始化 Draft
INSERT INTO public.user_drafts (id, draft_text, updated_at)
VALUES ('current', '', NOW())
ON CONFLICT (id) DO NOTHING;
