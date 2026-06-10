"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
// GET /api/worlds
router.get('/', async (req, res) => {
    try {
        const result = await database_1.default.query('SELECT * FROM worlds ORDER BY order_index ASC');
        res.json(result.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/worlds/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const worldRes = await database_1.default.query('SELECT * FROM worlds WHERE id = $1', [id]);
        if (worldRes.rows.length === 0) {
            return res.status(404).json({ message: 'World not found' });
        }
        const levelsRes = await database_1.default.query('SELECT * FROM levels WHERE world_id = $1 ORDER BY level_number ASC', [id]);
        res.json({
            ...worldRes.rows[0],
            levels: levelsRes.rows
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=worlds.js.map