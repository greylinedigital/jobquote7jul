import { useState, useCallback } from 'react';
import { handleError } from '@/lib/errorHandler';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncOperation<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  context?: string
): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log(`Starting async operation: ${context || 'unknown'}`);
      const result = await asyncFunction(...args);
      console.log(`Async operation completed: ${context || 'unknown'}`);
      
      setState({
        data: result,
        loading: false,
        error: null,
      });
      
      return result;
    } catch (error) {
      console.error(`Async operation failed: ${context || 'unknown'}`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      
      // Don't show alert here, let the component handle it
      return null;
    }
  }, [asyncFunction, context]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
  };
}