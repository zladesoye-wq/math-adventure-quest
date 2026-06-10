"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const auth_1 = require("../models/auth");
const jwt_1 = require("../utils/jwt");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    name: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const studentSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    age: zod_1.z.number().int().min(3).max(18).optional(),
    grade: zod_1.z.string().optional(),
    avatar_data: zod_1.z.any().optional(),
});
// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const existing = await (0, auth_1.findParentByEmail)(email);
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const parent = await (0, auth_1.createParent)(email, passwordHash, name);
        const token = (0, jwt_1.generateParentToken)(parent);
        res.status(201).json({
            token,
            parent: { id: parent.id, email: parent.email, name: parent.name },
            students: []
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        next(error);
    }
});
// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const parent = await (0, auth_1.findParentByEmail)(email);
        if (!parent || !(await bcryptjs_1.default.compare(password, parent.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = (0, jwt_1.generateParentToken)(parent);
        const students = await (0, auth_1.getStudentsByParentId)(parent.id);
        res.json({
            token,
            parent: { id: parent.id, email: parent.email, name: parent.name },
            students
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        next(error);
    }
});
// GET /api/auth/profile
router.get('/profile', auth_2.authenticate, async (req, res, next) => {
    try {
        const parent = await (0, auth_1.findParentById)(req.user.id);
        if (!parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        const students = await (0, auth_1.getStudentsByParentId)(parent.id);
        res.json({
            parent: { id: parent.id, email: parent.email, name: parent.name },
            students
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/students
router.post('/students', auth_2.authenticate, async (req, res, next) => {
    try {
        const validatedData = studentSchema.parse(req.body);
        const student = await (0, auth_1.createStudent)({
            ...validatedData,
            parent_id: req.user.id
        });
        res.status(201).json(student);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        next(error);
    }
});
// GET /api/auth/students
router.get('/students', auth_2.authenticate, async (req, res, next) => {
    try {
        const students = await (0, auth_1.getStudentsByParentId)(req.user.id);
        res.json(students);
    }
    catch (error) {
        next(error);
    }
});
// POST /api/auth/students/:id/login
router.post('/students/:id/login', auth_2.authenticate, async (req, res, next) => {
    try {
        const studentId = req.params.id;
        const student = await (0, auth_1.findStudentById)(studentId);
        if (!student || student.parent_id !== req.user.id) {
            return res.status(404).json({ message: 'Student not found or unauthorized' });
        }
        const token = (0, jwt_1.generateStudentToken)(student);
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
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map