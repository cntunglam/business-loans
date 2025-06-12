export function hasNestedProperty<T extends Record<string, unknown>, K extends string[]>(
  obj: T,
  ...keys: K
): obj is T & {
  [P in K[number]]: Record<string, string>;
} {
  let current: unknown = obj;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null || !(key in (current as Record<string, string>))) {
      return false;
    }
    current = (current as Record<string, string>)[key];
  }

  return true;
}
