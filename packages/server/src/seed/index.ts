import pool from '../config/database';

const worlds = [
  { name: 'Addition Forest', key: 'addition_forest', description: 'Master the basics of addition in the lush green forest.', order_index: 1, is_premium: false, unlocked_by_default: true },
  { name: 'Subtraction Mountain', key: 'subtraction_mountain', description: 'Climb the peaks by solving subtraction problems.', order_index: 2, is_premium: false, unlocked_by_default: true },
  { name: 'Multiplication Kingdom', key: 'multiplication_kingdom', description: 'Enter the royal court and master multiplication.', order_index: 3, is_premium: true, unlocked_by_default: false },
  { name: 'Division Desert', key: 'division_desert', description: 'Divide and conquer the shifting sands.', order_index: 4, is_premium: true, unlocked_by_default: false },
  { name: 'Fraction Castle', key: 'fraction_castle', description: 'Unlock the secrets of fractions in the ancient castle.', order_index: 5, is_premium: true, unlocked_by_default: false },
];

const getLevelTitle = (worldKey: string, levelNum: number) => {
  const themes: Record<string, string[]> = {
    addition_forest: ['Gentle Stream', 'Sunny Glade', 'Whispering Woods', 'Berry Patch', 'Hidden Path', 'Quiet Pond', 'Ancient Oak', 'Mushroom Circle', 'Deer Trail', 'Rabbit Hole', 'Fox Den', 'Bird Nest', 'Flower Meadow', 'Butterfly Garden', 'Mossy Rock', 'Crystal Spring', 'Deep Ravine', 'High Branch', 'Tree House', 'Forest Edge'],
    subtraction_mountain: ['Rocky Path', 'Cold Breeze', 'Steep Climb', 'Eagle Peak', 'Hidden Cave', 'Mountain Goat Trail', 'Icy Ridge', 'Snowy Plateau', 'Treacherous Pass', 'Frozen Lake', 'Granite Wall', 'Mist Valley', 'Echo Canyon', 'Pine Slope', 'Silver Mine', 'Summit Base', 'Thin Air', 'Whiteout', 'Peak View', 'The Descent'],
    multiplication_kingdom: ['Castle Gate', 'Royal Courtyard', 'Great Hall', 'Throne Room', 'Armor Gallery', 'Library Tower', 'Secret Passage', 'Dungeon Cell', 'Knight Training', 'Stables', 'Kitchen Garden', 'Banqueting Hall', 'Watchtower', 'Tapestry Room', 'Vault', 'Moat Bridge', 'Cathedral', 'Market Square', 'Wizard Laboratory', 'Inner Sanctum'],
    division_desert: ['Shifting Sands', 'Oasis Palm', 'Scorpion Hideout', 'Ancient Pyramid', 'Dune Peak', 'Mirage Lake', 'Dust Storm', 'Sandstone Arch', 'Nomad Camp', 'Hidden Well', 'Cactus Garden', 'Sunken Temple', 'Sphinx Mystery', 'Pharaoh Tomb', 'Canyon Shadow', 'Dry Riverbed', 'Golden Dunes', 'Starry Night', 'Sand Worm Hole', 'Lost City'],
    fraction_castle: ['Stone Archway', 'Iron Gate', 'Moat Water', 'Drawbridge', 'Outer Wall', 'Inner Keep', 'Great Hall', 'Feast Table', 'Royal Bedchamber', 'Solar Tower', 'Garrison Room', 'Armory', 'Chapel', 'Scriptorium', 'Kitchen', 'Buttery', 'Cellar', 'Pantry', 'Bakehouse', 'Brewery', 'Dairy'],
  };
  return themes[worldKey]?.[levelNum - 1] || `Level ${levelNum}`;
};

const generateLevels = (worldId: string, worldKey: string) => {
  const levels = [];
  for (let i = 1; i <= 20; i++) {
    let difficultyModifier = 1.0;
    if (i <= 5) difficultyModifier = 0.5 + (i - 1) * 0.125;
    else if (i <= 10) difficultyModifier = 1.0 + (i - 6) * 0.125;
    else if (i <= 15) difficultyModifier = 1.5 + (i - 11) * 0.125;
    else difficultyModifier = 2.0 + (i - 16) * 0.25;

    levels.push({
      world_id: worldId,
      level_number: i,
      title: getLevelTitle(worldKey, i),
      required_stars: i === 1 ? 0 : Math.floor((i - 1) * 1.5),
      difficulty_modifier: difficultyModifier,
    });
  }
  return levels;
};

const generateQuestions = (worldId: string, worldKey: string) => {
  const questions = [];
  const skillTag = worldKey.split('_')[0];

  for (let i = 1; i <= 30; i++) {
    const difficulty = Math.ceil(i / 6);
    let questionText = '';
    let correctAnswer = '';
    let options: string[] = [];
    let hints: string[] = [];

    if (skillTag === 'addition') {
      if (difficulty === 1) {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        questionText = `What is ${a} + ${b}?`;
        correctAnswer = (a + b).toString();
        hints = [`Count ${a} then add ${b} more.`];
      } else if (difficulty === 2) {
        const a = Math.floor(Math.random() * 20) + 10;
        const b = Math.floor(Math.random() * 10) + 1;
        questionText = `What is ${a} + ${b}?`;
        correctAnswer = (a + b).toString();
      } else {
        const a = Math.floor(Math.random() * 50) + 20;
        const b = Math.floor(Math.random() * 50) + 20;
        questionText = `What is ${a} + ${b}?`;
        correctAnswer = (a + b).toString();
      }
    } else if (skillTag === 'subtraction') {
      const a = Math.floor(Math.random() * (difficulty * 10)) + 10;
      const b = Math.floor(Math.random() * a);
      questionText = `What is ${a} - ${b}?`;
      correctAnswer = (a - b).toString();
    } else if (skillTag === 'multiplication') {
      const a = Math.floor(Math.random() * (difficulty + 1)) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      questionText = `What is ${a} × ${b}?`;
      correctAnswer = (a * b).toString();
    } else if (skillTag === 'division') {
      const b = Math.floor(Math.random() * 5) + 1;
      const ans = Math.floor(Math.random() * (difficulty + 2)) + 1;
      const a = b * ans;
      questionText = `What is ${a} ÷ ${b}?`;
      correctAnswer = ans.toString();
    } else {
      questionText = `What is 1/2 of 4?`;
      correctAnswer = '2';
    }

    if (options.length === 0) {
      const correctVal = parseInt(correctAnswer) || 0;
      const set = new Set<string>();
      set.add(correctAnswer);
      while (set.size < 4) {
        const offset = Math.floor(Math.random() * 10) - 5;
        if (offset !== 0) set.add((correctVal + offset).toString());
      }
      options = Array.from(set).sort(() => Math.random() - 0.5);
    }

    questions.push({
      world_id: worldId,
      difficulty,
      skill_tag: skillTag,
      question_text: questionText,
      options: JSON.stringify(options),
      correct_answer: correctAnswer,
      hints: JSON.stringify(hints.length > 0 ? hints : ['Think carefully!']),
    });
  }
  return questions;
};

export const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check for existing data
    const existingWorlds = await client.query('SELECT count(*) FROM worlds');
    if (parseInt(existingWorlds.rows[0].count) > 0) {
      console.log('Database already contains worlds. Skipping seed.');
      await client.query('ROLLBACK');
      return;
    }

    for (const world of worlds) {
      const worldRes = await client.query(
        'INSERT INTO worlds (name, key, description, order_index, is_premium, unlocked_by_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [world.name, world.key, world.description, world.order_index, world.is_premium, world.unlocked_by_default]
      );
      const worldId = worldRes.rows[0].id;

      const levels = generateLevels(worldId, world.key);
      for (const level of levels) {
        await client.query(
          'INSERT INTO levels (world_id, level_number, title, required_stars, difficulty_modifier) VALUES ($1, $2, $3, $4, $5)',
          [level.world_id, level.level_number, level.title, level.required_stars, level.difficulty_modifier]
        );
      }

      const questions = generateQuestions(worldId, world.key);
      for (const question of questions) {
        await client.query(
          'INSERT INTO questions (world_id, difficulty, skill_tag, question_text, options, correct_answer, hints) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [question.world_id, question.difficulty, question.skill_tag, question.question_text, question.options, question.correct_answer, question.hints]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
