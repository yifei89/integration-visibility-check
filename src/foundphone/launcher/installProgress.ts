// App content is already bundled; this represents the local installation phase.
export function runInstallProgress(
  progress: (value: number) => void,
  complete: () => void,
) {
  let value = 0;
  progress(value);
  const timer = setInterval(() => {
    value = Math.min(100, value + 5);
    progress(value);
    if (value === 100) {
      clearInterval(timer);
      complete();
    }
  }, 100);
  return () => clearInterval(timer);
}