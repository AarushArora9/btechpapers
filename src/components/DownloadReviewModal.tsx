import React, { useMemo } from 'react';
import { DocItem } from '../types';
import { formatBytes } from '../data/mockRepository';
import {
  X,
  FileText,
  Check,
  Archive,
  Trash2,
  AlertCircle,
  GraduationCap,
  Calendar,
} from 'lucide-react';

interface DownloadReviewModalProps {
  isOpen: boolean;
  selectedFiles: DocItem[];
  onToggleSelect: (item: DocItem) => void;
  onClearSelection: () => void;
  onConfirmDownload: () => void;
  onClose: () => void;
  maxLimit?: number;
}

export const DownloadReviewModal: React.FC<DownloadReviewModalProps> = ({
  isOpen,
  selectedFiles,
  onToggleSelect,
  onClearSelection,
  onConfirmDownload,
  onClose,
  maxLimit = 30,
}) => {
  if (!isOpen) return null;

  const totalBytes = useMemo(() => {
    return selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [selectedFiles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-[#161b22] text-neutral-900 dark:text-neutral-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-neutral-900 dark:text-neutral-100">
                  Final Check: Selected Papers
                </h3>
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
                  {selectedFiles.length}/{maxLimit}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Review your list before creating the ZIP bundle. Uncheck any papers you don't need.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors -mr-1"
            title="Close review"
            aria-label="Close review modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sub-bar / Quick Actions */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/70 px-4 sm:px-5 py-2.5 text-xs text-neutral-600 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:text-neutral-400">
          <span className="font-mono">
            Estimated Total:{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">
              {formatBytes(totalBytes)}
            </strong>
          </span>

          {selectedFiles.length > 0 && (
            <button
              onClick={onClearSelection}
              className="flex items-center gap-1.5 font-medium text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 py-1 px-2 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors"
              title="Deselect all selected papers"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Deselect All</span>
            </button>
          )}
        </div>

        {/* Scrollable Checklist Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 p-2 sm:p-3">
          {selectedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="font-medium text-sm text-neutral-800 dark:text-neutral-200">
                No papers selected
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xs">
                You unchecked all items. Check at least one paper from the repository to create your ZIP bundle.
              </p>
            </div>
          ) : (
            selectedFiles.map((file) => (
              <label
                key={file.id}
                className="group flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors min-h-[56px] select-none"
              >
                {/* Left: Large Tick Box + File Info */}
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  {/* Large 22x22px Touch-friendly Checkbox container */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => onToggleSelect(file)}
                      className="sr-only peer"
                      aria-label={`Selected paper ${file.name}`}
                    />
                    {/* Custom Styled Large Checkbox Box (22x22px) with 44px tap buffer */}
                    <div className="h-5.5 w-5.5 rounded-md border-2 border-blue-600 bg-blue-600 dark:border-blue-500 dark:bg-blue-500 flex items-center justify-center text-white shadow-xs transition-transform active:scale-90 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="hidden sm:flex shrink-0">
                    <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />
                  </div>

                  {/* Name and Tags */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {file.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                      {file.semester && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>{file.semester}</span>
                        </span>
                      )}
                      {file.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{file.year}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: File Size */}
                <div className="shrink-0 text-right font-mono text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                  {formatBytes(file.size)}
                </div>
              </label>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors min-h-[44px]"
          >
            Back to Files
          </button>

          <button
            onClick={onConfirmDownload}
            disabled={selectedFiles.length === 0}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all min-h-[44px] shadow-sm ${
              selectedFiles.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98]'
                : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Archive className="h-4 w-4" />
            <span>
              {selectedFiles.length > 0
                ? `Confirm & Download (${selectedFiles.length} ${
                    selectedFiles.length === 1 ? 'Paper' : 'Papers'
                  })`
                : 'Select Papers to Download'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
