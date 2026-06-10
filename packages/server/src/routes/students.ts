import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { z } from 'zod';
import { 
  getStudentStats, 
  getSkillMastery, 
  getWeeklyProgress, 
  getRecentActivity,
  addActivityLog 
} from '../models/progress';
import { 
  getStudentsByParentId, 
  createStudent, 
  findStudentById 
} from '../models/auth';
import { recommendNextQuestion, processAnswer } from '../services/adaptiveEngine';

const router = Router();

const studentSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(3).max(18).optional(),
  grade: z.number().int().optional(),
  avatar_data: z.any().optional(),
});

// Middleware to verify student ownership
const verifyStudentAccess = async (req: AuthRequest, res: Response, next: Function) => {
  const { id } = req.params;
  const parentId = req.user!.role === 'parent' ? req.user!.id : req.user!.parentId;

  if (req.user!.role === 'student' && req.user!.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (req.user!.role === 'parent') {
    const check = await pool.query('SELECT id FROM students WHERE id = $1 AND parent_id = $2', [id, parentId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found or unauthorized' });
    }
  }

  next();
};

// GET /api/students - List students for parent
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const students = await getStudentsByParentId(req.user!.id);
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/students - Add student for parent
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const validatedData = studentSchema.parse(req.body);
    const student = await createStudent({
      ...validatedData,
      parent_id: req.user!.id,
      grade: validatedData.grade?.toString() || '1'
    });
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: error.issues });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/students/:id/stats
router.get('/:id/stats', authenticate, verifyStudentAccess, async (req, res) => {
  try {
    const stats = await getStudentStats(req.params.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/students/:id/worlds
router.get('/:id/worlds', authenticate, verifyStudentAccess, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM worlds ORDER BY order_index ASC');
    const worlds = result.rows;
    
    // Get progress for each world
    const worldsWithProgress = await Promise.all(worlds.map(async (world) => {
      const levelsRes = await pool.query(
        'SELECT * FROM levels WHERE world_id = $1 ORDER BY level_number ASC', 
        [world.id]
      );
      
      const progressRes = await pool.query(
        'SELECT * FROM progress WHERE student_id = $1 AND level_id = ANY($2)',
        [req.params.id, levelsRes.rows.map(l => l.id)]
      );

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
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/students/:id/worlds/:worldId
router.get('/:id/worlds/:worldId', authenticate, verifyStudentAccess, async (req, res) => {
  try {
    const { worldId } = req.params;
    const worldRes = await pool.query('SELECT * FROM worlds WHERE id = $1', [worldId]);
    if (worldRes.rows.length === 0) return res.status(404).json({ success: false, error: 'World not found' });

    const levelsRes = await pool.query('SELECT * FROM levels WHERE world_id = $1 ORDER BY level_number ASC', [worldId]);
    res.json({ success: true, data: { ...worldRes.rows[0], levels: levelsRes.rows } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/students/:id/answer
router.post('/:id/answer', authenticate, verifyStudentAccess, async (req: AuthRequest, res) => {
  try {
    const { problemId, answerGiven, timeTaken } = req.body;
    const studentId = req.params.id;

    const questionRes = await pool.query('SELECT * FROM questions WHERE id = $1', [problemId]);
    if (questionRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Question not found' });
    
    const question = questionRes.rows[0];
    const isCorrect = question.correct_answer === answerGiven.toString();

    await pool.query(
      'INSERT INTO answers (student_id, question_id, given_answer, correct, time_spent) VALUES ($1, $2, $3, $4, $5)',
      [studentId, problemId, answerGiven.toString(), isCorrect, timeTaken]
    );

    const newMastery = await processAnswer(studentId, question.skill_tag, isCorrect, question.difficulty);

    const xpGained = isCorrect ? question.difficulty * 10 : 2;
    const coinsGained = isCorrect ? question.difficulty : 0;
    
    await pool.query('UPDATE students SET total_xp = total_xp + $1, coins = coins + $2 WHERE id = $3', 
      [xpGained, coinsGained, studentId]);

    await addActivityLog(studentId, 'answer_submitted', `Answered ${question.skill_tag} question ${isCorrect ? 'correctly' : 'incorrectly'}`, xpGained);

    const newStats = await getStudentStats(studentId);

    res.json({
      success: true,
      data: {
        correct: isCorrect,
        xpEarned: xpGained,
        coinsEarned: coinsGained,
        newStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/students/:id/achievements
router.get('/:id/achievements', authenticate, verifyStudentAccess, async (req, res) => {
  try {
    const resAch = await pool.query(`
      SELECT a.*, sa.earned_at 
      FROM achievements a
      LEFT JOIN student_achievements sa ON a.id = sa.achievement_id AND sa.student_id = $1
    `, [req.params.id]);
    res.json({ success: true, data: resAch.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/students/:id/challenges
router.get('/:id/challenges', authenticate, verifyStudentAccess, async (req, res) => {
  // Mock data for now as it's more complex
  res.json({ success: true, data: [
    { id: '1', title: 'Early Bird', description: 'Solve 5 problems before 9 AM', progress: 2, requirement: 5, xpReward: 50 },
    { id: '2', title: 'Perfect Score', description: 'Get 10 correct answers in a row', progress: 4, requirement: 10, xpReward: 100 }
  ] });
});

export default router;
