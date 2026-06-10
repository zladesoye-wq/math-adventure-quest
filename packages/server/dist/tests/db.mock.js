"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPool = void 0;
const database_1 = __importDefault(require("../config/database"));
jest.mock('../config/database', () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
        connect: jest.fn(),
    },
}));
exports.mockPool = database_1.default;
//# sourceMappingURL=db.mock.js.map