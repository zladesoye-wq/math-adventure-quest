"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/analytics/student/:studentId
router.get('/student/:studentId', auth_1.authenticate, async (req, res) => {
    try {
        const { studentId } = req.params;
        const parentId = req.user.id;
        // Verify parent owns student
        const studentCheck = await database_1.default.query('SELECT * FROM students WHERE id = $1 AND parent_id = $2', [studentId, parentId]);
        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found or unauthorized' });
        }
        // 1. Accuracy and volume over last 7 days
        const statsRes = await database_1.default.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_answers,
        COUNT(CASE WHEN correct THEN 1 END) as correct_answers
      FROM answers
      WHERE student_id = $1 AND created_at > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [studentId]);
        // 2. Skill Mastery status
        const masteryRes = await database_1.default.query(`
      SELECT skill_tag, mastery_level, attempts, correct
      FROM skill_mastery
      WHERE student_id = $1
      ORDER BY mastery_level DESC
    `, [studentId]);
        // 3. World progress
        const worldProgressRes = await database_1.default.query(`
      SELECT w.name as world_name, COUNT(p.id) as levels_completed
      FROM worlds w
      LEFT JOIN progress p ON w.id = p.world_id AND p.student_id = $1 AND p.completed = true
      GROUP BY w.id, w.name
    `, [studentId]);
        res.json({
            dailyStats: statsRes.rows,
            skillMastery: masteryRes.rows,
            worldProgress: worldProgressRes.rows
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/analytics/overview
router.get('/overview', auth_1.authenticate, async (req, res) => {
    try {
        const parentId = req.user.id;
        // Summary of all students
        const summaryRes = await database_1.default.query(`
      SELECT 
        s.id, 
        s.name, 
        s.total_xp, 
        s.level,
        (SELECT COUNT(*) FROM answers WHERE student_id = s.id) as total_attempts,
        (SELECT COUNT(*) FROM answers WHERE student_id = s.id AND correct = true) as total_correct
      FROM students s
      WHERE s.parent_id = $1
    `, [parentId]);
        res.json(summaryRes.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map