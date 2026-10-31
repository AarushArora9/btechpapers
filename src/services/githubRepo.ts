import { CONFIG } from '../config';
import { DocItem } from '../types';
import { generateValidPdfBytes } from '../utils/pdfGenerator';
import { getCachedPdfBytes, setCachedPdfBytes } from '../utils/zipper';

interface GitTreeItem {
  path: string;
  mode?: string;
  type: 'blob' | 'tree';
  sha?: string;
  size?: number;
  url?: string;
}

// Version 3 cache key to immediately invalidate old caches containing source folders
const CACHE_KEY = 'btechpapers_git_tree_cache_v3';
const CACHE_TIME_KEY = 'btechpapers_git_tree_cache_time';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Directories and files from web application source code that must NEVER appear in the document explorer
const IGNORED_DIRECTORY_PREFIXES = [
  'src/',
  'src',
  'public/',
  'public',
  'dist/',
  'dist',
  'build/',
  'build',
  'node_modules/',
  'node_modules',
  '.git',
  '.github',
  '.vercel',
  '.next',
];

const IGNORED_ROOT_FILES = new Set([
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'vite.config.js',
  'vercel.json',
  'index.html',
  '.gitignore',
  '.env',
  '.env.example',
  '.env.local',
  'readme.md',
  'deploy.md',
  'metadata.json',
]);

/**
 * Builds a nested DocItem tree from flat git tree entries,
 * strictly filtering out any website source code or non-academic files/folders.
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

  // Helper to ensure an academic folder node exists
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

  // Process items: ONLY process valid PDF documents
  for (const item of items) {
    const rawPath = item.path.replace(/^\/+/, '');

    // Skip dotfiles, hidden files, or git internals
    if (rawPath.startsWith('.') || rawPath.includes('/.')) continue;

    // Skip all code, build, and node_modules paths
    const isIgnoredDir = IGNORED_DIRECTORY_PREFIXES.some(
      (prefix) => rawPath === prefix || rawPath.startsWith(`${prefix}/`) || rawPath.toLowerCase().startsWith(`${prefix.toLowerCase()}/`)
    );
    if (isIgnoredDir) continue;

    const segments = rawPath.split('/');
    const fileName = segments[segments.length - 1];

    // Skip root-level config files (e.g. package.json, vercel.json, etc.)
    if (IGNORED_ROOT_FILES.has(fileName.toLowerCase())) continue;

    // Strict rule: ONLY accept .pdf question paper files!
    // Non-PDF items (source code, tsx, css, json) and empty directory records are completely excluded.
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    if (!isPdf) continue;

    const folderPath = segments.slice(0, -1).join('/');

    // Track metadata tags: First segment is typically Year (e.g. "2024", "2023")
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

    // Create the folder branch strictly because it contains this valid PDF
    const parentFolder = getOrCreateFolder(folderPath);
    const fullPath = `/${rawPath}`;
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
        const cached = getCachedPdfBytes(rawCdnUrl);
        if (cached) return cached;

        try {
          const resp = await fetch(rawCdnUrl, { mode: 'cors' });
          if (resp.ok) {
            const buf = await resp.arrayBuffer();
            const bytes = new Uint8Array(buf);
            setCachedPdfBytes(rawCdnUrl, bytes);
            return bytes;
          }
        } catch {
          // Fall back to generated representation if network/CORS blocks
        }
        const generated = generateValidPdfBytes({
          title: fileName.replace(/\.pdf$/i, ''),
          category: semesterTag || 'B.Tech Paper',
          summary: `Examination question paper for ${fileName.replace(/\.pdf$/i, '')}`,
          pageCount: 3,
        });
        setCachedPdfBytes(rawCdnUrl, generated);
        return generated;
      },
    };

    parentFolder.children = parentFolder.children || [];
    parentFolder.children.push(fileItem);
    allFiles.push(fileItem);
  }

  // Recursive pruning of any empty folders that contain no PDFs
  const pruneEmptyFolders = (node: DocItem): boolean => {
    if (node.type === 'file') return true;
    if (!node.children || node.children.length === 0) return false;

    node.children = node.children.filter((child) => pruneEmptyFolders(child));
    return node.children.length > 0;
  };
  pruneEmptyFolders(root);

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
