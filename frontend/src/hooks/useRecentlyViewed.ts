import { useEffect, useState } from "react";
import { RECENTLY_VIEWED_STORAGE_KEY, RECENTLY_VIEWED_MAX } from "../lib/constants";

function readSlugs(): string[] {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeSlugs(slugs: string[]): void {
  localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(slugs));
}

/** Call this once a product detail page has loaded a product, to record it in the "recently viewed" list. */
export function recordRecentlyViewed(slug: string): void {
  const existing = readSlugs().filter((s) => s !== slug);
  const next = [slug, ...existing].slice(0, RECENTLY_VIEWED_MAX);
  writeSlugs(next);
}

/** Returns the recently-viewed product slugs (most-recent first), optionally excluding one (e.g. the current product). */
export function useRecentlyViewed(excludeSlug?: string): string[] {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readSlugs().filter((s) => s !== excludeSlug));
  }, [excludeSlug]);

  return slugs;
}
