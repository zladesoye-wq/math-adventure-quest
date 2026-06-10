import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { 
  getStudentStats, 
  getSkillMastery, 
  getWeeklyProgress, 
  getRecentActivity,
  addActivityLog
} from '../models/progress';
import { getSkillRecommendations, recommendNextQuestion, processAnswer } from '../services/adaptiveEngine';
import pool from '../config/database';
import { z } from 'zod';

const router = Router();

// Validate studentId middleware
const validateStudentId = async (req: AuthRequest, res: Response, next: Function) => {
  const { studentId } = req.params;
  const parentId = req.user!.role === 'parent' ? req.user!.id : req.user!.parentId;

  if (!studentId) {
    return res.status(400).json({ message: 'studentId is required' });
  }

  // If student is logged in, they can only access their own data
  if (req.user!.role === 'student' && req.user!.id !== studentId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // If parent is logged in, verify they own the student
  if (req.user!.role === 'parent') {
    const check = await pool.query('SELECT id FROM students WHERE id = $1 AND parent_id = $2', [studentId as string, parentId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found or unauthorized' });
    }
  }

  next();
};

// GET /api/progress/:studentId/summary
router.get('/:studentId/summary', authenticate, validateStudentId, async (req: AuthRequest, res) => {
  try {
    const studentId = req.params.studentId as string;
    const stats = await getStudentStats(studentId);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/progress/:studentId/skills
router.get('/:studentId/skills', authenticate, validateStudentId, async (req: AuthRequest, res) => {
  try {
    const studentId = req.params.studentId as string;
    const skills = await getSkillMastery(studentId);
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/progress/:studentId/weekly
router.get('/:studentId/weekly', authenticate, validateStudentId, async (req: AuthRequest, res) => {
  try {
    const studentId = req.params.studentId as string;
    const weekly = await getWeeklyProgress(studentId);
    res.json(weekly);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/progress/:studentId/recent
router.get('/:studentId/recent', authenticate, validateStudentId, async (req: AuthRequest, res) => {
  try {
    const studentId = req.params.studentId as string;
    const recent = await getRecentActivity(studentId);
    res.json(recent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/progress/:studentId/report
router.get('/:studentId/report', authenticate, validateStudentId, async (req: AuthRequest, res) => {
  try {
    const studentId = req.params.studentId as string;
    const skills = await getSkillMastery(studentId);
    const recommendations = await getSkillRecommendations(studentId);
    
    const strengths = skills.filter((s: any) => s.mastery_level > 0.7);
    const weaknesses = skills.filter((s: any) => s.mastery_level < 0.4);

    res.json({
      strengths,
      weaknesses,
      recommendations,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// For student gameplay
const answerSchema = z.object({
  questionId: z.string().uuid(),
  givenAnswer: z.string(),
  timeSpent: z.number().int(),
});

// POST /api/progress/answer
router.post('/answer', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit answers' });
    }

    const { questionId, givenAnswer, timeSpent } = answerSchema.parse(req.body);
    const studentId = req.user!.id;

    const questionRes = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    if (questionRes.rows.length === 0) return res.status(404).json({ message: 'Question not found' });
    
    const question = questionRes.rows[0];
    const isCorrect = question.correct_answer === givenAnswer;

    await pool.query(
      'INSERT INTO answers (student_id, question_id, given_answer, correct, time_spent) VALUES ($1, $2, $3, $4, $5)',
      [studentId, questionId, givenAnswer, isCorrect, timeSpent]
    );

    const newMastery = await processAnswer(studentId, question.skill_tag, isCorrect, question.difficulty);

    const xpGained = isCorrect ? question.difficulty * 10 : 2;
    await pool.query('UPDATE students SET total_xp = total_xp + $1, coins = coins + $2 WHERE id = $3', 
      [xpGained, isCorrect ? question.difficulty : 0, studentId]);

    await addActivityLog(studentId, 'answer_submitted', `Answered ${question.skill_tag} question ${isCorrect ? 'correctly' : 'incorrectly'}`, xpGained);

    res.json({
      correct: isCorrect,
      correctAnswer: question.correct_answer,
      newMastery,
      xpGained
    });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/progress/recommend/:worldId
router.get('/recommend/:worldId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'student') return res.status(403).json({ message: 'Only students can get recommendations' });
    const worldId = req.params.worldId as string;
    const question = await recommendNextQuestion(req.user!.id, worldId);
    if (!question) return res.status(404).json({ message: 'No questions found' });
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
