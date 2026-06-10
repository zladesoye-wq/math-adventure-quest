-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'student')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_id TEXT DEFAULT 'default',
    coins INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worlds table
CREATE TABLE IF NOT EXISTS worlds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL
);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    required_xp INTEGER DEFAULT 0,
    UNIQUE(world_id, level_number)
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
    min_level INTEGER NOT NULL,
    max_level INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    answer TEXT NOT NULL,
    options JSONB,
    difficulty INTEGER DEFAULT 1,
    category TEXT NOT NULL
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
    problems_solved INTEGER DEFAULT 0,
    accuracy FLOAT DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT
);

-- Student Achievements table
CREATE TABLE IF NOT EXISTS student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, achievement_id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'premium')),
    status TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
