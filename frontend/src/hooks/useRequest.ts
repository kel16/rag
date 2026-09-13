import { useState } from "react";

interface UseRequestResult<T, TArgs extends unknown[]> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  request: (...args: TArgs) => Promise<T>;
  reset: () => void;
}

export function useRequest<T, TArgs extends unknown[]>(
  requestFn: (...args: TArgs) => Promise<T>,
): UseRequestResult<T, TArgs> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function request(...args: TArgs): Promise<T> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestFn(...args);

      setData(result);

      return result;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error("Something went wrong.");

      setError(normalizedError);

      throw normalizedError;
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setData(null);
    setError(null);
    setIsLoading(false);
  }

  return {
    data,
    error,
    isLoading,
    request,
    reset,
  };
}
