"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudent = exports.getStudentsByParentId = exports.findStudentById = exports.findParentById = exports.createParent = exports.findParentByEmail = void 0;
const database_1 = __importDefault(require("../config/database"));
const findParentByEmail = async (email) => {
    const result = await database_1.default.query('SELECT * FROM parents WHERE email = $1', [email]);
    return result.rows[0] || null;
};
exports.findParentByEmail = findParentByEmail;
const createParent = async (email, passwordHash, name) => {
    const result = await database_1.default.query('INSERT INTO parents (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, passwordHash, name]);
    return result.rows[0];
};
exports.createParent = createParent;
const findParentById = async (id) => {
    const result = await database_1.default.query('SELECT id, email, name FROM parents WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.findParentById = findParentById;
const findStudentById = async (id) => {
    const result = await database_1.default.query('SELECT * FROM students WHERE id = $1', [id]);
    return result.rows[0] || null;
};
exports.findStudentById = findStudentById;
const getStudentsByParentId = async (parentId) => {
    const result = await database_1.default.query('SELECT * FROM students WHERE parent_id = $1', [parentId]);
    return result.rows;
};
exports.getStudentsByParentId = getStudentsByParentId;
const createStudent = async (student) => {
    const { parent_id, name, age, grade, avatar_data } = student;
    const result = await database_1.default.query('INSERT INTO students (parent_id, name, age, grade, avatar_data) VALUES ($1, $2, $3, $4, $5) RETURNING *', [parent_id, name, age, grade, avatar_data ? JSON.stringify(avatar_data) : null]);
    return result.rows[0];
};
exports.createStudent = createStudent;
//# sourceMappingURL=auth.js.map