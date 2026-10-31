import Fuse from 'fuse.js';
import { DocItem, FilterState } from '../types';

export interface SearchResult {
  item: DocItem;
  score: number;
  matchRanges: [number, number][]; // Start and end index for highlighting in name
}

// Cached Fuse instance for master items list
let cachedFuse: Fuse<DocItem> | null = null;
let lastItemsRef: DocItem[] | null = null;

function getFuseInstance(items: DocItem[]): Fuse<DocItem> {
  if (cachedFuse && lastItemsRef === items) {
    return cachedFuse;
  }

  cachedFuse = new Fuse(items, {
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'subjectCode', weight: 0.25 },
      { name: 'semester', weight: 0.15 },
      { name: 'year', weight: 0.1 },
      { name: 'path', weight: 0.1 },
    ],
    threshold: 0.38,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
  });

  lastItemsRef = items;
  return cachedFuse;
}

/**
 * Fuse.js fuzzy search with filter state support (year and semester filters)
 * Optimised to use a persistent pre-indexed Fuse instance so searches execute in ~2ms.
 */
export function searchPapers(
  query: string,
  items: DocItem[],
  filter?: FilterState
): SearchResult[] {
  const cleanQuery = query.trim();
  const hasYearFilter = filter && filter.year && filter.year !== 'all';
  const hasSemesterFilter = filter && filter.semester && filter.semester !== 'all';

  // If no search query, return filtered items directly
  if (!cleanQuery) {
    if (hasYearFilter || hasSemesterFilter) {
      let filtered = items;
      if (hasYearFilter) {
        filtered = filtered.filter((i) => i.year === filter.year);
      }
      if (hasSemesterFilter) {
        filtered = filtered.filter((i) => i.semester === filter.semester);
      }
      return filtered.map((item) => ({
        item,
        score: 1,
        matchRanges: [],
      }));
    }
    return [];
  }

  // Use persistent master index - never rebuilds index on keystroke
  const fuse = getFuseInstance(items);
  const fuseResults = fuse.search(cleanQuery);

  const results: SearchResult[] = [];
  for (const res of fuseResults) {
    const item = res.item;

    // Fast O(1) property check for filters
    if (hasYearFilter && item.year !== filter.year) continue;
    if (hasSemesterFilter && item.semester !== filter.semester) continue;

    const matchRanges: [number, number][] = [];
    if (res.matches) {
      for (const m of res.matches) {
        if (m.key === 'name' && m.indices) {
          for (const [start, end] of m.indices) {
            matchRanges.push([start, end + 1]);
          }
        }
      }
    }

    results.push({
      item,
      score: 1 - (res.score || 0),
      matchRanges,
    });
  }

  return results;
}
