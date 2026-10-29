import { CONFIG } from '../config';
import { DocItem } from '../types';
import { generateValidPdfBytes } from '../utils/pdfGenerator';

interface GitTreeItem {
  path: string;
  mode?: string;
  type: 'blob' | 'tree';
  sha?: string;
  size?: number;
  url?: string;
}

const CACHE_KEY = 'btechpapers_git_tree_cache_v2';
const CACHE_TIME_KEY = 'btechpapers_git_tree_cache_time';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

/**
 * Builds a nested DocItem tree from flat git tree entries
 */
export function buildHierarchyFromGitTree(items: Array<{ path: string; size?: number; type?: string }>): {
  root: DocItem;
  allFiles: DocItem[];
  years: string[];
  semesters: string[];
} {
  const root: DocItem = {
    id: 'root',
    name: 'btechpapers',
    type: 'folder',
    path: '/',
    children: [],
  };

  const allFiles: DocItem[] = [];
  const yearsSet = new Set<string>();
  const semestersSet = new Set<string>();

  // Map to hold folder references by normalized path
  const folderMap = new Map<string, DocItem>();
  folderMap.set('/', root);

  // Helper to ensure a folder node exists
  const getOrCreateFolder = (folderPath: string): DocItem => {
    const normalized = folderPath === '' || folderPath === '/' ? '/' : `/${folderPath.replace(/^\/+|\/+$/g, '')}`;
    if (folderMap.has(normalized)) {
      return folderMap.get(normalized)!;
    }

    const segments = normalized.split('/').filter(Boolean);
    let currentPath = '';
    let currentParent = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      if (!folderMap.has(currentPath)) {
        const newFolder: DocItem = {
          id: `folder-${currentPath}`,
          name: segment,
          type: 'folder',
          path: currentPath,
          children: [],
        };
        currentParent.children = currentParent.children || [];
        currentParent.children.push(newFolder);
        folderMap.set(currentPath, newFolder);
      }
      currentParent = folderMap.get(currentPath)!;
    }

    return currentParent;
  };

  // Process items
  for (const item of items) {
    const rawPath = item.path;
    // Skip git internal files
    if (rawPath.startsWith('.') || rawPath.includes('/.')) continue;

    const segments = rawPath.split('/');
    const fileName = segments[segments.length - 1];
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const folderPath = segments.slice(0, -1).join('/');

    // Track metadata tags
    // First segment is typically Year (e.g. "2024", "2023")
    if (segments.length > 0 && /^\d{4}$/.test(segments[0])) {
      yearsSet.add(segments[0]);
    }

    // Find semester segment (e.g. "I Sem", "III Sem", "5th Sem")
    let semesterTag: string | undefined;
    for (const seg of segments) {
      if (/(?:I{1,3}|IV|V|VI{1,3}|VIII|\d+(?:st|nd|rd|th)?)\s*Sem/i.test(seg)) {
        semesterTag = seg;
        semestersSet.add(seg);
        break;
      }
    }

    // Exam session tag
    let sessionTag: string | undefined;
    if (segments.length >= 2) {
      sessionTag = segments[1];
    }

    if (isPdf) {
      const parentFolder = getOrCreateFolder(folderPath);
      const fullPath = `/${rawPath.replace(/^\/+/, '')}`;
      const rawCdnUrl = `https://raw.githubusercontent.com/${CONFIG.repositoryFullName}/${CONFIG.branch}/${encodeURI(rawPath)}`;

      // Extract subject code if present (e.g. (MAT 1151), (ARC 14-107))
      const codeMatch = fileName.match(/\(([A-Z]{2,4}[\s-]?\d{3,5}[A-Z]?)\)/i);
      const subjectCode = codeMatch ? codeMatch[1].trim() : undefined;

      const fileItem: DocItem = {
        id: `file-${rawPath}`,
        name: fileName,
        type: 'file',
        path: fullPath,
        size: item.size || 65000,
        year: segments.length > 0 && /^\d{4}$/.test(segments[0]) ? segments[0] : undefined,
        session: sessionTag,
        semester: semesterTag,
        subjectCode,
        rawUrl: rawCdnUrl,
        downloadUrl: rawCdnUrl,
        category: semesterTag || 'Question Paper',
        summary: `B.Tech University Examination Paper (${semesterTag || ''} - ${segments[0] || ''})`,
        contentGenerator: async () => {
          // Attempt to fetch real binary bytes directly from GitHub Raw CDN
          try {
            const resp = await fetch(rawCdnUrl, { mode: 'cors' });
            if (resp.ok) {
              const buf = await resp.arrayBuffer();
              return new Uint8Array(buf);
            }
          } catch {
            // Fall back to generated representation if network/CORS blocks
          }
          return generateValidPdfBytes({
            title: fileName.replace(/\.pdf$/i, ''),
            category: semesterTag || 'B.Tech Paper',
            summary: `Examination question paper for ${fileName.replace(/\.pdf$/i, '')}`,
            pageCount: 3,
          });
        },
      };

      parentFolder.children = parentFolder.children || [];
      parentFolder.children.push(fileItem);
      allFiles.push(fileItem);
    } else {
      // It's a directory
      getOrCreateFolder(rawPath);
    }
  }

  // Sort children: folders first alphabetically, then files
  const sortNode = (node: DocItem) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
      node.children.forEach(sortNode);
    }
  };
  sortNode(root);

  // Natural sort years descending
  const sortedYears = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));

  // Natural sort semesters
  const semOrder: Record<string, number> = {
    'i sem': 1,
    'ii sem': 2,
    'iii sem': 3,
    'iv sem': 4,
    'v sem': 5,
    'vi sem': 6,
    'vii sem': 7,
    'viii sem': 8,
  };

  const sortedSemesters = Array.from(semestersSet).sort((a, b) => {
    const oA = semOrder[a.toLowerCase()] || 99;
    const oB = semOrder[b.toLowerCase()] || 99;
    if (oA !== oB) return oA - oB;
    return a.localeCompare(b);
  });

  return {
    root,
    allFiles,
    years: sortedYears,
    semesters: sortedSemesters,
  };
}

/**
 * Fetches the GitHub tree live with in-memory & sessionStorage cache,
 * falling back to initial_tree.json or embedded data when rate-limited.
 */
export async function fetchRepositoryTree(forceRefresh: boolean = false): Promise<{
  root: DocItem;
  allFiles: DocItem[];
  years: string[];
  semesters: string[];
  isLive: boolean;
}> {
  // Check sessionStorage cache unless forceRefresh requested
  if (!forceRefresh && typeof window !== 'undefined') {
    try {
      const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
      const cachedData = sessionStorage.getItem(CACHE_KEY);

      if (cachedTime && cachedData && Date.now() - parseInt(cachedTime, 10) < CACHE_TTL_MS) {
        const parsed = JSON.parse(cachedData);
        return {
          ...buildHierarchyFromGitTree(parsed),
          isLive: true,
        };
      }
    } catch {
      // Ignore cache parse failures
    }
  }

  // Attempt live GitHub Git Trees API call
  try {
    const apiUrl = `https://api.github.com/repos/${CONFIG.repositoryFullName}/git/trees/${CONFIG.branch}?recursive=1`;
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.tree) && data.tree.length > 0) {
        const compact = data.tree.map((item: GitTreeItem) => ({
          path: item.path,
          size: item.size || 0,
          type: item.type,
        }));

        // Cache in sessionStorage
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(compact));
            sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
          } catch {
            // Storage quota limit fallback
          }
        }

        return {
          ...buildHierarchyFromGitTree(compact),
          isLive: true,
        };
      }
    }
  } catch (err) {
    console.warn('Live GitHub API fetch failed, loading fallback index:', err);
  }

  // Fallback: load pre-indexed initial_tree.json
  try {
    const fallbackRes = await fetch('./initial_tree.json');
    if (fallbackRes.ok) {
      const tuples: Array<[string, number]> = await fallbackRes.json();
      const items = tuples.map(([path, size]) => ({
        path,
        size,
        type: path.endsWith('.pdf') ? 'blob' : 'tree',
      }));
      return {
        ...buildHierarchyFromGitTree(items),
        isLive: false,
      };
    }
  } catch (err) {
    console.warn('Fallback tree load failed:', err);
  }

  // Final emergency structure if offline and initial_tree unreachable
  return {
    root: { id: 'root', name: 'btechpapers', type: 'folder', path: '/', children: [] },
    allFiles: [],
    years: ['2025', '2024', '2023', '2022', '2021', '2020'],
    semesters: ['I Sem', 'III Sem', 'V Sem', 'VII Sem'],
    isLive: false,
  };
}
