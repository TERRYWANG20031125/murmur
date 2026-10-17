import express, {Request, Response, NextFunction} from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import {config} from './config';
import {checkSupabaseHealth, ensureSeedData} from './db/supabaseClient';

// Import route modules
import timelineRouter from './routes/timeline';
import echoesRouter from './routes/echoes';
import capsulesRouter from './routes/capsules';
import draftRouter from './routes/draft';
import echoResonanceRouter from './routes/echoResonance';
import healthRouter from './routes/health';

const app = express();

// 1. 中间件配置
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({limit: '15mb'}));
app.use(express.urlencoded({extended: true, limit: '15mb'}));

// 请求日志记录
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// 2. 挂载 API 路由
app.use('/api/timeline', timelineRouter);
app.use('/api/echoes', echoesRouter);
app.use('/api/capsules', capsulesRouter);
app.use('/api/draft', draftRouter);
app.use('/api/echo-resonance', echoResonanceRouter);
app.use('/api/health', healthRouter);

// 3. 生产环境静态文件托管 (前后端一体化运行)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log(`[Static] 生产构建目录已检测到，托管前端静态文件: ${distPath}`);
  app.use(express.static(distPath));

  // SPA 回退
  app.get('*', (req: Request, res: Response) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// 4. 全局错误处理中间件
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error] 未捕获的服务端异常:', err);
  res.status(500).json({
    success: false,
    error: err.message || '服务端内部错误',
  });
});

// 5. 启动服务端监听
const PORT = config.port;

app.listen(PORT, '0.0.0.0', async () => {
  console.log('\n========================================================');
  console.log(`✨ 喃喃 (Murmur) 全栈服务端已就绪: http://localhost:${PORT}`);
  console.log(`📡 API 健康探针接口: http://localhost:${PORT}/api/health`);
  console.log(`🌊 回音共鸣接口:     http://localhost:${PORT}/api/echo-resonance`);
  console.log('--------------------------------------------------------');

  // 检测 Supabase 状态
  const dbStatus = await checkSupabaseHealth();
  if (dbStatus.connected) {
    console.log(`🟢 Supabase: 已连接 -> ${config.supabaseUrl}`);
    await ensureSeedData();
  } else if (dbStatus.configured) {
    console.log(`🟡 Supabase: 凭证已配置，但未连通或表未初始化:`);
    console.log(`   ${dbStatus.message}`);
  } else {
    console.log(`⚪ Supabase: 未配置环境变量，当前采用内存/本地双向降级存储。`);
    console.log(`   提示: 可在 .env 中填入 SUPABASE_URL 与 KEY 开启真实云存储。`);
  }
  console.log('========================================================\n');
});

export default app;
