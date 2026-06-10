"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addActivityLog = exports.updateSkillMastery = exports.getRecentActivity = exports.getWeeklyProgress = exports.getSkillMastery = exports.getStudentStats = void 0;
const database_1 = __importDefault(require("../config/database"));
const getStudentStats = async (studentId) => {
    const result = await database_1.default.query(`
    SELECT 
      s.*,
      (SELECT COUNT(*) FROM answers WHERE student_id = s.id) as total_problems,
      (SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN correct THEN 1 END)::float / COUNT(*)) * 100 
          ELSE 0 
        END 
       FROM answers WHERE student_id = s.id) as accuracy,
      (SELECT SUM(stars) FROM progress WHERE student_id = s.id) as stars,
      (SELECT streak_count FROM daily_rewards WHERE student_id = s.id) as streak
    FROM students s
    WHERE s.id = $1
  `, [studentId]);
    return result.rows[0] || null;
};
exports.getStudentStats = getStudentStats;
const getSkillMastery = async (studentId) => {
    const result = await database_1.default.query(`
    SELECT skill_tag, mastery_level, attempts, correct
    FROM skill_mastery
    WHERE student_id = $1
    ORDER BY mastery_level DESC
  `, [studentId]);
    return result.rows;
};
exports.getSkillMastery = getSkillMastery;
const getWeeklyProgress = async (studentId) => {
    const result = await database_1.default.query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as problems_solved,
      COUNT(CASE WHEN correct THEN 1 END)::float / COUNT(*) * 100 as accuracy,
      SUM(CASE WHEN correct THEN 10 ELSE 0 END) as xp_earned
    FROM answers
    WHERE student_id = $1 AND created_at > CURRENT_DATE - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [studentId]);
    return result.rows;
};
exports.getWeeklyProgress = getWeeklyProgress;
const getRecentActivity = async (studentId) => {
    const result = await database_1.default.query(`
    SELECT * FROM answers
    WHERE student_id = $1
    ORDER BY created_at DESC
    LIMIT 10
  `, [studentId]);
    return result.rows;
};
exports.getRecentActivity = getRecentActivity;
const updateSkillMastery = async (studentId, skillTag, masteryLevel, isCorrect) => {
    await database_1.default.query(`
    INSERT INTO skill_mastery (student_id, skill_tag, mastery_level, attempts, correct)
    VALUES ($1, $2, $3, 1, $4)
    ON CONFLICT (student_id, skill_tag)
    DO UPDATE SET 
      mastery_level = $3,
      attempts = skill_mastery.attempts + 1,
      correct = skill_mastery.correct + $4,
      last_practiced = CURRENT_TIMESTAMP
  `, [studentId, skillTag, masteryLevel, isCorrect ? 1 : 0]);
};
exports.updateSkillMastery = updateSkillMastery;
const addActivityLog = async (studentId, action, detail, xp) => {
    await database_1.default.query(`
    INSERT INTO activity_logs (student_id, action, detail, xp_earned)
    VALUES ($1, $2, $3, $4)
  `, [studentId, action, detail, xp]);
};
exports.addActivityLog = addActivityLog;
// Activity log doesn't have a table yet in the schema, but lead requested addActivityLog.
// Looking at the schema in 001_initial_schema.sql... 
// It has answers, progress, rewards, skill_mastery.
// Maybe I should add an activity_log table or just use answers/progress.
// I'll create an activity_logs table for more general events if needed, 
// but for now I'll stick to what we have or implement it if I can.
// Actually, I'll just use a mock or skip for now if table doesn't exist, 
// but wait, I can just create the table in a new migration.
//# sourceMappingURL=progress.js.map