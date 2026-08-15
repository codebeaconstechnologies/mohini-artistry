export function nowMs(): number {
  return Date.now();
}

/** Converts a snake_case D1 row into a camelCase object (shallow). */
export function toCamel<T extends Record<string, unknown>>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camelKey] = value;
  }
  return out as T;
}

export function toCamelList<T extends Record<string, unknown>>(
  rows: Record<string, unknown>[]
): T[] {
  return rows.map((r) => toCamel<T>(r));
}
