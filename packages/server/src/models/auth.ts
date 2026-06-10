import pool from '../config/database';

export interface Parent {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Student {
  id: string;
  parent_id: string;
  name: string;
  age?: number;
  grade?: string;
  avatar_data?: any;
  created_at?: Date;
  updated_at?: Date;
}

export const findParentByEmail = async (email: string): Promise<Parent | null> => {
  const result = await pool.query('SELECT * FROM parents WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const createParent = async (email: string, passwordHash: string, name?: string): Promise<Parent> => {
  const result = await pool.query(
    'INSERT INTO parents (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    [email, passwordHash, name]
  );
  return result.rows[0];
};

export const findParentById = async (id: string): Promise<Parent | null> => {
  const result = await pool.query('SELECT id, email, name FROM parents WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const findStudentById = async (id: string): Promise<Student | null> => {
  const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getStudentsByParentId = async (parentId: string): Promise<Student[]> => {
  const result = await pool.query('SELECT * FROM students WHERE parent_id = $1', [parentId]);
  return result.rows;
};

export const createStudent = async (student: Partial<Student>): Promise<Student> => {
  const { parent_id, name, age, grade, avatar_data } = student;
  const result = await pool.query(
    'INSERT INTO students (parent_id, name, age, grade, avatar_data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [parent_id, name, age, grade, avatar_data ? JSON.stringify(avatar_data) : null]
  );
  return result.rows[0];
};
