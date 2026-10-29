import Fuse from 'fuse.js';
import { DocItem, FilterState } from '../types';

export interface SearchResult {
  item: DocItem;
  score: number;
  matchRanges: [number, number][]; // Start and end index for highlighting in name
}

// Cached Fuse instance
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
 */
export function searchPapers(
  query: string,
  items: DocItem[],
  filter?: FilterState
): SearchResult[] {
  let targetItems = items;

  // Apply Year filter if selected
  if (filter && filter.year && filter.year !== 'all') {
    targetItems = targetItems.filter((item) => item.year === filter.year);
  }

  // Apply Semester filter if selected
  if (filter && filter.semester && filter.semester !== 'all') {
    targetItems = targetItems.filter((item) => item.semester === filter.semester);
  }

  const cleanQuery = query.trim();

  // If no search query, return filtered items directly (sorted)
  if (!cleanQuery) {
    if (filter && (filter.year !== 'all' || filter.semester !== 'all')) {
      return targetItems.map((item) => ({
        item,
        score: 0,
        matchRanges: [],
      }));
    }
    return [];
  }

  const fuse = getFuseInstance(targetItems);
  const fuseResults = fuse.search(cleanQuery);

  return fuseResults.map((res) => {
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

    return {
      item: res.item,
      score: 1 - (res.score || 0), // Invert so higher is better
      matchRanges,
    };
  });
}
