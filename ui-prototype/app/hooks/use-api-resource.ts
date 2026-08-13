"use client";
import { useCallback, useEffect, useState } from "react";
export function useApiResource<T>(loader: () => Promise<T>, resourceKey: string) {
  const [nonce, setNonce] = useState(0);
  const loadKey = `${resourceKey}:${nonce}`;
  const [state, setState] = useState<{ key: string; data: T | null; error: Error | null }>({ key: "", data: null, error: null });
  useEffect(() => {
    let active = true;
    Promise.resolve().then(loader).then((data) => { if (active) setState({ key: loadKey, data, error: null }); }).catch((value) => { if (active) setState({ key: loadKey, data: null, error: value instanceof Error ? value : new Error("Không tải được dữ liệu") }); });
    return () => { active = false; };
    // loader intentionally follows resourceKey; callers do not need to memoize it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey]);
  const reload = useCallback(() => setNonce((value) => value + 1), []);
  return { data: state.data, error: state.error, loading: state.key !== loadKey, reload };
}
