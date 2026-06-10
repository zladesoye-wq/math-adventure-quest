import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import apiClient from '../api/client';
import type { StudentStats, World, Achievement, DailyChallenge, RewardChest, MathProblem } from '../types';

// ── Student Stats ────────────────────────────────────────────

export function useStudentStats(studentId: string | undefined) {
  const { data, loading, error, execute } = useApi<StudentStats>();

  const fetch = useCallback(() => {
    if (studentId) {
      execute(() => apiClient.getStats(studentId));
    }
  }, [studentId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats: data, loading, error, refetch: fetch };
}

// ── Student Worlds ───────────────────────────────────────────

export function useStudentWorlds(studentId: string | undefined) {
  const { data, loading, error, execute } = useApi<World[]>();

  const fetch = useCallback(() => {
    if (studentId) {
      execute(() => apiClient.getWorlds(studentId));
    }
  }, [studentId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { worlds: data, loading, error, refetch: fetch };
}

// ── Single World ─────────────────────────────────────────────

export function useWorld(studentId: string | undefined, worldId: string | undefined) {
  const { data, loading, error, execute } = useApi<World>();

  const fetch = useCallback(() => {
    if (studentId && worldId) {
      execute(() => apiClient.getWorld(studentId, worldId));
    }
  }, [studentId, worldId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { world: data, loading, error, refetch: fetch };
}

// ── Achievements ─────────────────────────────────────────────

export function useAchievements(studentId: string | undefined) {
  const { data, loading, error, execute } = useApi<Achievement[]>();

  const fetch = useCallback(() => {
    if (studentId) {
      execute(() => apiClient.getAchievements(studentId));
    }
  }, [studentId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { achievements: data, loading, error, refetch: fetch };
}

// ── Daily Challenges ─────────────────────────────────────────

export function useDailyChallenges(studentId: string | undefined) {
  const { data, loading, error, execute } = useApi<DailyChallenge[]>();

  const fetch = useCallback(() => {
    if (studentId) {
      execute(() => apiClient.getDailyChallenges(studentId));
    }
  }, [studentId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { challenges: data, loading, error, refetch: fetch };
}

// ── Reward Chests ────────────────────────────────────────────

export function useRewardChests(studentId: string | undefined) {
  const { data, loading, error, execute } = useApi<RewardChest[]>();

  const fetch = useCallback(() => {
    if (studentId) {
      execute(() => apiClient.getRewardChests(studentId));
    }
  }, [studentId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { chests: data, loading, error, refetch: fetch };
}

// ── Math Problem ─────────────────────────────────────────────

export function useProblem(studentId: string | undefined, worldId: string | undefined, levelId: string | undefined) {
  const { data, loading, error, execute } = useApi<MathProblem>();

  const fetch = useCallback(() => {
    if (studentId && worldId && levelId) {
      execute(() => apiClient.getProblem(studentId, worldId, levelId));
    }
  }, [studentId, worldId, levelId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { problem: data, loading, error, refetch: fetch };
}

// ── Submit Answer ────────────────────────────────────────────

export function useSubmitAnswer() {
  const { data, loading, error, execute } = useApi<{ correct: boolean; xpEarned: number; coinsEarned: number; newStats: StudentStats }>();

  const submit = useCallback(async (
    studentId: string,
    result: { problemId: string; answerGiven: number; timeTaken: number; hintsUsed: number }
  ) => {
    return execute(() => apiClient.submitAnswer(studentId, {
      ...result,
      studentId,
      correct: false, // server will determine
      timestamp: new Date().toISOString(),
    }));
  }, [execute]);

  return { result: data, loading, error, submit };
}