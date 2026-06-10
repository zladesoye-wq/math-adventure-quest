import pool from '../config/database';
import { updateSkillMastery } from '../models/progress';

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
export const calculateNewMastery = (
  currentMastery: number,
  isCorrect: boolean,
  questionDifficulty: number
): number => {
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
  } else {
    newMastery -= 0.02 * (1 - normalizedDifficulty);
  }

  // Clamp between 0.0 and 1.0
  return Math.max(0.0, Math.min(1.0, newMastery));
};

export const processAnswer = async (
  studentId: string,
  skillTag: string,
  isCorrect: boolean,
  questionDifficulty: number
) => {
  // 1. Get current mastery
  const res = await pool.query(
    'SELECT mastery_level FROM skill_mastery WHERE student_id = $1 AND skill_tag = $2',
    [studentId, skillTag]
  );

  const currentMastery = res.rows.length > 0 ? res.rows[0].mastery_level : 0.1;
  
  // 2. Calculate new mastery
  const newMastery = calculateNewMastery(currentMastery, isCorrect, questionDifficulty);
  
  // 3. Update database
  await updateSkillMastery(studentId, skillTag, newMastery, isCorrect);
  
  return newMastery;
};

export const recommendQuestionDifficulty = (mastery: number): number => {
  if (mastery > 0.8) return 5;
  if (mastery > 0.6) return 4;
  if (mastery > 0.4) return 3;
  if (mastery > 0.2) return 2;
  return 1;
};

export const getSkillRecommendations = async (studentId: string) => {
  const result = await pool.query(`
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

export const shouldShowHint = async (studentId: string, skillTag: string): Promise<boolean> => {
  // If student gets 2+ questions wrong on the same skill recently
  const result = await pool.query(`
    SELECT correct FROM answers
    WHERE student_id = $1
    AND question_id IN (SELECT id FROM questions WHERE skill_tag = $2)
    ORDER BY created_at DESC
    LIMIT 2
  `, [studentId, skillTag]);

  if (result.rows.length < 2) return false;
  
  // If all (2) recent are incorrect
  return result.rows.every(r => r.correct === false);
};

export const recommendNextQuestion = async (studentId: string, worldId: string) => {
  // Find relevant skill tags for this world
  const questionsRes = await pool.query(
    'SELECT DISTINCT skill_tag FROM questions WHERE world_id = $1',
    [worldId]
  );
  const skillTags = questionsRes.rows.map(r => r.skill_tag);

  if (skillTags.length === 0) return null;

  // Get mastery for these tags (default to 0.1 if not found)
  const masteryRes = await pool.query(
    'SELECT skill_tag, mastery_level FROM skill_mastery WHERE student_id = $1 AND skill_tag = ANY($2)',
    [studentId, skillTags]
  );
  
  const masteries = masteryRes.rows;
  let targetDifficulty = 1;
  
  if (masteries.length > 0) {
    const avgMastery = masteries.reduce((sum, m) => sum + m.mastery_level, 0) / masteries.length;
    targetDifficulty = recommendQuestionDifficulty(avgMastery);
  }

  // Pick a random question near target difficulty
  const finalQuestionsRes = await pool.query(
    'SELECT * FROM questions WHERE world_id = $1 AND difficulty BETWEEN $2 AND $3 ORDER BY RANDOM() LIMIT 1',
    [worldId, Math.max(1, targetDifficulty - 1), Math.min(5, targetDifficulty + 1)]
  );

  const question = finalQuestionsRes.rows[0];
  if (!question) return null;

  // Check if we should show hint
  const showHint = await shouldShowHint(studentId, question.skill_tag);
  
  return {
    ...question,
    suggest_hint: showHint
  };
};
