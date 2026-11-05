// Opt-in timing for the course route: PERF_TIMING=1 npm run dev prints `[perf] <label> <ms>` per data step.
// scripts/dev/perf/RESULTS.md says how to read it. Costs nothing when the variable is unset.
export async function timed<T>(label: string, fn: () => Promise<T> | T): Promise<T> {
  if (process.env.PERF_TIMING !== '1') return fn()
  const t = performance.now()
  try {
    return await fn()
  } finally {
    console.log(`[perf] ${label} ${(performance.now() - t).toFixed(1)}ms`)
  }
}
