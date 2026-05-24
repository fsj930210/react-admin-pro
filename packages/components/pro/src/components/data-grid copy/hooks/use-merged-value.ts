import { useMemo } from 'react';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge<T>(defaultVal: T, userVal: Partial<T>): T {
  if (!isPlainObject(defaultVal) || !isPlainObject(userVal)) {
    return (userVal ?? defaultVal) as T;
  }

  const result = { ...defaultVal } as Record<string, unknown>;

  for (const key of Object.keys(userVal)) {
    const defaultKey = (defaultVal as Record<string, unknown>)[key];
    const userKey = (userVal as Record<string, unknown>)[key];

    if (userKey === undefined) continue;

    if (isPlainObject(defaultKey) && isPlainObject(userKey)) {
      result[key] = deepMerge(defaultKey, userKey);
    } else {
      result[key] = userKey;
    }
  }

  return result as T;
}

export function useMergedValue<T>(defaultValue: T, userValue?: Partial<T>): T {
  return useMemo(() => {
    if (!userValue) {
      return defaultValue;
    }
    return deepMerge(defaultValue, userValue);
  }, [defaultValue, userValue]);
}
