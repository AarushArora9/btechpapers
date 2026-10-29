import React from 'react';
import {
  FolderGit2,
  Moon,
  Sun,
  History,
  FileText,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { CONFIG } from '../config';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  totalDocsCount: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onNavigateRoot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  historyCount,
  onOpenHistory,
  totalDocsCount,
  isRefreshing = false,
  onRefresh,
  onNavigateRoot,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0d1117]/90 transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateRoot}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-mono text-sm font-bold shadow-xs hover:opacity-90 transition-opacity"
            title="Go to repository root"
          >
            <FolderGit2 className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateRoot}
              className="font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight text-base hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              btechpapers
            </button>
            <span className="hidden sm:inline-block text-xs text-neutral-400 dark:text-neutral-500 font-mono">
              /
            </span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-mono text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300">
              {CONFIG.branch}
            </span>
          </div>
        </div>

        {/* Center / Stats item */}
        <div className="hidden md:flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1.5 font-mono">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {totalDocsCount.toLocaleString()}
            </span>{' '}
            papers
          </span>
          <span aria-hidden="true">·</span>
          <span>Max 30 papers per ZIP</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Refresh Tree from GitHub API button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
              title="Sync live files from GitHub repository"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            title="View Download History"
          >
            <History className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-100 px-1 text-[10px] font-mono font-medium text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
