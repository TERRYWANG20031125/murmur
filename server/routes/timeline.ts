import {Router, Request, Response} from 'express';
import {timelineService} from '../services/timelineService';

const router = Router();

// GET /api/timeline
router.get('/', async (req: Request, res: Response) => {
  try {
    const visibility = req.query.visibility as 'public' | 'private' | undefined;
    const items = await timelineService.getAll(visibility);
    res.json({success: true, data: items});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// GET /api/timeline/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await timelineService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({success: false, error: '心绪记录未找到'});
    }
    res.json({success: true, data: item});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/timeline
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || !body.text) {
      return res.status(400).json({success: false, error: '心事内容不能为空'});
    }

    const newItem = {
      id: body.id || `timeline-${Date.now()}`,
      timestamp: body.timestamp || '刚刚',
      weatherCondition: body.weatherCondition || '晴空心绪',
      moodBadge: body.moodBadge || '微小确幸',
      moodEmoji: body.moodEmoji || '🌿',
      text: body.text,
      imageUrl: body.imageUrl,
      imageCaption: body.imageCaption,
      audioMemo: body.audioMemo,
      tags: body.tags || [],
      reactions: body.reactions || {flares: 0, hasFlared: false, warmBlanket: false},
      echoReply: body.echoReply,
      visibility: body.visibility || 'public',
      isQuoteCard: Boolean(body.isQuoteCard),
      quoteAuthorNote: body.quoteAuthorNote,
      createdDate: body.createdDate || new Date().toISOString(),
    };

    const saved = await timelineService.create(newItem);
    res.status(201).json({success: true, data: saved});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// PUT /api/timeline/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await timelineService.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({success: false, error: '更新失败，记录不存在'});
    }
    res.json({success: true, data: updated});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// DELETE /api/timeline/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await timelineService.delete(req.params.id);
    res.json({success});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/timeline/reset
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    const data = await timelineService.reset();
    res.json({success: true, data});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

export default router;
