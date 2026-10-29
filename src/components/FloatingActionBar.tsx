import React from 'react';
import { Archive, X, AlertCircle } from 'lucide-react';
import { DocItem } from '../types';
import { formatBytes } from '../data/mockRepository';

interface FloatingActionBarProps {
  selectedFiles: DocItem[];
  onClear: () => void;
  onDownloadZip: () => void;
  maxLimit: number;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  selectedFiles,
  onClear,
  onDownloadZip,
  maxLimit,
}) => {
  const count = selectedFiles.length;
  if (count === 0) return null;

  const totalBytes = selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const isAtLimit = count >= maxLimit;

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-neutral-300 bg-neutral-900/95 p-3 text-white shadow-xl backdrop-blur-md dark:border-neutral-700 dark:bg-[#161b22]/95">
        {/* Count and Size summary */}
        <div className="flex items-center gap-3 text-xs w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="flex h-5 items-center rounded-md bg-blue-500/20 px-2 font-mono text-[11px] font-semibold text-blue-400 border border-blue-500/30">
              {count} / {maxLimit}
            </span>
            <span className="font-medium text-neutral-200">
              {count === 1 ? 'PDF selected' : 'PDFs selected'}
            </span>
          </div>

          <span className="text-neutral-500 font-mono">·</span>

          <span className="font-mono text-neutral-300 tabular-nums text-[11px]">
            {formatBytes(totalBytes)}
          </span>

          {isAtLimit && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono ml-1">
              <AlertCircle className="h-3 w-3" />
              <span>Limit reached</span>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={onDownloadZip}
            className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Download ZIP ({count})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
