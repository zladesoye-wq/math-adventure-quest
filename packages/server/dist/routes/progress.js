"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const progress_1 = require("../models/progress");
const adaptiveEngine_1 = require("../services/adaptiveEngine");
const database_1 = __importDefault(require("../config/database"));
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Validate studentId middleware
const validateStudentId = async (req, res, next) => {
    const { studentId } = req.params;
    const parentId = req.user.role === 'parent' ? req.user.id : req.user.parentId;
    if (!studentId) {
        return res.status(400).json({ message: 'studentId is required' });
    }
    // If student is logged in, they can only access their own data
    if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ message: 'Forbidden' });
    }
    // If parent is logged in, verify they own the student
    if (req.user.role === 'parent') {
        const check = await database_1.default.query('SELECT id FROM students WHERE id = $1 AND parent_id = $2', [studentId, parentId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found or unauthorized' });
        }
    }
    next();
};
// GET /api/progress/:studentId/summary
router.get('/:studentId/summary', auth_1.authenticate, validateStudentId, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const stats = await (0, progress_1.getStudentStats)(studentId);
        res.json(stats);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/progress/:studentId/skills
router.get('/:studentId/skills', auth_1.authenticate, validateStudentId, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const skills = await (0, progress_1.getSkillMastery)(studentId);
        res.json(skills);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/progress/:studentId/weekly
router.get('/:studentId/weekly', auth_1.authenticate, validateStudentId, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const weekly = await (0, progress_1.getWeeklyProgress)(studentId);
        res.json(weekly);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/progress/:studentId/recent
router.get('/:studentId/recent', auth_1.authenticate, validateStudentId, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const recent = await (0, progress_1.getRecentActivity)(studentId);
        res.json(recent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/progress/:studentId/report
router.get('/:studentId/report', auth_1.authenticate, validateStudentId, async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const skills = await (0, progress_1.getSkillMastery)(studentId);
        const recommendations = await (0, adaptiveEngine_1.getSkillRecommendations)(studentId);
        const strengths = skills.filter((s) => s.mastery_level > 0.7);
        const weaknesses = skills.filter((s) => s.mastery_level < 0.4);
        res.json({
            strengths,
            weaknesses,
            recommendations,
            generatedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// For student gameplay
const answerSchema = zod_1.z.object({
    questionId: zod_1.z.string().uuid(),
    givenAnswer: zod_1.z.string(),
    timeSpent: zod_1.z.number().int(),
});
// POST /api/progress/answer
router.post('/answer', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can submit answers' });
        }
        const { questionId, givenAnswer, timeSpent } = answerSchema.parse(req.body);
        const studentId = req.user.id;
        const questionRes = await database_1.default.query('SELECT * FROM questions WHERE id = $1', [questionId]);
        if (questionRes.rows.length === 0)
            return res.status(404).json({ message: 'Question not found' });
        const question = questionRes.rows[0];
        const isCorrect = question.correct_answer === givenAnswer;
        await database_1.default.query('INSERT INTO answers (student_id, question_id, given_answer, correct, time_spent) VALUES ($1, $2, $3, $4, $5)', [studentId, questionId, givenAnswer, isCorrect, timeSpent]);
        const newMastery = await (0, adaptiveEngine_1.processAnswer)(studentId, question.skill_tag, isCorrect, question.difficulty);
        const xpGained = isCorrect ? question.difficulty * 10 : 2;
        await database_1.default.query('UPDATE students SET total_xp = total_xp + $1, coins = coins + $2 WHERE id = $3', [xpGained, isCorrect ? question.difficulty : 0, studentId]);
        await (0, progress_1.addActivityLog)(studentId, 'answer_submitted', `Answered ${question.skill_tag} question ${isCorrect ? 'correctly' : 'incorrectly'}`, xpGained);
        res.json({
            correct: isCorrect,
            correctAnswer: question.correct_answer,
            newMastery,
            xpGained
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            return res.status(400).json({ errors: error.issues });
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/progress/recommend/:worldId
router.get('/recommend/:worldId', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'student')
            return res.status(403).json({ message: 'Only students can get recommendations' });
        const worldId = req.params.worldId;
        const question = await (0, adaptiveEngine_1.recommendNextQuestion)(req.user.id, worldId);
        if (!question)
            return res.status(404).json({ message: 'No questions found' });
        res.json(question);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=progress.js.map