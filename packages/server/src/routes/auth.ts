import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { 
  findParentByEmail, 
  createParent, 
  findParentById, 
  getStudentsByParentId, 
  createStudent,
  findStudentById
} from '../models/auth';
import { generateParentToken, generateStudentToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const studentSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(3).max(18).optional(),
  grade: z.string().optional(),
  avatar_data: z.any().optional(),
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existing = await findParentByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const parent = await createParent(email, passwordHash, name);
    const token = generateParentToken(parent);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: parent.id, email: parent.email, name: parent.name, role: 'parent' }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data' });
    }
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const parent = await findParentByEmail(email);
    if (!parent || !(await bcrypt.compare(password, parent.password_hash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateParentToken(parent);
    const students = await getStudentsByParentId(parent.id);

    res.json({
      success: true,
      data: {
        token,
        user: { id: parent.id, email: parent.email, name: parent.name, role: 'parent' },
        students
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid input data' });
    }
    next(error);
  }
});

// GET /api/auth/me
// Returns the currently-authenticated user. Handles BOTH parent and student
// tokens. Previously this only looked up parents, so any student token caused
// a 404 here — which in turn made the client wipe the stored token and break
// the whole student session.
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role === 'student') {
      const student = await findStudentById(req.user!.id);
      if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }
      return res.json({
        success: true,
        data: {
          id: student.id,
          name: student.name,
          role: 'student',
          parentId: student.parent_id,
        },
      });
    }

    const parent = await findParentById(req.user!.id);
    if (!parent) {
      return res.status(404).json({ success: false, error: 'Parent not found' });
    }
    // Touch students so the call mirrors prior behavior; not returned in payload.
    await getStudentsByParentId(parent.id);
    res.json({
      success: true,
      data: {
        id: parent.id,
        email: parent.email,
        name: parent.name,
        role: 'parent',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/students/:id/login - Parent switching to a student profile
router.post('/students/:id/login', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (req.user!.role !== 'parent') {
      return res.status(403).json({ success: false, error: 'Only parents can switch to student profiles' });
    }

    const studentId = req.params.id as string;
    const student = await findStudentById(studentId);
    
    if (!student || student.parent_id !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Student not found or unauthorized' });
    }

    const token = generateStudentToken(student);
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: student.id,
          name: student.name,
          role: 'student',
          parentId: student.parent_id
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
