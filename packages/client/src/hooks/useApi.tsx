import { useState, useCallback, type ReactNode } from 'react';
import type { ApiResponse } from '../types';

// ── State Type ──────────────────────────────────────────────

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// ── Base API Hook ────────────────────────────────────────────

export function useApi<T>(initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      if (result.success && result.data !== undefined) {
        setData(result.data);
        setLoading(false);
        return result.data;
      } else {
        const errorMsg = result.error || 'An unexpected error occurred';
        setError(errorMsg);
        setLoading(false);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      setLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

// ── Loading / Error / Empty Display Components ──────────────

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-5xl mb-4 animate-spin-slow">🧮</div>
      <p className="text-gray-500 font-display font-semibold">{message}</p>
    </div>
  );
}

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="kid-card text-center border-2 border-red-200 bg-red-50 max-w-md mx-auto my-8">
      <div className="text-5xl mb-3">😅</div>
      <h3 className="font-display font-bold text-gray-800 mb-2">Oops!</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="kid-button-primary px-6 py-2 text-sm">
          🔄 Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📭', message = 'Nothing here yet!', action }: { icon?: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-gray-500 font-display font-semibold text-lg mb-4">{message}</p>
      {action}
    </div>
  );
}