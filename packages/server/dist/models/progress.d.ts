export interface StudentStats {
    id: string;
    name: string;
    total_xp: number;
    level: number;
    coins: number;
    gems: number;
    total_problems: number;
    accuracy: number;
    stars: number;
    streak: number;
}
export declare const getStudentStats: (studentId: string) => Promise<StudentStats | null>;
export declare const getSkillMastery: (studentId: string) => Promise<any[]>;
export declare const getWeeklyProgress: (studentId: string) => Promise<any[]>;
export declare const getRecentActivity: (studentId: string) => Promise<any[]>;
export declare const updateSkillMastery: (studentId: string, skillTag: string, masteryLevel: number, isCorrect: boolean) => Promise<void>;
export declare const addActivityLog: (studentId: string, action: string, detail: string, xp: number) => Promise<void>;
