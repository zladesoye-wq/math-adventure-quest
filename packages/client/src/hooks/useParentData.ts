import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import apiClient from '../api/client';
import type { ChildProgress, Student } from '../types';

// ── Child Progress ───────────────────────────────────────────

export function useChildProgress(childId: string | undefined) {
  const { data, loading, error, execute } = useApi<ChildProgress>();

  const fetch = useCallback(() => {
    if (childId) {
      execute(() => apiClient.getChildProgress(childId));
    }
  }, [childId, execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { progress: data, loading, error, refetch: fetch };
}

// ── All Children Progress ────────────────────────────────────

export function useAllChildrenProgress() {
  const { data, loading, error, execute } = useApi<ChildProgress[]>();

  const fetch = useCallback(() => {
    execute(() => apiClient.getAllChildrenProgress());
  }, [execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { children: data, loading, error, refetch: fetch };
}

// ── Students List (for parent) ───────────────────────────────

export function useStudents() {
  const { data, loading, error, execute } = useApi<Student[]>();

  const fetch = useCallback(() => {
    execute(() => apiClient.getStudents());
  }, [execute]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { students: data, loading, error, refetch: fetch };
}