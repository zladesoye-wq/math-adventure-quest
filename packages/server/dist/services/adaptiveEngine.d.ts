export interface SkillMastery {
    student_id: string;
    skill_tag: string;
    mastery_level: number;
    attempts: number;
    correct: number;
}
/**
 * Calculates new mastery level using an Elo-inspired system.
 * Mastery level: 0.0 (new) to 1.0 (mastered)
 */
export declare const calculateNewMastery: (currentMastery: number, isCorrect: boolean, questionDifficulty: number) => number;
export declare const processAnswer: (studentId: string, skillTag: string, isCorrect: boolean, questionDifficulty: number) => Promise<number>;
export declare const recommendQuestionDifficulty: (mastery: number) => number;
export declare const getSkillRecommendations: (studentId: string) => Promise<{
    skill: any;
    mastery: any;
    recommendation: string;
}[]>;
export declare const shouldShowHint: (studentId: string, skillTag: string) => Promise<boolean>;
export declare const recommendNextQuestion: (studentId: string, worldId: string) => Promise<any>;
