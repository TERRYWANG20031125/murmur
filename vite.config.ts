import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Server-side API handler fallback for Echo Resonance
function echoApiFallbackPlugin() {
  return {
    name: 'echo-api-fallback-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        // Fallback only if not intercepted by backend proxy
        if (req.url === '/api/echo-resonance' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const thought = parsed.thought || '';
              const mood = parsed.mood || '';
              const apiKey = process.env.GEMINI_API_KEY;

              if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
                const {GoogleGenAI} = await import('@google/genai');
                const ai = new GoogleGenAI({apiKey});
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

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(
                  JSON.stringify({
                    reply: replyText,
                    author: '远方旅人的回音',
                    timestamp: '刚刚',
                  }),
                );
                return;
              }
            } catch (err) {
              console.error('Gemini echo error:', err);
            }

            const fallbacks = [
              '给你递一张干燥柔软的纸巾。今天辛苦啦，热气腾腾的红薯会替生活拥抱你。',
              '抱抱你！能在陌生的城市把属于自己的光拧亮，你已经比想象中更加独立坚强了。',
              '灯亮起来的那一刻，你也照亮了自己呀。今晚睡个暖暖的觉吧，晚安！',
              '允许自己做一颗偶尔停下来的齿轮，不赶路，去感受路。风已经替你把沉重吹走了。',
              '心事已化作风中的飞羽，今夜月色很温柔，卸下疲惫，安心睡吧。',
              '你已经走过了很长的路，这一刻允许自己什么都不做，世界会静静守护你。',
            ];
            const randomReply =
              fallbacks[Math.floor(Math.random() * fallbacks.length)];
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(
              JSON.stringify({
                reply: randomReply,
                author: '远方旅人的回音',
                timestamp: '刚刚',
              }),
            );
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  const backendPort = process.env.PORT || '3001';
  const backendTarget = `http://localhost:${backendPort}`;

  return {
    plugins: [react(), tailwindcss(), echoApiFallbackPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // Forward /api requests to Express fullstack backend server
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          // If the backend server isn't running yet, fall back cleanly without breaking the frontend
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              if (res && 'writeHead' in res && !(res as any).headersSent) {
                (res as any).writeHead(503, {'Content-Type': 'application/json'});
                (res as any).end(
                  JSON.stringify({
                    success: false,
                    error: '后端服务连接中或未启动，前端已启用离线持久化缓存',
                    offline: true,
                  }),
                );
              }
            });
          },
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
