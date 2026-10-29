import React from 'react';
import { X, FileText, Download, Calendar, Layers, Hash } from 'lucide-react';
import { DocItem } from '../types';
import { formatBytes } from '../data/mockRepository';

interface PdfPreviewModalProps {
  item: DocItem | null;
  onClose: () => void;
  onDownload: (item: DocItem) => void;
  isSelected: boolean;
  onToggleSelect: (item: DocItem) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  item,
  onClose,
  onDownload,
  isSelected,
  onToggleSelect,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#161b22] text-neutral-900 dark:text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500 dark:text-red-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <span className="text-[11px] font-mono font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {item.category || 'Documentation'}
            </span>
            <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 truncate">
              {item.name}
            </h3>
            <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500 truncate">
              {item.path}
            </p>
          </div>
        </div>

        {/* Document Metadata Strip */}
        <div className="my-5 grid grid-cols-3 gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-900/60 font-mono text-xs">
          <div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">File Size</div>
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              {formatBytes(item.size)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">Page Count</div>
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              {item.pageCount || 4} pages
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500">Modified</div>
            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
              {item.updatedAt}
            </div>
          </div>
        </div>

        {/* Abstract & Summary */}
        <div className="space-y-3 text-xs">
          <div>
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Document Abstract
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {item.summary ||
                ' '}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Latest Repository Commit
            </h4>
            <p className="font-mono text-neutral-500 dark:text-neutral-400 text-[11px] bg-neutral-100 dark:bg-neutral-900 p-2 rounded border border-neutral-200/60 dark:border-neutral-800">
              {item.lastCommit}
            </p>
          </div>
        </div>

        {/* 20MB Size Notice if applicable */}
        {item.size && item.size > 20 * 1024 * 1024 && (
          <div className="mt-4 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px]">
            This file ({formatBytes(item.size)}) is over 20 MB. Individual download is limited to 20 MB; please select it to download via ZIP bundle.
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item)}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
            />
            <span>Include in ZIP batch</span>
          </label>

          <div className="flex items-center gap-2">
            {item.size && item.size > 20 * 1024 * 1024 ? (
              <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                Available via ZIP batch (&gt;20MB)
              </span>
            ) : (
              <button
                onClick={() => onDownload(item)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
