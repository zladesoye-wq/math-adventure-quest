import request from 'supertest';
import app from '../app';
import bcrypt from 'bcryptjs';
import pool from '../config/database';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

const mockPool = pool as any;

process.env.JWT_SECRET = 'test_secret';

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new parent', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] }); // Check if email exists
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ id: 'parent-123', email: 'test@example.com', name: 'Parent One' }] 
      }); // Insert parent

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Parent One'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 400 if email already exists', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: '1' }] });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Existing'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a parent with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      // findParentByEmail
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ id: 'parent-123', email: 'test@example.com', password_hash: hashedPassword, name: 'Parent One' }] 
      });
      // getStudentsByParentId
      mockPool.query.mockResolvedValueOnce({ 
        rows: [] 
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ id: 'parent-123', email: 'test@example.com', password_hash: hashedPassword }] 
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });
  });
});
