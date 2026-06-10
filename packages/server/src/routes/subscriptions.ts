import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/subscriptions
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const parentId = req.user!.parentId || req.user!.id;
    const result = await pool.query('SELECT * FROM subscriptions WHERE parent_id = $1', [parentId]);
    
    if (result.rows.length === 0) {
      return res.json({ success: true, data: { plan_type: 'free', status: 'active' } });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/subscriptions/subscribe (Mock)
router.post('/subscribe', authenticate, async (req: AuthRequest, res) => {
  try {
    const parentId = req.user!.parentId || req.user!.id;
    const { plan } = req.body; // 'free' or 'premium'

    if (!['free', 'premium'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await pool.query(`
      INSERT INTO subscriptions (parent_id, plan_type, status, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (parent_id) 
      DO UPDATE SET 
        plan_type = EXCLUDED.plan_type,
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = CURRENT_TIMESTAMP
    `, [parentId, plan, 'active', startDate, endDate]);

    res.json({ message: `Successfully subscribed to ${plan} plan`, plan_type: plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
