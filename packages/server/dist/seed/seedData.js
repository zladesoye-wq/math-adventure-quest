"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const database_1 = __importDefault(require("../config/database"));
const worlds = [
    {
        name: 'Addition Forest',
        key: 'addition_forest',
        description: 'Master the basics of addition in the lush green forest.',
        order_index: 1,
        is_premium: false,
        unlocked_by_default: true,
    },
    {
        name: 'Subtraction Mountain',
        key: 'subtraction_mountain',
        description: 'Climb the peaks by solving subtraction problems.',
        order_index: 2,
        is_premium: false,
        unlocked_by_default: true,
    },
    {
        name: 'Multiplication Kingdom',
        key: 'multiplication_kingdom',
        description: 'Enter the royal court and master multiplication.',
        order_index: 3,
        is_premium: true,
        unlocked_by_default: false,
    },
    {
        name: 'Division Desert',
        key: 'division_desert',
        description: 'Divide and conquer the shifting sands.',
        order_index: 4,
        is_premium: true,
        unlocked_by_default: false,
    },
    {
        name: 'Fraction Castle',
        key: 'fraction_castle',
        description: 'Unlock the secrets of fractions in the ancient castle.',
        order_index: 5,
        is_premium: true,
        unlocked_by_default: false,
    },
];
const generateLevels = (worldId) => {
    const levels = [];
    for (let i = 1; i <= 20; i++) {
        levels.push({
            world_id: worldId,
            level_number: i,
            title: `Level ${i}`,
            required_stars: (i - 1) * 2,
            difficulty_modifier: 1 + (i - 1) * 0.1,
        });
    }
    return levels;
};
const generateQuestions = (worldId, worldKey) => {
    const questions = [];
    const skillTag = worldKey.split('_')[0];
    for (let i = 1; i <= 50; i++) {
        const difficulty = Math.ceil(i / 10);
        let questionText = '';
        let correctAnswer = '';
        let options = [];
        if (skillTag === 'addition') {
            const a = Math.floor(Math.random() * (difficulty * 10)) + 1;
            const b = Math.floor(Math.random() * (difficulty * 10)) + 1;
            questionText = `${a} + ${b} = ?`;
            correctAnswer = (a + b).toString();
        }
        else if (skillTag === 'subtraction') {
            const a = Math.floor(Math.random() * (difficulty * 10)) + 10;
            const b = Math.floor(Math.random() * a);
            questionText = `${a} - ${b} = ?`;
            correctAnswer = (a - b).toString();
        }
        else if (skillTag === 'multiplication') {
            const a = Math.floor(Math.random() * (difficulty * 5)) + 1;
            const b = Math.floor(Math.random() * 10) + 1;
            questionText = `${a} × ${b} = ?`;
            correctAnswer = (a * b).toString();
        }
        else if (skillTag === 'division') {
            const b = Math.floor(Math.random() * 10) + 1;
            const ans = Math.floor(Math.random() * (difficulty * 5)) + 1;
            const a = b * ans;
            questionText = `${a} ÷ ${b} = ?`;
            correctAnswer = ans.toString();
        }
        else if (skillTag === 'fraction') {
            const den = Math.floor(Math.random() * 5) + 2;
            const num = Math.floor(Math.random() * (den - 1)) + 1;
            questionText = `What is ${num}/${den} of 1?`;
            correctAnswer = `${num}/${den}`;
        }
        // Generate random options
        const correctVal = parseInt(correctAnswer) || 0;
        options = [
            correctAnswer,
            (correctVal + 1).toString(),
            (correctVal - 1).toString(),
            (correctVal + 2).toString(),
        ].sort(() => Math.random() - 0.5);
        questions.push({
            world_id: worldId,
            difficulty,
            skill_tag: skillTag,
            question_text: questionText,
            options: JSON.stringify(options),
            correct_answer: correctAnswer,
            hints: JSON.stringify(['Think carefully!', 'Use your fingers if needed.']),
        });
    }
    return questions;
};
const seedDatabase = async () => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        // Clear existing data
        await client.query('DELETE FROM questions');
        await client.query('DELETE FROM levels');
        await client.query('DELETE FROM worlds');
        for (const world of worlds) {
            const worldRes = await client.query('INSERT INTO worlds (name, key, description, order_index, is_premium, unlocked_by_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [world.name, world.key, world.description, world.order_index, world.is_premium, world.unlocked_by_default]);
            const worldId = worldRes.rows[0].id;
            const levels = generateLevels(worldId);
            for (const level of levels) {
                await client.query('INSERT INTO levels (world_id, level_number, title, required_stars, difficulty_modifier) VALUES ($1, $2, $3, $4, $5)', [level.world_id, level.level_number, level.title, level.required_stars, level.difficulty_modifier]);
            }
            const questions = generateQuestions(worldId, world.key);
            for (const question of questions) {
                await client.query('INSERT INTO questions (world_id, difficulty, skill_tag, question_text, options, correct_answer, hints) VALUES ($1, $2, $3, $4, $5, $6, $7)', [
                    question.world_id,
                    question.difficulty,
                    question.skill_tag,
                    question.question_text,
                    question.options,
                    question.correct_answer,
                    question.hints,
                ]);
            }
        }
        await client.query('COMMIT');
        console.log('Database seeded successfully!');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding database:', error);
        throw error;
    }
    finally {
        client.release();
    }
};
exports.seedDatabase = seedDatabase;
if (require.main === module) {
    (0, exports.seedDatabase)().then(() => process.exit(0)).catch(() => process.exit(1));
}
//# sourceMappingURL=seedData.js.map