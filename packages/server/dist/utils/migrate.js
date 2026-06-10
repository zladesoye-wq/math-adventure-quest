"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database"));
const runMigrations = async () => {
    const client = await database_1.default.connect();
    try {
        console.log('Starting migrations...');
        const migrationsPath = path_1.default.join(__dirname, '../../migrations');
        const files = fs_1.default.readdirSync(migrationsPath).filter(f => f.endsWith('.sql')).sort();
        for (const file of files) {
            console.log(`Running migration: ${file}`);
            const filePath = path_1.default.join(migrationsPath, file);
            const sql = fs_1.default.readFileSync(filePath, 'utf8');
            await client.query(sql);
        }
        console.log('Migrations completed successfully.');
    }
    catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
    finally {
        client.release();
    }
};
exports.runMigrations = runMigrations;
if (require.main === module) {
    (0, exports.runMigrations)().catch(() => process.exit(1));
}
//# sourceMappingURL=migrate.js.map