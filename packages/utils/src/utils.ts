import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function rafThrottle<T extends (...args: any[]) => void>(fn: T): T {
  let queued = false;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    lastArgs = args;
    if (!queued) {
      queued = true;
      requestAnimationFrame(() => {
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
        queued = false;
      });
    }
  };

  return throttled as T;
}