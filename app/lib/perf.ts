/** Dev-only performance marks for auth bootstrap and channels page. */

const PREFIX = 'tsundere';

export function perfMark(name: string): void {
  if (!import.meta.env.DEV || typeof performance === 'undefined') return;
  performance.mark(`${PREFIX}:${name}`);
}

export function perfMeasure(name: string, startMark: string, endMark?: string): void {
  if (!import.meta.env.DEV || typeof performance === 'undefined') return;
  const start = `${PREFIX}:${startMark}`;
  const end = endMark ? `${PREFIX}:${endMark}` : undefined;
  try {
    performance.measure(`${PREFIX}:${name}`, start, end);
    const entries = performance.getEntriesByName(`${PREFIX}:${name}`);
    const last = entries[entries.length - 1];
    if (last) {
      console.debug(`[perf] ${name}: ${Math.round(last.duration)}ms`);
    }
  } catch {
    /* marks may be missing on first paint */
  }
}

export function perfClearMarks(...names: string[]): void {
  if (!import.meta.env.DEV || typeof performance === 'undefined') return;
  for (const name of names) {
    performance.clearMarks(`${PREFIX}:${name}`);
    performance.clearMeasures(`${PREFIX}:${name}`);
  }
}
