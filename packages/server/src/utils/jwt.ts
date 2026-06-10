import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const generateParentToken = (parent: { id: string }): string => {
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign({ id: parent.id, role: 'parent' }, JWT_SECRET, options);
};

export const generateStudentToken = (student: { id: string; parent_id: string }): string => {
  const options: SignOptions = {
    expiresIn: '24h',
  };
  return jwt.sign(
    { id: student.id, parentId: student.parent_id, role: 'student' },
    JWT_SECRET,
    options
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
