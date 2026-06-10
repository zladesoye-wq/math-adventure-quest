export declare const generateParentToken: (parent: {
    id: string;
}) => string;
export declare const generateStudentToken: (student: {
    id: string;
    parent_id: string;
}) => string;
export declare const verifyToken: (token: string) => any;
