import { useCallback, useRef, useState } from "react";

/**
 * useAsyncAction
 * - Prevents double submit (ignores clicks while running)
 * - Gives you `loading` + `run(fn)`
 *
 * Usage:
 * const { loading, run } = useAsyncAction();
 * <button disabled={loading} onClick={() => run(() => apiCall())}>Save</button>
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const runningRef = useRef(false);

  const run = useCallback(async (fn) => {
    if (runningRef.current) return; // block double-click / double-submit
    runningRef.current = true;
    setLoading(true);

    try {
      const result = await fn();
      return result;
    } finally {
      runningRef.current = false;
      setLoading(false);
    }
  }, []);

  return { loading, run };
}
