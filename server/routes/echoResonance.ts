import {Router, Request, Response} from 'express';
import {config} from '../config';

const router = Router();

const FALLBACK_REPLIES = [
  '给你递一张干燥柔软的纸巾。今天辛苦啦，热气腾腾的红薯会替生活拥抱你。',
  '抱抱你！能在陌生的城市把属于自己的光拧亮，你已经比想象中更加独立坚强了。',
  '灯亮起来的那一刻，你也照亮了自己呀。今晚睡个暖暖的觉吧，晚安！',
  '允许自己做一颗偶尔停下来的齿轮，不赶路，去感受路。风已经替你把沉重吹走了。',
  '心事已化作风中的飞羽，今夜月色很温柔，卸下疲惫，安心睡吧。',
  '你已经走过了很长的路，这一刻允许自己什么都不做，世界会静静守护你。',
  '所有的难过都会在晚风里风干，明天醒来，又是新的一寸阳光。',
  '不慌不忙，慢慢生根。你无需总是坚不可摧，软弱也可以被温柔收藏。',
];

// POST /api/echo-resonance
router.post('/', async (req: Request, res: Response) => {
  const {thought, mood} = req.body || {};

  if (config.isGeminiConfigured) {
    try {
      const {GoogleGenAI} = await import('@google/genai');
      const ai = new GoogleGenAI({apiKey: config.geminiApiKey});
      const prompt = `你是“喃喃”情绪自留地里一位萍水相逢的远方温柔旅人。
用户在回音海中放飞了一架载着心事的纸飞机：
【心绪氛围】：${mood || '寻找光亮'}
【心事内容】：“${thought || '此刻有些疲倦，想一个人静静呆会儿。'}”

请以“远方旅人”的身份，给对方写一段简短、温暖、真挚且充满诗意与共情的暖心回音（1到2句话，不超过60字）。
要求：
- 不要说教、不要讲大道理、不要使用客服腔。
- 像一位坐在对面递来一杯热茶的朋友，温柔地肯定对方，给予力量。
- 仅输出回复正文文字，不要带任何多余引号或前缀。`;

      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const replyText = resp.text
        ? resp.text.trim().replace(/^["“]|["”]$/g, '')
        : '愿晚风抚平你所有的褶皱，今晚好好休息，梦里有漫天繁星。';

      return res.json({
        reply: replyText,
        author: '远方旅人的回音',
        timestamp: '刚刚',
        source: 'gemini',
      });
    } catch (err) {
      console.warn('[EchoResonance] Gemini 生成回音失败，切换至暖例文案库:', err);
    }
  }

  // 默认使用诗意温暖文案
  const randomReply =
    FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];

  res.json({
    reply: randomReply,
    author: '远方旅人的回音',
    timestamp: '刚刚',
    source: 'poetic_fallback',
  });
});

export default router;
