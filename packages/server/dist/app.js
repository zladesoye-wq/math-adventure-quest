"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, morgan_1.default)('dev')); // Logging
app.use((0, cors_1.default)()); // CORS
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
// API Routes
app.use('/api', routes_1.default);
// Basic route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        message,
        status,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map