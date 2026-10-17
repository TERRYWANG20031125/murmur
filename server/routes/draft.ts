import {Router, Request, Response} from 'express';
import {draftService} from '../services/draftService';

const router = Router();

// GET /api/draft
router.get('/', async (_req: Request, res: Response) => {
  try {
    const draft = await draftService.getDraft();
    res.json({success: true, draft});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/draft
router.post('/', async (req: Request, res: Response) => {
  try {
    const {text} = req.body;
    const draft = await draftService.saveDraft(typeof text === 'string' ? text : '');
    res.json({success: true, draft});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// DELETE /api/draft
router.delete('/', async (_req: Request, res: Response) => {
  try {
    await draftService.clearDraft();
    res.json({success: true});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

export default router;
