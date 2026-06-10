import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: 'parent' | 'student';
        parentId?: string;
        email?: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
