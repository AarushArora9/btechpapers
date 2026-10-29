import React from 'react';
import { X, History, Trash2, Download, Archive, Calendar, FileText } from 'lucide-react';
import { DownloadHistoryItem } from '../types';
import { formatBytes } from '../data/mockRepository';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
  onRedownloadArchive: (item: DownloadHistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onRedownloadArchive,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md border-l border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#161b22] text-neutral-900 dark:text-neutral-100 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-base">Download History</h2>
              <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-xs font-mono text-neutral-500">
                {history.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Clear all download history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto py-4 divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
                  <Archive className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  No download history yet
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
                  Your generated ZIP archives and download records will be stored locally in this browser.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="py-3.5 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        <Archive className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{item.archiveName}</span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.timestamp)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.fileCount} PDFs</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatBytes(item.compressedBytes)}
                        </span>
                        <span className="text-neutral-400">({item.compressionRatio} savings)</span>
                      </div>

                      {/* File preview chips */}
                      <div className="mt-2 flex flex-wrap gap-1 max-h-16 overflow-hidden">
                        {item.fileNames.slice(0, 3).map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded bg-neutral-100 dark:bg-neutral-800/80 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 truncate max-w-[140px]"
                          >
                            <FileText className="h-2.5 w-2.5" />
                            <span className="truncate">{name}</span>
                          </span>
                        ))}
                        {item.fileNames.length > 3 && (
                          <span className="text-[10px] text-neutral-400 font-mono self-center">
                            +{item.fileNames.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onRedownloadArchive(item)}
                      className="shrink-0 rounded-md border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-50 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                      title="Re-generate and download archive"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 font-mono text-center">
            Stored in browser localStorage
          </div>
        </aside>
      </div>
    </div>
  );
};
