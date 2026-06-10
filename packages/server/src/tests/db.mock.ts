import pool from '../config/database';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

export const mockPool = pool as any;
