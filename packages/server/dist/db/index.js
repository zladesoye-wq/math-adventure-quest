"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Standard pg pool for server-side Express apps
// If using Neon in a serverless environment (like Vercel functions), 
// we might use the @neondatabase/serverless driver instead of pg.
// But for a long-running Node process, pg is fine.
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
const query = (text, params) => pool.query(text, params);
exports.query = query;
exports.default = pool;
//# sourceMappingURL=index.js.map