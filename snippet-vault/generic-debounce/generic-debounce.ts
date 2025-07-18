import { useEffect, useRef } from 'react';

type Timer = ReturnType<typeof setTimeout>;
type AnyFunction = (...args: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Generic Debounce needs to accept any function type
 * @param fn any function type
 * @param delay in ms
 * @returns value or void
 */
// eslint-disable-line @typescript-eslint/no-explicit-any
const useGenericDebounce = <T extends AnyFunction, R = ReturnType<T>>(
  fn: T,
  delay: number,
  callback?: (result: R) => void
): T => {
  const timerRef = useRef<Timer | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounceFunc = ((...args: any[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const result = fn(...args);
      if (callback) {
        if (result instanceof Promise) {
          result.then((resolved: ReturnType<T>) => callback(resolved));
        } else {
          callback(result as unknown as R);
        }
      }
    }, delay);
  }) as T;

  return debounceFunc;
};

export default useGenericDebounce;
