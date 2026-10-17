import {Router, Request, Response} from 'express';
import {capsulesService} from '../services/capsulesService';

const router = Router();

// GET /api/capsules
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await capsulesService.getAll();
    res.json({success: true, data: items});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/capsules
router.post('/', async (req: Request, res: Response) => {
  try {
    const {content, futureDays, sealedDate, deliverDate} = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({success: false, error: '盲盒心事内容不能为空'});
    }

    const now = new Date();
    const days = typeof futureDays === 'number' && futureDays > 0 ? futureDays : 30;
    const deliver = new Date();
    deliver.setDate(deliver.getDate() + days);

    const newCapsule = {
      id: `capsule-${Date.now()}`,
      content: content.trim(),
      sealedDate: sealedDate || now.toISOString().slice(0, 10),
      deliverDate: deliverDate || deliver.toISOString().slice(0, 10),
      daysRemaining: days,
      unsealed: false,
    };

    const saved = await capsulesService.create(newCapsule);
    res.status(201).json({success: true, data: saved});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// PATCH /api/capsules/:id/unseal
router.patch('/:id/unseal', async (req: Request, res: Response) => {
  try {
    const updated = await capsulesService.unseal(req.params.id);
    if (!updated) {
      return res.status(404).json({success: false, error: '时间盲盒未找到'});
    }
    res.json({success: true, data: updated});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// DELETE /api/capsules/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await capsulesService.delete(req.params.id);
    res.json({success});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

// POST /api/capsules/reset
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    const data = await capsulesService.reset();
    res.json({success: true, data});
  } catch (err: any) {
    res.status(500).json({success: false, error: err.message});
  }
});

export default router;
