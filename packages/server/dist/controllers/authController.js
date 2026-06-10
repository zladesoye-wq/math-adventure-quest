"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginStudent = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { email, password, name } = validatedData;
        // Check if user exists
        const userExists = await database_1.default.query('SELECT * FROM parents WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // Create user
        const newUser = await database_1.default.query('INSERT INTO parents (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, passwordHash, name]);
        const user = newUser.rows[0];
        const token = (0, jwt_1.signToken)({ id: user.id, role: 'parent' });
        res.status(201).json({
            id: user.id,
            email: user.email,
            name: user.name,
            token,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;
        // Check for user
        const result = await database_1.default.query('SELECT * FROM parents WHERE email = $1', [email]);
        const user = result.rows[0];
        if (user && (await bcryptjs_1.default.compare(password, user.password_hash))) {
            const token = (0, jwt_1.signToken)({ id: user.id, role: 'parent' });
            res.json({
                id: user.id,
                email: user.email,
                name: user.name,
                token,
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT id, email, name FROM parents WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMe = getMe;
const loginStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const parentId = req.user.id;
        // Verify student belongs to parent
        const result = await database_1.default.query('SELECT * FROM students WHERE id = $1 AND parent_id = $2', [studentId, parentId]);
        const student = result.rows[0];
        if (!student) {
            return res.status(404).json({ message: 'Student not found or unauthorized' });
        }
        const token = (0, jwt_1.signToken)({
            id: parentId,
            studentId: student.id,
            role: 'student'
        });
        res.json({
            token,
            student: {
                id: student.id,
                name: student.name,
                avatar_data: student.avatar_data
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.loginStudent = loginStudent;
//# sourceMappingURL=authController.js.map