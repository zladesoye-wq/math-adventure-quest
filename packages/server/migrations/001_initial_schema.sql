-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    grade TEXT,
    avatar_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worlds table
CREATE TABLE IF NOT EXISTS worlds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    unlocked_by_default BOOLEAN DEFAULT FALSE
);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    required_stars INTEGER DEFAULT 0,
    difficulty_modifier FLOAT DEFAULT 1.0,
    UNIQUE(world_id, level_number)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
    difficulty INTEGER DEFAULT 1,
    skill_tag TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    hints JSONB DEFAULT '[]'::jsonb
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, level_id)
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    given_answer TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    criteria_type TEXT NOT NULL,
    criteria_value INTEGER NOT NULL
);

-- Student Achievements table
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, achievement_id)
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL,
    reward_key TEXT NOT NULL,
    amount INTEGER NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    stripe_id TEXT UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium')),
    status TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_id)
);

-- Skill Mastery table
CREATE TABLE IF NOT EXISTS skill_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    skill_tag TEXT NOT NULL,
    mastery_level FLOAT DEFAULT 0.0,
    attempts INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    last_practiced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_tag)
);

-- Daily Rewards table
CREATE TABLE IF NOT EXISTS daily_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    streak_count INTEGER DEFAULT 0,
    last_claim_date DATE,
    UNIQUE(student_id)
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
