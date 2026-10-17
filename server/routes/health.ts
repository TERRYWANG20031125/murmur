import {Router, Request, Response} from 'express';
import {checkSupabaseHealth} from '../db/supabaseClient';
import {config} from '../config';
import {timelineService} from '../services/timelineService';
import {echoesService} from '../services/echoesService';
import {capsulesService} from '../services/capsulesService';

const router = Router();

// GET /api/health
router.get('/', async (_req: Request, res: Response) => {
  const supabaseStatus = await checkSupabaseHealth();
  const timelineCount = (await timelineService.getAll()).length;
  const echoesCount = (await echoesService.getAll()).length;
  const capsulesCount = (await capsulesService.getAll()).length;

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Murmur Backend Server',
    database: {
      provider: 'Supabase PostgreSQL',
      ...supabaseStatus,
      counts: {
        timeline: timelineCount,
        echoes: echoesCount,
        capsules: capsulesCount,
      },
    },
    ai: {
      provider: 'Gemini AI',
      configured: config.isGeminiConfigured,
      mode: config.isGeminiConfigured ? 'live_genai' : 'poetic_fallback',
    },
    environment: config.nodeEnv,
    port: config.port,
  });
});

export default router;
