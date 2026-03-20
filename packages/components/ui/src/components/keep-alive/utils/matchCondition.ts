import type { MatchPattern, MatchPatternList } from '../types';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isMatchPattern(value: unknown): value is MatchPattern {
  return isString(value) || isRegExp(value);
}

export function isMatchPatternList(value: unknown): value is MatchPatternList {
  if (isArray(value)) {
    return value.every(isMatchPattern);
  }
  return isMatchPattern(value);
}

function matchPattern(pattern: MatchPattern, key: string): boolean {
  if (typeof pattern === 'string') {
    return pattern === key;
  }
  if (pattern instanceof RegExp) {
    return pattern.test(key);
  }
  return false;
}

export function matchCondition(
  key: string,
  includes?: MatchPatternList,
  excludes?: MatchPatternList,
): boolean {
  const isExcluded = checkExcludes(key, excludes);
  if (isExcluded) {
    return false;
  }

  if (includes === undefined) {
    return true;
  }

  return checkIncludes(key, includes);
}

function checkExcludes(key: string, excludes?: MatchPatternList): boolean {
  if (excludes === undefined) {
    return false;
  }

  if (isArray(excludes)) {
    return (excludes as MatchPattern[]).some(
      (pattern: MatchPattern) => matchPattern(pattern, key),
    );
  }

  return matchPattern(excludes, key);
}

function checkIncludes(key: string, includes: MatchPatternList): boolean {
  if (isArray(includes)) {
    return (includes as MatchPattern[]).some(
      (pattern: MatchPattern) => matchPattern(pattern, key),
    );
  }

  return matchPattern(includes, key);
}
