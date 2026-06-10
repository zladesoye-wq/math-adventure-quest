"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/rewards/achievements
router.get('/achievements', async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT * FROM achievements');
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/rewards/student
router.get('/student', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Student context required' });
        }
        const studentId = req.user.id;
        const achievementsRes = await database_1.default.query(`
      SELECT a.*, sa.earned_at 
      FROM achievements a
      JOIN student_achievements sa ON a.id = sa.achievement_id
      WHERE sa.student_id = $1
    `, [studentId]);
        const rewardsRes = await database_1.default.query('SELECT * FROM rewards WHERE student_id = $1', [studentId]);
        res.json({
            achievements: achievementsRes.rows,
            rewards: rewardsRes.rows
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/rewards/claim-daily
router.post('/claim-daily', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Student context required' });
        }
        const studentId = req.user.id;
        const today = new Date().toISOString().split('T')[0];
        const streakRes = await database_1.default.query('SELECT * FROM daily_rewards WHERE student_id = $1', [studentId]);
        let streakCount = 1;
        if (streakRes.rows.length > 0) {
            const lastClaim = streakRes.rows[0].last_claim_date;
            if (lastClaim === today) {
                return res.status(400).json({ message: 'Daily reward already claimed today' });
            }
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            if (lastClaim === yesterdayStr) {
                streakCount = streakRes.rows[0].streak_count + 1;
            }
        }
        const coinsReward = 10 * streakCount;
        await database_1.default.query('BEGIN');
        if (streakRes.rows.length === 0) {
            await database_1.default.query('INSERT INTO daily_rewards (student_id, streak_count, last_claim_date) VALUES ($1, $2, $3)', [studentId, streakCount, today]);
        }
        else {
            await database_1.default.query('UPDATE daily_rewards SET streak_count = $1, last_claim_date = $2 WHERE student_id = $3', [streakCount, today, studentId]);
        }
        await database_1.default.query('UPDATE students SET coins = coins + $1 WHERE id = $2', [coinsReward, studentId]);
        await database_1.default.query('INSERT INTO rewards (student_id, reward_type, reward_key, amount) VALUES ($1, $2, $3, $4)', [
            studentId, 'currency', 'coins', coinsReward
        ]);
        await database_1.default.query('COMMIT');
        res.json({ message: 'Daily reward claimed!', coinsGained: coinsReward, streakCount });
    }
    catch (error) {
        await database_1.default.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=rewards.js.map