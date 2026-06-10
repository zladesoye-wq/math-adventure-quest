import { Router, Response } from 'express';
import pool from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/rewards/achievements
router.get('/achievements', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM achievements');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/rewards/student
router.get('/student', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Student context required' });
    }

    const studentId = req.user!.id;
    
    const achievementsRes = await pool.query(`
      SELECT a.*, sa.earned_at 
      FROM achievements a
      JOIN student_achievements sa ON a.id = sa.achievement_id
      WHERE sa.student_id = $1
    `, [studentId]);

    const rewardsRes = await pool.query('SELECT * FROM rewards WHERE student_id = $1', [studentId]);

    res.json({
      success: true,
      data: {
        achievements: achievementsRes.rows,
        rewards: rewardsRes.rows
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/rewards/claim-daily
router.post('/claim-daily', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Student context required' });
    }

    const studentId = req.user!.id;
    const today = new Date().toISOString().split('T')[0];

    const streakRes = await pool.query('SELECT * FROM daily_rewards WHERE student_id = $1', [studentId]);
    
    let streakCount = 1;
    if (streakRes.rows.length > 0) {
      const lastClaim = streakRes.rows[0].last_claim_date;
      if (lastClaim === today) {
        return res.status(400).json({ success: false, error: 'Daily reward already claimed today' });
      }
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastClaim === yesterdayStr) {
        streakCount = streakRes.rows[0].streak_count + 1;
      }
    }

    const coinsReward = 10 * streakCount;

    await pool.query('BEGIN');
    
    if (streakRes.rows.length === 0) {
      await pool.query(
        'INSERT INTO daily_rewards (student_id, streak_count, last_claim_date) VALUES ($1, $2, $3)',
        [studentId, streakCount, today]
      );
    } else {
      await pool.query(
        'UPDATE daily_rewards SET streak_count = $1, last_claim_date = $2 WHERE student_id = $3',
        [streakCount, today, studentId]
      );
    }

    await pool.query('UPDATE students SET coins = coins + $1 WHERE id = $2', [coinsReward, studentId]);
    
    await pool.query('INSERT INTO rewards (student_id, reward_type, reward_key, amount) VALUES ($1, $2, $3, $4)', [
      studentId, 'currency', 'coins', coinsReward
    ]);

    await pool.query('COMMIT');

    res.json({ 
      success: true, 
      data: {
        message: 'Daily reward claimed!', 
        coinsGained: coinsReward, 
        streakCount 
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
