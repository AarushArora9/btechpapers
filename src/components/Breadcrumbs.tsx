import React from 'react';
import { ChevronRight, ArrowLeft, Folder } from 'lucide-react';
import { BreadcrumbSegment } from '../types';

interface BreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPath, onNavigate }) => {
  // Parse path into segments
  const segments: BreadcrumbSegment[] = [{ name: 'octodoc', path: '/' }];

  if (currentPath !== '/' && currentPath !== '') {
    const parts = currentPath.split('/').filter(Boolean);
    let accum = '';
    for (const part of parts) {
      accum += `/${part}`;
      segments.push({ name: part, path: accum });
    }
  }

  // Calculate parent path
  const isRoot = currentPath === '/' || currentPath === '';
  const parentPath = isRoot
    ? '/'
    : currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 overflow-x-auto py-1">
        {!isRoot && (
          <button
            onClick={() => onNavigate(parentPath)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
            title="Go to parent directory"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Up</span>
          </button>
        )}

        <div className="flex items-center font-mono text-xs">
          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;

            return (
              <React.Fragment key={seg.path}>
                {idx > 0 && (
                  <span className="mx-1 text-neutral-400 dark:text-neutral-600">/</span>
                )}
                {isLast ? (
                  <span className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                    <Folder className="h-3.5 w-3.5 text-blue-500 fill-blue-500/20" />
                    <span>{seg.name}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onNavigate(seg.path)}
                    className="flex items-center gap-1 text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors focus-visible:outline-none"
                  >
                    <span>{seg.name}</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      <div className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
        {currentPath === '/' ? 'root directory' : currentPath}
      </div>
    </div>
  );
};
