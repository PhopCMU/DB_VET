interface ProgressSimulator {
  start: () => void;
  stop: () => void;
  waitForCompletion: () => Promise<void>;
}

export const createProgressSimulator = (
  setUploadProgress: (progress: number) => void,
  duration: number = 2000
): ProgressSimulator => {
  let intervalId: number | null = null;
  let isRunning = false;
  let resolveCompletion: (() => void) | null = null;

  let waitForCompletionPromise: Promise<void> = Promise.resolve();

  const start = () => {
    if (isRunning) return;

    isRunning = true;
    const startTime = Date.now();
    setUploadProgress(0);

    waitForCompletionPromise = new Promise<void>((resolve) => {
      resolveCompletion = resolve;
    });

    intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min(Math.round((elapsed / duration) * 100), 100);
      setUploadProgress(percent);

      if (percent >= 100) {
        stop(); // จะเรียก resolve ด้วย
        setUploadProgress(0);
      }
    }, 500);
  };

  const stop = () => {
    if (!isRunning) return;

    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }

    isRunning = false;
    setUploadProgress(100);
    resolveCompletion?.();
  };

  const waitForCompletion = () => waitForCompletionPromise;

  return { start, stop, waitForCompletion };
};
