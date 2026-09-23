'use client';

import * as React from 'react';

interface UseFetchOptions {
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useFetch<T>(url: string, options?: UseFetchOptions): UseFetchResult<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [trigger, setTrigger] = React.useState(0);
  const enabled = options?.enabled ?? true;

  const refetch = React.useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  React.useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Something went wrong');
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, trigger, enabled]);

  return { data, error, isLoading, refetch };
}
