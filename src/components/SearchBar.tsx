import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  matchesCount?: number;
  isSearching: boolean;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  matchesCount,
  isSearching,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: press '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onClear();
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 flex items-center text-neutral-400 dark:text-neutral-500">
          <Search className="h-4 w-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search question papers by subject, course code, or semester..."
          className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-24 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-100 dark:placeholder-neutral-500 transition-colors"
          aria-label="Search files"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {value ? (
            <button
              onClick={onClear}
              className="flex h-5 w-5 items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              title="Clear search (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              /
            </kbd>
          )}

          {isSearching && matchesCount !== undefined && (
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 border-l border-neutral-200 dark:border-neutral-800 pl-2">
              {matchesCount} {matchesCount === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
