import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { getStudentStats, getWeeklyProgress, getSkillMastery } from '../models/progress';

const router = Router();

const mapStudentProgress = async (s: any, parentId: string) => {
  const stats = await getStudentStats(s.id);
  const weekly = await getWeeklyProgress(s.id);
  const skills = await getSkillMastery(s.id);
  const recent = await pool.query('SELECT * FROM activity_logs WHERE student_id = $1 ORDER BY created_at DESC LIMIT 5', [s.id]);
  
  const strengths = skills.filter((sk: any) => sk.mastery_level > 0.7).map((sk: any) => sk.skill_tag);
  const weaknesses = skills.filter((sk: any) => sk.mastery_level < 0.4).map((sk: any) => sk.skill_tag);

  // Map backend stats to frontend stats
  const mappedStats = stats ? {
    coins: stats.coins,
    gems: stats.gems,
    stars: stats.stars || 0,
    xp: stats.total_xp,
    level: stats.level,
    streak: stats.streak || 0,
    longestStreak: stats.streak || 0,
    problemsSolved: Number(stats.total_problems),
    correctAnswers: Math.round(Number(stats.total_problems) * (stats.accuracy / 100)),
    accuracy: Math.round(stats.accuracy),
    lastActiveDate: new Date().toISOString()
  } : {
    coins: 0, gems: 0, stars: 0, xp: 0, level: 1, streak: 0, longestStreak: 0, problemsSolved: 0, correctAnswers: 0, accuracy: 0, lastActiveDate: new Date().toISOString()
  };

  const studentData = {
    id: s.id,
    name: s.name,
    email: '',
    role: 'student',
    parentId: parentId,
    age: s.age,
    grade: Number(s.grade),
    avatar: s.avatar_data,
    stats: mappedStats
  };

  return {
    student: studentData,
    recentActivity: recent.rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      action: r.action,
      detail: r.detail,
      timestamp: r.created_at,
      xpEarned: r.xp_earned
    })),
    weeklyAccuracy: [85, 90, 75, 95, 80, 0, 0], // Placeholder
    weeklyProblems: [10, 15, 8, 20, 12, 0, 0],   // Placeholder
    strengths,
    weaknesses,
    timeSpentToday: 15
  };
};

// GET /api/parents/children/progress - All children progress
router.get('/children/progress', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'parent') return res.status(403).json({ success: false, error: 'Forbidden' });

    const studentsRes = await pool.query('SELECT id, name, age, grade, avatar_data FROM students WHERE parent_id = $1', [req.user!.id]);
    const children = await Promise.all(studentsRes.rows.map(s => mapStudentProgress(s, req.user!.id)));

    res.json({ success: true, data: children });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/parents/children/:id/progress - Single child progress
router.get('/children/:id/progress', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user!.role !== 'parent') return res.status(403).json({ success: false, error: 'Forbidden' });

    const studentId = req.params.id;
    const check = await pool.query('SELECT id, name, age, grade, avatar_data FROM students WHERE id = $1 AND parent_id = $2', [studentId, req.user!.id]);
    if (check.rows.length === 0) return res.status(404).json({ success: false, error: 'Child not found' });

    const childProgress = await mapStudentProgress(check.rows[0], req.user!.id);

    res.json({
      success: true,
      data: childProgress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
