"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendNextQuestion = exports.shouldShowHint = exports.getSkillRecommendations = exports.recommendQuestionDifficulty = exports.processAnswer = exports.calculateNewMastery = void 0;
const database_1 = __importDefault(require("../config/database"));
const progress_1 = require("../models/progress");
/**
 * Calculates new mastery level using an Elo-inspired system.
 * Mastery level: 0.0 (new) to 1.0 (mastered)
 */
const calculateNewMastery = (currentMastery, isCorrect, questionDifficulty) => {
    const kFactor = 0.1; // Maximum change per answer
    // Normalized difficulty (1-5 -> 0.2-1.0)
    const normalizedDifficulty = questionDifficulty / 5;
    // Expected probability of answering correctly based on current mastery vs difficulty
    // If mastery == difficulty, expected is 0.5
    // If mastery >> difficulty, expected is close to 1.0
    // If mastery << difficulty, expected is close to 0.0
    const expected = 1 / (1 + Math.pow(10, (normalizedDifficulty - currentMastery) / 0.5));
    const score = isCorrect ? 1 : 0;
    // Update mastery
    let newMastery = currentMastery + kFactor * (score - expected);
    // Adjust based on difficulty to reward harder problems more
    if (isCorrect) {
        newMastery += 0.02 * normalizedDifficulty;
    }
    else {
        newMastery -= 0.02 * (1 - normalizedDifficulty);
    }
    // Clamp between 0.0 and 1.0
    return Math.max(0.0, Math.min(1.0, newMastery));
};
exports.calculateNewMastery = calculateNewMastery;
const processAnswer = async (studentId, skillTag, isCorrect, questionDifficulty) => {
    // 1. Get current mastery
    const res = await database_1.default.query('SELECT mastery_level FROM skill_mastery WHERE student_id = $1 AND skill_tag = $2', [studentId, skillTag]);
    const currentMastery = res.rows.length > 0 ? res.rows[0].mastery_level : 0.1;
    // 2. Calculate new mastery
    const newMastery = (0, exports.calculateNewMastery)(currentMastery, isCorrect, questionDifficulty);
    // 3. Update database
    await (0, progress_1.updateSkillMastery)(studentId, skillTag, newMastery, isCorrect);
    return newMastery;
};
exports.processAnswer = processAnswer;
const recommendQuestionDifficulty = (mastery) => {
    if (mastery > 0.8)
        return 5;
    if (mastery > 0.6)
        return 4;
    if (mastery > 0.4)
        return 3;
    if (mastery > 0.2)
        return 2;
    return 1;
};
exports.recommendQuestionDifficulty = recommendQuestionDifficulty;
const getSkillRecommendations = async (studentId) => {
    const result = await database_1.default.query(`
    SELECT skill_tag, mastery_level
    FROM skill_mastery
    WHERE student_id = $1
    ORDER BY mastery_level ASC
    LIMIT 3
  `, [studentId]);
    return result.rows.map(r => ({
        skill: r.skill_tag,
        mastery: r.mastery_level,
        recommendation: `Practice ${r.skill_tag} to improve your score!`
    }));
};
exports.getSkillRecommendations = getSkillRecommendations;
const shouldShowHint = async (studentId, skillTag) => {
    // If student gets 2+ questions wrong on the same skill recently
    const result = await database_1.default.query(`
    SELECT correct FROM answers
    WHERE student_id = $1
    AND question_id IN (SELECT id FROM questions WHERE skill_tag = $2)
    ORDER BY created_at DESC
    LIMIT 2
  `, [studentId, skillTag]);
    if (result.rows.length < 2)
        return false;
    // If all (2) recent are incorrect
    return result.rows.every(r => r.correct === false);
};
exports.shouldShowHint = shouldShowHint;
const recommendNextQuestion = async (studentId, worldId) => {
    // Find relevant skill tags for this world
    const questionsRes = await database_1.default.query('SELECT DISTINCT skill_tag FROM questions WHERE world_id = $1', [worldId]);
    const skillTags = questionsRes.rows.map(r => r.skill_tag);
    if (skillTags.length === 0)
        return null;
    // Get mastery for these tags (default to 0.1 if not found)
    const masteryRes = await database_1.default.query('SELECT skill_tag, mastery_level FROM skill_mastery WHERE student_id = $1 AND skill_tag = ANY($2)', [studentId, skillTags]);
    const masteries = masteryRes.rows;
    let targetDifficulty = 1;
    if (masteries.length > 0) {
        const avgMastery = masteries.reduce((sum, m) => sum + m.mastery_level, 0) / masteries.length;
        targetDifficulty = (0, exports.recommendQuestionDifficulty)(avgMastery);
    }
    // Pick a random question near target difficulty
    const finalQuestionsRes = await database_1.default.query('SELECT * FROM questions WHERE world_id = $1 AND difficulty BETWEEN $2 AND $3 ORDER BY RANDOM() LIMIT 1', [worldId, Math.max(1, targetDifficulty - 1), Math.min(5, targetDifficulty + 1)]);
    const question = finalQuestionsRes.rows[0];
    if (!question)
        return null;
    // Check if we should show hint
    const showHint = await (0, exports.shouldShowHint)(studentId, question.skill_tag);
    return {
        ...question,
        suggest_hint: showHint
    };
};
exports.recommendNextQuestion = recommendNextQuestion;
//# sourceMappingURL=adaptiveEngine.js.map