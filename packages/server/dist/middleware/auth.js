"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../models/auth");
const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        // For both parent and student, the 'id' in token refers to their specific ID in respective tables.
        // However, if it's a student, we might want to check the parent account still exists.
        const parentId = decoded.role === 'student' ? decoded.parentId : decoded.id;
        const parent = await (0, auth_1.findParentById)(parentId);
        if (!parent) {
            return res.status(401).json({ message: 'Account no longer exists' });
        }
        req.user = {
            id: decoded.id,
            role: decoded.role,
            parentId: decoded.parentId,
            email: parent.email
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next();
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const parentId = decoded.role === 'student' ? decoded.parentId : decoded.id;
        const parent = await (0, auth_1.findParentById)(parentId);
        if (parent) {
            req.user = {
                id: decoded.id,
                role: decoded.role,
                parentId: decoded.parentId,
                email: parent.email
            };
        }
        next();
    }
    catch (error) {
        // Fail silently for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map