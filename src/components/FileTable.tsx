import React, { useMemo, memo } from 'react';
import {
  Folder,
  FileText,
  CornerLeftUp,
  Download,
  Eye,
  FolderOpen,
} from 'lucide-react';
import { DocItem } from '../types';
import { formatBytes, countFolderFiles, calculateFolderBytes } from '../data/mockRepository';
import { SearchResult } from '../utils/fuzzySearch';
import { AutoScrollText } from './AutoScrollText';

interface FileTableRowProps {
  item: DocItem;
  isSelected: boolean;
  matchRanges?: [number, number][];
  isSearching: boolean;
  onToggleSelect: (item: DocItem) => void;
  onNavigateFolder: (path: string) => void;
  onPreviewFile: (item: DocItem) => void;
  onDownloadSingle: (item: DocItem) => void;
  maxEgressBytes: number;
}

/**
 * Highly optimized, memoized table row component.
 * Prevents re-rendering untouched rows when toggling checkboxes or typing.
 */
const FileTableRowComponent: React.FC<FileTableRowProps> = ({
  item,
  isSelected,
  matchRanges,
  isSearching,
  onToggleSelect,
  onNavigateFolder,
  onPreviewFile,
  onDownloadSingle,
  maxEgressBytes,
}) => {
  const isFolder = item.type === 'folder';

  // Render fuzzy highlight in filename
  const renderedName = useMemo(() => {
    if (!matchRanges || matchRanges.length === 0) {
      return item.name;
    }

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;

    matchRanges.forEach(([start, end], idx) => {
      if (start > lastIdx) {
        parts.push(item.name.substring(lastIdx, start));
      }
      parts.push(
        <mark
          key={idx}
          className="bg-amber-300/30 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200 rounded-xs px-0.5"
        >
          {item.name.substring(start, end)}
        </mark>
      );
      lastIdx = end;
    });

    if (lastIdx < item.name.length) {
      parts.push(item.name.substring(lastIdx));
    }

    return parts;
  }, [item.name, matchRanges]);

  return (
    <div
      className={`group flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 text-xs transition-colors ${
        isSelected
          ? 'bg-blue-50/50 dark:bg-blue-950/20'
          : 'hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40'
      }`}
    >
      {/* Left Zone: Checkbox & Name */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 mr-2 sm:mr-4">
        {isFolder ? (
          /* Hide empty checkbox spacer on mobile to give maximum room for the year name */
          <div
            className="hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 -my-2 p-2 shrink-0 opacity-0"
            aria-hidden="true"
          >
            <div className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[44px] min-w-[44px] -ml-2 -my-2 p-2 shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item)}
              className="h-5 w-5 rounded-md border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 cursor-pointer transition-transform active:scale-95"
              aria-label={`Select ${item.name}`}
            />
          </div>
        )}

        {/* Icon */}
        <div className="shrink-0 flex items-center justify-center">
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
              className="flex flex-col items-start justify-center text-left py-1 min-w-0 flex-1 max-w-full focus-visible:outline-none group/fbtn"
            >
              <AutoScrollText
                title={item.name}
                className="font-medium sm:font-semibold text-xs sm:text-sm text-neutral-900 group-hover/fbtn:text-blue-600 dark:text-neutral-100 dark:group-hover/fbtn:text-blue-400 transition-colors w-full"
              >
                {item.name}
              </AutoScrollText>
              {/* Number of docs shifted cleanly below the year/folder */}
              <span className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5 leading-tight">
                {countFolderFiles(item)} {countFolderFiles(item) === 1 ? 'doc' : 'docs'}
              </span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0 flex-1">
              <div
                onClick={() => onPreviewFile(item)}
                className="cursor-pointer font-medium text-neutral-900 hover:text-blue-600 dark:text-neutral-100 dark:hover:text-blue-400 transition-colors min-w-0 max-w-full flex-1"
                title={item.name}
              >
                <AutoScrollText title={item.name}>
                  {renderedName}
                </AutoScrollText>
              </div>
              {isSearching && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono truncate shrink-0 max-w-[140px] sm:max-w-[180px]">
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
      <div className="w-12 sm:w-16 text-right shrink-0 font-mono text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-300 tabular-nums mr-1 sm:mr-2">
        {isFolder ? formatBytes(calculateFolderBytes(item)) : formatBytes(item.size)}
      </div>

      {/* Right Zone: Action buttons */}
      <div className="flex w-8 sm:w-16 shrink-0 items-center justify-end gap-0.5 sm:gap-1">
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
};

const FileTableRow = memo(FileTableRowComponent);

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
  const isRoot = items.length > 0 && items[0].path ? items[0].path.split('/').length <= 2 : true;

  // Calculate items to display:
  // If searching: searchResults
  // Otherwise: items (sorted: folders first, then files)
  const displayItems = useMemo(() => {
    if (isSearching && searchResults) {
      return searchResults.map((r) => r.item);
    }
    return [...items].sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
  }, [isSearching, searchResults, items]);

  // Fast O(1) Map lookup for fuzzy search highlight ranges
  const searchMatchMap = useMemo(() => {
    if (!isSearching || !searchResults) return null;
    const map = new Map<string, [number, number][]>();
    for (const r of searchResults) {
      if (r.matchRanges && r.matchRanges.length > 0) {
        map.set(r.item.id, r.matchRanges);
      }
    }
    return map;
  }, [isSearching, searchResults]);

  const visibleFiles = useMemo(() => {
    return displayItems.filter((i) => i.type === 'file');
  }, [displayItems]);

  const allVisibleSelected =
    visibleFiles.length > 0 && visibleFiles.every((f) => selectedIds.has(f.id));
  const someVisibleSelected =
    visibleFiles.some((f) => selectedIds.has(f.id)) && !allVisibleSelected;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#161b22] shadow-xs">
      {/* Table Header mimicking GitHub Repository Table Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/70 px-4 py-2.5 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-3 cursor-pointer select-none min-h-[40px] sm:min-h-[36px] py-0.5">
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
              className="h-5 w-5 rounded-md border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 cursor-pointer transition-transform active:scale-95"
              title={allVisibleSelected ? 'Deselect visible' : `Select all visible (up to ${maxLimit})`}
            />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {isSearching ? 'Search Results' : 'Repository Files'}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-[11px] font-mono">
          <span className="hidden md:inline text-neutral-400 dark:text-neutral-500">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </span>
          <span className="hidden sm:inline">Last commit</span>
          <span className="w-12 sm:w-16 text-right">Size</span>
          <span className="w-8 sm:w-16 text-right">Actions</span>
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
        {displayItems.map((item) => (
          <FileTableRow
            key={item.id}
            item={item}
            isSelected={selectedIds.has(item.id)}
            matchRanges={searchMatchMap?.get(item.id)}
            isSearching={isSearching}
            onToggleSelect={onToggleSelect}
            onNavigateFolder={onNavigateFolder}
            onPreviewFile={onPreviewFile}
            onDownloadSingle={onDownloadSingle}
            maxEgressBytes={maxEgressBytes}
          />
        ))}
      </div>
    </div>
  );
};
