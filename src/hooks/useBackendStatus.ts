import { useEffect, useState } from 'react';
import { backendStatus } from '../api/client';

/**
 * Polls the shared API connectivity flag until the first request has resolved,
 * so the sidebar indicator settles without forcing a global re-render.
 */
export function useBackendStatus(): ReturnType<typeof backendStatus> {
  const [status, setStatus] = useState(backendStatus);

  useEffect(() => {
    if (status !== 'unknown') return;
    const interval = window.setInterval(() => {
      const next = backendStatus();
      if (next !== 'unknown') {
        setStatus(next);
        window.clearInterval(interval);
      }
    }, 600);
    return () => window.clearInterval(interval);
  }, [status]);

  return status;
}