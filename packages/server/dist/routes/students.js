"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const zod_1 = require("zod");
const progress_1 = require("../models/progress");
const auth_2 = require("../models/auth");
const adaptiveEngine_1 = require("../services/adaptiveEngine");
const router = (0, express_1.Router)();
const studentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    age: zod_1.z.number().int().min(3).max(18).optional(),
    grade: zod_1.z.number().int().optional(),
    avatar_data: zod_1.z.any().optional(),
});
// Middleware to verify student ownership
const verifyStudentAccess = async (req, res, next) => {
    const { id } = req.params;
    const parentId = req.user.role === 'parent' ? req.user.id : req.user.parentId;
    if (req.user.role === 'student' && req.user.id !== id) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    if (req.user.role === 'parent') {
        const check = await database_1.default.query('SELECT id FROM students WHERE id = $1 AND parent_id = $2', [id, parentId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found or unauthorized' });
        }
    }
    next();
};
// GET /api/students - List students for parent
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const students = await (0, auth_2.getStudentsByParentId)(req.user.id);
        res.json({ success: true, data: students });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /api/students - Add student for parent
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const validatedData = studentSchema.parse(req.body);
        const student = await (0, auth_2.createStudent)({
            ...validatedData,
            parent_id: req.user.id,
            grade: validatedData.grade?.toString() || '1'
        });
        res.status(201).json({ success: true, data: student });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            return res.status(400).json({ success: false, error: error.issues });
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /api/students/:id/stats
router.get('/:id/stats', auth_1.authenticate, verifyStudentAccess, async (req, res) => {
    try {
        const stats = await (0, progress_1.getStudentStats)(req.params.id);
        res.json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /api/students/:id/worlds
router.get('/:id/worlds', auth_1.authenticate, verifyStudentAccess, async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT * FROM worlds ORDER BY order_index ASC');
        const worlds = result.rows;
        // Get progress for each world
        const worldsWithProgress = await Promise.all(worlds.map(async (world) => {
            const levelsRes = await database_1.default.query('SELECT * FROM levels WHERE world_id = $1 ORDER BY level_number ASC', [world.id]);
            const progressRes = await database_1.default.query('SELECT * FROM progress WHERE student_id = $1 AND level_id = ANY($2)', [req.params.id, levelsRes.rows.map(l => l.id)]);
            const levelsWithStatus = levelsRes.rows.map(level => {
                const prog = progressRes.rows.find(p => p.level_id === level.id);
                return {
                    ...level,
                    status: prog ? 'completed' : (level.level_number === 1 ? 'unlocked' : 'locked'),
                    stars: prog ? prog.stars : 0
                };
            });
            return { ...world, levels: levelsWithStatus };
        }));
        res.json({ success: true, data: worldsWithProgress });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /api/students/:id/worlds/:worldId
router.get('/:id/worlds/:worldId', auth_1.authenticate, verifyStudentAccess, async (req, res) => {
    try {
        const { worldId } = req.params;
        const worldRes = await database_1.default.query('SELECT * FROM worlds WHERE id = $1', [worldId]);
        if (worldRes.rows.length === 0)
            return res.status(404).json({ success: false, error: 'World not found' });
        const levelsRes = await database_1.default.query('SELECT * FROM levels WHERE world_id = $1 ORDER BY level_number ASC', [worldId]);
        res.json({ success: true, data: { ...worldRes.rows[0], levels: levelsRes.rows } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
// POST /api/students/:id/answer
router.post('/:id/answer', auth_1.authenticate, verifyStudentAccess, async (req, res) => {
    try {
        const { problemId, answerGiven, timeTaken } = req.body;
        const studentId = req.params.id;
        const questionRes = await database_1.default.query('SELECT * FROM questions WHERE id = $1', [problemId]);
        if (questionRes.rows.length === 0)
            return res.status(404).json({ success: false, error: 'Question not found' });
        const question = questionRes.rows[0];
        const isCorrect = question.correct_answer === answerGiven.toString();
        await database_1.default.query('INSERT INTO answers (student_id, question_id, given_answer, correct, time_spent) VALUES ($1, $2, $3, $4, $5)', [studentId, problemId, answerGiven.toString(), isCorrect, timeTaken]);
        const newMastery = await (0, adaptiveEngine_1.processAnswer)(studentId, question.skill_tag, isCorrect, question.difficulty);
        const xpGained = isCorrect ? question.difficulty * 10 : 2;
        const coinsGained = isCorrect ? question.difficulty : 0;
        await database_1.default.query('UPDATE students SET total_xp = total_xp + $1, coins = coins + $2 WHERE id = $3', [xpGained, coinsGained, studentId]);
        await (0, progress_1.addActivityLog)(studentId, 'answer_submitted', `Answered ${question.skill_tag} question ${isCorrect ? 'correctly' : 'incorrectly'}`, xpGained);
        const newStats = await (0, progress_1.getStudentStats)(studentId);
        res.json({
            success: true,
            data: {
                correct: isCorrect,
                xpEarned: xpGained,
                coinsEarned: coinsGained,
                newStats
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /api/students/:id/achievements
router.get('/:id/achievements', auth_1.authenticate, verifyStudentAccess, async (req, res) => {
    try {
        const resAch = await database_1.default.query(`
      SELECT a.*, sa.earned_at 
      FROM achievements a
      LEFT JOIN student_achievements sa ON a.id = sa.achievement_id AND sa.student_id = $1
    `, [req.params.id]);
        res.json({ success: true, data: resAch.rows });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});
// GET /api/students/:id/challenges
router.get('/:id/challenges', auth_1.authenticate, verifyStudentAccess, async (req, res) => {
    // Mock data for now as it's more complex
    res.json({ success: true, data: [
            { id: '1', title: 'Early Bird', description: 'Solve 5 problems before 9 AM', progress: 2, requirement: 5, xpReward: 50 },
            { id: '2', title: 'Perfect Score', description: 'Get 10 correct answers in a row', progress: 4, requirement: 10, xpReward: 100 }
        ] });
});
exports.default = router;
//# sourceMappingURL=students.js.map