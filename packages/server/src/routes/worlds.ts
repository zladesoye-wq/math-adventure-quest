import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/worlds
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM worlds ORDER BY order_index ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/worlds/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const worldRes = await pool.query('SELECT * FROM worlds WHERE id = $1', [id]);
    
    if (worldRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'World not found' });
    }

    const levelsRes = await pool.query('SELECT * FROM levels WHERE world_id = $1 ORDER BY level_number ASC', [id]);

    res.json({
      success: true,
      data: {
        ...worldRes.rows[0],
        levels: levelsRes.rows
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
