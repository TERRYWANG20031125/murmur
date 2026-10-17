import {Router, Request, Response} from 'express';
import {echoesService} from '../services/echoesService';

const router = Router();

// GET /api/echoes
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const items = await echoesService.getAll(category);
    res.json({success: true, data: items});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// GET /api/echoes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await echoesService.getById(req.params.id);
    if (!item) {
      return res.status(404).json({success: false, error: '回音记录未找到'});
    }
    res.json({success: true, data: item});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/echoes (放飞纸飞机)
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || !body.text) {
      return res.status(400).json({success: false, error: '纸飞机心音内容不能为空'});
    }

    const newEcho = {
      id: body.id || `echo-${Date.now()}`,
      author: body.author || '心海放舟的旅人',
      locationAndTime: body.locationAndTime || '星海某处 · 刚刚',
      tag: body.tag || '寻找光亮',
      tagEmoji: body.tagEmoji || '✨',
      category: body.category || 'daily',
      text: body.text,
      imageUrl: body.imageUrl,
      ambientSoundTitle: body.ambientSoundTitle,
      reactions: body.reactions || {hugs: 0, lights: 1, tea: 0},
      userReactions: body.userReactions || {light: true},
      warmNotes: body.warmNotes || [],
      caressedCount: body.caressedCount || 0,
    };

    const saved = await echoesService.create(newEcho);
    res.status(201).json({success: true, data: saved});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// PUT /api/echoes/:id (更新互动反应等)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await echoesService.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({success: false, error: '更新失败，记录不存在'});
    }
    res.json({success: true, data: updated});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/echoes/:id/notes (递送温暖小纸条)
router.post('/:id/notes', async (req: Request, res: Response) => {
  try {
    const {text, author, isAi} = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({success: false, error: '纸条内容不能为空'});
    }

    const note = {
      id: `note-${Date.now()}`,
      text: text.trim(),
      author: author || '同频的旅人',
      isAi: Boolean(isAi),
    };

    const updated = await echoesService.addWarmNote(req.params.id, note);
    if (!updated) {
      return res.status(404).json({success: false, error: '回音记录不存在'});
    }
    res.json({success: true, data: updated, note});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// DELETE /api/echoes/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await echoesService.delete(req.params.id);
    res.json({success});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/echoes/reset
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    const data = await echoesService.reset();
    res.json({success: true, data});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

export default router;
