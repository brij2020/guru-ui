"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { apiErrorHandler, ApiError } from "@/lib/apiErrorHandler";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface ApiContextValue {
  getState: <T>(key: string) => ApiState<T>;
  execute: <T>(key: string, promise: Promise<T>) => Promise<T | null>;
  reset: (key: string) => void;
  resetAll: () => void;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, ApiState<unknown>>>({});

  const getState = useCallback(
    <T,>(key: string): ApiState<T> => {
      return (states[key] as ApiState<T>) || { data: null, loading: false, error: null };
    },
    [states]
  );

  const execute = useCallback(
    async <T,>(key: string, promise: Promise<T>): Promise<T | null> => {
      setStates((prev) => ({
        ...prev,
        [key]: { data: null, loading: true, error: null },
      }));

      try {
        const data = await promise;
        setStates((prev) => ({
          ...prev,
          [key]: { data, loading: false, error: null },
        }));
        return data;
      } catch (error) {
        const parsedError = apiErrorHandler.parseError(error);
        setStates((prev) => ({
          ...prev,
          [key]: { data: null, loading: false, error: parsedError },
        }));
        return null;
      }
    },
    []
  );

  const reset = useCallback((key: string) => {
    setStates((prev) => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  const resetAll = useCallback(() => {
    setStates({});
  }, []);

  return (
    <ApiContext.Provider value={{ getState, execute, reset, resetAll }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi<T>(
  key: string,
  promise?: Promise<T>
): ApiState<T> & { refetch: () => void; isLoading: boolean; hasError: boolean } {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within ApiProvider");
  }

  const state = context.getState<T>(key);
  const refetch = useCallback(() => {
    if (promise) {
      context.execute(key, promise);
    }
  }, [context, key, promise]);

  return {
    ...state,
    refetch,
    isLoading: state.loading,
    hasError: !!state.error,
  };
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
): {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: () => Promise<T | null>;
} {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const parsedError = apiErrorHandler.parseError(error);
      setState({ data: null, loading: false, error: parsedError });
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, execute };
}

export default ApiProvider;
