/**
 * Core type definitions for B.Tech Papers Repository
 */

export type ItemType = 'file' | 'folder';

export interface DocItem {
  id: string;
  name: string;
  type: ItemType;
  path: string;
  size?: number; // In bytes
  lastCommit?: string;
  updatedAt?: string;
  pageCount?: number;
  category?: string;
  summary?: string;
  year?: string;
  session?: string;
  semester?: string;
  subjectCode?: string;
  rawUrl?: string;
  downloadUrl?: string;
  children?: DocItem[];
  contentGenerator?: () => Promise<Uint8Array> | Uint8Array;
}

export interface BreadcrumbSegment {
  name: string;
  path: string;
}

export interface DownloadHistoryItem {
  id: string;
  timestamp: number;
  archiveName: string;
  fileCount: number;
  uncompressedBytes: number;
  compressedBytes: number;
  compressionRatio: string;
  durationMs: number;
  fileNames: string[];
}

export interface DownloadMetrics {
  archiveName: string;
  fileCount: number;
  fileNames: string[];
  uncompressedBytes: number;
  compressedBytes: number;
  uncompressedMb: string;
  compressedMb: string;
  compressionRatio: string;
  durationMs: number;
  speedMBps: string;
}

export type ThemeMode = 'dark' | 'light';

export interface FilterState {
  year: string; // 'all' or year like '2024'
  semester: string; // 'all' or semester like 'I Sem'
}
