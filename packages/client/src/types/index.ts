// ── User & Auth Types ────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'student' | 'teacher';
}

export interface Parent extends User {
  role: 'parent';
  children: Student[];
}

export interface Student extends User {
  role: 'student';
  parentId: string;
  age: number;
  grade: number;
  avatar: AvatarData;
  stats: StudentStats;
  worldProgress: WorldProgress[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'parent' | 'teacher';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

// ── Avatar Types ──────────────────────────────────────────────

export interface AvatarData {
  gender: 'boy' | 'girl';
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  outfit: string;
  accessory: string | null;
  pet: string | null;
}

export interface AvatarOption {
  id: string;
  label: string;
  image: string; // emoji or icon
  category: AvatarCategory;
}

export type AvatarCategory = 'gender' | 'hairStyle' | 'hairColor' | 'skinTone' | 'outfit' | 'accessory' | 'pet';

// ── World & Level Types ──────────────────────────────────────

export type WorldId = 'addition-forest' | 'subtraction-mountain' | 'multiplication-kingdom' | 'division-desert' | 'fraction-castle';

export interface World {
  id: WorldId;
  name: string;
  description: string;
  emoji: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  icon: string;
  isPremium: boolean;
  order: number;
  levels: Level[];
}

export interface Level {
  id: string;
  worldId: WorldId;
  number: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  starsRequired: number;
  status: 'locked' | 'unlocked' | 'completed';
  stars: number;
  bestScore: number;
}

export interface WorldProgress {
  worldId: WorldId;
  unlocked: boolean;
  completedLevels: number;
  totalStars: number;
  bestScore: number;
}

// ── Math Problem Types ────────────────────────────────────────

export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fraction';

export interface MathProblem {
  id: string;
  operation: MathOperation;
  operandA: number;
  operandB: number;
  answer: number;
  displayText: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  hints: string[];
  visualAid?: 'fraction-circle' | 'number-line' | 'array' | 'ten-frame';
  options?: number[]; // Multiple choice options
}

export interface ProblemResult {
  problemId: string;
  studentId: string;
  correct: boolean;
  answerGiven: number;
  timeTaken: number; // milliseconds
  hintsUsed: number;
  timestamp: string;
}

// ── Gamification Types ────────────────────────────────────────

export interface StudentStats {
  coins: number;
  gems: number;
  stars: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  problemsSolved: number;
  correctAnswers: number;
  accuracy: number;
  lastActiveDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'milestone' | 'accuracy' | 'streak' | 'speed' | 'completion';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  coinReward: number;
  expiresAt: string;
}

export interface RewardChest {
  id: string;
  type: 'bronze' | 'silver' | 'gold' | 'diamond';
  status: 'locked' | 'available' | 'claimed';
  progress: number;
  maxProgress: number;
  rewards: {
    coins: number;
    gems: number;
    item?: string;
  };
}

// ── Parent Dashboard Types ────────────────────────────────────

export interface ChildProgress {
  student: Student;
  recentActivity: ActivityLog[];
  weeklyAccuracy: number[];
  weeklyProblems: number[];
  strengths: string[];
  weaknesses: string[];
  timeSpentToday: number;
}

export interface ActivityLog {
  id: string;
  studentId: string;
  action: string;
  detail: string;
  timestamp: string;
  xpEarned: number;
}

// ── API Response Types ────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}