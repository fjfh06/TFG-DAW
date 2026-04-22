import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage a loading state with a minimum duration.
 * Useful to avoid "flashing" loaders when requests are very fast.
 * 
 * @param initialState Initial loading state
 * @param minDuration Minimum duration in milliseconds (default 1000ms)
 * @returns [displayLoading, setIsLoading, actualLoading]
 */
export const useLoading = (initialState: boolean = false, minDuration: number = 1000) => {
  const [actualLoading, setActualLoading] = useState(initialState);
  const [displayLoading, setDisplayLoading] = useState(initialState);
  const startTime = useRef<number | null>(initialState ? Date.now() : null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setIsLoading = useCallback((value: boolean) => {
    setActualLoading(value);
  }, []);

  useEffect(() => {
    if (actualLoading) {
      // If we are starting to load
      if (timerRef.current) clearTimeout(timerRef.current);
      setDisplayLoading(true);
      startTime.current = Date.now();
    } else {
      // If we finished loading
      const now = Date.now();
      const elapsed = startTime.current ? now - startTime.current : minDuration;
      const remaining = Math.max(0, minDuration - elapsed);

      if (remaining > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayLoading(false);
          startTime.current = null;
        }, remaining);
      } else {
        setDisplayLoading(false);
        startTime.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [actualLoading, minDuration]);

  return [displayLoading, setIsLoading, actualLoading] as const;
};
