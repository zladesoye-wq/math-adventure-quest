// ── API Client ─────────────────────────────────────────────────
// Connects to the backend at /api/
import type {
  ApiResponse,
  LoginCredentials,
  RegisterData,
  User,
  Student,
  World,
  MathProblem,
  ProblemResult,
  StudentStats,
  Achievement,
  DailyChallenge,
  RewardChest,
  ChildProgress,
} from '../types';

const BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Restore token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'An error occurred',
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ── Auth ────────────────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const result = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (result.success && result.data) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const result = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.success && result.data) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  async studentLogin(studentId: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const result = await this.request<{ user: User; token: string }>(`/auth/students/${studentId}/login`, {
      method: 'POST',
    });
    if (result.success && result.data) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  // ── Students ────────────────────────────────────────────────

  async getStudents(): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>('/students');
  }

  async addStudent(data: { name: string; age: number; grade: number }): Promise<ApiResponse<Student>> {
    return this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudentAvatar(studentId: string, avatar: Record<string, string>): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/students/${studentId}/avatar`, {
      method: 'PATCH',
      body: JSON.stringify(avatar),
    });
  }

  // ── Worlds ──────────────────────────────────────────────────

  async getWorlds(studentId: string): Promise<ApiResponse<World[]>> {
    return this.request<World[]>(`/students/${studentId}/worlds`);
  }

  async getWorld(studentId: string, worldId: string): Promise<ApiResponse<World>> {
    return this.request<World>(`/students/${studentId}/worlds/${worldId}`);
  }

  // ── Math Problems ───────────────────────────────────────────

  async getProblem(studentId: string, worldId: string, levelId: string): Promise<ApiResponse<MathProblem>> {
    return this.request<MathProblem>(`/students/${studentId}/worlds/${worldId}/levels/${levelId}/problem`);
  }

  async submitAnswer(studentId: string, result: ProblemResult): Promise<ApiResponse<{ correct: boolean; xpEarned: number; coinsEarned: number; newStats: StudentStats }>> {
    return this.request<{ correct: boolean; xpEarned: number; coinsEarned: number; newStats: StudentStats }>(`/students/${studentId}/answer`, {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }

  // ── Stats & Progress ────────────────────────────────────────

  async getStats(studentId: string): Promise<ApiResponse<StudentStats>> {
    return this.request<StudentStats>(`/students/${studentId}/stats`);
  }

  async getAchievements(studentId: string): Promise<ApiResponse<Achievement[]>> {
    return this.request<Achievement[]>(`/students/${studentId}/achievements`);
  }

  async getDailyChallenges(studentId: string): Promise<ApiResponse<DailyChallenge[]>> {
    return this.request<DailyChallenge[]>(`/students/${studentId}/challenges`);
  }

  async getRewardChests(studentId: string): Promise<ApiResponse<RewardChest[]>> {
    return this.request<RewardChest[]>(`/students/${studentId}/chests`);
  }

  // ── Parent Dashboard ────────────────────────────────────────

  async getChildProgress(childId: string): Promise<ApiResponse<ChildProgress>> {
    return this.request<ChildProgress>(`/parents/children/${childId}/progress`);
  }

  async getAllChildrenProgress(): Promise<ApiResponse<ChildProgress[]>> {
    return this.request<ChildProgress[]>('/parents/children/progress');
  }
}

export const apiClient = new ApiClient();
export default apiClient;