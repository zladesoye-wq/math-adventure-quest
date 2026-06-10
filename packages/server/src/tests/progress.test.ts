process.env.JWT_SECRET = 'test_secret';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

const mockPool = pool as any;
const JWT_SECRET = 'test_secret';

describe('Progress API', () => {
  let studentToken: string;
  const studentId = 'student-123';

  beforeAll(() => {
    studentToken = jwt.sign(
      { id: studentId, role: 'student', parentId: 'parent-123' },
      JWT_SECRET
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/progress/answer', () => {
    it('should process a correct answer', async () => {
      const questionId = '00000000-0000-0000-0000-000000000456';
      
      // Mock parent check in middleware
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ id: 'parent-123', email: 'parent@example.com' }] 
      });

      // Mock question lookup
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ 
          id: questionId, 
          correct_answer: '4', 
          skill_tag: 'addition', 
          difficulty: 1 
        }] 
      });

      // Mock answer insertion
      mockPool.query.mockResolvedValueOnce({});

      // Mock mastery lookup (in processAnswer)
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ mastery_level: 0.2 }] 
      });

      // Mock mastery update
      mockPool.query.mockResolvedValueOnce({});

      // Mock student XP/coins update
      mockPool.query.mockResolvedValueOnce({});

      // Mock activity log
      mockPool.query.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/api/progress/answer')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          questionId,
          givenAnswer: '4',
          timeSpent: 5
        });

      if (res.status !== 200) {
        console.error('Response body:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.correct).toBe(true);
      expect(res.body.xpGained).toBe(10);
    });

    it('should process an incorrect answer', async () => {
      const questionId = '00000000-0000-0000-0000-000000000456';
      
      // Mock parent check in middleware
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ id: 'parent-123', email: 'parent@example.com' }] 
      });

      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ 
          id: questionId, 
          correct_answer: '4', 
          skill_tag: 'addition', 
          difficulty: 1 
        }] 
      });
      mockPool.query.mockResolvedValueOnce({}); // Insert answer
      mockPool.query.mockResolvedValueOnce({ rows: [{ mastery_level: 0.2 }] }); // Get mastery
      mockPool.query.mockResolvedValueOnce({}); // Update mastery
      mockPool.query.mockResolvedValueOnce({}); // Update student
      mockPool.query.mockResolvedValueOnce({}); // Log activity

      const res = await request(app)
        .post('/api/progress/answer')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          questionId,
          givenAnswer: '5',
          timeSpent: 10
        });

      expect(res.status).toBe(200);
      expect(res.body.correct).toBe(false);
      expect(res.body.xpGained).toBe(2);
    });
  });
});
