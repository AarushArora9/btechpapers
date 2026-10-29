import React from 'react';
import {
  Folder,
  FileText,
  CornerLeftUp,
  Download,
  Eye,
  Check,
  FolderOpen,
} from 'lucide-react';
import { DocItem } from '../types';
import { formatBytes, countFolderFiles, calculateFolderBytes } from '../data/mockRepository';
import { SearchResult } from '../utils/fuzzySearch';

interface FileTableProps {
  currentPath: string;
  items: DocItem[];
  searchResults?: SearchResult[];
  isSearching: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (item: DocItem) => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onNavigateFolder: (path: string) => void;
  onNavigateParent: () => void;
  onPreviewFile: (item: DocItem) => void;
  onDownloadSingle: (item: DocItem) => void;
  maxLimit: number;
  maxEgressBytes?: number;
}

export const FileTable: React.FC<FileTableProps> = ({
  currentPath,
  items,
  searchResults,
  isSearching,
  selectedIds,
  onToggleSelect,
  onSelectAllVisible,
  onClearSelection,
  onNavigateFolder,
  onNavigateParent,
  onPreviewFile,
  onDownloadSingle,
  maxLimit,
  maxEgressBytes = 20 * 1024 * 1024,
}) => {
  const isRoot = currentPath === '/' || currentPath === '';

  // Calculate items to display:
  // If searching: searchResults
  // Otherwise: items (sorted: folders first, then files)
  const displayItems = isSearching && searchResults
    ? searchResults.map((r) => r.item)
    : [...items].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });

  const visibleFiles = displayItems.filter((i) => i.type === 'file');
  const allVisibleSelected =
    visibleFiles.length > 0 && visibleFiles.every((f) => selectedIds.has(f.id));
  const someVisibleSelected =
    visibleFiles.some((f) => selectedIds.has(f.id)) && !allVisibleSelected;

  // Render fuzzy highlight in filename
  const renderHighlightedName = (name: string, item: DocItem) => {
    if (!isSearching || !searchResults) return name;
    const match = searchResults.find((r) => r.item.id === item.id);
    if (!match || match.matchRanges.length === 0) return name;

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;

    match.matchRanges.forEach(([start, end], idx) => {
      if (start > lastIdx) {
        parts.push(name.substring(lastIdx, start));
      }
      parts.push(
        <mark
          key={idx}
          className="bg-amber-300/30 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200 rounded-xs px-0.5"
        >
          {name.substring(start, end)}
        </mark>
      );
      lastIdx = end;
    });

    if (lastIdx < name.length) {
      parts.push(name.substring(lastIdx));
    }

    return parts;
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#161b22] shadow-xs">
      {/* Table Header mimicking GitHub Repository Table Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/70 px-4 py-2.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              ref={(el) => {
                if (el) el.indeterminate = someVisibleSelected;
              }}
              onChange={() => {
                if (allVisibleSelected) {
                  onClearSelection();
                } else {
                  onSelectAllVisible();
                }
              }}
              className="h-3.5 w-3.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
              title={allVisibleSelected ? 'Deselect visible' : `Select all visible (up to ${maxLimit})`}
            />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {isSearching ? 'Search Results' : 'Repository Files'}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono">
          <span className="hidden md:inline text-neutral-400 dark:text-neutral-500">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </span>
          <span className="hidden sm:inline">Last commit</span>
          <span className="w-16 text-right">Size</span>
          <span className="w-16 text-right">Actions</span>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
        {/* Parent directory navigation row */}
        {!isRoot && !isSearching && (
          <div
            onClick={onNavigateParent}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onNavigateParent();
            }}
            className="group flex cursor-pointer items-center justify-between px-4 py-2 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors focus-visible:outline-none"
          >
            <div className="flex items-center gap-3 font-mono text-neutral-500 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              <div className="w-3.5 text-center">
                <CornerLeftUp className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold">..</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans">
                (Go up to parent directory)
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
              up
            </span>
          </div>
        )}

        {/* Empty state */}
        {displayItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
              <FolderOpen className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {isSearching ? 'No matching PDF documents found' : 'This folder is empty'}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
              {isSearching
                ? 'Try different keywords or browse through the folder hierarchy.'
                : 'Navigate back up to explore other documentation directories.'}
            </p>
          </div>
        )}

        {/* Render rows */}
        {displayItems.map((item) => {
          const isFolder = item.type === 'folder';
          const isSelected = selectedIds.has(item.id);

          return (
            <div
              key={item.id}
              className={`group flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                isSelected
                  ? 'bg-blue-50/50 dark:bg-blue-950/20'
                  : 'hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40'
              }`}
            >
              {/* Left Zone: Checkbox & Name */}
              <div className="flex min-w-0 flex-1 items-center gap-3 mr-4">
                {isFolder ? (
                  <div className="h-3.5 w-3.5 shrink-0 opacity-20" aria-hidden="true" />
                ) : (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item)}
                    className="h-3.5 w-3.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 cursor-pointer"
                    aria-label={`Select ${item.name}`}
                  />
                )}

                {/* Icon */}
                <div className="shrink-0">
                  {isFolder ? (
                    <Folder className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                  ) : (
                    <FileText className="h-4 w-4 text-red-500/90 dark:text-red-400" />
                  )}
                </div>

                {/* Name & Folder Click */}
                <div className="min-w-0 flex-1">
                  {isFolder ? (
                    <button
                      onClick={() => onNavigateFolder(item.path)}
                      className="flex items-center gap-2 text-left font-medium text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400 transition-colors truncate focus-visible:outline-none"
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                        ({countFolderFiles(item)} docs)
                      </span>
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 truncate">
                      <span
                        onClick={() => onPreviewFile(item)}
                        className="cursor-pointer font-medium text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400 truncate transition-colors"
                        title={item.name}
                      >
                        {renderHighlightedName(item.name, item)}
                      </span>
                      {isSearching && (
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono truncate">
                          {item.path}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Center Zone: Commit & Time */}
              <div className="hidden lg:flex min-w-0 max-w-xs items-center gap-2 truncate text-neutral-500 dark:text-neutral-400 mr-4">
                <span className="truncate text-[11px]">{item.lastCommit}</span>
              </div>

              <div className="hidden sm:block text-[11px] text-neutral-400 dark:text-neutral-500 font-mono shrink-0 mr-4">
                {item.updatedAt}
              </div>

              {/* Right Zone: Size */}
              <div className="w-16 text-right shrink-0 font-mono text-[11px] text-neutral-600 dark:text-neutral-300 tabular-nums mr-2">
                {isFolder ? formatBytes(calculateFolderBytes(item)) : formatBytes(item.size)}
              </div>

              {/* Right Zone: Action buttons */}
              <div className="flex w-16 shrink-0 items-center justify-end gap-1">
                {isFolder ? (
                  <button
                    onClick={() => onNavigateFolder(item.path)}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                    title="Open directory"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onPreviewFile(item)}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                      title="Inspect document preview"
                      aria-label="Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {(() => {
                      const exceedsLimit = !isFolder && !!item.size && item.size > maxEgressBytes;
                      return (
                        <button
                          onClick={() => {
                            if (!exceedsLimit) onDownloadSingle(item);
                          }}
                          disabled={exceedsLimit}
                          className={`rounded p-1 transition-colors ${
                            exceedsLimit
                              ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                              : 'text-neutral-400 hover:bg-neutral-100 hover:text-blue-600 dark:hover:bg-neutral-800 dark:hover:text-blue-400'
                          }`}
                          title={
                            exceedsLimit
                              ? `Over 20 MB · Please download via ZIP (${formatBytes(item.size)})`
                              : 'Download PDF'
                          }
                          aria-label={exceedsLimit ? 'Download disabled' : 'Download'}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
