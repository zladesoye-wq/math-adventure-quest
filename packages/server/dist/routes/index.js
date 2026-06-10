"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const progress_1 = __importDefault(require("./progress"));
const worlds_1 = __importDefault(require("./worlds"));
const rewards_1 = __importDefault(require("./rewards"));
const subscriptions_1 = __importDefault(require("./subscriptions"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/progress', progress_1.default);
router.use('/worlds', worlds_1.default);
router.use('/rewards', rewards_1.default);
router.use('/subscriptions', subscriptions_1.default);
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to Math Adventure Quest API' });
});
exports.default = router;
//# sourceMappingURL=index.js.map