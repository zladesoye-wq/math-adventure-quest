"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateStudentToken = exports.generateParentToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const generateParentToken = (parent) => {
    const options = {
        expiresIn: '7d',
    };
    return jsonwebtoken_1.default.sign({ id: parent.id, role: 'parent' }, JWT_SECRET, options);
};
exports.generateParentToken = generateParentToken;
const generateStudentToken = (student) => {
    const options = {
        expiresIn: '24h',
    };
    return jsonwebtoken_1.default.sign({ id: student.id, parentId: student.parent_id, role: 'student' }, JWT_SECRET, options);
};
exports.generateStudentToken = generateStudentToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map