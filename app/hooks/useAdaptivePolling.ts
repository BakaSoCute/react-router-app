import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 30_000;

/**
 * Returns RTK Query pollingInterval: active interval when enabled + tab visible, else 0.
 */
export function useAdaptivePolling(enabled: boolean, intervalMs = DEFAULT_INTERVAL_MS): number {
  const [pollingInterval, setPollingInterval] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setPollingInterval(0);
      return;
    }

    const sync = () => {
      setPollingInterval(document.visibilityState === "visible" ? intervalMs : 0);
    };

    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [enabled, intervalMs]);

  return pollingInterval;
}
