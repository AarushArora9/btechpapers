import React from 'react';
import { Archive, CheckCircle2, Loader2, X } from 'lucide-react';
import { ZipProgressInfo } from '../utils/zipper';
import { DownloadMetrics } from '../types';
import { AutoScrollText } from './AutoScrollText';

interface ZipProgressModalProps {
  isOpen: boolean;
  progress: ZipProgressInfo | null;
  completedMetrics: DownloadMetrics | null;
  onClose: () => void;
  onCancel?: () => void;
}

export const ZipProgressModal: React.FC<ZipProgressModalProps> = ({
  isOpen,
  progress,
  completedMetrics,
  onClose,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isCompleted = progress?.state === 'completed' || !!completedMetrics;
  const percent = progress?.percent ?? (isCompleted ? 100 : 0);

  const handleDismiss = () => {
    if (isCompleted) {
      onClose();
    } else if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#161b22] text-neutral-900 dark:text-neutral-100">
        {/* Cross / Close button always visible to allow canceling anytime */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 rounded-md p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isCompleted ? 'Close' : 'Cancel archive creation'}
          aria-label={isCompleted ? 'Close modal' : 'Cancel compression'}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pr-6">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Archive className="h-5 w-5 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
              {isCompleted ? 'Archive Ready' : 'Preparing Question Papers'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {isCompleted
                ? 'Your papers have been packaged and downloaded.'
                : 'Bundling your selected question papers into a single download...'}
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="my-5">
          <div className="flex justify-between items-center mb-1.5 text-xs font-mono gap-2">
            <AutoScrollText className="text-neutral-600 dark:text-neutral-400 max-w-[280px]">
              {isCompleted
                ? completedMetrics?.archiveName || 'Archive generated'
                : progress?.currentFileName || 'Starting...'}
            </AutoScrollText>
            <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums shrink-0">
              {percent}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className={`h-full transition-all duration-200 ease-out ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Clean Completion Summary */}
        {isCompleted && completedMetrics && (
          <div className="mt-4 rounded-lg border border-neutral-100 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 dark:text-neutral-500 text-[11px] block">Selected Papers</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {completedMetrics.fileCount} {completedMetrics.fileCount === 1 ? 'file' : 'files'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 dark:text-neutral-500 text-[11px] block">ZIP File Size</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {completedMetrics.compressedMb} MB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-between">
          {!isCompleted ? (
            <>
              <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                <span>Downloading and bundling papers...</span>
              </div>
              <button
                onClick={handleDismiss}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
