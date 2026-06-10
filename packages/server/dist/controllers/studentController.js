"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudents = exports.createStudent = void 0;
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const studentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    age: zod_1.z.number().int().min(3).max(18).optional(),
    grade: zod_1.z.string().optional(),
    avatar_data: zod_1.z.any().optional(),
});
const createStudent = async (req, res) => {
    try {
        const validatedData = studentSchema.parse(req.body);
        const { name, age, grade, avatar_data } = validatedData;
        const parentId = req.user.id;
        const result = await database_1.default.query('INSERT INTO students (parent_id, name, age, grade, avatar_data) VALUES ($1, $2, $3, $4, $5) RETURNING *', [parentId, name, age, grade, JSON.stringify(avatar_data || {})]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createStudent = createStudent;
const getStudents = async (req, res) => {
    try {
        const parentId = req.user.id;
        const result = await database_1.default.query('SELECT * FROM students WHERE parent_id = $1', [parentId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStudents = getStudents;
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const parentId = req.user.id;
        const validatedData = studentSchema.partial().parse(req.body);
        // Verify ownership
        const studentCheck = await database_1.default.query('SELECT * FROM students WHERE id = $1 AND parent_id = $2', [id, parentId]);
        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found or unauthorized' });
        }
        const { name, age, grade, avatar_data } = validatedData;
        // Construct dynamic update query or just update all fields
        const current = studentCheck.rows[0];
        const result = await database_1.default.query('UPDATE students SET name = $1, age = $2, grade = $3, avatar_data = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *', [
            name !== undefined ? name : current.name,
            age !== undefined ? age : current.age,
            grade !== undefined ? grade : current.grade,
            avatar_data !== undefined ? JSON.stringify(avatar_data) : current.avatar_data,
            id
        ]);
        res.json(result.rows[0]);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const parentId = req.user.id;
        const result = await database_1.default.query('DELETE FROM students WHERE id = $1 AND parent_id = $2 RETURNING id', [id, parentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found or unauthorized' });
        }
        res.json({ message: 'Student deleted successfully', id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteStudent = deleteStudent;
//# sourceMappingURL=studentController.js.map