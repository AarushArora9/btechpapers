import { DownloadHistoryItem, DownloadMetrics } from '../types';

const STORAGE_KEY = 'doc_download_history_v1';

export function getDownloadHistory(): DownloadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDownloadToHistory(metrics: DownloadMetrics): DownloadHistoryItem {
  const history = getDownloadHistory();

  const newItem: DownloadHistoryItem = {
    id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    archiveName: metrics.archiveName,
    fileCount: metrics.fileCount,
    uncompressedBytes: metrics.uncompressedBytes,
    compressedBytes: metrics.compressedBytes,
    compressionRatio: metrics.compressionRatio,
    durationMs: metrics.durationMs,
    fileNames: metrics.fileNames,
  };

  // Keep up to 50 most recent archives
  const updated = [newItem, ...history].slice(0, 50);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage quota fallback
  }

  return newItem;
}

export function clearDownloadHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
