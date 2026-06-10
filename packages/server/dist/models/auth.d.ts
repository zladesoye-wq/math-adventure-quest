export interface Parent {
    id: string;
    email: string;
    password_hash: string;
    name?: string;
    created_at?: Date;
    updated_at?: Date;
}
export interface Student {
    id: string;
    parent_id: string;
    name: string;
    age?: number;
    grade?: string;
    avatar_data?: any;
    created_at?: Date;
    updated_at?: Date;
}
export declare const findParentByEmail: (email: string) => Promise<Parent | null>;
export declare const createParent: (email: string, passwordHash: string, name?: string) => Promise<Parent>;
export declare const findParentById: (id: string) => Promise<Parent | null>;
export declare const findStudentById: (id: string) => Promise<Student | null>;
export declare const getStudentsByParentId: (parentId: string) => Promise<Student[]>;
export declare const createStudent: (student: Partial<Student>) => Promise<Student>;
