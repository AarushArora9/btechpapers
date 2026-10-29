/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FolderGit2,
  GitBranch,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileText,
  Download,
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { DocItem, DownloadHistoryItem, DownloadMetrics, FilterState, ThemeMode } from './types';
import { fetchRepositoryTree } from './services/githubRepo';
import { searchPapers } from './utils/fuzzySearch';
import { createAndDownloadZip, downloadSinglePdf, ZipProgressInfo } from './utils/zipper';
import { getDownloadHistory, saveDownloadToHistory, clearDownloadHistory } from './utils/historyStorage';
import { CONFIG } from './config';

import { Navbar } from './components/Navbar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SearchBar } from './components/SearchBar';
import { FilterChips } from './components/FilterChips';
import { FileTable } from './components/FileTable';
import { FloatingActionBar } from './components/FloatingActionBar';
import { ZipProgressModal } from './components/ZipProgressModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PdfPreviewModal } from './components/PdfPreviewModal';

export default function App() {
  // Theme state: default dark
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('btechpapers_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  // Repository tree & file state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [rootNode, setRootNode] = useState<DocItem>({
    id: 'root',
    name: 'btechpapers',
    type: 'folder',
    path: '/',
    children: [],
  });
  const [allFiles, setAllFiles] = useState<DocItem[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);

  // Navigation, search & filter state
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterState, setFilterState] = useState<FilterState>({
    year: 'all',
    semester: 'all',
  });

  // File selection state (up to 30 files)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals & Drawers state
  const [previewItem, setPreviewItem] = useState<DocItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);
  const [egressError, setEgressError] = useState<string | null>(null);

  // ZIP progress state and abort controller ref
  const [isZipModalOpen, setIsZipModalOpen] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<ZipProgressInfo | null>(null);
  const [completedMetrics, setCompletedMetrics] = useState<DownloadMetrics | null>(null);
  const zipAbortControllerRef = useRef<AbortController | null>(null);

  // Sync theme to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('btechpapers_theme', theme);
  }, [theme]);

  // Load initial repository tree from GitHub
  const loadRepoTree = useCallback(async (forceRefresh: boolean = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetchRepositoryTree(forceRefresh);
      setRootNode(res.root);
      setAllFiles(res.allFiles);
      setYears(res.years);
      setSemesters(res.semesters);
    } catch (err) {
      console.error('Failed to load GitHub repository tree:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRepoTree(false);
    setDownloadHistory(getDownloadHistory());
  }, [loadRepoTree]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Map of all files for fast lookup
  const allFilesMap = useMemo(() => {
    const map = new Map<string, DocItem>();
    allFiles.forEach((f) => map.set(f.id, f));
    return map;
  }, [allFiles]);

  // Find node by path in tree
  const findNodeByPath = useCallback((node: DocItem, targetPath: string): DocItem | null => {
    const normTarget = targetPath === '' || targetPath === '/' ? '/' : targetPath.replace(/\/+$/, '');
    const normNode = node.path === '' || node.path === '/' ? '/' : node.path.replace(/\/+$/, '');

    if (normTarget === normNode) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByPath(child, targetPath);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Current folder node
  const currentNode = useMemo(() => {
    return findNodeByPath(rootNode, currentPath) || rootNode;
  }, [rootNode, currentPath, findNodeByPath]);

  // Search & Filtering
  const isFiltering = filterState.year !== 'all' || filterState.semester !== 'all';
  const isSearching = searchQuery.trim().length > 0;
  const isSearchOrFilterActive = isSearching || isFiltering;

  const searchResults = useMemo(() => {
    if (!isSearchOrFilterActive) return undefined;
    return searchPapers(searchQuery, allFiles, filterState);
  }, [isSearchOrFilterActive, searchQuery, allFiles, filterState]);

  // Navigation handlers
  const handleNavigateFolder = useCallback((path: string) => {
    setCurrentPath(path);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigateParent = useCallback(() => {
    if (currentPath === '/' || currentPath === '') return;
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    handleNavigateFolder(parentPath);
  }, [currentPath, handleNavigateFolder]);

  // Selection Logic (Capped at 30 files)
  const handleToggleSelect = (item: DocItem) => {
    if (item.type !== 'file') return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        if (next.size >= CONFIG.maxBatchSelect) {
          return next;
        }
        next.add(item.id);
      }
      return next;
    });
  };

  // Select all visible files
  const handleSelectAllVisible = () => {
    const visibleFiles = isSearchOrFilterActive && searchResults
      ? searchResults.map((r) => r.item)
      : (currentNode.children || []).filter((i) => i.type === 'file');

    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const file of visibleFiles) {
        if (next.size >= CONFIG.maxBatchSelect) break;
        next.add(file.id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Selected DocItem objects
  const selectedFiles = useMemo(() => {
    const list: DocItem[] = [];
    selectedIds.forEach((id) => {
      const item = allFilesMap.get(id);
      if (item) list.push(item);
    });
    return list;
  }, [selectedIds, allFilesMap]);

  // Single PDF download (handles friendly error message)
  const handleDownloadSingle = async (item: DocItem) => {
    try {
      await downloadSinglePdf(item, CONFIG.maxEgressBytes);
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message
        : 'Direct download is limited to 20 MB per file. Please select it and download via ZIP.';
      setEgressError(msg);
      setTimeout(() => setEgressError(null), 5000);
    }
  };

  // Client-side ZIP Packaging (up to 30 files) with cancellation support
  const handleDownloadZip = async () => {
    if (selectedFiles.length === 0) return;

    const controller = new AbortController();
    zipAbortControllerRef.current = controller;

    setIsZipModalOpen(true);
    setCompletedMetrics(null);
    setZipProgress({
      percent: 0,
      currentFileName: 'Starting package...',
      currentFileIndex: 0,
      totalFiles: selectedFiles.length,
      state: 'preparing',
    });

    try {
      const metrics = await createAndDownloadZip(
        selectedFiles,
        (progress) => setZipProgress(progress),
        controller.signal
      );

      setCompletedMetrics(metrics);

      // Save to download history
      const historyItem = saveDownloadToHistory(metrics);
      setDownloadHistory((prev) => [historyItem, ...prev]);

      // Clear selection after download
      setSelectedIds(new Set());
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled compression, dismiss cleanly
      } else {
        console.error('Packaging error:', err);
      }
      setIsZipModalOpen(false);
    } finally {
      zipAbortControllerRef.current = null;
    }
  };

  const handleCancelZip = () => {
    if (zipAbortControllerRef.current) {
      zipAbortControllerRef.current.abort();
      zipAbortControllerRef.current = null;
    }
    setIsZipModalOpen(false);
  };

  // Re-download from history
  const handleRedownloadArchive = async (historyItem: DownloadHistoryItem) => {
    const matchingFiles: DocItem[] = [];
    for (const name of historyItem.fileNames) {
      const file = allFiles.find((f) => f.name === name);
      if (file) matchingFiles.push(file);
    }

    if (matchingFiles.length === 0) return;

    const controller = new AbortController();
    zipAbortControllerRef.current = controller;

    setIsHistoryOpen(false);
    setIsZipModalOpen(true);
    setCompletedMetrics(null);

    try {
      const metrics = await createAndDownloadZip(
        matchingFiles,
        (progress) => setZipProgress(progress),
        controller.signal
      );
      setCompletedMetrics(metrics);
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Re-download error:', err);
      }
      setIsZipModalOpen(false);
    } finally {
      zipAbortControllerRef.current = null;
    }
  };

  const handleClearAllHistory = () => {
    clearDownloadHistory();
    setDownloadHistory([]);
  };

  return (
    <div
      className={`min-h-screen bg-[#f6f8fa] text-neutral-900 dark:bg-[#090d16] dark:text-neutral-100 font-sans transition-colors duration-200 flex flex-col ${
        theme === 'dark' ? 'dark' : ''
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        historyCount={downloadHistory.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        totalDocsCount={allFiles.length}
        isRefreshing={isRefreshing}
        onRefresh={() => loadRepoTree(true)}
        onNavigateRoot={() => handleNavigateFolder('/')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-20">
        {/* Sleek Repository Header Strip (clean without description line) */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-3.5 sm:p-4 dark:border-neutral-800 dark:bg-[#161b22] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Repo Title Zone */}
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="h-4 w-4 text-blue-500" />
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight font-mono">
                {CONFIG.repositoryFullName}
              </h1>
              <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 uppercase">
                Public
              </span>
            </div>

            {/* Quick stats & GitHub link */}
            <div className="flex items-center gap-3.5 text-xs font-mono text-neutral-500 dark:text-neutral-400 shrink-0">
              <div className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                <span>{CONFIG.branch}</span>
              </div>
              <span aria-hidden="true">·</span>
              <a
                href={CONFIG.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-sans transition-colors"
                title="View repository on GitHub"
              >
                <span>GitHub Repo</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Clean Search Bar */}
        <div className="mb-3">
          <SearchBar
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            matchesCount={searchResults?.length}
            isSearching={isSearchOrFilterActive}
            onClear={() => {
              setSearchQuery('');
              setFilterState({ year: 'all', semester: 'all' });
            }}
          />
        </div>

        {/* Year and Semester Filter Chips */}
        <FilterChips
          years={years}
          semesters={semesters}
          filterState={filterState}
          onFilterChange={setFilterState}
          onClearFilter={() => setFilterState({ year: 'all', semester: 'all' })}
        />

        {/* Breadcrumb Navigation Trail */}
        <div className="mb-3">
          <Breadcrumbs
            currentPath={isSearchOrFilterActive ? '/search-results' : currentPath}
            onNavigate={handleNavigateFolder}
          />
        </div>

        {/* User-friendly Notification Banner if a single download is over 20MB */}
        {egressError && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{egressError}</span>
            </div>
            <button
              onClick={() => setEgressError(null)}
              className="ml-2 text-xs font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading state or Directory Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#161b22] text-center">
            <Loader2 className="h-7 w-7 text-blue-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Loading Question Papers...
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Synchronizing files from GitHub ({CONFIG.repositoryFullName})
            </p>
          </div>
        ) : (
          <FileTable
            currentPath={currentPath}
            items={currentNode.children || []}
            searchResults={searchResults}
            isSearching={isSearchOrFilterActive}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAllVisible={handleSelectAllVisible}
            onClearSelection={handleClearSelection}
            onNavigateFolder={handleNavigateFolder}
            onNavigateParent={handleNavigateParent}
            onPreviewFile={(item) => setPreviewItem(item)}
            onDownloadSingle={handleDownloadSingle}
            maxLimit={CONFIG.maxBatchSelect}
            maxEgressBytes={CONFIG.maxEgressBytes}
          />
        )}
      </main>

      {/* Repository Description moved cleanly to the bottom */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 pb-6 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="rounded-lg border border-neutral-200 bg-white/60 p-4 dark:border-neutral-800/80 dark:bg-[#161b22]/60">
          <p className="leading-relaxed">
            Centralized examination repository for B.Tech engineering coursework. Browse folders by year and semester or use the search bar above. Download individual papers directly or select up to 30 papers to compress into a clean, flat ZIP bundle.
          </p>
        </div>
      </section>

      {/* Floating Action Bar when files are selected */}
      <FloatingActionBar
        selectedFiles={selectedFiles}
        onClear={handleClearSelection}
        onDownloadZip={handleDownloadZip}
        maxLimit={CONFIG.maxBatchSelect}
      />

      {/* Compression Progress & Completion Modal with Cancellation Cross */}
      <ZipProgressModal
        isOpen={isZipModalOpen}
        progress={zipProgress}
        completedMetrics={completedMetrics}
        onClose={() => setIsZipModalOpen(false)}
        onCancel={handleCancelZip}
      />

      {/* Download History Slide-Over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={downloadHistory}
        onClearHistory={handleClearAllHistory}
        onRedownloadArchive={handleRedownloadArchive}
      />

      {/* PDF Inspection / Preview Modal */}
      <PdfPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
        onDownload={handleDownloadSingle}
        isSelected={previewItem ? selectedIds.has(previewItem.id) : false}
        onToggleSelect={handleToggleSelect}
      />

      {/* Repository Footer with Direct Link */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-6 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-[#0d1117] dark:text-neutral-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {CONFIG.appName}
            </span>
            <span aria-hidden="true">·</span>
            <span>PDF Question Papers Explorer</span>
          </div>

          {/* Direct link to see the GitHub repository itself & download full code */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
            <a
              href="/btechpapers-web-app.zip"
              download="btechpapers-web-app.zip"
              className="inline-flex items-center gap-1.5 rounded border border-neutral-300 bg-white px-2 py-0.5 text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
              title="Download entire code as ZIP to drop into your GitHub repo"
            >
              <Download className="h-3 w-3 text-blue-500" />
              <span>Download Code (ZIP)</span>
            </a>

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 dark:text-neutral-500">Repository:</span>
              <a
                href={CONFIG.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-neutral-800 hover:bg-neutral-200 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-blue-400 transition-colors"
              >
                <span>{CONFIG.repositoryFullName}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}
